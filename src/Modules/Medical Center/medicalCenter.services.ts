import { Request, Response } from "express";
import {
  createClinicDTO,
  getFacilitiesDTO,
  getFacilityDTO,
  updateFacilityDTO,
  updateFacilityParamsDTO,
} from "./medicalCenter.dto";
import { medicalCenterRepository } from "../../DB/Repositories/medicalCenter.repository";
import { medicalCenterModel } from "../../DB/Models/medicalCenter.model";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../Utils/Security/Error/global.error.utils";
import { deleteFile, uploadFile } from "../../Utils/Multer/aws.services.utils";
import { MedicalServiceTypeEnum, RoleEnum } from "../../Utils/Enum/enum.utils";

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

  updateFacility = async (req: Request, res: Response): Promise<Response> => {
    if (req.body.workingSchedule) {
      req.body.workingSchedule = JSON.parse(req.body.workingSchedule);
    }
    if (req.body.labSpecialization) {
      req.body.labSpecialization = JSON.parse(req.body.labSpecialization);
    }
    if (req.body.radiologySpecialty) {
      req.body.radiologySpecialty = JSON.parse(req.body.radiologySpecialty);
    }

    const { facilityId, userId } =
      req.params as unknown as updateFacilityParamsDTO;
    const {
      facilityName,
      address,
      phone,
      email,
      serviceType,
      labSpecialization,
      radiologySpecialty,
      workingSchedule,
    }: updateFacilityDTO = req.body;

    const filter: Record<string, any> = { _id: facilityId };
    if (req.decoded.role === RoleEnum.ADMIN) {
      filter.createdBy = userId !== undefined ? userId : req.decoded._id;
    } else if (req.decoded.role === RoleEnum.FACILITY) {
      filter.createdBy = req.decoded._id;
    }

    const checkFacility = await this._medicalCenter.findOne({ filter });
    if (!checkFacility) throw new NotFoundException("Facility Not Found");

    const targetServiceType =
      serviceType !== undefined ? serviceType : checkFacility.serviceType;

    const updateFields: Record<string, any> = {};

    if (facilityName !== undefined) updateFields.facilityName = facilityName;
    if (address !== undefined) updateFields.address = address;
    if (phone !== undefined) updateFields.phone = phone;
    if (email !== undefined) updateFields.email = email;
    if (workingSchedule !== undefined)
      updateFields.workingSchedule = workingSchedule;
    if (serviceType !== undefined) updateFields.serviceType = serviceType;

    if (targetServiceType === MedicalServiceTypeEnum.LABORATORY) {
      const effectiveLabSpec =
        labSpecialization !== undefined
          ? labSpecialization
          : checkFacility.labSpecialization;

      if (!effectiveLabSpec || effectiveLabSpec.length === 0) {
        throw new BadRequestException(
          "Laboratory Facility Must Have At Least One Lab Specialization",
        );
      }

      if (labSpecialization !== undefined) {
        updateFields.labSpecialization = labSpecialization;
      }
      updateFields.radiologySpecialty = []; 
    }

    if (targetServiceType === MedicalServiceTypeEnum.RADIOLOGY) {
      const effectiveRadSpec =
        radiologySpecialty !== undefined
          ? radiologySpecialty
          : checkFacility.radiologySpecialty;

      if (!effectiveRadSpec || effectiveRadSpec.length === 0) {
        throw new BadRequestException(
          "Radiology Facility Must Have At Least One Radiology Specialty",
        );
      }

      if (radiologySpecialty !== undefined) {
        updateFields.radiologySpecialty = radiologySpecialty;
      }
      updateFields.labSpecialization = []; 
    }

    let newLogoKey: string | undefined;
    if (req.file) {
      newLogoKey = await uploadFile({
        path: `Center/Facility Imaged/${req.decoded._id}`,
        file: req.file,
      });
      updateFields.facilityLogo = newLogoKey;
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(200).json({ message: "No Changes Detected" });
    }

    updateFields.$inc = { __v: 1 };

    try {
      const result = await this._medicalCenter.updateOne({
        filter,
        update: updateFields,
      });

      if (result.matchedCount === 0) {
        throw new NotFoundException("Facility Not Found");
      }

      if (newLogoKey && checkFacility.facilityLogo) {
        deleteFile({ Key: checkFacility.facilityLogo }).catch((s3Error) => {
          console.error("Failed to delete old facility logo from S3:", s3Error);
        });
      }

      return res.status(200).json({ message: "Facility Updated Successfully" });
    } catch (error: any) {
      if (newLogoKey) {
        await deleteFile({ Key: newLogoKey }).catch(() => {});
      }
      if (error.code === 11000) {
        throw new ConflictException("Facility Name Already Exists");
      }
      throw error;
    }
  };
}
export default new medicalCenterServices();
