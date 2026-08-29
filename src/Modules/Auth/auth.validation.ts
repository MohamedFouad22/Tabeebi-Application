import * as z from "zod";
import { generalFields } from "../../Middleware/generalFields.utils";

export const signupSchema = {
  body: z
    .strictObject({
      firstName: generalFields.firstName,
      lastName: generalFields.lastName,
      userName: generalFields.userName.optional(),
      email: generalFields.email,
      phone: generalFields.phone,
      password: generalFields.password,
      confirmPassword: generalFields.confirmPassword,
      profileImage: generalFields.profileImage.optional(),
      coverImages: generalFields.coverImages.optional(),
      age: generalFields.age,
      gender: generalFields.gender,
      role: generalFields.role,
    })
    .superRefine((value, ctx) => {
      if (value.password && value.password !== value.confirmPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["password"],
          message: "Password Not Match",
        });
      }
      if (value.age && value.age < 18) {
        ctx.addIssue({
          code: "custom",
          path: ["age"],
          message: "The age must not be less than 18 years.",
        });
      }
    }),
};

export const confirmEmailSchema = {
  body: z.strictObject({
    otp: generalFields.otp,
    email: generalFields.email,
  }),
};

export const resendOTPSchema = {
  body: z.strictObject({
    email: generalFields.email,
  }),
};

export const loginSchema = {
  body: z.strictObject({
    email: generalFields.email,
    password: generalFields.password,
  }),
};
