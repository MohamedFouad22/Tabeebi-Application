import * as z from "zod";
import {
  GenderEnum,
  ProviderEnum,
  RoleEnum,
  TwoAuthFactorEnum,
} from "../Utils/Enum/enum.utils";
import { Types } from "mongoose";

export const generalFields = {
  firstName: z.string().trim().min(3).max(25),
  lastName: z.string().trim().min(3).max(25),
  userName: z.string().trim().min(3).max(25).optional(),
  email: z.email(),
  phone: z.string(),
  password: z.string().min(8),
  confirmPassword: z.string(),
  OTPVerificationCode: z.string(),
  profileImage: z.string(),
  coverImages: z.string().array(),

  age: z.number().min(18),

  twoFactorAuthStatus: z
    .enum(TwoAuthFactorEnum)
    .default(TwoAuthFactorEnum.INACTIVE),
  provider: z.enum(ProviderEnum).default(ProviderEnum.SYSTEM),
  gender: z.enum(GenderEnum).default(GenderEnum.MALE),
  role: z.enum(RoleEnum).default(RoleEnum.USER),

  VerificationAccountExpiredAt: z.date(),
  changeCredientialsTime: z.date().optional(),
  OTPExpiredAt: z.date().optional(),
  confirmedAt: z.date().optional(),
  freezedAt: z.date().optional(),
  restoredAt: z.date().optional(),

  freezedBy: z.string().refine((value) => {
    Types.ObjectId.isValid(value);
  }),
  restoredBy: z.string().refine((value) => {
    Types.ObjectId.isValid(value);
  }),
};
