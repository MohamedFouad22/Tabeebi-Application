import { HydratedDocument, model, models, Schema, Types } from "mongoose";
import { ItemTypeEnum } from "../../Utils/Enum/enum.utils";

export interface IRate {
  _id: Types.ObjectId;

  userId: Types.ObjectId;
  rate: number;
  comment: string;
  item: Types.ObjectId;
  itemType: ItemTypeEnum;

  createdAt: Date;
  updatedAt?: Date;
}

export const rateSchema = new Schema<IRate>(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    rate: {
      type: Number,
      min: 0.5,
      max: 5,
      required: function (this: HRateDocument) {
        return this.comment ? false : true;
      },
    },
    comment: {
      type: String,
      minLength: 2,
      maxLength: 500,
      required: function (this: HRateDocument) {
        return this.rate ? false : true;
      },
    },
    item: {
      type: Types.ObjectId,
      refPath: "itemType",
      required: true,
    },
    itemType: {
      type: String,
      enum: {
        values: Object.values(ItemTypeEnum),
        message: "This Value Not Interested",
      },
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

rateSchema.index({ userId: 1, item: 1, itemType: 1 }, { unique: true });

export type HRateDocument = HydratedDocument<IRate>;
export const rateModel = models.Rate || model("Rate", rateSchema);
