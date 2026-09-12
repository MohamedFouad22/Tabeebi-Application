import { Types } from "mongoose";
import * as z from "zod";

export const createProductSchema = {
  body: z.strictObject({
    productName: z
      .string()
      .min(2, { message: "Product Name Must Be At Least 2 Letters" })
      .max(200, { message: "Product Name Must Be At Most 200 Letters" })
      .trim(),
    overview: z
      .string()
      .min(2, { message: "Product Overview Must Be At Least 2 Letters" })
      .max(5000, { message: "Product Overview Must Be At Most 5000 Letters" })
      .trim(),
    brand: z.string().refine((value) => {
      return Types.ObjectId.isValid(value);
    }),
    category: z.string().refine((value) => {
      return Types.ObjectId.isValid(value);
    }),
    originalPrice: z.coerce
      .number()
      .positive({ message: "Price must be greater than 0" }),
    discountPercentage: z.coerce.number().min(0).max(100).default(0),
    stock: z.coerce.number().int().min(0),
    sold: z.coerce.number().min(0).default(0).optional(),
  }),
};

export const getProductSchema = {
  params: z.strictObject({
    productId: z.string().refine((value) => {
      return Types.ObjectId.isValid(value);
    }),
  }),
};

export const deleteProductSchema = {
  params: z.strictObject({
    productId: z.string().refine((value) => {
      return Types.ObjectId.isValid(value);
    }),
  }),
};
