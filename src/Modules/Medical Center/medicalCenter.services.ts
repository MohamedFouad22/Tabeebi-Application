import { Request, Response } from "express";
import {
  createClinicDTO,
  getFacilitiesDTO,
  getFacilityDTO,
} from "./medicalCenter.dto";
import { medicalCenterRepository } from "../../DB/Repositories/medicalCenter.repository";
import { medicalCenterModel } from "../../DB/Models/medicalCenter.model";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../Utils/Security/Error/global.error.utils";
import { deleteFile, uploadFile } from "../../Utils/Multer/aws.services.utils";

class medicalCenterServices {
  private _medicalCenter = new medicalCenterRepository(medicalCenterModel);
  constructor() {}

  createCenter = async (req: Request, res: Response): Promise<Response> => {
    if (req.body.workingSchedule) {
      req.body.workingSchedule = JSON.parse(req.body.workingSchedule);
    }

    if (req.body.labSpecialization) {
      req.body.labSpecialization = JSON.parse(req.body.labSpecialization);
    }

    if (req.body.radiologySpecialty) {
      req.body.radiologySpecialty = JSON.parse(req.body.radiologySpecialty);
    }

    const {
      facilityName,
      address,
      phone,
      email,
      workingSchedule,
      serviceType,
      labSpecialization,
      radiologySpecialty,
    }: createClinicDTO = req.body;

    const checkFacility = await this._medicalCenter.findOne({
      filter: { facilityName },
    });

    if (checkFacility) {
      throw new ConflictException("Facility Name Already Exists");
    }

    const file = await uploadFile({
      path: `Center/Facility Imaged/${req.decoded._id}`,
      file: req.file as Express.Multer.File,
    });

    if (!file) {
      throw new BadRequestException("Failed To Upload File");
    }

    try {
      const [facility] = await this._medicalCenter.create({
        data: [
          {
            address,
            createdBy: req.decoded._id,
            email,
            facilityLogo: file,
            facilityName,
            phone,
            workingSchedule,
            serviceType,
            labSpecialization,
            radiologySpecialty,
          },
        ],
      });

      if (!facility) {
        throw new BadRequestException("Failed To Create Facility");
      }

      return res.status(201).json({
        message: "Center Created Successfully",
      });
    } catch (error) {
      await deleteFile({ Key: file });
      throw error;
    }
  };

  getFacilities = async (req: Request, res: Response): Promise<Response> => {
    const {
      serviceType,
      labSpecialization,
      radiologySpecialty,
      name,
    }: getFacilitiesDTO = req.query;

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (req.query.serviceType) {
      filter.serviceType = serviceType;
    }
    if (req.query.labSpecialization) {
      filter.labSpecialization = labSpecialization;
    }
    if (req.query.radiologySpecialty) {
      filter.radiologySpecialty = radiologySpecialty;
    }
    if (name) {
      filter.facilityName = { $regex: name, $options: "i" };
    }

    const [facilities, totalFacilities] = await Promise.all([
      this._medicalCenter.find({
        filter,
        options: {
          page,
          limit,
          skip,
          sort: { createdAt: -1 },
          populate: [{ path: "createdBy", select: "firstName lastName email" }],
        },
      }),

      this._medicalCenter.countDocuments({ filter }),
    ]);

    const totalPages = Math.ceil(totalFacilities / limit);

    return res.status(200).json({
      message: "Get Facilities Successfully",
      Pagination: {
        currentPage: page,
        limit,
        skip,
        totalPages,
        totalFacilities,
      },

      facilities,
    });
  };

  getFacility = async (req: Request, res: Response): Promise<Response> => {
    const { facilityId } = req.params as getFacilityDTO;

    const filter: Record<string, any> = { _id: facilityId };

    const facility = await this._medicalCenter.findOne({
      filter,
      options: {
        populate: [{ path: "createdBy", select: "firstName lastName email" }],
      },
    });
    if (!facility) throw new NotFoundException("Facility Not Found");

    return res
      .status(200)
      .json({ message: "Get Facility Successfully", Data: { facility } });
  };
}
export default new medicalCenterServices();
