import { Types } from "mongoose";
import * as z from "zod";
import { ItemTypeEnum } from "../../Utils/Enum/enum.utils";

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

export const reteBrandSchema = {
  params: z.strictObject({
    brandId: z.string().refine((value) => {
      return Types.ObjectId.isValid(value);
    }),
  }),
  body: z
    .strictObject({
      rate: z.number().min(0.5).max(5).optional(),
      comment: z
        .string()
        .min(2, { message: "Comment Must Be At Least 2 Letters" })
        .max(500, { message: "Comment Must Be At Most 500 Letters" })
        .optional(),
    })
    .superRefine((value, ctx) => {
      if (value.rate === undefined && value.comment === undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["rate"],
          message: "At least rate or comment must be provided",
        });
      }
    }),
};

export const brandReviewsSchema = {
  params: z.strictObject({
    brandId: z.string().refine((value) => {
      return Types.ObjectId.isValid(value);
    }),
  }),
  query: z.strictObject({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(10),
  }),
};
