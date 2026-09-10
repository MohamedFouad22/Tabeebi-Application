import * as z from "zod";
import { createCategorySchema, getCategorySchema } from "./category.validation";

export type createCategoryDTO = z.infer<typeof createCategorySchema.body>;
export type getCategoryDTO = z.infer<typeof getCategorySchema.params>;
