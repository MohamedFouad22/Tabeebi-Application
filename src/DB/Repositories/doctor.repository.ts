import { Model, MongooseBaseQueryOptions, QueryFilter } from "mongoose";
import { DateBaseRepository } from "./database.repository";
import { IDoctor } from "../Models/doctor.model";

export class DoctorRepository extends DateBaseRepository<IDoctor> {
  constructor(protected override readonly model: Model<IDoctor>) {
    super(model);
  }

  countDocuments = async ({
    filter,
    options,
  }: {
    filter?: QueryFilter<IDoctor>;
    options?: MongooseBaseQueryOptions<IDoctor>;
  }): Promise<number> => {
    return await this.model.countDocuments(filter, options);
  };
}
