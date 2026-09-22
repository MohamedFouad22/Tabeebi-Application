import { Request, Response } from "express";
import {
  bookAppointmentDTO,
  bookAppointmentParamsDTO,
  cancelAppointmentDTO,
  checkoutAppointmentDTO,
  deleteAppointmentDTO,
  getAppointmentDTO,
  getDoctorHistoryDTO,
  rescheduledAppointmentDTO,
  rescheduledAppointmentParamsDTO,
  updateAppointmentDTO,
  updateAppointmentParamsDTO,
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
import {
  PaymentMethodEnum,
  PaymentStatusEnum,
  RoleEnum,
  statusEnum,
} from "../../Utils/Enum/enum.utils";
import { UserRepository } from "../../DB/Repositories/user.repository";
import { userModel } from "../../DB/Models/user.model";
import StripeServices from "../../Utils/Payments/Stripe/stripe.payment.utils";
import Stripe from "stripe";

class appointmentServices {
  private _bookModel = new BookingRepository(bookingModel);
  private _doctorModel = new DoctorRepository(doctorModel);
  private _clinicModel = new ClinicRepository(clinicModel);
  private _userModel = new UserRepository(userModel);
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

    const { day, from, to } = workingSchedule;
    const doctorShift = doctor.workingSchedule.find(
      (schedule) => schedule.day === day && schedule.isDayOff === false,
    );

    if (!doctorShift) {
      throw new BadRequestException(
        "This day is not on the doctor's schedule or it's a day off",
      );
    }

    const timeToMinutes = (timeStr: string): number => {
      const [hoursStr = "0", minutesStr = "0"] = timeStr.split(":");
      const hours = Number(hoursStr);
      const minutes = Number(minutesStr);

      return hours * 60 + minutes;
    };

    const requestFromMin = timeToMinutes(from);
    const requestToMin = timeToMinutes(to);
    const shiftFromMin = timeToMinutes(doctorShift.from);
    const shiftToMin = timeToMinutes(doctorShift.to);

    if (
      requestFromMin < shiftFromMin ||
      requestToMin > shiftToMin ||
      requestFromMin >= requestToMin
    ) {
      throw new BadRequestException(
        "Requested time range falls outside of doctor's working hours",
      );
    }

    const duration = requestToMin - requestFromMin;
    if (doctor.slotDuration && duration !== doctor.slotDuration) {
      throw new BadRequestException(
        `Appointment duration must be exactly ${doctor.slotDuration} minutes`,
      );
    }

    const offsetFromShiftStart = requestFromMin - shiftFromMin;
    if (
      doctor.slotDuration &&
      offsetFromShiftStart % doctor.slotDuration !== 0
    ) {
      throw new BadRequestException(
        `Appointment start time is not aligned with the doctor's ${doctor.slotDuration}-minute slot intervals`,
      );
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

    const bookingExpiryDate = new Date(targetDate);
    bookingExpiryDate.setUTCHours(23, 59, 59, 999);

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
        "This appointment slot has been booked by someone else",
      );
    }

    try {
      const [bookAppointment] = await this._bookModel.create({
        data: [
          {
            patientId: req.decoded._id,
            doctorId: doctor.userId,
            clinicId: req.body.clinicId || undefined,
            workingSchedule,
            status,
            slotDuration: doctor.slotDuration,
            consultationFee: doctor.consultationFee,
            paymentStatus,
            paymentMethod,
            bookingDate: targetDate,
            bookingDateExpiredAt: bookingExpiryDate,
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

  getPatientHistory = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { patientId } = req.params;

    const filter: Record<string, any> = {};

    if (patientId) {
      filter.patientId = patientId;
    }

    if (req.decoded.role === RoleEnum.USER) {
      filter.patientId = req.decoded._id;
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      this._bookModel.find({
        filter,
        projection: "-__v -createdAt -updatedAt",
        options: {
          page,
          limit,
          skip,
          sort: { createdAt: -1 },
          populate: [
            {
              path: "patientId",
              select: "firstName lastName email",
            },
            {
              path: "doctorId",
              select: "doctorName specialization",
            },
          ],
        },
      }),

      this._bookModel.countDocuments({ filter }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      message: "Get History Successfully",
      pagination: {
        totalPages,
        total,
        limit,
        skip,
        currentPage: page,
      },
      history,
    });
  };

  getAppointment = async (req: Request, res: Response): Promise<Response> => {
    const { appointmentId } = req.params as getAppointmentDTO;

    const filter: Record<string, any> = { _id: appointmentId };

    if (req.decoded.role === RoleEnum.USER) {
      filter.patientId = req.decoded._id;
    } else if (req.decoded.role === RoleEnum.DOCTOR) {
      filter.doctorId = req.decoded._id;
    }

    const book = await this._bookModel.findOne({
      filter,
      projection: "-createdAt -updatedAt -__v",
      options: {
        populate: [
          {
            path: "patientId",
            select: "firstName lastName email",
          },
          {
            path: "doctorId",
            select: "doctorName email specialization",
          },
        ],
      },
    });

    if (!book) {
      throw new NotFoundException("Appointment not found or access denied");
    }

    return res
      .status(200)
      .json({ message: "Get Appointment Successfully", book });
  };

  getDoctorHistory = async (req: Request, res: Response): Promise<Response> => {
    const { doctorId, patientId } = req.params as getDoctorHistoryDTO;

    const filter: Record<string, any> = { doctorId };

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const skip = (page - 1) * limit;

    if (patientId) {
      filter.patientId = patientId;
    }

    if (req.decoded.role === RoleEnum.DOCTOR) {
      filter.doctorId = req.decoded._id;
    }

    const [history, total] = await Promise.all([
      this._bookModel.find({
        filter,
        projection: "-createdAt -updatedAt -__v",
        options: {
          page,
          limit,
          skip,
          sort: { createdAt: -1 },
          populate: [
            { path: "doctorId", select: "firstName lastName email" },
            { path: "patientId", select: "firstName lastName email" },
          ],
        },
      }),
      this._bookModel.countDocuments({ filter }),
    ]);
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      message: "Get History Successfully",
      Pagination: { currentPage: page, limit, skip, total, totalPages },
      history,
    });
  };

  rescheduleAppointment = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { appointmentId, patientId, doctorId } =
      req.params as rescheduledAppointmentParamsDTO;
    const { workingSchedule }: rescheduledAppointmentDTO = req.body;
    const { day, from, to, isDayOff } = workingSchedule;
    const filter: Record<string, any> = { _id: appointmentId };

    if (req.decoded.role === RoleEnum.USER) {
      filter.patientId = req.decoded._id;
      filter.doctorId = doctorId;
    }

    if (req.decoded.role === RoleEnum.DOCTOR) {
      filter.doctorId = req.decoded._id;
      if (patientId) {
        filter.patientId = patientId;
      }
    }

    if (req.decoded.role === RoleEnum.ADMIN) {
      if (patientId) filter.patientId = patientId;
      if (doctorId) filter.doctorId = doctorId;
    }

    if (workingSchedule.isDayOff === true) {
      throw new BadRequestException("This Day Is Day Off For Doctor");
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

    const appointment = await this._bookModel.findOneAndUpdate({
      filter,
      update: {
        $set: {
          "workingSchedule.day": day,
          "workingSchedule.from": from,
          "workingSchedule.to": to,
          "workingSchedule.isDayOff": isDayOff,
          bookingDate: targetDate,
        },
        $inc: { __v: 1 },
      },
      options: { new: true },
    });

    if (!appointment)
      throw new BadRequestException(
        "Failed To Rescheduled Appointment Or Book Not Found",
      );

    return res
      .status(200)
      .json({ message: "Appointment Rescheduled Successfully" });
  };

  canceledAppointment = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { appointmentId } = req.params as cancelAppointmentDTO;
    const filter: Record<string, any> = {
      _id: appointmentId,
      status: statusEnum.PENDING,
    };

    if (req.decoded.role === RoleEnum.USER) {
      filter.patientId = req.decoded._id;
    } else if (req.decoded.role === RoleEnum.DOCTOR) {
      filter.doctorId = req.decoded._id;
    }

    const updateAppointment = await this._bookModel.findOneAndUpdate({
      filter,
      update: {
        status: statusEnum.CANCELLED,
        $unset: {
          bookingDate: true,
          workingSchedule: true,
          bookingDateExpiredAt: true,
        },
        $inc: { __v: 1 },
      },
    });
    if (!updateAppointment)
      throw new NotFoundException(
        "Failed To Update Appointment Or Is It No Longer Possible To Cancel The Appointment",
      );

    return res
      .status(200)
      .json({ message: "Appointment Canceled Successfully" });
  };

  updateAppointmentStatus = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { appointmentId } = req.params as updateAppointmentParamsDTO;
    const { status }: updateAppointmentDTO = req.body;

    const filter: Record<string, any> = { _id: appointmentId };
    const update: Record<string, any> = { status, $inc: { __v: 1 } };

    if (req.decoded.role === RoleEnum.DOCTOR) {
      filter.doctorId = req.decoded._id;
    }

    if (status === statusEnum.CONFIRMED) {
      filter.status = statusEnum.PENDING;
    } else if (status === statusEnum.COMPLETED) {
      filter.status = statusEnum.CONFIRMED;
      update.$unset = {
        bookingDate: true,
        bookingDateExpiredAt: true,
        workingSchedule: true,
      };
      update.paymentStatus = PaymentStatusEnum.PAID;
    }

    const updateBook = await this._bookModel.findOneAndUpdate({
      filter,
      update,
    });
    if (!updateBook)
      throw new NotFoundException(
        "Appointment Not Found Or Invalid Status Transition",
      );

    return res
      .status(200)
      .json({ message: "Appointment Status Updated Successfully" });
  };

  deleteAppointment = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { appointmentId } = req.params as deleteAppointmentDTO;
    const filter: Record<string, any> = { _id: appointmentId };

    const deleteBook = await this._bookModel.findOneAndDelete({ filter });
    if (!deleteBook) throw new NotFoundException("Appointment not found");

    return res
      .status(200)
      .json({ message: "Appointment Deleted Successfully" });
  };

  checkoutAppointment = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { appointmentId } = req.params as checkoutAppointmentDTO;

    const book = await this._bookModel.findOne({
      filter: {
        _id: appointmentId,
        status: statusEnum.PENDING,
        paymentStatus: PaymentStatusEnum.UNPAID,
        paymentMethod: PaymentMethodEnum.CARD,
      },
      options: {
        populate: [{ path: "patientId", select: "firstName lastName email" }],
      },
    });
    if (!book)
      throw new NotFoundException(
        "Book Not Found Or Not Allowed To Online Payment",
      );

    const doctor = await this._doctorModel.findOne({
      filter: { userId: book.doctorId },
    });
    if (!doctor) throw new NotFoundException("Doctor Not Found");

    const amount = book.consultationFee;
    const line_items = [
      {
        price_data: {
          currency: "egp",
          product_data: {
            name: `Doctor : ${doctor.doctorName}`,
            description: `Specialization : ${doctor.specialization}\nBio : ${doctor.bio}`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ];

    const session = await StripeServices.createSession({
      customer_email: `${req.decoded.email}`,
      line_items,
      metadata: {
        book_id: appointmentId.toString(),
        doctorId: doctor._id.toString(),
      },
      mode: "payment",
      discounts: [],
    });

    return res.status(200).json({
      message: "Checkout Session Created Successfully",
      session: { url: session.url },
    });
  };

  webhooksStripe = async (req: Request, res: Response): Promise<Response> => {
    try {
      const signature = req.headers["stripe-signature"] as string;

      if (!signature) {
        throw new BadRequestException("Missing stripe-signature header");
      }

      const event = StripeServices.constructEvent({
        payload: req.body,
        signature,
        secret: process.env.STRIPE_WEBHOOK_SECRET as string,
      });

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const book_id = session.metadata?.book_id;

        if (book_id) {
          try {
            const updateResult = await this._bookModel.updateOne({
              filter: { _id: book_id },
              update: {
                $unset: { slotDuration: true, bookingDateExpiredAt: true },
                $set: {
                  status: statusEnum.CONFIRMED,
                  paymentStatus: PaymentStatusEnum.PAID,
                },
              },
            });

            if (updateResult.matchedCount === 0) {
              console.warn(`⚠️ No booking found in DB for ID: ${book_id}`);
            } else {
              console.log(`✅ Appointment ${book_id} confirmed and paid.`);
            }
          } catch (dbError: any) {
            console.error("❌ DB Update Error in Webhook:", dbError.message);
          }
        } else {
          console.warn(
            "⚠️ Checkout Session completed without 'book_id' in metadata.",
          );
        }
      }

      return res.status(200).json({ received: true });
    } catch (error: any) {
      console.error("❌ Webhook Error:", error.message);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }
  };
}
export default new appointmentServices();
