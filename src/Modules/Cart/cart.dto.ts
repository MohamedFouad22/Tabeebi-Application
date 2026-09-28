import * as z from "zod";
import {
  createCartSchema,
  getCartSchema,
  updateItemQuantitySchema,
} from "./cart.validation";

export type createCartDTO = z.infer<typeof createCartSchema.body>;
export type getCartDTO = z.infer<typeof getCartSchema.params>;
export type updateItemQuantityDTO = z.infer<
  typeof updateItemQuantitySchema.body
>;
export type updateItemQuantityParamsDTO = z.infer<
  typeof updateItemQuantitySchema.params
>;
