import * as z from "zod";
import {
  bookAppointmentSchema,
  cancelAppointmentSchema,
  checkoutAppointmentSchema,
  deleteAppointmentSchema,
  getAppointmentSchema,
  getDoctorHistorySchema,
  getPatientSchema,
  rescheduledAppointmentSchema,
  updateAppointmentSchema,
} from "./appointments.validation";

export type bookAppointmentDTO = z.infer<typeof bookAppointmentSchema.body>;
export type bookAppointmentParamsDTO = z.infer<
  typeof bookAppointmentSchema.params
>;
export type getPatientDTO = z.infer<typeof getPatientSchema.params>;
export type getAppointmentDTO = z.infer<typeof getAppointmentSchema.params>;
export type getDoctorHistoryDTO = z.infer<typeof getDoctorHistorySchema.params>;
export type rescheduledAppointmentDTO = z.infer<
  typeof rescheduledAppointmentSchema.body
>;
export type rescheduledAppointmentParamsDTO = z.infer<
  typeof rescheduledAppointmentSchema.params
>;
export type cancelAppointmentDTO = z.infer<
  typeof cancelAppointmentSchema.params
>;
export type updateAppointmentDTO = z.infer<typeof updateAppointmentSchema.body>;
export type updateAppointmentParamsDTO = z.infer<
  typeof updateAppointmentSchema.params
>;
export type deleteAppointmentDTO = z.infer<
  typeof deleteAppointmentSchema.params
>;
export type checkoutAppointmentDTO = z.infer<
  typeof checkoutAppointmentSchema.params
>;
