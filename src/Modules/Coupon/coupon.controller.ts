import { Router } from "express";
const router: Router = Router();
import CouponServices from "./coupon.services";
import { authentication } from "../../Middleware/authentication.middleware";
import { RoleEnum, TokenTypeEnum } from "../../Utils/Enum/enum.utils";
import { validation } from "../../Middleware/validation.middleware";
import {
  createCouponSchema,
  getCouponSchema,
  updateCouponSchema,
} from "./coupon.validation";

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

router.get(
  "/get-coupons",
  authentication(TokenTypeEnum.ACCESS, [
    RoleEnum.ADMIN,
    RoleEnum.COMPANY,
    RoleEnum.DOCTOR,
  ]),
  CouponServices.getCoupons,
);

router.get(
  "/get-coupon/:couponId",
  authentication(TokenTypeEnum.ACCESS, [
    RoleEnum.ADMIN,
    RoleEnum.COMPANY,
    RoleEnum.DOCTOR,
  ]),
  validation(getCouponSchema),
  CouponServices.getCoupon,
);

router.patch(
  "/update-coupon/:couponId",
  authentication(TokenTypeEnum.ACCESS, [
    RoleEnum.ADMIN,
    RoleEnum.COMPANY,
    RoleEnum.DOCTOR,
  ]),
  validation(updateCouponSchema),
  CouponServices.updateCoupon,
);

export default router;
