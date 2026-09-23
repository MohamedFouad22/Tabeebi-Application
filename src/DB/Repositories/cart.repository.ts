import { Model, MongooseBaseQueryOptions, QueryFilter } from "mongoose";
import { DateBaseRepository } from "./database.repository";
import { ICart } from "../Models/cart.model";

export class CartRepository extends DateBaseRepository<ICart> {
  constructor(protected override readonly model: Model<ICart>) {
    super(model);
  }

  countDocuments = async ({
    filter,
    options,
  }: {
    filter?: QueryFilter<ICart>;
    options?: MongooseBaseQueryOptions<ICart> | null;
  }) => {
    return this.model.countDocuments(filter, options);
  };
}
