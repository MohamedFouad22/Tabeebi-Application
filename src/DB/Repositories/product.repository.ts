import { Model } from "mongoose";
import { DateBaseRepository } from "./database.repository";
import { IProduct } from "../Models/product.model";

export class ProductRepository extends DateBaseRepository<IProduct> {
  constructor(protected override readonly model: Model<IProduct>) {
    super(model);
  }

  async countDocuments(filter: object): Promise<number> {
    return await this.model.countDocuments(filter);
  }
}
