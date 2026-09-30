import { Model, MongooseBaseQueryOptions, QueryFilter } from "mongoose";
import { DateBaseRepository } from "./database.repository";
import { IOrder } from "../Models/order.model";

export class OrderRepository extends DateBaseRepository<IOrder> {
  constructor(protected override readonly model: Model<IOrder>) {
    super(model);
  }

  countDocuments = async ({
    filter,
    options,
  }: {
    filter?: QueryFilter<IOrder>;
    options?: MongooseBaseQueryOptions<IOrder> | null;
  }) => {
    return this.model.countDocuments(filter, options);
  };
}
