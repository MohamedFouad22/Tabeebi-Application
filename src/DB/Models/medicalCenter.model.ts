import { HydratedDocument, model, models, Schema, Types } from "mongoose";
import {
  labSpecializationEnum,
  MedicalServiceTypeEnum,
  RadiologySpecialtyEnum,
} from "../../Utils/Enum/enum.utils";

export interface IMedicalCenter {
  _id: Types.ObjectId;

  facilityName: string;

  createdBy: Types.ObjectId;

  serviceType: MedicalServiceTypeEnum;
  labSpecialization?: labSpecializationEnum[];
  radiologySpecialty?: RadiologySpecialtyEnum[];

  address: string;
  phone: string;

  workingSchedule: {
    day: string;
    from: string;
    to: string;
    isDayOff: boolean;
  }[];

  facilityLogo: string;

  email?: string;

  createdAt: Date;
  updatedAt?: Date;
}

export const medicalCenterSchema = new Schema<IMedicalCenter>(
  {
    facilityName: {
      type: String,
      trim: true,
      minLength: 2,
      maxLength: 150,
      lowercase: true,
      unique: true,
      required: true,
    },

    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    serviceType: {
      type: String,
      enum: { values: Object.values(MedicalServiceTypeEnum) },
      required: true,
    },

    labSpecialization: [
      {
        type: String,
        enum: { values: Object.values(labSpecializationEnum) },
        required: function (this: HMedicalCenterDocument) {
          return this.serviceType.includes(MedicalServiceTypeEnum.LABORATORY)
            ? true
            : false;
        },
      },
    ],

    radiologySpecialty: [
      {
        type: String,
        enum: { values: Object.values(RadiologySpecialtyEnum) },
        required: function (this: HMedicalCenterDocument) {
          return this.serviceType.includes(MedicalServiceTypeEnum.RADIOLOGY)
            ? true
            : false;
        },
      },
    ],

    address: {
      type: String,
      minLength: 2,
      maxLength: 500,
      required: true,
    },

    phone: {
      type: String,
      required: true,
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

    email: String,

    facilityLogo: {
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

medicalCenterSchema.index({ createdBy: 1 });

export type HMedicalCenterDocument = HydratedDocument<IMedicalCenter>;
export const medicalCenterModel =
  models.MedicalCenter || model("MedicalCenter", medicalCenterSchema);
