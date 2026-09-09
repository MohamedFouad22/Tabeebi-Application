import { HydratedDocument, model, models, Schema, Types } from "mongoose";

export interface IBrand {
  _id: Types.ObjectId;

  brandName: string;
  createdBy: Types.ObjectId;
  brandLogo: string;
  description: string;
  rate?: number;

  createdAt: Date;
  updatedAt?: Date;
}

export const brandSchema = new Schema<IBrand>(
  {
    brandName: {
      type: String,
      minLength: 2,
      maxlength: 25,
      unique: true,
      required: true,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    brandLogo: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      minLength: 2,
      maxLength: 500,
      required: true,
    },
    rate: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export type HBrandDocument = HydratedDocument<IBrand>;
export const brandModel = models.Brand || model("Brand", brandSchema);
