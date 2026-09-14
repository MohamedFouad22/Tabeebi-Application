import { Model } from "mongoose";
import { DateBaseRepository } from "./database.repository";
import { IClinic } from "../Models/clinic.model";

export class ClinicRepository extends DateBaseRepository<IClinic> {
  constructor(protected override readonly model: Model<IClinic>) {
    super(model);
  }

  async countDocuments(filter: object): Promise<number> {
    return await this.model.countDocuments(filter);
  }
}
