import { Request, Response } from "express";
import { createClinicDTO } from "./medicalCenter.dto";
import { medicalCenterRepository } from "../../DB/Repositories/medicalCenter.repository";
import { medicalCenterModel } from "../../DB/Models/medicalCenter.model";
import {
  BadRequestException,
  ConflictException,
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
}
export default new medicalCenterServices();
