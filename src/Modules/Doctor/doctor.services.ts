import { Request, Response } from "express";
import {
  createDoctorDTO,
  createDoctorParamsDTO,
  deleteDoctorDTO,
  getDoctorDTO,
  getDoctorsDTO,
  updateDoctorDTO,
  updateDoctorParamsDTO,
} from "./doctor.dto";
import { UserRepository } from "../../DB/Repositories/user.repository";
import { userModel } from "../../DB/Models/user.model";
import { ClinicRepository } from "../../DB/Repositories/clinic.repository";
import { clinicModel } from "../../DB/Models/clinic.model";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "../../Utils/Security/Error/global.error.utils";
import { RoleEnum } from "../../Utils/Enum/enum.utils";
import { DoctorRepository } from "../../DB/Repositories/doctor.repository";
import { doctorModel } from "../../DB/Models/doctor.model";
import { deleteFile, uploadFile } from "../../Utils/Multer/aws.services.utils";

class doctorServices {
  private _userModel = new UserRepository(userModel);
  private _clinicModel = new ClinicRepository(clinicModel);
  private _doctorModel = new DoctorRepository(doctorModel);
  constructor() {}

  createDoctor = async (req: Request, res: Response): Promise<Response> => {
    if (req.body.workingSchedule) {
      req.body.workingSchedule = JSON.parse(req.body.workingSchedule);
    }
    const { userId } = req.params as createDoctorParamsDTO;
    const {
      doctorName,
      bio,
      clinic,
      consultationFee,
      specialization,
      slotDuration,
      workingSchedule,
      phone,
      address,
      email,
      location,
    }: createDoctorDTO = req.body;

    if (clinic) {
      const checkClinic = await this._clinicModel.findOne({
        filter: { _id: clinic },
      });
      if (!checkClinic) throw new NotFoundException("Clinic Not Found");
    }

    const existingDoctor = await this._doctorModel.findOne({
      filter: { userId: userId ? userId : req.decoded._id },
    });

    if (existingDoctor) {
      throw new ConflictException(
        "Doctor profile already exists for this user",
      );
    }

    const user = await this._userModel.findOne({
      filter: { _id: userId ? userId : req.decoded._id },
    });
    if (!user) throw new NotFoundException("User Not Found");

    if (!user.profileImage && !req.file) {
      throw new BadRequestException(
        "Must upload a doctor image or have a profile image",
      );
    }

    if (user.role !== RoleEnum.ADMIN && user.role !== RoleEnum.DOCTOR) {
      throw new ForbiddenException("Not Allowed To Add This User");
    }

    if (workingSchedule && workingSchedule.length > 0) {
      const days = workingSchedule.map((schedule) => schedule.day);
      if (new Set(days).size !== days.length) {
        throw new BadRequestException(
          "Duplicate days in working schedule are not allowed",
        );
      }
    }

    let key;
    if (req.file) {
      key = await uploadFile({
        path: `Doctors/Doctors Image/${userId ? userId : req.decoded._id}`,
        file: req.file as Express.Multer.File,
      });
    }

    try {
      const [doctor] = await this._doctorModel.create({
        data: [
          {
            doctorName,
            bio,
            doctorImage: key ? key : user.profileImage,
            specialization,
            userId: user._id,
            workingSchedule,
            slotDuration,
            consultationFee,
            ...(clinic && { clinic }),
            ...(!clinic && {
              phone: phone ? phone : user.phone,
              email: email ? email : user.email,
              address,
              location,
            }),
          },
        ],
      });
      if (!doctor) throw new BadRequestException("Failed To Create Doctor");
      if (clinic) {
        await this._clinicModel.updateOne({
          filter: { _id: clinic },
          update: { $addToSet: { doctors: doctor._id } },
        });
      }
      return res.status(201).json({ message: "Doctor Created Successfully" });
    } catch (error) {
      if (key) await deleteFile({ Key: key });
      throw error;
    }
  };

  getDoctors = async (req: Request, res: Response): Promise<Response> => {
    const { specialization } = req.query as unknown as getDoctorsDTO;

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (specialization) {
      filter.specialization = specialization;
    }
    const [doctors, totalDoctors] = await Promise.all([
      this._doctorModel.find({
        filter,
        projection: "-__v -createdAt -updatedAt",
        options: {
          page,
          limit,
          skip,
          sort: { createdAt: -1 },
          populate: [
            {
              path: "userId",
              select: "firstName lastName email",
            },
            {
              path: "clinic",
              select: "clinicName address phone",
            },
          ],
        },
      }),
      this._doctorModel.countDocuments({
        filter,
      }),
    ]);

    const totalPages = Math.ceil(totalDoctors / limit);

    return res.status(200).json({
      message: "Get Doctors Successfully",
      Pagination: {
        currentPage: page,
        limit,
        skip,
        totalDoctors,
        totalPages,
      },
      doctors,
    });
  };

  getSpecificDoctor = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { doctorId } = req.params as getDoctorDTO;

    const doctor = await this._doctorModel.findOne({
      filter: { _id: doctorId },
      projection: "-__v -createdAt -updatedAt",
      options: {
        populate: [
          {
            path: "userId",
            select: "firstName lastName email",
          },
          {
            path: "clinic",
            select: "clinicName address phone",
          },
        ],
      },
    });
    if (!doctor) throw new NotFoundException("Doctor Not Found");

    return res.status(200).json({ message: "Get Doctor Successfully", doctor });
  };

  updateDoctor = async (req: Request, res: Response): Promise<Response> => {
    if (req.body.workingSchedule) {
      req.body.workingSchedule = JSON.parse(req.body.workingSchedule);
    }
    const { doctorId } = req.params as updateDoctorParamsDTO;
    const {
      doctorName,
      bio,
      clinic,
      specialization,
      consultationFee,
      slotDuration,
      workingSchedule,
    }: updateDoctorDTO = req.body;

    const doctor = await this._doctorModel.findOne({
      filter: { _id: doctorId },
    });
    if (!doctor) throw new NotFoundException("Doctor Not Found");

    if (
      req.decoded.role !== RoleEnum.ADMIN &&
      req.decoded._id !== doctor.userId
    ) {
      throw new ForbiddenException("Not Allowed For You To Update Doctor");
    }

    if (clinic) {
      const checkClinic = await this._clinicModel.findOne({
        filter: { _id: clinic },
      });
      if (!checkClinic) throw new NotFoundException("Clinic Not Found");
    }

    if (workingSchedule) {
      const days = workingSchedule.map((schedule) => schedule.day);
      if (new Set(days).size !== days.length) {
        throw new BadRequestException(
          "Duplicate days in working schedule are not allowed",
        );
      }
    }

    const oldImage = doctor.doctorImage;
    let key;
    if (req.file) {
      key = await uploadFile({
        path: `Doctors/Doctors Image/${doctorId ? doctorId : req.decoded._id}`,
        file: req.file as Express.Multer.File,
      });
    }

    const updateDoctor = await this._doctorModel.updateOne({
      filter: { _id: doctorId ? doctorId : req.decoded._id },
      update: {
        ...(doctorName && { doctorName }),
        ...(bio && { bio }),
        ...(clinic && { clinic }),
        ...(specialization && { specialization }),
        ...(consultationFee && { consultationFee }),
        ...(slotDuration && { slotDuration }),
        ...(workingSchedule && { workingSchedule }),
        ...(key && { doctorImage: key }),
        $inc: { __v: 1 },
      },
    });
    if (!updateDoctor) {
      if (key) await deleteFile({ Key: key });
      throw new BadRequestException("Failed To Update Doctor");
    }

    if (key) await deleteFile({ Key: oldImage });

    return res.status(200).json({ message: "Doctor Updated Successfully" });
  };

  deleteDoctor = async (req: Request, res: Response): Promise<Response> => {
    const { doctorId } = req.params as deleteDoctorDTO;

    const doctor = await this._doctorModel.findOne({
      filter: { _id: doctorId },
    });
    if (!doctor) throw new NotFoundException("Doctor Not Found");

    if (
      req.decoded.role !== RoleEnum.ADMIN &&
      req.decoded._id !== doctor.userId
    ) {
      throw new ForbiddenException("Not Allowed To Delete This Doctor");
    }

    const deleteDoctor = await this._doctorModel.deleteOne({
      filter: { _id: doctorId },
    });

    if (!deleteDoctor) throw new BadRequestException("Failed To Delete Doctor");

    if (doctor.clinic) {
      const updateClinic = await this._clinicModel.updateOne({
        filter: { _id: doctor.clinic },
        update: { $pull: { doctors: doctor._id } },
      });
      if (!updateClinic)
        throw new BadRequestException("Failed To Update Docto's Clinic");
    }

    if (
      doctor.doctorImage &&
      doctor.doctorImage.includes("Doctors/Doctors Image")
    ) {
      await deleteFile({ Key: doctor.doctorImage });
    }

    return res.status(200).json({ message: "Doctor Deleted Successfully" });
  };
}
export default new doctorServices();
