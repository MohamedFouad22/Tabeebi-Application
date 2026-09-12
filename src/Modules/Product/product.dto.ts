import * as z from "zod";
import {
  createProductSchema,
  deleteProductSchema,
  getProductSchema,
} from "./product.validation";

export type createProductDTO = z.infer<typeof createProductSchema.body>;
export type getProductDto = z.infer<typeof getProductSchema.params>;
export type deleteProductDTO = z.infer<typeof deleteProductSchema.params>;
