import { Types } from "mongoose";
import * as z from "zod";
import { SpecializationEnum } from "../../Utils/Enum/enum.utils";

export const createDoctorSchema = {
  params: z.strictObject({
    userId: z
      .string()
      .refine((value) => {
        return Types.ObjectId.isValid(value);
      })
      .optional(),
  }),
  body: z
    .strictObject({
      doctorName: z
        .string()
        .min(2, { message: "Doctor Name Must Be At Least 2 Letters" })
        .max(50, { message: "Doctor Name Must Be At Most 50 Letters" })
        .trim(),
      bio: z
        .string()
        .min(2, { message: "Bio Must Be At Least 2 Letters" })
        .max(250, { message: "Bio Must Be At Most 250 Letters" })
        .trim(),
      clinic: z.string().refine((value) => {
        return Types.ObjectId.isValid(value);
      }),
      specialization: z.enum(SpecializationEnum),
      consultationFee: z.coerce.number().min(0),
      slotDuration: z.coerce.number().default(30),
      workingSchedule: z.preprocess(
        (value) => {
          if (typeof value === "string") {
            return JSON.parse(value);
          }

          return value;
        },
        z.array(
          z.object({
            day: z.string(),
            from: z.string(),
            to: z.string(),
            isDayOff: z.boolean(),
          }),
        ),
      ),
    })
    .superRefine((value, ctx) => {
      if (value.doctorName.split(" ").length < 2) {
        ctx.addIssue({
          code: "custom",
          path: ["doctorName"],
          message: "Doctor Name Must Be At Least 2 Name",
        });
      }
    }),
};

export const getDoctorsSchema = {
  query: z.strictObject({
    specialization: z.enum(SpecializationEnum).optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
};

export const getDoctorSchema = {
  params: z.strictObject({
    doctorId: z.string().refine((value) => {
      return Types.ObjectId.isValid(value);
    }),
  }),
};

export const updateDoctorSchema = {
  params: z.strictObject({
    doctorId: z.string().refine((value) => {
      return Types.ObjectId.isValid(value);
    }),
  }),
  body: z
    .strictObject({
      doctorName: z
        .string()
        .min(2, { message: "Doctor Name Must Be At Least 2 Letters" })
        .max(50, { message: "Doctor Name Must Be At Most 50 Letters" })
        .trim()
        .optional(),
      bio: z
        .string()
        .min(2, { message: "Bio Must Be At Least 2 Letters" })
        .max(250, { message: "Bio Must Be At Most 250 Letters" })
        .trim()
        .optional(),
      clinic: z
        .string()
        .refine((value) => {
          return Types.ObjectId.isValid(value);
        })
        .optional(),
      specialization: z.enum(SpecializationEnum).optional(),
      consultationFee: z.coerce.number().min(0).optional(),
      slotDuration: z.coerce.number().default(30).optional(),
      workingSchedule: z
        .preprocess(
          (value) => {
            if (typeof value === "string") {
              return JSON.parse(value);
            }

            return value;
          },
          z.array(
            z.object({
              day: z.string(),
              from: z.string(),
              to: z.string(),
              isDayOff: z.boolean(),
            }),
          ),
        )
        .optional(),
    })
    .superRefine((value, ctx) => {
      if (value.doctorName && value.doctorName.split(" ").length < 2) {
        ctx.addIssue({
          code: "custom",
          path: ["doctorName"],
          message: "Doctor Name Must Be At Least 2 Name",
        });
      }
    }),
};
