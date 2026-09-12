import { HydratedDocument, model, models, Schema, Types } from "mongoose";

export interface IProduct {
  _id: Types.ObjectId;

  productName: string;
  overview: string;
  productImages: string[];
  slug?: string;

  brand: Types.ObjectId;
  category: Types.ObjectId;
  createdBy: Types.ObjectId;

  originalPrice: number;
  discountPercentage: number;
  priceAfterDiscount?: number;
  rate?: number;
  stock: number;
  sold?: number;

  createdAt: Date;
  updatedAt?: Date;
}

export const productSchema = new Schema<IProduct>(
  {
    productName: {
      type: String,
      minLength: 2,
      maxlength: 200,
      trim: true,
      required: true,
    },

    overview: {
      type: String,
      minLength: 2,
      maxLength: 5000,
      trim: true,
      required: true,
    },

    slug: {
      type: String,
    },

    productImages: {
      type: [String],
      required: true,
    },

    brand: {
      type: Types.ObjectId,
      ref: "Brand",
      required: true,
    },

    category: {
      type: Types.ObjectId,
      ref: "Category",
      required: true,
    },

    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    originalPrice: {
      type: Number,
      min: 1,
      required: true,
    },

    discountPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
      required: true,
    },

    priceAfterDiscount: {
      type: Number,
      min: 0,
    },

    rate: {
      type: Number,
      min: 0.5,
      max: 5,
    },

    stock: {
      type: Number,
      min: 0,
      required: true,
    },

    sold: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

productSchema.pre("save", async function (this: HProductDocument) {
  if (this.isNew || this.isModified("productName")) {
    const name = this.productName.trim().toLowerCase().replace(/\s+/g, "-");
    this.slug = `${name}`;
  }
});

productSchema.pre("save", async function (this: HProductDocument) {
  if (
    this.isNew ||
    this.isModified("originalPrice") ||
    this.isModified("discountPercentage")
  ) {
    if (this.discountPercentage === 0) {
      this.priceAfterDiscount = this.originalPrice;
    } else {
      this.priceAfterDiscount =
        this.originalPrice -
        (this.originalPrice * this.discountPercentage) / 100;
    }
  }
});

export type HProductDocument = HydratedDocument<IProduct>;
export const productModel = models.Product || model("Product", productSchema);
