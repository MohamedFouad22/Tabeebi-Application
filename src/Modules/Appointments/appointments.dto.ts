import * as z from "zod";
import {
  bookAppointmentSchema,
  getAppointmentSchema,
  getDoctorHistorySchema,
  getPatientSchema,
} from "./appointments.validation";

export type bookAppointmentDTO = z.infer<typeof bookAppointmentSchema.body>;
export type bookAppointmentParamsDTO = z.infer<
  typeof bookAppointmentSchema.params
>;
export type getPatientDTO = z.infer<typeof getPatientSchema.params>;
export type getAppointmentDTO = z.infer<typeof getAppointmentSchema.params>;
export type getDoctorHistoryDTO = z.infer<typeof getDoctorHistorySchema.params>;
