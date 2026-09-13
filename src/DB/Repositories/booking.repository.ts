import { Model } from "mongoose";
import { DateBaseRepository } from "./database.repository";
import { IBooking } from "../Models/booking.model";

export class BookingRepository extends DateBaseRepository<IBooking> {
  constructor(protected override readonly model: Model<IBooking>) {
    super(model);
  }
}
