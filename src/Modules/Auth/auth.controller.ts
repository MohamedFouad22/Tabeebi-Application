import { Router } from "express";
const router: Router = Router();
import authServices from "./auth.services";
import { validation } from "../../Middleware/validation.middleware";
import { confirmEmailSchema, resendOTPSchema, signupSchema } from "./auth.validation";

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

export default router;
