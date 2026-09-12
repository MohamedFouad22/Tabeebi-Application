import * as z from "zod";
import { createProductSchema } from "./product.validation";

export type createProductDTO = z.infer<typeof createProductSchema.body>;
