import * as z from "zod";
import {
  confirmEmailSchema,
  forgetPasswordSchema,
  loginSchema,
  loginWithGoogleSchema,
  logoutSchema,
  resendOTPSchema,
  resetPasswordSchema,
  signupSchema,
  updatedPasswordSchema,
  verifyTwoAuthFactorSchema,
} from "./auth.validation";

export type signupDTO = z.infer<typeof signupSchema.body>;
export type confirmEmailDTO = z.infer<typeof confirmEmailSchema.body>;
export type resendOTPDTO = z.infer<typeof resendOTPSchema.body>;
export type loginDTO = z.infer<typeof loginSchema.body>;
export type forgetPasswordDTO = z.infer<typeof forgetPasswordSchema.body>;
export type resetPasswordDTO = z.infer<typeof resetPasswordSchema.body>;
export type updatedPasswordDTO = z.infer<typeof updatedPasswordSchema.body>;
export type verifyTwoAuthFactorDTO = z.infer<
  typeof verifyTwoAuthFactorSchema.body
>;
export type loginWithGoogleDTO = z.infer<typeof loginWithGoogleSchema.body>;
export type logoutDTO = z.infer<typeof logoutSchema.body>;
