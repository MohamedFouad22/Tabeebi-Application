import * as z from "zod";
import { createCheckoutSchema, createOrderSchema } from "./order.validation";

export type createOrderDTO = z.infer<typeof createOrderSchema.body>;
export type createOrderParamsDTO = z.infer<typeof createOrderSchema.params>;
export type createCheckoutDTO = z.infer<typeof createCheckoutSchema.params>;
