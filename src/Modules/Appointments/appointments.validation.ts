import { Types } from "mongoose";
import * as z from "zod";
import {
  PaymentMethodEnum,
  PaymentStatusEnum,
  statusEnum,
} from "../../Utils/Enum/enum.utils";
import { generalFields } from "../../Middleware/generalFields.utils";

export const bookAppointmentSchema = {
  params: z.strictObject({
    doctorId: z.string().refine((value) => {
      return Types.ObjectId.isValid(value);
    }),
  }),
  body: z
    .strictObject({
      status: z.enum(statusEnum).default(statusEnum.PENDING).optional(),
      paymentStatus: z
        .enum(PaymentStatusEnum)
        .default(PaymentStatusEnum.UNPAID)
        .optional(),
      paymentMethod: z
        .enum(PaymentMethodEnum)
        .default(PaymentMethodEnum.CASH)
        .optional(),
      email: generalFields.email.optional(),
      phone: generalFields.phone,
      patientName: z.string(),
      workingSchedule: z.object({
        day: z.string(),
        from: z.string(),
        to: z.string(),
        isDayOff: z.boolean(),
      }),
    })
    .superRefine((value, ctx) => {
      if (value.patientName.split(" ").length < 2) {
        ctx.addIssue({
          code: "custom",
          path: ["patientName"],
          message: "Patient Name Must Be At Least 2 Name",
        });
      }
    }),
};

export const getPatientSchema = {
  params: z
    .strictObject({
      patientId: z
        .string()
        .refine((value) => {
          return Types.ObjectId.isValid(value);
        })
        .optional(),
    })
    .optional(),
};

export const getAppointmentSchema = {
  params: z.strictObject({
    appointmentId: z.string().refine((value) => {
      return Types.ObjectId.isValid(value);
    }),
  }),
};

export const getDoctorHistorySchema = {
  params: z.strictObject({
    doctorId: z.string().refine((value) => {
      return Types.ObjectId.isValid(value);
    }),
    patientId: z
      .string()
      .refine((value) => {
        return Types.ObjectId.isValid(value);
      })
      .optional(),
  }),
};

export const rescheduledAppointmentSchema = {
  params: z.strictObject({
    appointmentId: z.string().refine((value) => {
      return Types.ObjectId.isValid(value);
    }),
    patientId: z
      .string()
      .refine((value) => {
        return Types.ObjectId.isValid(value);
      })
      .optional(),
    doctorId: z
      .string()
      .refine((value) => {
        return Types.ObjectId.isValid(value);
      })
      .optional(),
  }),
  body: z.strictObject({
    workingSchedule: z.object({
      day: z.string(),
      from: z.string(),
      to: z.string(),
      isDayOff: z.boolean(),
    }),
  }),
};

export const cancelAppointmentSchema = {
  params: z.strictObject({
    appointmentId: z.string().refine((value) => {
      return Types.ObjectId.isValid(value);
    }),
  }),
};

export const updateAppointmentSchema = {
  params: z.strictObject({
    appointmentId: z.string().refine((value) => {
      return Types.ObjectId.isValid(value);
    }),
  }),
  body: z.strictObject({
    status: z.enum([statusEnum.CONFIRMED, statusEnum.COMPLETED]),
  }),
};

export const deleteAppointmentSchema = {
  params: z.strictObject({
    appointmentId: z.string().refine((value) => {
      return Types.ObjectId.isValid(value);
    }),
  }),
};
