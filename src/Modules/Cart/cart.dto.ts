import * as z from "zod";
import { createCartSchema, getCartSchema } from "./cart.validation";

export type createCartDTO = z.infer<typeof createCartSchema.body>;
export type getCartDTO = z.infer<typeof getCartSchema.params>;
