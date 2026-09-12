import * as z from "zod";
import {
  createProductSchema,
  deleteProductSchema,
  getProductSchema,
  updateProductSchema,
} from "./product.validation";

export type createProductDTO = z.infer<typeof createProductSchema.body>;
export type getProductDto = z.infer<typeof getProductSchema.params>;
export type deleteProductDTO = z.infer<typeof deleteProductSchema.params>;
export type updateProductDTO = z.infer<typeof updateProductSchema.body>;
export type updateProductParamsDTO = z.infer<typeof updateProductSchema.params>;
