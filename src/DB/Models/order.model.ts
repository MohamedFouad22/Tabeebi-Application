import { HydratedDocument, model, models, Schema, Types } from "mongoose";
import {
  PaymentMethodEnum,
  PaymentStatusEnum,
  statusEnum,
} from "../../Utils/Enum/enum.utils";
import { ICartItemAttributes } from "./cart.model";

export interface IOrder {
  _id: Types.ObjectId;

  createdBy: Types.ObjectId;
  cartId: Types.ObjectId;
  couponId?: Types.ObjectId;

  subTotal: number;
  discount: number;
  totalAfterDiscount: number;

  status: statusEnum;
  paymentMethod: PaymentMethodEnum;
  paymentStatus: PaymentStatusEnum;

  items: {
    productId: Types.ObjectId;
    productTotal: number;
    subTotal: number;
    quantity: number;
    selectedAttributes?: ICartItemAttributes[];
  }[];

  address: string;
  phone: string;

  shippingFee: number;
  taxFee: number;

  intentId?: string;

  createdAt: Date;
  updatedAt?: Date;
}

export const orderSchema = new Schema<IOrder>(
  {
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    cartId: {
      type: Types.ObjectId,
      ref: "Cart",
      required: true,
    },

    couponId: {
      type: Types.ObjectId,
      ref: "Coupon",
    },

    subTotal: {
      type: Number,
      min: 0,
      required: true,
    },

    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    totalAfterDiscount: {
      type: Number,
      min: 0,
      required: true,
    },

    status: {
      type: String,
      enum: { values: Object.values(statusEnum) },
      default: statusEnum.PENDING,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: { values: Object.values(PaymentMethodEnum) },
      default: PaymentMethodEnum.CASH,
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: { values: Object.values(PaymentStatusEnum) },
      default: PaymentStatusEnum.UNPAID,
      required: true,
    },

    address: {
      type: String,
      minLength: 10,
      maxLength: 500,
      trim: true,
      required: true,
    },

    items: [
      {
        productId: {
          type: Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productTotal: {
          type: Number,
          default: 0,
          required: true,
        },
        subTotal: {
          type: Number,
          default: 0,
          required: true,
        },
        quantity: {
          type: Number,
          min: [1, "Quantity cannot be less than 1"],
          required: true,
        },
        selectedAttributes: [
          {
            key: { type: String, required: true },
            value: { type: String, required: true },
            _id: false,
          },
        ],
      },
    ],

    phone: {
      type: String,
      required: true,
    },

    shippingFee: {
      type: Number,
      default: 0,
      required: true,
    },

    taxFee: {
      type: Number,
      default: 0,
      required: true,
    },

    intentId: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export type HOrderDocument = HydratedDocument<IOrder>;
export const orderModel = models.Order || model("Order", orderSchema);
