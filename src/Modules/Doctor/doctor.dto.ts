import * as z from "zod";
import {
  createDoctorSchema,
  deleteDoctorSchema,
  getDoctorSchema,
  getDoctorsSchema,
  updateDoctorSchema,
} from "./doctor.validation";

export type createDoctorDTO = z.infer<typeof createDoctorSchema.body>;
export type createDoctorParamsDTO = z.infer<typeof createDoctorSchema.params>;
export type getDoctorsDTO = z.infer<typeof getDoctorsSchema.query>;
export type getDoctorDTO = z.infer<typeof getDoctorSchema.params>;
export type updateDoctorParamsDTO = z.infer<typeof updateDoctorSchema.params>;
export type updateDoctorDTO = z.infer<typeof updateDoctorSchema.body>;
export type deleteDoctorDTO = z.infer<typeof deleteDoctorSchema.params>;
