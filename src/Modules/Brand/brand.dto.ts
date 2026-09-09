import * as z from "zod";
import { createBrandSchema, getSpecificBrandSchema } from "./brand.validation";

export type createBrandDTO = z.infer<typeof createBrandSchema.body>;
export type getSpecificBrandDTO = z.infer<typeof getSpecificBrandSchema.params>;
