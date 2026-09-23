import { Model, MongooseBaseQueryOptions, QueryFilter } from "mongoose";
import { DateBaseRepository } from "./database.repository";
import { ICoupon } from "../Models/coupon.model";

export class CouponRepository extends DateBaseRepository<ICoupon> {
  constructor(protected override readonly model: Model<ICoupon>) {
    super(model);
  }

  countDocuments = async ({
    filter,
    options,
  }: {
    filter?: QueryFilter<ICoupon>;
    options?: MongooseBaseQueryOptions<ICoupon> | null;
  }) => {
    return this.model.countDocuments(filter, options);
  };
}
