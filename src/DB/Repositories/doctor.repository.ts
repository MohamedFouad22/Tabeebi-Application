import { Model } from "mongoose";
import { DateBaseRepository } from "./database.repository";
import { IDoctor } from "../Models/doctor.model";

export class DoctorRepository extends DateBaseRepository<IDoctor> {
  constructor(protected override readonly model: Model<IDoctor>) {
    super(model);
  }
}
