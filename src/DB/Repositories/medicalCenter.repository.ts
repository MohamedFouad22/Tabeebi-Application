import {
  AnyBulkWriteOperation,
  Model,
  MongooseBulkWriteOptions,
} from "mongoose";
import { DateBaseRepository } from "./database.repository";
import { IMedicalCenter } from "../Models/medicalCenter.model";

export class medicalCenterRepository extends DateBaseRepository<IMedicalCenter> {
  constructor(protected override readonly model: Model<IMedicalCenter>) {
    super(model);
  }

  async countDocuments(filter: object): Promise<number> {
    return await this.model.countDocuments(filter);
  }

  async bulkWrite(
    writes: Array<AnyBulkWriteOperation<IMedicalCenter>>,
    options?: MongooseBulkWriteOptions & { ordered: false },
  ) {
    return await this.model.bulkWrite(writes, options);
  }
}
