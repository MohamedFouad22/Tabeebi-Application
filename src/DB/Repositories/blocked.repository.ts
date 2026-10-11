import { Model, MongooseBaseQueryOptions, QueryFilter } from "mongoose";
import { DateBaseRepository } from "./database.repository";
import { IBlocked } from "../Models/blockedSlots.model";

export class BlockedRepository extends DateBaseRepository<IBlocked> {
  constructor(protected override readonly model: Model<IBlocked>) {
    super(model);
  }

  countDocuments = async ({
    filter,
    options,
  }: {
    filter?: QueryFilter<IBlocked>;
    options?: MongooseBaseQueryOptions<IBlocked> | null;
  }) => {
    return this.model.countDocuments(filter, options);
  };
}
