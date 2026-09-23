import * as z from "zod";
import {
  createCouponSchema,
  deleteCouponSchema,
  getCouponSchema,
  updateCouponSchema,
} from "./coupon.validation";

export type IcreateCouponDTO = z.infer<typeof createCouponSchema.body>;
export type getCouponDTO = z.infer<typeof getCouponSchema.params>;
export type updateCouponParamsDTO = z.infer<typeof updateCouponSchema.params>;
export type updateCouponDTO = z.infer<typeof updateCouponSchema.body>;
export type deleteCouponDTO = z.infer<typeof deleteCouponSchema.params>;
