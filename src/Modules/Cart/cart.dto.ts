import * as z from "zod";
import { createCartSchema } from "./cart.validation";

export type createCartDTO = z.infer<typeof createCartSchema.body>;
