import * as z from "zod";
import { createClinicSchema, getAllClinicsSchema } from "./clinic.validation";

export type IcreateClinicDTO = z.infer<typeof createClinicSchema.body>;
export type IgetAllClinicsDTO = z.infer<typeof getAllClinicsSchema.query>;
