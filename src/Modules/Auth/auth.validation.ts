import * as z from "zod";
import { generalFields } from "../../Middleware/generalFields.utils";

export const signupSchema = {
  body: z
    .strictObject({
      firstName: generalFields.firstName,
      lastName: generalFields.lastName,
      userName: generalFields.userName,
      email: generalFields.email,
      phone: generalFields.phone,
      password: generalFields.password,
      confirmPassword: generalFields.confirmPassword,
      OTPVerificationCode: generalFields.OTPVerificationCode,
      profileImage: generalFields.profileImage,
      coverImages: generalFields.coverImages,
      age: generalFields.age,
      twoFactorAuthStatus: generalFields.twoFactorAuthStatus,
      provider: generalFields.provider,
      gender: generalFields.gender,
      role: generalFields.role,
      VerificationAccountExpiredAt: generalFields.VerificationAccountExpiredAt,
      changeCredientialsTime: generalFields.changeCredientialsTime,
      OTPExpiredAt: generalFields.OTPExpiredAt,
      confirmedAt: generalFields.confirmedAt,
      freezedAt: generalFields.freezedAt,
      restoredAt: generalFields.restoredAt,
      freezedBy: generalFields.freezedAt,
      restoredBy: generalFields.restoredAt,
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
