import * as z from "zod";

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
