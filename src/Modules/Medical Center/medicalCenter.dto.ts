import * as z from "zod";
import { createFacilitySchema } from "./medicalCenter.validation";

export type createClinicDTO = z.infer<typeof createFacilitySchema.body>;
