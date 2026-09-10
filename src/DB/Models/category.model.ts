import { HydratedDocument, model, models, Schema, Types } from "mongoose";

export interface ICategory {
  _id: Types.ObjectId;

  categoryName: string;
  categoryDescription?: string;
  categoryImage?: string[];
  createdBy: Types.ObjectId;
  brands: Types.ObjectId[];
  topBrands: Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;
}

export const categorySchema = new Schema<ICategory>(
  {
    categoryName: {
      type: String,
      minLength: 2,
      maxLength: 25,
      unique: true,
      trim: true,
      lowercase: true,
      required: true,
    },

    categoryDescription: {
      type: String,
      minLength: 2,
      maxLength: 500,
      trim: true,
    },

    categoryImage: [String],

    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    brands: {
      type: [Types.ObjectId],
      ref: "Brand",
      required: true,
    },

    topBrands: {
      type: [Types.ObjectId],
      ref: "Brand",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export type HCategoryDocument = HydratedDocument<ICategory>;
export const categoryModel =
  models.Category || model("Category", categorySchema);
