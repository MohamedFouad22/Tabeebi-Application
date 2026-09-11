import * as z from "zod";
import { createCategorySchema, getCategorySchema, updateCategorySchema } from "./category.validation";

export type createCategoryDTO = z.infer<typeof createCategorySchema.body>;
export type getCategoryDTO = z.infer<typeof getCategorySchema.params>;
export type updateCategorySchema = z.infer<typeof updateCategorySchema.body>;
export type updateCategoryParamsSchema = z.infer<typeof updateCategorySchema.params>;
