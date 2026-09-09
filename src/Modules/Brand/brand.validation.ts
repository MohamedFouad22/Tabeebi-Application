import { Types } from "mongoose";
import * as z from "zod";

export const createBrandSchema = {
  body: z.strictObject({
    brandName: z
      .string()
      .min(2, { message: "Brand Name Must Be At Least 2 Latters" })
      .max(25, { message: "Brand Name Must Be At Most 25 Latters" }),
    description: z
      .string()
      .min(2, { message: "Description Must Be At Least 2 Latters" })
      .max(500, { message: "Description Must Be At Most 500 Latters" }),
    rate: z.number().default(0).optional(),
  }),
};

export const getSpecificBrandSchema = {
  params: z.strictObject({
    brandId: z.string().refine((value) => {
      return Types.ObjectId.isValid(value);
    }),
  }),
};

export const updateBrandSchema = {
  params: z.strictObject({
    brandId: z.string().refine((value) => {
      return Types.ObjectId.isValid(value);
    }),
  }),
  body: z.strictObject({
    brandName: z
      .string()
      .min(2, { message: "Brand Name Must Be At Least 2 Latters" })
      .max(25, { message: "Brand Name Must Be At Most 25 Latters" })
      .optional(),
    description: z
      .string()
      .min(2, { message: "Description Must Be At Least 2 Latters" })
      .max(500, { message: "Description Must Be At Most 500 Latters" })
      .optional(),
  }),
};

export const deleteBrandSchema = {
  params: z.strictObject({
    brandId: z.string().refine((value) => {
      return Types.ObjectId.isValid(value);
    }),
  }),
};
