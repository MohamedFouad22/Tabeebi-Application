import * as z from "zod";
import {
  editProfileSchema,
  enableTwoAuthFactorSchema,
  freezeAccountSchema,
  restoreAccountSchema,
} from "./user.validation";

export type freezeAccountDTO = z.infer<typeof freezeAccountSchema.params>;
export type restoreAccountDTO = z.infer<typeof restoreAccountSchema.params>;
export type editProfileDTO = z.infer<typeof editProfileSchema.body>;
export type enableTwoAuthFactorDTO = z.infer<typeof enableTwoAuthFactorSchema.body>;
