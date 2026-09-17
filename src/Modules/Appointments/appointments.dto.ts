import * as z from "zod";
import { bookAppointmentSchema } from "./appointments.validation";

export type bookAppointmentDTO = z.infer<typeof bookAppointmentSchema.body>;
export type bookAppointmentParamsDTO = z.infer<
  typeof bookAppointmentSchema.params
>;
