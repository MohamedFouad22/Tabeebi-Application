import * as z from "zod";
import { createDoctorSchema } from "./doctor.validation";

export type createDoctorDTO = z.infer<typeof createDoctorSchema.body>;
export type createDoctorParamsDTO = z.infer<typeof createDoctorSchema.params>;
