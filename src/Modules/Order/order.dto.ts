import * as z from "zod";
import {
  cancelOrderSchema,
  createCheckoutSchema,
  createOrderSchema,
  getOrdersAdminSchema,
  getOrderSchema,
  getOrdersSchema,
  updateStatusSchema,
} from "./order.validation";

export type createOrderDTO = z.infer<typeof createOrderSchema.body>;
export type createOrderParamsDTO = z.infer<typeof createOrderSchema.params>;
export type createCheckoutDTO = z.infer<typeof createCheckoutSchema.params>;
export type getOrdersDTO = z.infer<typeof getOrdersSchema.params>;
export type getOrdersQueryDTO = z.infer<typeof getOrdersSchema.query>;
export type getOrderDTO = z.infer<typeof getOrderSchema.params>;
export type cancelOrderDTO = z.infer<typeof cancelOrderSchema.params>;
export type getOrdersAdminDTO = z.infer<typeof getOrdersAdminSchema.query>;
export type updateStatusDTO = z.infer<typeof updateStatusSchema.body>;
export type updateStatusParamsDTO = z.infer<typeof updateStatusSchema.params>;
