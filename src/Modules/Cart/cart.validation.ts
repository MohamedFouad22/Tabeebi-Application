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
