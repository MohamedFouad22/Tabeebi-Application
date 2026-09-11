import { Model } from "mongoose";
import { DateBaseRepository } from "./database.repository";
import { ICategory } from "../Models/category.model";

export class CategoryRepository extends DateBaseRepository<ICategory> {
  constructor(protected override readonly model: Model<ICategory>) {
    super(model);
  }
}
