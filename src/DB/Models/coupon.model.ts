import { HydratedDocument, model, models, Schema, Types } from "mongoose";
import { couponStatusEnum } from "../../Utils/Enum/enum.utils";
import { BadRequestException } from "../../Utils/Security/Error/global.error.utils";

export interface ICoupon {
  _id: Types.ObjectId;

  createdBy: Types.ObjectId;
  code: string;
  couponStatus: couponStatusEnum;
  couponAvailableAt?: Date;
  couponExpiredAt?: Date;
  couponDiscount?: number;
  couponDiscountAmount?: number;
  usageCount: number;
  maxUsage?: number;

  createdAt: Date;
  updatedAt?: Date;
}

export const couponSchema = new Schema<ICoupon>(
  {
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    code: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
      minLength: [2, "Coupon Must Be At Least 2 Characters"],
      maxLength: [50, "Coupon Must Be At Most 50 Characters"],
      required: true,
    },
    couponDiscount: {
      type: Number,
      min: [1, "Discount cannot be less than 1%"],
      max: [100, "Discount percentage cannot exceed 100%"],
    },
    couponDiscountAmount: {
      type: Number,
      min: [1, "Discount cannot be less than 1"],
    },
    couponStatus: {
      type: String,
      enum: { values: Object.values(couponStatusEnum) },
      required: true,
    },
    couponAvailableAt: Date,
    couponExpiredAt: {
      type: Date,
      required: function (this: HCouponDocument) {
        return this.maxUsage ? false : true;
      },
    },
    maxUsage: {
      type: Number,
      min: [1, "Maximum usage must be at least 1"],
      required: function (this: HCouponDocument) {
        return this.couponExpiredAt ? false : true;
      },
    },
    usageCount: {
      type: Number,
      default: 0,
      min: [0, "Usage count cannot be negative"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

couponSchema.index({ code: 1, couponStatus: 1 });

couponSchema.pre("validate", function (this: HCouponDocument) {
  const now = new Date();

  if (this.couponExpiredAt && this.couponExpiredAt <= now) {
    this.couponStatus = couponStatusEnum.EXPIRED;
  } else if (this.couponAvailableAt && this.couponAvailableAt > now) {
    this.couponStatus = couponStatusEnum.PENDING;
  } else {
    this.couponStatus = couponStatusEnum.ACTIVE;
  }
});

couponSchema.pre("validate", function (this: HCouponDocument) {
  const hasDiscount = this.couponDiscount !== undefined;
  const hasDiscountAmount = this.couponDiscountAmount !== undefined;

  if (
    (hasDiscount && hasDiscountAmount) ||
    (!hasDiscount && !hasDiscountAmount)
  ) {
    throw new BadRequestException("Provide only one discount method");
  }
});

export type HCouponDocument = HydratedDocument<ICoupon>;
export const couponModel = models.Coupon || model("Coupon", couponSchema);
