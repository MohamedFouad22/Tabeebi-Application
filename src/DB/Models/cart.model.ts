import { HydratedDocument, model, models, Schema, Types } from "mongoose";

export interface ICartItemAttributes {
  key: string;
  value: string;
}

export interface ICart {
  _id: Types.ObjectId;

  createdBy?: Types.ObjectId;
  guestToken?: string;

  items: {
    productId: Types.ObjectId;
    productTotal: number;
    subTotal: number;
    quantity: number;
    selectedAttributes: ICartItemAttributes[];
  }[];

  coupon?: Types.ObjectId;

  subTotal: number;
  discount?: number;
  shippingFee: number;
  taxFee: number;
  TotalAfterAdditions: number;

  createdAt: Date;
  updatedAt?: Date;
}

export const cartSchema = new Schema<ICart>(
  {
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
    },

    guestToken: String,

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

    coupon: {
      type: Types.ObjectId,
      ref: "Coupon",
    },

    subTotal: { type: Number, default: 0, required: true },
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be less than 0"],
      max: [100, "Discount cannot be most than 100"],
    },
    shippingFee: { type: Number, default: 0, required: true },
    taxFee: { type: Number, default: 0, required: true },
    TotalAfterAdditions: { type: Number, default: 0, required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export type HCartDocument = HydratedDocument<ICart>;
export const cartModel = models.Cart || model("Cart", cartSchema);
