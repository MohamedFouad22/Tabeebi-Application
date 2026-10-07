import * as z from "zod";
import {
  createFacilitySchema,
  getFacilitiesSchema,
  getFacilitySchema,
} from "./medicalCenter.validation";

export type createClinicDTO = z.infer<typeof createFacilitySchema.body>;
export type getFacilitiesDTO = z.infer<typeof getFacilitiesSchema.query>;
export type getFacilityDTO = z.infer<typeof getFacilitySchema.params>;
