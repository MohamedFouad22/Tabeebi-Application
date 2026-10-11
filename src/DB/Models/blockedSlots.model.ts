import { HydratedDocument, model, models, Schema, Types } from "mongoose";

export interface IBlocked {
  _id: Types.ObjectId;

  doctorId: Types.ObjectId;
  date: Date;
  from: string;
  to: string;
  reason?: string;

  createdAt: Date;
  updatedAt?: Date;
}

export const blockedSchema = new Schema<IBlocked>(
  {
    doctorId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: { type: Date, required: true },

    from: {
      type: String,
      required: true,
    },

    to: {
      type: String,
      required: true,
    },
    
    reason: {
      type: String,
      minLength: 2,
      maxLength: 500,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export type HBlockedDocument = HydratedDocument<IBlocked>;
export const blockedModel = models.Blocked || model("Blocked", blockedSchema);
