import { Request, Response } from "express";
import {
  IcreateClinicDTO,
  IdeleteClinicDTO,
  IgetAllClinicsDTO,
  IgetClinicDTO,
  IupdateClinicDoctorsDTO,
  IupdateClinicDoctorsParamsDTO,
  IupdateClinicDto,
  IupdateClinicParamsDto,
} from "./clinic.dto";
import { ClinicRepository } from "../../DB/Repositories/clinic.repository";
import { clinicModel } from "../../DB/Models/clinic.model";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "../../Utils/Security/Error/global.error.utils";
import { deleteFile, uploadFile } from "../../Utils/Multer/aws.services.utils";
import { UserRepository } from "../../DB/Repositories/user.repository";
import { userModel } from "../../DB/Models/user.model";
import { RoleEnum } from "../../Utils/Enum/enum.utils";
import { DoctorRepository } from "../../DB/Repositories/doctor.repository";
import { doctorModel } from "../../DB/Models/doctor.model";

class clinicServices {
  private _clinicModel = new ClinicRepository(clinicModel);
  private _doctorModel = new DoctorRepository(doctorModel);
  constructor() {}

  createClinic = async (req: Request, res: Response): Promise<Response> => {
    const {
      clinicName,
      location,
      address,
      phone,
      email,
      doctors = [],
    }: IcreateClinicDTO = req.body;

    const clinic = await this._clinicModel.findOne({
      filter: { $or: [{ clinicName }, { phone }] },
    });
    if (clinic) throw new BadRequestException("This Clinic Already Exists");

    const finalDoctors = [...new Set(doctors)];
    if (finalDoctors.length !== doctors?.length) {
      throw new ConflictException(
        "You Cannot Add The Same Doctor More Than Once",
      );
    }

    if (finalDoctors.length > 0) {
      const checkDoctors = await this._doctorModel.find({
        filter: { _id: { $in: finalDoctors }, role: RoleEnum.DOCTOR },
      });
      if (checkDoctors.length !== finalDoctors.length) {
        throw new NotFoundException(
          "One or more doctors were not found or not allowed",
        );
      }
    }

    let key: string | undefined;
    if (req.file as Express.Multer.File) {
      key = await uploadFile({
        path: `Clinic/Clinic Logo/${req.decoded._id}`,
        file: req.file as Express.Multer.File,
      });
    }

    try {
      const [newClinic] = await this._clinicModel.create({
        data: [
          {
            clinicName,
            location,
            address,
            phone,
            email,
            clinicLogo: key,
            doctors,
            createdBy: req.decoded._id,
          },
        ],
      });
      if (!newClinic) throw new BadRequestException("Failed To Create Clinic");
    } catch (error) {
      if (key) await deleteFile({ Key: key });
      throw error;
    }

    return res.status(201).json({ message: "Clinic Created Successfully" });
  };

  getAllClinics = async (req: Request, res: Response): Promise<Response> => {
    const { clinicName } = req.query as unknown as IgetAllClinicsDTO;

    const searchRegex =
      clinicName &&
      new RegExp(
        clinicName
          .trim()
          .split(/\s+/)
          .map((w) => `(?=.*${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`)
          .join("") + ".+$",
        "i",
      );

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const skip = (page - 1) * limit;

    const [clinics, totalClinics] = await Promise.all([
      this._clinicModel.find({
        filter: clinicName ? { clinicName: searchRegex } : {},
        projection: "-__v -createdAt -updatedAt",
        options: {
          page,
          limit,
          skip,
          sort: { createdAt: -1 },
        },
      }),
      this._clinicModel.countDocuments({
        filter: clinicName ? { clinicName: searchRegex } : {},
      }),
    ]);
    if (!clinics.length || clinics.length < 1) {
      return res.status(200).json({ message: "No Clinics Found", clinics: [] });
    }

    const totalPages = Math.ceil(totalClinics / limit);

    return res.status(200).json({
      message: "Get Clinics Successfully",
      Pagination: {
        totalPages,
        currentPage: page,
        limit,
        totalClinics,
      },
      clinics,
    });
  };

  getClinic = async (req: Request, res: Response): Promise<Response> => {
    const { clinicId } = req.params as IgetClinicDTO;

    const clinic = await this._clinicModel.findOne({
      filter: { _id: clinicId },
      projection: "-__v -createdAt -updatedAt",
      options: {
        populate: [
          { path: "doctors", select: "userName specialization email phone" },
        ],
      },
    });
    if (!clinic) {
      throw new NotFoundException("Clinic Not Found");
    }

    return res.status(200).json({ message: "Get Clinic Successfully", clinic });
  };

  updateClinic = async (req: Request, res: Response): Promise<Response> => {
    const { clinicId } = req.params as IupdateClinicParamsDto;
    const { clinicName, location, address, phone, email }: IupdateClinicDto =
      req.body;

    const checkClinic = await this._clinicModel.findOne({
      filter: { _id: clinicId },
    });
    if (!checkClinic) throw new NotFoundException("Not Found Clinic");

    if (
      req.user.role !== RoleEnum.ADMIN &&
      req.decoded._id.toString() !== checkClinic.createdBy.toString()
    ) {
      throw new ForbiddenException("Not Allowed To Update Clinic");
    }

    if (clinicName || phone) {
      const duplicateCheck = await this._clinicModel.findOne({
        filter: {
          _id: { $ne: clinicId },
          $or: [
            ...(clinicName ? [{ clinicName }] : []),
            ...(phone ? [{ phone }] : []),
          ],
        },
      });
      if (duplicateCheck) {
        throw new ConflictException(
          "Clinic Name or Phone already in use by another clinic",
        );
      }
    }

    let key: string | undefined;
    if (req.file as Express.Multer.File) {
      await deleteFile({ Key: String(checkClinic.clinicLogo) });

      key = await uploadFile({
        path: `Clinic/Clinic Logo/${req.decoded._id}`,
        file: req.file as Express.Multer.File,
      });
    }

    try {
      const clinic = await this._clinicModel.updateOne({
        filter: { _id: clinicId },
        update: {
          ...(clinicName && { clinicName }),
          ...(location && { location }),
          ...(address && { address }),
          ...(phone && { phone }),
          ...(email && { email }),
          ...(key && { clinicLogo: key }),
          $inc: { __v: 1 },
        },
      });
      if (!clinic) {
        throw new BadRequestException("Failed To Update Clinic");
      }
      if (key && checkClinic.clinicLogo) {
        await deleteFile({ Key: String(checkClinic.clinicLogo) });
      }
    } catch (error) {
      if (key) await deleteFile({ Key: key });
      throw error;
    }

    return res.status(200).json({ message: "Update Clinic Successfully" });
  };

  deleteClinic = async (req: Request, res: Response): Promise<Response> => {
    const { clinicId } = req.params as IdeleteClinicDTO;

    const clinic = await this._clinicModel.findOne({
      filter: { _id: clinicId },
    });
    if (!clinic) throw new NotFoundException("Clinic Not Found");

    if (
      req.decoded.role !== RoleEnum.ADMIN &&
      req.decoded._id.toString() !== clinic.createdBy.toString()
    ) {
      throw new ForbiddenException("Not Allowed To Delete Clinic");
    }

    if (clinic.clinicLogo) {
      await deleteFile({ Key: String(clinic.clinicLogo) });
    }

    await this._clinicModel.deleteOne({ filter: { _id: clinicId } });

    return res.status(200).json({ message: "Clinic Deleted Successfully" });
  };

  updateClinicDoctor = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { clinicId, doctorId } = req.params as IupdateClinicDoctorsParamsDTO;
    const { doctors } = (req.body as IupdateClinicDoctorsDTO) || {};

    const clinic = await this._clinicModel.findOne({
      filter: { _id: clinicId },
    });
    if (!clinic) throw new NotFoundException("Clinic Not Found");

    if (
      req.decoded.role !== RoleEnum.ADMIN &&
      req.decoded._id.toString() !== clinic.createdBy.toString()
    ) {
      throw new ForbiddenException("Not Allowed To Update Clinic");
    }

    if (Array.isArray(doctors) && doctors.length > 0) {
      const newDoctors = [...new Set(doctors)];

      const checkDoctors = await this._doctorModel.find({
        filter: { _id: { $in: newDoctors }, role: RoleEnum.DOCTOR },
      });
      if (checkDoctors.length !== newDoctors.length) {
        throw new NotFoundException(
          "One or more doctors were not found or not allowed",
        );
      }

      const updateClinic = await this._clinicModel.updateOne({
        filter: { _id: clinicId },
        update: {
          $addToSet: { doctors: { $each: newDoctors } },
          $inc: { __v: 1 },
        },
      });
      if (!updateClinic) {
        throw new BadRequestException("Failed To Update Clinic");
      }
    } else if (doctorId && doctorId.length > 0) {
      const doctor = await this._doctorModel.findOne({
        filter: { _id: doctorId },
      });
      if (!doctor) throw new NotFoundException("Doctor Not Found");

      const deleteDoctor = await this._clinicModel.updateOne({
        filter: { _id: clinicId },
        update: { $pull: { doctors: doctorId }, $inc: { __v: 1 } },
      });
      if (!deleteDoctor)
        throw new BadRequestException("Failed To Delete Doctor");
    }

    return res
      .status(200)
      .json({ message: "Clinic's Doctors Updated Successfully" });
  };
}
export default new clinicServices();
