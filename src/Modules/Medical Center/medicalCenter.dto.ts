import * as z from "zod";
import {
  createFacilitySchema,
  getFacilitiesSchema,
} from "./medicalCenter.validation";

export type createClinicDTO = z.infer<typeof createFacilitySchema.body>;
export type getFacilitiesDTO = z.infer<typeof getFacilitiesSchema.query>;
