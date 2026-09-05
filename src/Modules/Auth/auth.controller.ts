import { Router } from "express";
const router: Router = Router();
import authServices from "./auth.services";
import { validation } from "../../Middleware/validation.middleware";
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
import { authentication } from "../../Middleware/authentication.middleware";
import { RoleEnum, TokenTypeEnum } from "../../Utils/Enum/enum.utils";

router.post("/signup", validation(signupSchema), authServices.signup);
router.patch(
  "/confirm-email",
  validation(confirmEmailSchema),
  authServices.confirmEmail,
);
router.patch(
  "/resend-otp",
  validation(resendOTPSchema),
  authServices.resendOTP,
);
router.post("/login", validation(loginSchema), authServices.login);
router.post(
  "/forget-password",
  validation(forgetPasswordSchema),
  authServices.forgetPassword,
);
router.patch(
  "/reset-password",
  validation(resetPasswordSchema),
  authServices.resetPassword,
);
router.patch(
  "/update-password",
  authentication(TokenTypeEnum.ACCESS, [
    RoleEnum.USER,
    RoleEnum.ADMIN,
    RoleEnum.DOCTOR,
  ]),
  validation(updatedPasswordSchema),
  authServices.updatePassword,
);
router.post(
  "/verify-two-auth-factor",
  validation(verifyTwoAuthFactorSchema),
  authServices.verifyTwoAuthFactor,
);
router.post(
  "/login-with-google",
  validation(loginWithGoogleSchema),
  authServices.loginWithGoogle,
);
router.post(
  "/logout",
  authentication(TokenTypeEnum.ACCESS, [
    RoleEnum.USER,
    RoleEnum.ADMIN,
    RoleEnum.DOCTOR,
  ]),
  validation(logoutSchema),
  authServices.logout,
);
router.post("/refresh-token", authServices.refreshToken);
export default router;
