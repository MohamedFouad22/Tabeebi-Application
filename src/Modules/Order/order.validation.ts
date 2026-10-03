import * as z from "zod";
import { generalFields } from "../../Middleware/generalFields.utils";
import { Types } from "mongoose";
import { PaymentMethodEnum, statusEnum } from "../../Utils/Enum/enum.utils";

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

export const createCheckoutSchema = {
  params: z.strictObject({
    userId: z
      .string()
      .refine((value) => {
        return Types.ObjectId.isValid(value);
      })
      .optional(),
    orderId: z.string().refine((value) => {
      return Types.ObjectId.isValid(value);
    }),
  }),
};

export const getOrdersSchema = {
  params: z.strictObject({
    userId: z
      .string()
      .refine((value) => {
        return Types.ObjectId.isValid(value);
      })
      .optional(),
  }),
  query: z.strictObject({
    status: z.enum(statusEnum).optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
};

export const getOrderSchema = {
  params: z.strictObject({
    orderId: z.string().refine((value) => {
      return Types.ObjectId.isValid(value);
    }),
  }),
};

export const cancelOrderSchema = {
  params: z.strictObject({
    orderId: z.string().refine((value) => {
      return Types.ObjectId.isValid(value);
    }),
    userId: z
      .string()
      .refine((value) => {
        return Types.ObjectId.isValid(value);
      })
      .optional(),
  }),
};

export const getOrdersAdminSchema = {
  query: z.strictObject({
    status: z.enum(statusEnum).optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
};

export const updateStatusSchema = {
  body: z.strictObject({
    status: z.enum(statusEnum),
  }),
  params: z.strictObject({
    orderId: z.string().refine((value) => {
      return Types.ObjectId.isValid(value);
    }),
  }),
};
