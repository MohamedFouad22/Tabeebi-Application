import { Request, Response } from "express";
import { IcreateClinicDTO, IgetAllClinicsDTO } from "./clinic.dto";
import { ClinicRepository } from "../../DB/Repositories/clinic.repository";
import { clinicModel } from "../../DB/Models/clinic.model";
import {
  BadRequestException,
  ConflictException,
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
  private _userModel = new UserRepository(userModel);
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
      const checkDoctors = await this._userModel.find({
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
}
export default new clinicServices();
