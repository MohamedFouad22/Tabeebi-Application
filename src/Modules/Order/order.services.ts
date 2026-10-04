import { Request, Response } from "express";
import {
  cancelOrderDTO,
  createCheckoutDTO,
  createOrderDTO,
  createOrderParamsDTO,
  getOrderDTO,
  getOrdersAdminDTO,
  getOrdersDTO,
  getOrdersQueryDTO,
  updateStatusDTO,
  updateStatusParamsDTO,
} from "./order.dto";
import {
  PaymentMethodEnum,
  PaymentStatusEnum,
  RoleEnum,
  statusEnum,
} from "../../Utils/Enum/enum.utils";
import { CartRepository } from "../../DB/Repositories/cart.repository";
import { cartModel } from "../../DB/Models/cart.model";
import { orderModel } from "../../DB/Models/order.model";
import { OrderRepository } from "../../DB/Repositories/order.repository";
import { couponModel } from "../../DB/Models/coupon.model";
import { CouponRepository } from "../../DB/Repositories/coupon.repository";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from "../../Utils/Security/Error/global.error.utils";
import { eventEmitter } from "../../Utils/Events/event.utils";
import { userModel } from "../../DB/Models/user.model";
import { UserRepository } from "../../DB/Repositories/user.repository";
import { productModel } from "../../DB/Models/product.model";
import { ProductRepository } from "../../DB/Repositories/product.repository";
import StripeServices from "../../Utils/Payments/Stripe/stripe.payment.utils";
import Stripe from "stripe";

class OrderServices {
  private _cartModel = new CartRepository(cartModel);
  private _orderModel = new OrderRepository(orderModel);
  private _couponModel = new CouponRepository(couponModel);
  private _userModel = new UserRepository(userModel);
  private _productModel = new ProductRepository(productModel);
  constructor() {}

  createOrder = async (req: Request, res: Response): Promise<Response> => {
    const { userId }: createOrderParamsDTO = req.params;
    const { address, phone, paymentMethod }: createOrderDTO = req.body;

    let user;
    let userData;
    if (req.decoded.role === RoleEnum.ADMIN) {
      user = userId ? userId : req.decoded._id;
      userData = await this._userModel.findOne({
        filter: { _id: user },
      });
    } else if (req.decoded.role === RoleEnum.USER) {
      user = req.decoded._id;
    }

    const cart = await this._cartModel.findOne({
      filter: { createdBy: user },
      options: {
        populate: [
          {
            path: "items.productId",
            select: "productName originalPrice stock priceAfterDiscount",
          },
        ],
      },
    });
    if (!cart) throw new NotFoundException("Cart Not Found");

    let coupon;
    if (cart.coupon) {
      coupon = await this._couponModel.findOne({
        filter: { _id: cart.coupon },
      });
      if (!coupon) throw new NotFoundException("Coupon Not Found");
    }

    const total = cart.totalAfterDiscount
      ? cart.totalAfterDiscount
      : cart.subTotal;

    const taxFee = (total * 3) / 100;

    let shippingFee;
    if (total >= 10_000) {
      shippingFee = 0;
    } else {
      shippingFee = 50;
    }

    const totalAfterAddition = total + taxFee + shippingFee;
    const totalOrder = total;

    for (const item of cart.items) {
      const productData = item.productId as any;
      if (productData.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product: ${productData.productName}`,
        );
      }
    }

    if (
      !paymentMethod ||
      (paymentMethod && paymentMethod === PaymentMethodEnum.CASH)
    ) {
      for (const item of cart.items) {
        const productId = (item.productId as any)._id || item.productId;

        await this._productModel.updateOne({
          filter: {
            _id: productId,
            stock: { $gte: item.quantity },
          },
          update: {
            $inc: {
              stock: -item.quantity,
              sold: item.quantity,
            },
          },
        });
      }
    }

    const [order] = await this._orderModel.create({
      data: [
        {
          createdBy: user,
          cartId: cart._id,
          couponId: coupon?._id,
          items: cart.items,
          subTotal: Number(totalOrder.toFixed(2)),
          discount: cart.discount,
          taxFee,
          shippingFee,
          totalAfterDiscount: Number(totalAfterAddition.toFixed(2)),
          status: statusEnum.PENDING,
          paymentStatus: PaymentStatusEnum.UNPAID,
          paymentMethod,
          address,
          phone,
        },
      ],
    });
    if (!order) {
      throw new BadRequestException("Failed To Create Order");
    } else {
      if (order.paymentMethod === PaymentMethodEnum.CASH) {
        if (order.couponId) {
          const updateCoupon = await this._couponModel.updateOne({
            filter: { _id: coupon?._id },
            update: {
              $inc: { usageCount: 1, __v: 1 },
            },
          });
          if (!updateCoupon)
            throw new BadRequestException("Failed To Update Coupon");
        }

        const deleteCart = await this._cartModel.deleteOne({
          filter: { createdBy: user },
        });
        if (!deleteCart)
          throw new BadRequestException("Failed To Delete Order From Cart");
      }
    }

    eventEmitter.emit("orderConfirmation", {
      to:
        req.decoded.role === RoleEnum.USER
          ? req.decoded.email
          : userData?.email,
      userName:
        req.decoded.role === RoleEnum.USER
          ? req.decoded.userName
          : userData?.userName,
      total: order.totalAfterDiscount,
      paymentMethod: order.paymentMethod,
      items: cart.items.map((item) => ({
        name: (item.productId as any).productName,
        quantity: item.quantity,
        price: item.subTotal,
      })),
      address,
      phone,
    });

    return res
      .status(201)
      .json({ message: "Order Created Successfully", Data: { order } });
  };

  checkoutOrder = async (req: Request, res: Response): Promise<Response> => {
    const { userId, orderId } = req.params as createCheckoutDTO;

    let user;
    let email;
    let userData;
    if (req.decoded.role === RoleEnum.ADMIN) {
      user = userId ? userId : req.decoded._id;
      userData = await this._userModel.findOne({ filter: { _id: user } });
      email = userId ? userData?.email : req.decoded.email;
    } else if (req.decoded.role === RoleEnum.USER) {
      user = req.decoded._id;
      email = req.decoded.email;
    }

    const order = await this._orderModel.findOne({
      filter: {
        _id: orderId,
        createdBy: user,
        paymentMethod: PaymentMethodEnum.CARD,
        paymentStatus: PaymentStatusEnum.UNPAID,
        status: statusEnum.PENDING,
      },
      options: {
        populate: [
          { path: "createdBy", select: "firstName lastName email" },
          { path: "items.productId", select: "productName" },
        ],
      },
    });
    if (!order)
      throw new NotFoundException(
        "Order Not Found Or Can't Complete This Order",
      );

    const session = await StripeServices.createSession({
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "egp",
            product_data: {
              name: order.items
                .map((item) => (item.productId as any).productName)
                .join(", "),
            },
            unit_amount: Math.round(order.totalAfterDiscount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: { order: orderId.toString() },
      mode: "payment",
    });

    return res.status(200).json({
      message: "Checkout Done Successfully",
      session: { url: session.url },
    });
  };

  webhookStripe = async (req: Request, res: Response): Promise<Response> => {
    try {
      const signature = req.headers["stripe-signature"] as string;

      if (!signature)
        throw new UnauthorizedException("Missing Stripe Signature");

      const event = StripeServices.constructEvent({
        payload: req.body,
        signature,
        secret: process.env.STRIPE_WEBHOOK_SECRET as string,
      });

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const order_id = session.metadata?.order;

        if (order_id) {
          try {
            const updateResult = await this._orderModel.updateOne({
              filter: { _id: order_id },
              update: {
                status: statusEnum.CONFIRMED,
                paymentStatus: PaymentStatusEnum.PAID,
                $inc: { __v: 1 },
              },
            });
            if (updateResult.matchedCount === 0) {
              console.warn(`⚠️ No Order found in DB for ID: ${order_id}`);
            } else {
              console.log(`✅ Order ${order_id} confirmed and paid.`);
            }
          } catch (dbError: any) {
            console.error("❌ DB Update Error in Webhook:", dbError.message);
          }
        } else {
          console.warn(
            "⚠️ Checkout Session completed without 'order_id' in metadata.",
          );
        }
      }
      return res.status(200).json({ received: true });
    } catch (error: any) {
      console.error("❌ Webhook Error:", error.message);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }
  };

  getOrders = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req.params as getOrdersDTO;
    const { status } = req.query as getOrdersQueryDTO;

    if (req.decoded.role === RoleEnum.USER && req.params.userId) {
      throw new ForbiddenException("You Not Allowed To Sent User Id");
    }

    let user;
    if (req.decoded.role === RoleEnum.ADMIN) {
      user = userId ? userId : req.decoded._id;
    } else if (req.decoded.role === RoleEnum.USER) {
      user = req.decoded._id;
    }

    const filter: Record<string, any> = { createdBy: user };

    if (req.query.status) {
      filter.status = status;
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const skip = (page - 1) * limit;

    const [orders, totalOrders] = await Promise.all([
      this._orderModel.find({
        filter,
        projection: "-__v -updatedAt",
        options: {
          page,
          limit,
          skip,
          sort: { createdAt: -1 },
          populate: [{ path: "createdBy", select: "firstName lastName email" }],
        },
      }),

      this._orderModel.countDocuments({ filter }),
    ]);

    const totalPages = Math.ceil(totalOrders / limit);

    return res.status(200).json({
      message: "Get Orders Successfully",
      Pagination: {
        currentPage: page,
        limit,
        skip,
        totalOrders,
        totalPages,
      },
      orders,
    });
  };

  getOrder = async (req: Request, res: Response): Promise<Response> => {
    const { orderId } = req.params as getOrderDTO;

    const filter: Record<string, any> = { _id: orderId };

    if (req.decoded.role === RoleEnum.USER) {
      filter.createdBy = req.decoded._id;
    }

    const order = await this._orderModel.findOne({
      filter,
      projection: "-__v -updatedAt",
      options: {
        populate: [{ path: "createdBy", select: "firstName lastName email" }],
      },
    });
    if (!order) throw new NotFoundException("Order Not Found");

    return res.status(200).json({ message: "Get Order Successfully", order });
  };

  cancelOrder = async (req: Request, res: Response): Promise<Response> => {
    const { orderId, userId } = req.params as cancelOrderDTO;

    if (req.decoded.role === RoleEnum.USER && req.params.userId) {
      throw new ForbiddenException("You Not Allowed To Sent User Id");
    }

    let user;
    if (req.decoded.role === RoleEnum.ADMIN) {
      user = userId ? userId : req.decoded._id;
    } else if (req.decoded.role === RoleEnum.USER) {
      user = req.decoded._id;
    }

    const filter: Record<string, any> = { _id: orderId, createdBy: user };

    const order = await this._orderModel.findOne({
      filter,
    });
    if (!order) throw new NotFoundException("Order Not Found");

    if (order.paymentMethod === PaymentMethodEnum.CASH) {
      for (const item of order.items) {
        const productId = (item.productId as any)._id || item.productId;

        const updateProduct = await this._productModel.updateOne({
          filter: { _id: productId },
          update: {
            $inc: {
              stock: item.quantity,
              sold: -item.quantity,
            },
          },
        });

        if (!updateProduct)
          throw new BadRequestException("Failed To Update Product");
      }
    }

    if (
      order.paymentStatus === PaymentStatusEnum.UNPAID &&
      order.paymentMethod === PaymentMethodEnum.CASH &&
      order.status ===
        (statusEnum.PENDING || statusEnum.CONFIRMED || statusEnum.PROCESSING)
    ) {
      const updateOrder = await this._orderModel.updateOne({
        filter,
        update: {
          status: statusEnum.CANCELLED,
          $inc: { __v: 1 },
        },
      });
      if (!updateOrder) throw new BadRequestException("Failed To Update Order");
    } else {
      throw new BadRequestException("Order Can't Canceled ");
    }

    return res.status(200).json({ message: "Order Canceled Successfully" });
  };

  getAllOrders = async (req: Request, res: Response): Promise<Response> => {
    const { status } = req.query as getOrdersAdminDTO;

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (status) {
      filter.status = status;
    }

    const [orders, totalOrders] = await Promise.all([
      this._orderModel.find({
        filter,
        projection: "-__v -updatedAt",
        options: {
          page,
          limit,
          skip,
          sort: { createdAt: -1 },
          populate: [{ path: "createdBy", select: "firstName lastName email" }],
        },
      }),

      this._orderModel.countDocuments({ filter }),
    ]);

    const totalPages = Math.ceil(totalOrders / limit);

    return res.status(200).json({
      message: "Get Orders Successfully",
      pagination: {
        currentPage: page,
        limit,
        skip,
        totalPages,
        totalOrders,
      },
      orders,
    });
  };

  updateStatus = async (req: Request, res: Response): Promise<Response> => {
    const { orderId } = req.params as updateStatusParamsDTO;
    const { status }: updateStatusDTO = req.body;

    const filter: Record<string, any> = { _id: orderId };
    const update: Record<string, any> = { status, $inc: { __v: 1 } };

    const order = await this._orderModel.findOne({
      filter,
      options: {
        populate: [{ path: "createdBy", select: "firstName lastName email" }],
      },
    });
    if (!order) throw new NotFoundException("Order Not Found");

    if (
      order.status === statusEnum.CANCELLED ||
      order.status === statusEnum.DELIVERED
    ) {
      throw new BadRequestException(
        "This Order Has Been Canceled Or Already Delivered Can't Be Update Status",
      );
    }

    if (order.status === status) {
      throw new BadRequestException("The Order Is Already At This Stage");
    }

    if (
      status === statusEnum.DELIVERED &&
      order.paymentMethod === PaymentMethodEnum.CASH &&
      order.paymentStatus === PaymentStatusEnum.UNPAID
    ) {
      update.paymentStatus = PaymentStatusEnum.PAID;
    }

    const updateOrder = await this._orderModel.updateOne({
      filter,
      update,
    });
    if (!updateOrder)
      throw new BadRequestException("Failed To Update Order Status");

    const user = order.createdBy as unknown as {
      firstName: string;
      lastName: string;
      userName: string;
      email: string;
    };

    eventEmitter.emit("updateOrderStatus", {
      to: user.email,
      userName: user.userName,
      status: status,
      total: order.totalAfterDiscount,
      address: order.address,
      phone: order.phone,
    });

    return res.status(200).json({ message: "Status Updated Successfully" });
  };
}
export default new OrderServices();
