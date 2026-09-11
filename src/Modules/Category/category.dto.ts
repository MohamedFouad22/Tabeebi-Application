import * as z from "zod";
import { createCategorySchema, deleteCategorySchema, getCategorySchema, updateCategorySchema } from "./category.validation";

export type createCategoryDTO = z.infer<typeof createCategorySchema.body>;
export type getCategoryDTO = z.infer<typeof getCategorySchema.params>;
export type updateCategoryDTO = z.infer<typeof updateCategorySchema.body>;
export type updateCategoryParamsDTO = z.infer<typeof updateCategorySchema.params>;
export type deleteCategoryDTO = z.infer<typeof deleteCategorySchema.params>;
