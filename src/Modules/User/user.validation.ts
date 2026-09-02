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
