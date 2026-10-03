import * as z from "zod";
import {
  createCheckoutSchema,
  createOrderSchema,
  getOrderSchema,
  getOrdersSchema,
} from "./order.validation";

export type createOrderDTO = z.infer<typeof createOrderSchema.body>;
export type createOrderParamsDTO = z.infer<typeof createOrderSchema.params>;
export type createCheckoutDTO = z.infer<typeof createCheckoutSchema.params>;
export type getOrdersDTO = z.infer<typeof getOrdersSchema.params>;
export type getOrdersQueryDTO = z.infer<typeof getOrdersSchema.query>;
export type getOrderDTO = z.infer<typeof getOrderSchema.params>;
