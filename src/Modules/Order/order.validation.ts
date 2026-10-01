import * as z from "zod";
import { generalFields } from "../../Middleware/generalFields.utils";
import { Types } from "mongoose";
import { PaymentMethodEnum } from "../../Utils/Enum/enum.utils";

export const createOrderSchema = {
  params: z.strictObject({
    userId: z
      .string()
      .refine((value) => {
        return Types.ObjectId.isValid(value);
      })
      .optional(),
  }),
  body: z.strictObject({
    address: z.string().min(10).max(500).trim(),
    phone: generalFields.phone,
    paymentMethod: z
      .enum(PaymentMethodEnum)
      .default(PaymentMethodEnum.CASH)
      .optional(),
  }),
};
