import * as z from "zod";
import { createOrderSchema } from "./order.validation";

export type createOrderDTO = z.infer<typeof createOrderSchema.body>;
export type createOrderParamsDTO = z.infer<typeof createOrderSchema.params>;
