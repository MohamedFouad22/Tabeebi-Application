import * as z from "zod";
import { createClinicSchema } from "./clinic.validation";

export type IcreateClinicDTO = z.Infer<typeof createClinicSchema.body>;
