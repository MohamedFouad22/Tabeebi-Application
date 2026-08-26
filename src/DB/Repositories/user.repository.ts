import { Model } from "mongoose";
import { DateBaseRepository } from "./database.repository";
import { IUser } from "../Models/user.model";

export class UserRepository extends DateBaseRepository<IUser> {
  constructor(protected override readonly model: Model<IUser>) {
    super(model);
  }
}
