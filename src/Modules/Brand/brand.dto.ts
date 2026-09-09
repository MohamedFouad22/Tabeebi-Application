import * as z from "zod";
import {
  createBrandSchema,
  deleteBrandSchema,
  getSpecificBrandSchema,
  updateBrandSchema,
} from "./brand.validation";

export type createBrandDTO = z.infer<typeof createBrandSchema.body>;
export type getSpecificBrandDTO = z.infer<typeof getSpecificBrandSchema.params>;
export type updateBrandDTO = z.infer<typeof updateBrandSchema.body>;
export type updateBrandParamsDTO = z.infer<typeof updateBrandSchema.params>;
export type deleteBrandDTO = z.infer<typeof deleteBrandSchema.params>;
