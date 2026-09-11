import { Types } from "mongoose";
import * as z from "zod";

export const createCategorySchema = {
  body: z.strictObject({
    categoryName: z
      .string()
      .min(2, { message: "Category Name Must Be At Least 2 Letters" })
      .max(25, { message: "Category Name Must Be At Most 25 Letters" })
      .trim(),

    categoryDescription: z
      .string()
      .min(2, { message: "Category Name Must Be At Least 2 Letters" })
      .max(500, { message: "Category Name Must Be At Most 500 Letters" })
      .trim()
      .optional(),

    brands: z.array(
      z.string().refine((val) => Types.ObjectId.isValid(val), {
        message: "Invalid Brand ID",
      }),
    ),
    topBrands: z
      .array(
        z.string().refine((val) => Types.ObjectId.isValid(val), {
          message: "Invalid Brand ID",
        }),
      )
      .optional(),
  }),
};

export const getCategorySchema = {
  params: z.strictObject({
    categoryId: z.string().refine((value) => {
      return Types.ObjectId.isValid(value);
    }),
  }),
};

export const updateCategorySchema = {
  params: z.strictObject({
    categoryId: z.string().refine((value) => {
      return Types.ObjectId.isValid(value);
    }),
  }),
  body: z
    .strictObject({
      categoryName: z
        .string()
        .min(2, { message: "Category Name Must Be At Least 2 Letters" })
        .max(25, { message: "Category Name Must Be At Most 25 Letters" })
        .trim()
        .optional(),

      categoryDescription: z
        .string()
        .min(2, { message: "Category Name Must Be At Least 2 Letters" })
        .max(500, { message: "Category Name Must Be At Most 500 Letters" })
        .trim()
        .optional(),

      brands: z
        .array(
          z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: "Invalid Brand ID",
          }),
        )
        .optional(),

      topBrands: z
        .array(
          z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: "Invalid Brand ID",
          }),
        )
        .optional(),

      categoryImage: z.any().optional(),
    })
    .passthrough(),
};
