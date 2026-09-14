import { HydratedDocument, model, models, Schema, Types } from "mongoose";

export interface IClinic {
  _id: Types.ObjectId;

  clinicName: string;
  location?: string;
  address: string;

  phone: string;
  email?: string;
  clinicLogo?: string;
  doctors: string[];
  createdBy: Types.ObjectId;

  createdAt: Date;
  updatedAt?: Date;
}

export const clinicSchema = new Schema<IClinic>(
  {
    clinicName: {
      type: String,
      minLength: 2,
      maxLength: 50,
      unique: true,
      trim: true,
      required: true,
    },

    location: String,

    address: {
      type: String,
      minLength: 2,
      maxLength: 250,
      trim: true,
      required: true,
    },

    phone: {
      type: String,
      unique: true,
      required: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
    },

    clinicLogo: {
      type: String,
      required: true,
    },

    doctors: [
      {
        type: Types.ObjectId,
        ref: "Doctor",
        required: true,
      },
    ],

    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export type HClinicDocument = HydratedDocument<IClinic>;
export const clinicModel = models.Clinic || model("Clinic", clinicSchema);
