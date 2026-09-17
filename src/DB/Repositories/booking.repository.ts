import { Model, MongooseBaseQueryOptions, QueryFilter } from "mongoose";
import { DateBaseRepository } from "./database.repository";
import { IBooking } from "../Models/booking.model";

export class BookingRepository extends DateBaseRepository<IBooking> {
  constructor(protected override readonly model: Model<IBooking>) {
    super(model);
  }

  countDocuments = async ({
    filter,
    options,
  }: {
    filter?: QueryFilter<IBooking>;
    options?: MongooseBaseQueryOptions<IBooking> | null;
  }) => {
    return this.model.countDocuments(filter, options);
  };
}
