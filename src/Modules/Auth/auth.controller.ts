import { Router } from "express";
const router: Router = Router();
import authServices from "./auth.services";
import { validation } from "../../Middleware/validation.middleware";
import {
  confirmEmailSchema,
  loginSchema,
  resendOTPSchema,
  signupSchema,
} from "./auth.validation";

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

export default router;
