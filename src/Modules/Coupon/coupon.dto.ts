import * as z from "zod";
import { createCouponSchema } from "./coupon.validation";

export type IcreateCouponDTO = z.infer<typeof createCouponSchema.body>;
