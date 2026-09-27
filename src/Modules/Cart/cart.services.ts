import { Request, Response } from "express";
import { CartRepository } from "../../DB/Repositories/cart.repository";
import { cartModel } from "../../DB/Models/cart.model";
import {
  BadRequestException,
  NotFoundException,
} from "../../Utils/Security/Error/global.error.utils";
import { ProductRepository } from "../../DB/Repositories/product.repository";
import { productModel } from "../../DB/Models/product.model";
import { createCartDTO, getCartDTO } from "./cart.dto";
import { Types } from "mongoose";
import { RoleEnum } from "../../Utils/Enum/enum.utils";

class CartServices {
  private _cartModel = new CartRepository(cartModel);
  private _productModel = new ProductRepository(productModel);
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
}
export default new CartServices();
