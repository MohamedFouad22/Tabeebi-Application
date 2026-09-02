import { HydratedDocument, model, models, Schema, Types } from "mongoose";
import {
  GenderEnum,
  ProviderEnum,
  RoleEnum,
  TwoAuthFactorEnum,
} from "../../Utils/Enum/enum.utils";

export interface IUser {
  _id: Types.ObjectId;

  firstName: string;
  lastName: string;
  userName?: string;
  email: string;
  phone: string;
  password: string;
  OTPVerificationCode: string;
  TwoAuthFactorVerificationCode?: string;
  profileImage: string;
  coverImages: string[];

  age: number;

  twoFactorAuthStatus: TwoAuthFactorEnum;
  provider: ProviderEnum;
  gender: GenderEnum;
  role: RoleEnum;

  VerificationAccountExpiredAt: Date;
  changeCredientialsTime?: Date;
  twoAuthFactorEnabledAt?: Date;
  OTPExpiredAt: Date;
  confirmedAt: Date;
  createdAt: Date;
  updatedAt?: Date;
  freezedAt?: Date;
  restoredAt?: Date;

  freezedBy?: Types.ObjectId;
  restoredBy?: Types.ObjectId;
}

export const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      trim: true,
      minLength: 3,
      maxLength: 25,
      required: true,
    },
    lastName: {
      type: String,
      trim: true,
      minLength: 3,
      maxLength: 25,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      minLength: 8,
      required: true,
    },
    age: {
      type: Number,
      minLength: 18,
      required: true,
    },
    OTPVerificationCode: String,
    TwoAuthFactorVerificationCode: String,
    profileImage: String,
    coverImages: [String],
    twoFactorAuthStatus: {
      type: String,
      enum: {
        values: Object.values(TwoAuthFactorEnum),
        message: "This Value Not Found",
      },
      default: TwoAuthFactorEnum.INACTIVE,
    },
    provider: {
      type: String,
      enum: {
        values: Object.values(ProviderEnum),
        message: "This Value Not Found",
      },
      default: ProviderEnum.SYSTEM,
    },
    gender: {
      type: String,
      enum: {
        values: Object.values(GenderEnum),
        message: "This Value Not Found",
      },
      default: GenderEnum.MALE,
    },
    role: {
      type: String,
      enum: {
        values: Object.values(RoleEnum),
        message: "This Value Not Found",
      },
      default: RoleEnum.USER,
    },
    VerificationAccountExpiredAt: Date,
    changeCredientialsTime: Date,
    twoAuthFactorEnabledAt: Date,
    OTPExpiredAt: Date,
    confirmedAt: Date,
    freezedAt: Date,
    restoredAt: Date,
    freezedBy: Types.ObjectId,
    restoredBy: Types.ObjectId,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.index(
  { VerificationAccountExpiredAt: 1 },
  { expireAfterSeconds: 0 },
);

userSchema
  .virtual("userName")
  .set(function (value) {
    const [firstName, lastName] = value.split(" ") || [];
    this.firstName = firstName || "";
    this.lastName = lastName || "";
  })
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  });

export const userModel = model("User", userSchema) || models.User;
export type HUserDocument = HydratedDocument<IUser>;
