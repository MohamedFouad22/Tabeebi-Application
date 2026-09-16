import { HydratedDocument, model, models, Schema, Types } from "mongoose";
import { SpecializationEnum } from "../../Utils/Enum/enum.utils";

export interface IDoctor {
  _id: Types.ObjectId;

  doctorName: string;
  bio: string;
  doctorImage: string;

  userId: Types.ObjectId;
  clinic?: Types.ObjectId;

  phone?: string;
  address?: string;
  location?: string;
  email?: string;

  workingSchedule: {
    day: string;
    from: string;
    to: string;
    isDayOff: boolean;
  }[];

  specialization: string;
  consultationFee: number;
  slotDuration: number;

  createdAt: Date;
  updatedAt?: Date;
}

export const doctorSchema = new Schema<IDoctor>(
  {
    doctorName: {
      type: String,
      minlength: 2,
      maxlength: 50,
      trim: true,
      required: true,
    },

    bio: {
      type: String,
      minLength: 2,
      maxLength: 250,
      trim: true,
      required: true,
    },

    doctorImage: {
      type: String,
      required: true,
    },

    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    clinic: {
      type: Types.ObjectId,
      ref: "Clinic",
    },

    workingSchedule: [
      {
        day: {
          type: String,
          required: true,
        },

        from: {
          type: String,
          required: true,
        },

        to: {
          type: String,
          required: true,
        },

        isDayOff: {
          type: Boolean,
          required: true,
        },
      },
    ],

    specialization: {
      type: String,
      enum: { values: Object.values(SpecializationEnum) },
      required: true,
    },

    consultationFee: {
      type: Number,
      min: 0,
      required: true,
    },

    slotDuration: {
      type: Number,
      default: 30,
      required: true,
    },

    phone: {
      type: String,
      required: function (this: HDoctorDocument) {
        return this.clinic ? false : true;
      },
    },

    email: {
      type: String,
      required: function (this: HDoctorDocument) {
        return this.clinic ? false : true;
      },
    },

    address: {
      type: String,
      required: function (this: HDoctorDocument) {
        return this.clinic ? false : true;
      },
    },

    location: {
      type: String,
      required: function (this: HDoctorDocument) {
        return this.clinic ? false : true;
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
export type HDoctorDocument = HydratedDocument<IDoctor>;
export const doctorModel = models.Doctor || model("Doctor", doctorSchema);
