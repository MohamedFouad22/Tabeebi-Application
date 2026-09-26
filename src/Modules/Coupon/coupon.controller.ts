import { Router } from "express";
const router: Router = Router();
import CouponServices from "./coupon.services";
import { authentication } from "../../Middleware/authentication.middleware";
import { RoleEnum, TokenTypeEnum } from "../../Utils/Enum/enum.utils";
import { validation } from "../../Middleware/validation.middleware";
import {
  checkCouponValiditySchema,
  createCouponSchema,
  deleteCouponSchema,
  getCouponSchema,
  updateCouponSchema,
} from "./coupon.validation";
import couponServices from "./coupon.services";

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

router.delete(
  "/delete-coupon/:couponId",
  authentication(TokenTypeEnum.ACCESS, [
    RoleEnum.ADMIN,
    RoleEnum.COMPANY,
    RoleEnum.DOCTOR,
  ]),
  validation(deleteCouponSchema),
  couponServices.deleteCoupon,
);

router.get(
  "/check-validity/:coupon",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER, RoleEnum.ADMIN]),
  validation(checkCouponValiditySchema),
  couponServices.checkCouponValidity,
);

export default router;
