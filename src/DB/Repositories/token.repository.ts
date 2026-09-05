import { Model } from "mongoose";
import { IToken } from "../Models/token.model";
import { DateBaseRepository } from "./database.repository";

export class TokenRepository extends DateBaseRepository<IToken> {
  constructor(protected override readonly model: Model<IToken>) {
    super(model);
  }
}
