import { Model } from "mongoose";
import { IBrand } from "../Models/brand.model";
import { DateBaseRepository } from "./database.repository";

export class BrandRepository extends DateBaseRepository<IBrand> {
  constructor(protected override readonly model: Model<IBrand>) {
    super(model);
  }
}
