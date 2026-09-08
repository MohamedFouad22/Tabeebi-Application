import * as z from "zod";
import { generalFields } from "../../Middleware/generalFields.utils";

export const freezeAccountSchema = {
  params: z.strictObject({
    userId: generalFields.userId.optional(),
  }),
};

export const restoreAccountSchema = {
  params: z.strictObject({
    userId: generalFields.userId.optional(),
  }),
};

export const editProfileSchema = {
  body: z.strictObject({
    firstName: generalFields.firstName.optional(),
    lastName: generalFields.lastName.optional(),
    phone: generalFields.phone.optional(),
    age: generalFields.age.optional(),
    gender: generalFields.gender.optional(),
  }),
};

export const enableTwoAuthFactorSchema = {
  body: z.strictObject({
    otp: generalFields.otp,
  }),
};

export const deleteAccountSchema = {
  body: z.strictObject({
    otp: generalFields.otp,
  }),
};

export const inviteUserSchema = {
  body: z.strictObject({
    email: generalFields.email,
  }),
};

export const contactUsSchema = {
  body: z.strictObject({
    userName: generalFields.userName,
    email: generalFields.email,
    phone: generalFields.phone,
    comment: z
      .string()
      .min(2, { message: "Comment Must Be At Least 2 Letters" })
      .max(500, { message: "Comment Must Be At Most 500 Letters" }),
  }),
};
