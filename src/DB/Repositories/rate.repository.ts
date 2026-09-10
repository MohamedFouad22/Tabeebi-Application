import { Model } from "mongoose";
import { DateBaseRepository } from "./database.repository";
import { IRate } from "../Models/rate.model";

export class RateRepository extends DateBaseRepository<IRate> {
  constructor(protected override readonly model: Model<IRate>) {
    super(model);
  }

  async countDocuments(filter: object): Promise<number> {
    return await this.model.countDocuments(filter);
  }
}
