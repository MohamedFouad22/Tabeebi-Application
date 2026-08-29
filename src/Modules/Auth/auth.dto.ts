import * as z from "zod";
import { confirmEmailSchema, loginSchema, resendOTPSchema, signupSchema } from "./auth.validation";

export type signupDTO = z.infer<typeof signupSchema.body>;
export type confirmEmailDTO = z.infer<typeof confirmEmailSchema.body>;
export type resendOTPDTO = z.infer<typeof resendOTPSchema.body>;
export type loginDTO = z.infer<typeof loginSchema.body>;
