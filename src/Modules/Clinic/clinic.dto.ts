import * as z from "zod";
import {
  createClinicSchema,
  getAllClinicsSchema,
  getClinicSchema,
} from "./clinic.validation";

export type IcreateClinicDTO = z.infer<typeof createClinicSchema.body>;
export type IgetAllClinicsDTO = z.infer<typeof getAllClinicsSchema.query>;
export type IgetClinicDTO = z.infer<typeof getClinicSchema.params>;
