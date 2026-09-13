import { HydratedDocument, model, models, Schema, Types } from "mongoose";
import {
  PaymentMethodEnum,
  PaymentStatusEnum,
  statusEnum,
} from "../../Utils/Enum/enum.utils";

export interface IBooking {
  _id: Types.ObjectId;

  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  clinicId?: Types.ObjectId;

  workingSchedule: {
    day: string;
    from: string;
    to: string;
  };

  status: string;
  slotDuration: number;
  consultationFee: number;
  bookingDate: Date;

  paymentStatus: string;
  paymentMethod: string;

  email?: string;
  phone: string;
  patientName: string;

  createdAt: Date;
  updatedAt?: Date;
}

export const bookingSchema = new Schema<IBooking>(
  {
    patientId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctorId: {
      type: Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    clinicId: {
      type: Types.ObjectId,
      ref: "Clinic",
    },

    workingSchedule: {
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
    },

    status: {
      type: String,
      enum: { values: Object.values(statusEnum) },
      default: statusEnum.PENDING,
      required: true,
    },

    slotDuration: {
      type: Number,
      required: true,
    },

    consultationFee: {
      type: Number,
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: { values: Object.values(PaymentStatusEnum) },
      default: PaymentStatusEnum.UNPAID,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: { values: Object.values(PaymentMethodEnum) },
      default: PaymentMethodEnum.CASH,
      required: true,
    },

    bookingDate: {
      type: Date,
      required: true,
    },

    email: String,

    phone: {
      type: String,
      required: true,
    },

    patientName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

bookingSchema.index(
  {
    doctorId: 1,
    bookingDate: 1,
    "workingSchedule.from": 1,
  },
  { unique: true },
);

export type HBookDocument = HydratedDocument<IBooking>;
export const bookingModel = models.Booking || model("Booking", bookingSchema);
