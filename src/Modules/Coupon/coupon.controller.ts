import { Router } from "express";
const router: Router = Router();
import CouponServices from "./coupon.services";
import { authentication } from "../../Middleware/authentication.middleware";
import { RoleEnum, TokenTypeEnum } from "../../Utils/Enum/enum.utils";
import { validation } from "../../Middleware/validation.middleware";
import { createCouponSchema } from "./coupon.validation";

router.post(
  "/create-coupon",
  authentication(TokenTypeEnum.ACCESS, [
    RoleEnum.ADMIN,
    RoleEnum.COMPANY,
    RoleEnum.DOCTOR,
  ]),
  validation(createCouponSchema),
  CouponServices.createCoupon,
);

export default router;
