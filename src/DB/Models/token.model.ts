import { HydratedDocument, model, models, Schema, Types } from "mongoose";

export interface IToken {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  jwtId: String;

  expiredAt: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export const tokenSchema = new Schema<IToken>(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    jwtId: {
      type: String,
      required: true,
    },
    expiredAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tokenSchema.index(
  { expiredAt: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: {
      expireAfterSeconds: { $exists: true, $type: "date" },
    },
  },
);

export const tokenModel = model("Token", tokenSchema) || models.Token;
export type HTokenDocument = HydratedDocument<IToken>;
