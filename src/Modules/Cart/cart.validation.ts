import { Types } from "mongoose";
import * as z from "zod";

export const createCartSchema = {
  body: z.strictObject({
    productId: z.string().refine((value) => {
      return Types.ObjectId.isValid(value);
    }),
    quantity: z.number(),
  }),
};

export const getCartSchema = {
  params: z.strictObject({
    userId: z
      .string()
      .refine((value) => {
        return Types.ObjectId.isValid(value);
      })
      .optional(),
  }),
};

export const updateItemQuantitySchema = {
  params: z.strictObject({
    itemId: z.string().refine((value) => {
      return Types.ObjectId.isValid(value);
    }),
    userId: z
      .string()
      .refine((value) => {
        return Types.ObjectId.isValid(value);
      })
      .optional(),
  }),
  body: z.strictObject({
    quantity: z.number(),
  }),
};

export const removeItemSchema = {
  params: z.strictObject({
    itemId: z.string().refine((value) => {
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

export const clearCartSchema = {
  params: z.strictObject({
    userId: z
      .string()
      .refine((value) => {
        return Types.ObjectId.isValid(value);
      })
      .optional(),
  }),
};

export const applyCouponSchema = {
  params: z.strictObject({
    userId: z
      .string()
      .refine((value) => {
        return Types.ObjectId.isValid(value);
      })
      .optional(),
  }),
  body: z.strictObject({
    coupon: z.string(),
  }),
};

export const removeCouponSchema = {
  params: z.strictObject({
    userId: z
      .string()
      .refine((value) => {
        return Types.ObjectId.isValid(value);
      })
      .optional(),
  }),
};
