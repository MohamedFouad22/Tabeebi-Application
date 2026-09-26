import { Types } from "mongoose";
import * as z from "zod";
import { couponStatusEnum } from "../../Utils/Enum/enum.utils";

export const createCouponSchema = {
  body: z
    .strictObject({
      code: z.string().trim().uppercase().min(2).max(50),
      couponAvailableAt: z.coerce.date().optional(),
      couponDiscount: z.number().min(1).max(100).optional(),
      couponDiscountAmount: z.number().min(1).optional(),
      maxUsage: z.number().min(1).optional(),
      couponExpiredAt: z.coerce.date().optional(),
    })
    .refine(
      (data) =>
        (data.couponDiscount !== undefined &&
          data.couponDiscountAmount === undefined) ||
        (data.couponDiscount === undefined &&
          data.couponDiscountAmount !== undefined),
      {
        message:
          "Provide only one discount method (either couponDiscount or couponDiscountAmount)",
        path: ["couponDiscount"],
      },
    )
    .refine(
      (data) =>
        data.maxUsage !== undefined || data.couponExpiredAt !== undefined,
      {
        message: "You must specify either maxUsage or couponExpiredAt",
        path: ["maxUsage"],
      },
    )
    .refine(
      (data) => {
        if (!data.couponAvailableAt) return true;
        return data.couponAvailableAt >= new Date();
      },
      {
        message: "couponAvailableAt cannot be a past date",
        path: ["couponAvailableAt"],
      },
    ),
};

export const getCouponSchema = {
  params: z.strictObject({
    couponId: z.string().refine((value) => {
      return Types.ObjectId.isValid(value);
    }),
  }),
};

export const updateCouponSchema = {
  params: z.strictObject({
    couponId: z.string().refine((value) => {
      return Types.ObjectId.isValid(value);
    }),
  }),
  body: z
    .strictObject({
      couponStatus: z.enum(couponStatusEnum).optional(),
      couponAvailableAt: z.coerce.date().optional(),
      couponExpiredAt: z.coerce.date().optional(),
      couponDiscount: z.number().min(1).max(100).optional(),
      couponDiscountAmount: z.number().min(1).optional(),
      maxUsage: z.number().min(1).optional(),
    })
    .refine(
      (data) =>
        !(
          data.couponDiscount !== undefined &&
          data.couponDiscountAmount !== undefined
        ),
      {
        message:
          "Provide only one discount method (either couponDiscount or couponDiscountAmount)",
        path: ["couponDiscount"],
      },
    )
    .refine(
      (data) => {
        if (!data.couponAvailableAt || !data.couponExpiredAt) return true;
        return data.couponExpiredAt > data.couponAvailableAt;
      },
      {
        message: "couponExpiredAt must be after couponAvailableAt",
        path: ["couponExpiredAt"],
      },
    ),
};

export const deleteCouponSchema = {
  params: z.strictObject({
    couponId: z.string().refine((value) => {
      return Types.ObjectId.isValid(value);
    }),
  }),
};

export const checkCouponValiditySchema = {
  params: z.strictObject({
    coupon: z.string().trim().uppercase().min(2).max(50),
  }),
};
