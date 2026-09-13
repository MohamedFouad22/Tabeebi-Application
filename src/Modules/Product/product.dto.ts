import * as z from "zod";
import {
  createProductSchema,
  deleteImageSchema,
  deleteProductSchema,
  getProductSchema,
  updateProductSchema,
  updateProductStockSchema,
} from "./product.validation";

export type createProductDTO = z.infer<typeof createProductSchema.body>;
export type getProductDto = z.infer<typeof getProductSchema.params>;
export type deleteProductDTO = z.infer<typeof deleteProductSchema.params>;
export type updateProductDTO = z.infer<typeof updateProductSchema.body>;
export type updateProductParamsDTO = z.infer<typeof updateProductSchema.params>;
export type updateProductStockDTO = z.infer<
  typeof updateProductStockSchema.body
>;
export type updateProductStockParamsDTO = z.infer<
  typeof updateProductStockSchema.params
>;
export type deleteImageDTO = z.infer<typeof deleteImageSchema.body>;
export type deleteImageParamsDTO = z.infer<typeof deleteImageSchema.params>;
