import * as z from "zod";
import { generalFields } from "../../Middleware/generalFields.utils";
import { Types } from "mongoose";

export const createClinicSchema = {
  body: z.strictObject({
    clinicName: z
      .string()
      .min(2, { message: "Clinic Name Must Be At Least 2 Letters" })
      .max(50, { message: "Clinic Name Must Be At Most 50 Letters" })
      .trim(),
    location: z.string().optional(),
    address: z
      .string()
      .min(2, { message: "Address Must Be At Least 2 Letters" })
      .max(250, { message: "Address Must Be At Most 250 Letters" })
      .trim(),
    phone: generalFields.phone,
    email: generalFields.email.optional(),
    doctors: z
      .array(
        z.string().refine((val) => {
          return Types.ObjectId.isValid(val);
        }),
      )
      .default([]),
  }),
};

export const getAllClinicsSchema = {
  query: z.strictObject({
    clinicName: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
};

export const getClinicSchema = {
  params: z.strictObject({
    clinicId: z.string().refine((value) => {
      return Types.ObjectId.isValid(value);
    }),
  }),
};

export const updateClinicSchema = {
  params: z.strictObject({
    clinicId: z.string().refine((value) => {
      return Types.ObjectId.isValid(value);
    }),
  }),
  body: z.strictObject({
    clinicName: z
      .string()
      .min(2, { message: "Clinic Name Must Be At Least 2 Letters" })
      .max(50, { message: "Clinic Name Must Be At Most 50 Letters" })
      .trim()
      .optional(),
    location: z.string().optional(),
    address: z
      .string()
      .min(2, { message: "Address Must Be At Least 2 Letters" })
      .max(250, { message: "Address Must Be At Most 250 Letters" })
      .trim()
      .optional(),
    phone: generalFields.phone.optional(),
    email: generalFields.email.optional(),
  }),
};
