import * as z from "zod";
import {
  clearCartSchema,
  createCartSchema,
  getCartSchema,
  removeItemSchema,
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
export type removeItemDTO = z.infer<typeof removeItemSchema.params>;
export type clearCartDTO = z.infer<typeof clearCartSchema.params>;
