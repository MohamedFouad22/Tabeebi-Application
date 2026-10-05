import {
  AnyBulkWriteOperation,
  Model,
  MongooseBulkWriteOptions,
} from "mongoose";
import { DateBaseRepository } from "./database.repository";
import { IProduct } from "../Models/product.model";

export class ProductRepository extends DateBaseRepository<IProduct> {
  constructor(protected override readonly model: Model<IProduct>) {
    super(model);
  }

  async countDocuments(filter: object): Promise<number> {
    return await this.model.countDocuments(filter);
  }

  async bulkWrite(
    writes: Array<AnyBulkWriteOperation<IProduct>>,
    options?: MongooseBulkWriteOptions & { ordered: false },
  ) {
    return await this.model.bulkWrite(writes, options);
  }
}
