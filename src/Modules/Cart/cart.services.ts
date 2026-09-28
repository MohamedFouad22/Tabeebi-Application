import { Request, Response } from "express";
import { CartRepository } from "../../DB/Repositories/cart.repository";
import { cartModel } from "../../DB/Models/cart.model";
import {
  BadRequestException,
  NotFoundException,
} from "../../Utils/Security/Error/global.error.utils";
import { ProductRepository } from "../../DB/Repositories/product.repository";
import { productModel } from "../../DB/Models/product.model";
import {
  applyCouponDTO,
  applyCouponParamsDTO,
  clearCartDTO,
  createCartDTO,
  getCartDTO,
  removeItemDTO,
  updateItemQuantityDTO,
  updateItemQuantityParamsDTO,
} from "./cart.dto";
import { Types } from "mongoose";
import { couponStatusEnum, RoleEnum } from "../../Utils/Enum/enum.utils";
import { CouponRepository } from "../../DB/Repositories/coupon.repository";
import { couponModel } from "../../DB/Models/coupon.model";

class CartServices {
  private _cartModel = new CartRepository(cartModel);
  private _productModel = new ProductRepository(productModel);
  private _couponModel = new CouponRepository(couponModel);
  constructor() {}

  getCart = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req.params as getCartDTO;

    let user;
    if (req.decoded.role === RoleEnum.ADMIN) {
      user = userId ? userId : req.decoded._id;
    } else {
      user = req.decoded._id;
    }

    const cart = await this._cartModel.findOne({
      filter: { createdBy: user },
      options: {
        populate: [
          { path: "createdBy", select: "firstName lastName email" },
          {
            path: "items.productId",
            select: "productName originalPrice stock priceAfterDiscount",
          },
        ],
      },
    });
    if (!cart)
      return res.status(200).json({
        message: "Cart Is Empty",
        Data: { cart: null },
      });

    return res
      .status(200)
      .json({ message: "Get Cart Successfully", Data: { cart } });
  };

  createCart = async (req: Request, res: Response): Promise<Response> => {
    const { productId, quantity }: createCartDTO = req.body;

    const product = await this._productModel.findOne({
      filter: { _id: productId },
    });
    if (!product) throw new NotFoundException("Product Not Found");

    if (quantity > product?.stock) {
      throw new BadRequestException("This Product Be Out Of Stock");
    }

    const price = product.priceAfterDiscount
      ? product.priceAfterDiscount
      : product.originalPrice || undefined;
    const total = price ? price * quantity : undefined;

    const checkCart = await this._cartModel.findOne({
      filter: { createdBy: req.decoded._id },
    });

    if (!checkCart) {
      const [cart] = await this._cartModel.create({
        data: [
          {
            createdBy: req.decoded._id,
            subTotal: total,
            items: [
              { productId, quantity, productTotal: price, subTotal: total },
            ],
          },
        ],
      });
      if (!cart) throw new BadRequestException("Failed To Create Cart");

      return res.status(201).json({
        message: "Cart Created Successfully",
        Data: { cart },
      });
    } else {
      const checkItems = checkCart.items.findIndex(
        (item) => item.productId.toString() === productId,
      );

      if (checkItems > -1) {
        const cartItem = checkCart.items[checkItems];
        if (cartItem) {
          if (cartItem.quantity + quantity > product.stock) {
            throw new BadRequestException("Exceeded available stock limit");
          } else {
            cartItem.quantity += quantity;
            cartItem.subTotal = cartItem.productTotal * cartItem.quantity;
          }
        }
      } else {
        checkCart.items.push({
          productId: new Types.ObjectId(productId),
          quantity,
          productTotal: price as number,
          subTotal: total as number,
        });
      }

      if (checkCart) {
        checkCart.subTotal = checkCart.items.reduce(
          (sum, item) => sum + (item.subTotal || 0),
          0,
        );
      }
    }

    await checkCart.save();

    return res.status(200).json({
      message: "Product Added To Cart Successfully",
      Data: { checkCart },
    });
  };

  updateItemQuantity = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { itemId, userId } = req.params as updateItemQuantityParamsDTO;
    const { quantity }: updateItemQuantityDTO = req.body;

    let user;
    if (req.decoded.role === RoleEnum.ADMIN) {
      user = userId ? userId : req.decoded._id;
    } else if (req.decoded.role === RoleEnum.USER) {
      user = req.decoded._id;
    }

    const checkCart = await this._cartModel.findOne({
      filter: { createdBy: user },
    });
    if (!checkCart)
      throw new NotFoundException("This user does not have a cart yet");

    const product = await this._productModel.findOne({
      filter: { _id: itemId },
    });
    if (!product) throw new NotFoundException("Product Not Found");

    const price = product.priceAfterDiscount
      ? product.priceAfterDiscount
      : product.originalPrice;
    const total = price * quantity;

    const productId = checkCart.items.findIndex((item) => {
      return item.productId.toString() === itemId.toString();
    });

    if (productId === -1) {
      throw new NotFoundException("Item Not Found In Cart");
    }

    if (quantity > product.stock) {
      throw new BadRequestException("Product Out Of Stock");
    }

    const item = checkCart.items[productId];
    if (item) {
      item.quantity = quantity;
      item.productTotal = price;
      item.subTotal = total;
    }

    checkCart.subTotal = checkCart.items.reduce(
      (sum, item) => sum + (item.subTotal || 0),
      0,
    );

    await checkCart.save();

    return res.status(200).json({
      message: "Item Quantity Updated Successfully",
      Data: { cart: checkCart },
    });
  };

  removeItem = async (req: Request, res: Response): Promise<Response> => {
    const { itemId, userId } = req.params as removeItemDTO;

    let user;
    if (req.decoded.role === RoleEnum.ADMIN) {
      user = userId ? userId : req.decoded._id;
    } else if (req.decoded.role === RoleEnum.USER) {
      user = req.decoded._id;
    }

    const cart = await this._cartModel.findOne({ filter: { createdBy: user } });
    if (!cart) throw new NotFoundException("Cart Not Found");

    const productId = cart.items.findIndex((item) => {
      return item?.productId && item.productId.toString() === itemId.toString();
    });

    if (productId === -1) {
      throw new NotFoundException("Product Not Found In Cart");
    }

    cart.items.splice(productId, 1);

    cart.subTotal = cart.items.reduce(
      (sum, item) => sum + (item.subTotal || 0),
      0,
    );

    await cart.save();

    return res
      .status(200)
      .json({ message: "Remove Product Successfully", Data: { cart } });
  };

  clearCart = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req.params as clearCartDTO;

    let user;
    if (req.decoded.role === RoleEnum.ADMIN) {
      user = userId ? userId : req.decoded._id;
    } else if (req.decoded.role === RoleEnum.USER) {
      user = req.decoded._id;
    }

    const cart = await this._cartModel.findOneAndUpdate({
      filter: { createdBy: user },
      update: {
        items: [],
        subTotal: 0,
        discount: 0,
      },
      options: { new: true },
    });
    if (!cart)
      throw new NotFoundException("Not Found Cart Or Failed To Update Cart");

    return res.status(200).json({ message: "Clear Cart Successfully" });
  };

  applyCoupon = async (req: Request, res: Response): Promise<Response> => {
    const { coupon }: applyCouponDTO = req.body;
    const { userId } = req.params as applyCouponParamsDTO;

    let user;
    if (req.decoded.role === RoleEnum.ADMIN) {
      user = userId ? userId : req.decoded._id;
    } else if (req.decoded.role === RoleEnum.USER) {
      user = req.decoded._id;
    }

    const checkCoupon = await this._couponModel.findOne({
      filter: { code: coupon },
    });
    if (!checkCoupon) throw new NotFoundException("Coupon Not Found");

    if (
      checkCoupon.maxUsage &&
      checkCoupon.maxUsage <= checkCoupon.usageCount
    ) {
      throw new BadRequestException("Coupon Reach Max Usage");
    }

    if (
      checkCoupon.couponStatus === couponStatusEnum.EXPIRED ||
      (checkCoupon.couponExpiredAt && checkCoupon.couponExpiredAt < new Date())
    ) {
      throw new BadRequestException("Coupon Is Expired");
    }

    if (
      checkCoupon.couponAvailableAt &&
      checkCoupon.couponAvailableAt > new Date()
    ) {
      throw new BadRequestException("Coupon Is Not Available Now");
    }

    const cart = await this._cartModel.findOne({
      filter: { createdBy: user },
    });
    if (!cart) throw new NotFoundException("Cart Not Found");

    if (!cart.items.length || cart.items.length < 1) {
      throw new BadRequestException("Cart Is Empty");
    }

    if (cart.coupon) {
      throw new BadRequestException(
        "You Already Use One Coupon Cann't Use More Than Coupon",
      );
    }

    const rawSubTotal = cart.items.reduce(
      (sum, item) => sum + item.subTotal,
      0,
    );

    const discountPercentage = checkCoupon.couponDiscount || 0;
    const discountAmount = (rawSubTotal * discountPercentage) / 100;

    cart.coupon = checkCoupon._id;
    cart.subTotal = rawSubTotal - discountAmount;
    cart.discount = discountPercentage;

    await cart.save();

    return res.status(200).json({ message: "Coupon Applied Successfully" });
  };
}
export default new CartServices();
