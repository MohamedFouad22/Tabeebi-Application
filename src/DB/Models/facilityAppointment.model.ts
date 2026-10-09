import { HydratedDocument, model, models, Schema, Types } from "mongoose";
import {
  GenderEnum,
  PaymentMethodEnum,
  PaymentStatusEnum,
  statusEnum,
} from "../../Utils/Enum/enum.utils";

export interface ITestItem {
  testId: Types.ObjectId;
  name: string;
  price: number;
}

export interface ITestResult {
  fileUrl: string;
  uploadedAt: Date;
  notes?: string;
}

export interface IAppointment {
  _id: Types.ObjectId;
  createdBy: Types.ObjectId;
  facilityId: Types.ObjectId;
  services: ITestItem[];
  phone: string;
  patientName: string;
  email: string;
  age: number;
  gender: GenderEnum;
  bookingDate: Date;
  subtotal: number;
  taxFee: number;
  totalAmount: number;
  bookingDateExpiredAt?: Date;
  status: statusEnum;
  paymentMethod: PaymentMethodEnum;
  paymentStatus: PaymentStatusEnum;
  stripeSessionId?: string;
  paymentIntentId?: string;
  results?: ITestResult[];
  createdAt: Date;
  updatedAt?: Date;
}

const testItemSchema = new Schema<ITestItem>(
  {
    testId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const testResultSchema = new Schema<ITestResult>(
  {
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { _id: false },
);

export const appointmentSchema = new Schema<IAppointment>(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    facilityId: {
      type: Schema.Types.ObjectId,
      ref: "MedicalCenter",
      required: true,
      index: true,
    },

    services: {
      type: [testItemSchema],
      required: true,
      validate: {
        validator: (services: ITestItem[]) => services.length > 0,
        message: "At least one test is required",
      },
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    patientName: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 100,
      trim: true,
      lowercase: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    age: {
      type: Number,
      required: true,
      min: 0,
      max: 130,
      validate: {
        validator: Number.isInteger,
        message: "Age must be an integer",
      },
    },

    gender: {
      type: String,
      enum: { values: Object.values(GenderEnum) },
      required: true,
    },

    bookingDate: {
      type: Date,
      required: true,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    taxFee: {
      type: Number,
      required: true,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    bookingDateExpiredAt: {
      type: Date,
    },

    status: {
      type: String,
      enum: { values: Object.values(statusEnum) },
      default: statusEnum.PENDING,
      index: true,
    },

    paymentMethod: {
      type: String,
      enum: { values: Object.values(PaymentMethodEnum) },
      default: PaymentMethodEnum.CASH,
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: { values: Object.values(PaymentStatusEnum) },
      default: PaymentStatusEnum.UNPAID,
      required: true,
    },

    stripeSessionId: {
      type: String,
      sparse: true,
    },

    paymentIntentId: {
      type: String,
      sparse: true,
    },

    results: {
      type: [testResultSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

appointmentSchema.index({
  facilityId: 1,
  bookingDate: 1,
  status: 1,
});

appointmentSchema.index({
  createdBy: 1,
  bookingDate: -1,
});

export type HAppointmentDocument = HydratedDocument<IAppointment>;

export const appointmentModel =
  models.Appointment || model("Appointment", appointmentSchema);
