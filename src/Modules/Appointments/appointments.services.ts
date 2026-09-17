import { Request, Response } from "express";
import {
  bookAppointmentDTO,
  bookAppointmentParamsDTO,
} from "./appointments.dto";
import { BookingRepository } from "../../DB/Repositories/booking.repository";
import { bookingModel } from "../../DB/Models/booking.model";
import { doctorModel } from "../../DB/Models/doctor.model";
import { DoctorRepository } from "../../DB/Repositories/doctor.repository";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../Utils/Security/Error/global.error.utils";
import { clinicModel } from "../../DB/Models/clinic.model";
import { ClinicRepository } from "../../DB/Repositories/clinic.repository";
import { sendBookingNotification } from "../../Utils/Message/sendWhatsappMessage.utils";
import { statusEnum } from "../../Utils/Enum/enum.utils";

class appointmentRouterServices {
  private _bookModel = new BookingRepository(bookingModel);
  private _doctorModel = new DoctorRepository(doctorModel);
  private _clinicModel = new ClinicRepository(clinicModel);
  constructor() {}

  bookAppointment = async (req: Request, res: Response): Promise<Response> => {
    const { doctorId } = req.params as bookAppointmentParamsDTO;
    const {
      status,
      paymentStatus,
      paymentMethod,
      email,
      phone,
      patientName,
      workingSchedule,
    }: bookAppointmentDTO = req.body;

    const doctor = await this._doctorModel.findOne({
      filter: { _id: doctorId },
    });

    if (!doctor) throw new NotFoundException("Doctor Not Found");

    if (req.body.clinicId) {
      const clinic = await this._clinicModel.findOne({
        filter: { _id: req.body.clinicId },
      });

      if (!clinic) throw new NotFoundException("Clinic Not Found");
    }

    const { day, from, to, isDayOff } = workingSchedule;

    if (isDayOff) {
      throw new BadRequestException("This is the doctor's day off");
    }

    const checkAppointment = doctor.workingSchedule.some(
      (schedule) =>
        schedule.day === day &&
        schedule.from === from &&
        schedule.to === to &&
        schedule.isDayOff === false,
    );

    if (!checkAppointment) {
      throw new BadRequestException("This day is not on the doctor's schedule");
    }

    const targetDate = new Date();
    while (
      targetDate.toLocaleDateString("en-US", {
        weekday: "long",
        timeZone: "UTC",
      }) !== day
    ) {
      targetDate.setUTCDate(targetDate.getUTCDate() + 1);
    }

    targetDate.setUTCHours(0, 0, 0, 0);

    const startOfDay = new Date(targetDate);
    const endOfDay = new Date(targetDate);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

    const checkAvailableAppointment = await this._bookModel.findOne({
      filter: {
        doctorId,
        bookingDate: {
          $gte: startOfDay,
          $lt: endOfDay,
        },
        "workingSchedule.from": from,
        "workingSchedule.to": to,
        status: { $ne: statusEnum.CANCELLED },
      },
    });

    if (checkAvailableAppointment) {
      throw new ConflictException(
        "This appointment has been booked by someone else",
      );
    }

    try {
      const [bookAppointment] = await this._bookModel.create({
        data: [
          {
            patientId: req.decoded._id,
            doctorId,
            clinicId: req.body.clinicId || undefined,
            workingSchedule,
            status,
            slotDuration: doctor.slotDuration,
            consultationFee: doctor.consultationFee,
            paymentStatus,
            paymentMethod,
            bookingDate: targetDate,
            email,
            phone,
            patientName,
          },
        ],
      });

      if (!bookAppointment) {
        throw new BadRequestException("Failed To Book Appointment");
      }

      sendBookingNotification(phone, {
        clientName: patientName,
        bookingId: bookAppointment._id.toString(),
        date: targetDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        }),
        time: `${from} - ${to}`,
      }).catch((err) => console.error("WhatsApp Notification Error:", err));

      return res.status(201).json({
        message: "Book Appointment Successfully",
      });
    } catch (error: any) {
      if (error.code === 11000 || error.message?.includes("E11000")) {
        throw new ConflictException(
          "This appointment has been booked by someone else",
        );
      }

      throw error;
    }
  };
}
export default new appointmentRouterServices();
