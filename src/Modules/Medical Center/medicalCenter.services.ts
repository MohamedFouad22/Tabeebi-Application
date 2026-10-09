import { Request, Response } from "express";
import {
  accountStatusDTO,
  accountStatusParamsDTO,
  createClinicDTO,
  deleteAccountDTO,
  deleteAccountParamsDTO,
  deleteFacilityDTO,
  deleteTestDTO,
  getFacilitiesDTO,
  getFacilityDTO,
  getTestsDTO,
  updateFacilityDTO,
  updateFacilityParamsDTO,
  updateTestDetailesDTO,
  updateTestDetailesParamsDTO,
  updateTestsDTO,
  updateTestsParamsDTO,
} from "./medicalCenter.dto";
import { medicalCenterRepository } from "../../DB/Repositories/medicalCenter.repository";
import { medicalCenterModel } from "../../DB/Models/medicalCenter.model";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../Utils/Security/Error/global.error.utils";
import { deleteFile, uploadFile } from "../../Utils/Multer/aws.services.utils";
import {
  labSpecializationEnum,
  MedicalServiceTypeEnum,
  RadiologySpecialtyEnum,
  RoleEnum,
} from "../../Utils/Enum/enum.utils";
import { eventEmitter } from "../../Utils/Events/event.utils";
import { userModel } from "../../DB/Models/user.model";
import { UserRepository } from "../../DB/Repositories/user.repository";
import { generateOtp } from "../../Utils/Security/OTP/generateOtp.utils";
import { compareData, hashData } from "../../Utils/Security/Hash/hash.utils";

class medicalCenterServices {
  private _medicalCenter = new medicalCenterRepository(medicalCenterModel);
  private _userModel = new UserRepository(userModel);
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

  accountStatus = async (req: Request, res: Response): Promise<Response> => {
    const { facilityId, userId } = req.params as accountStatusParamsDTO;
    const { slug } = req.query as accountStatusDTO;

    const filter: Record<string, any> = { _id: facilityId };
    const update: Record<string, any> = {};

    let user;
    let userData;
    if (req.decoded.role === RoleEnum.FACILITY) {
      filter.createdBy = req.decoded._id;
      user = req.decoded._id;
    } else if (req.decoded.role === RoleEnum.ADMIN) {
      if (userId !== undefined) {
        userData = await this._userModel.findOne({
          filter: { _id: userId },
        });
        if (!userData) throw new NotFoundException("User Not Found");
      }
      filter.createdBy = userId !== undefined ? userId : req.decoded._id;
      user = userId !== undefined ? userId : req.decoded._id;
    }

    const checkFacility = await this._medicalCenter.findOne({ filter });
    if (!checkFacility) throw new NotFoundException("Facility Not Found");

    if (checkFacility.accountStatus === slug) {
      throw new BadRequestException("Can't Update Account Status");
    }
    update.accountStatus = slug;
    update.statusUpdatedBy = user;

    const status = await this._medicalCenter.updateOne({ filter, update });
    if (status.modifiedCount === 0)
      throw new BadRequestException("Failed To Update Account Status");

    return res
      .status(200)
      .json({ message: "Account Status Updated Successfully" });
  };

  deleteFacilityRequest = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { facilityId, userId } = req.params as deleteFacilityDTO;

    const filter: Record<string, any> = { _id: facilityId };
    const update: Record<string, any> = {};

    let user;
    let userData;
    if (req.decoded.role === RoleEnum.FACILITY) {
      filter.createdBy = req.decoded._id;
      user = req.decoded._id;
    } else if (req.decoded.role === RoleEnum.ADMIN) {
      if (userId !== undefined) {
        userData = await this._userModel.findOne({
          filter: { _id: userId },
        });
        if (!userData) throw new NotFoundException("User Not Found");
      }
      filter.createdBy = userId !== undefined ? userId : req.decoded._id;
      user = userId !== undefined ? userId : req.decoded._id;
    }

    const checkFacility = await this._medicalCenter.findOne({ filter });
    if (!checkFacility) throw new NotFoundException("Facility Not Found");

    const otp = await generateOtp();

    update.deleteFacilityOTP = await hashData(otp.toString());
    update.deleteFacilityOTPExpiredAt = new Date(Date.now() + 5 * 60 * 1000);

    const updateFacility = await this._medicalCenter.updateOne({
      filter,
      update,
    });

    if (updateFacility.modifiedCount === 0)
      throw new BadRequestException("Failed To Update Facility");

    eventEmitter.emit("deleteFacilityRequest", {
      to: userData?.email ? userData?.email : req.decoded.email,
      code: otp.toString(),
      firstName: userData?.userName ? userData?.userName : req.decoded.userName,
    });

    return res
      .status(200)
      .json({ message: "Delete Facility Email Sent Successfully" });
  };

  deleteFacility = async (req: Request, res: Response): Promise<Response> => {
    const { facilityId, userId } = req.params as deleteAccountParamsDTO;
    const { otp }: deleteAccountDTO = req.body;

    const filter: Record<string, any> = { _id: facilityId };
    let user;
    let userData;

    if (req.decoded.role === RoleEnum.FACILITY) {
      filter.createdBy = req.decoded._id;
      user = req.decoded._id;
    } else if (req.decoded.role === RoleEnum.ADMIN) {
      if (userId !== undefined) {
        userData = await this._userModel.findOne({
          filter: { _id: userId },
        });
        if (!userData) throw new NotFoundException("User Not Found");
      }
      filter.createdBy = userId !== undefined ? userId : req.decoded._id;
      user = userId !== undefined ? userId : req.decoded._id;
    }

    const checkFacility = await this._medicalCenter.findOne({
      filter: {
        ...filter,
        deleteFacilityOTP: { $exists: true },
        deleteFacilityOTPExpiredAt: { $exists: true },
      },
    });
    if (!checkFacility) throw new NotFoundException("Facility Not Found");

    if (
      checkFacility.deleteFacilityOTPExpiredAt &&
      new Date(Date.now()) > checkFacility.deleteFacilityOTPExpiredAt
    ) {
      throw new BadRequestException("OTP Expired");
    }

    if (!(await compareData(otp, checkFacility.deleteFacilityOTP))) {
      throw new BadRequestException("Invalid OTP");
    }

    const deleteFacility = await this._medicalCenter.deleteOne({ filter });
    if (deleteFacility.deletedCount === 0)
      throw new BadRequestException("Failed To Delete Facility");

    eventEmitter.emit("deleteFacility", {
      to: userData?.email ? userData?.email : req.decoded.email,
      firstName: userData?.userName ? userData?.userName : req.decoded.userName,
    });

    return res.status(200).json({ message: "Facility Deleted Successfully" });
  };

  updateTests = async (req: Request, res: Response): Promise<Response> => {
    const { facilityId, userId } = req.params as updateTestsParamsDTO;
    const { tests }: updateTestsDTO = req.body;

    const filter: Record<string, any> = { _id: facilityId };

    let user;
    if (req.decoded.role === RoleEnum.FACILITY) {
      filter.createdBy = req.decoded._id;
      user = req.decoded._id;
    } else if (req.decoded.role === RoleEnum.ADMIN) {
      filter.createdBy = userId !== undefined ? userId : req.decoded._id;
      user = userId !== undefined ? userId : req.decoded._id;
    }

    const facility = await this._medicalCenter.findOne({ filter });
    if (!facility) throw new NotFoundException("Facility Not Found");

    const normalizedTests = tests.map((test) => ({
      ...test,
      testName: test.testName.trim(),
    }));

    const testNames = normalizedTests.map((test) => test.testName);

    if (new Set(testNames).size !== testNames.length) {
      throw new BadRequestException(
        "Duplicate Tests Are Not Allowed In Payload",
      );
    }

    const existingTest = await this._medicalCenter.findOne({
      filter: {
        _id: facilityId,
        "tests.testName": { $in: testNames },
      },
    });

    if (existingTest) {
      throw new BadRequestException(
        "One Or More Tests Already Exist In Facility",
      );
    }

    if (facility.serviceType === MedicalServiceTypeEnum.LABORATORY) {
      const labSpecs = (facility.labSpecialization || []) as string[];
      if (!labSpecs.length) {
        throw new BadRequestException(
          "No Laboratory Specializations Found For This Facility",
        );
      }

      const hasInvalidTest = testNames.some(
        (testName) => !labSpecs.includes(testName),
      );

      if (hasInvalidTest) {
        throw new BadRequestException(
          "One Or More Tests Are Not Covered By Your Lab Specializations",
        );
      }
    } else if (facility.serviceType === MedicalServiceTypeEnum.RADIOLOGY) {
      const radSpecs = (facility.radiologySpecialty || []) as string[];
      if (!radSpecs.length) {
        throw new BadRequestException(
          "No Radiology Specializations Found For This Facility",
        );
      }

      const hasInvalidTest = testNames.some(
        (testName) => !radSpecs.includes(testName),
      );

      if (hasInvalidTest) {
        throw new BadRequestException(
          "One Or More Tests Are Not Covered By Your Radiology Specializations",
        );
      }
    }

    const updateFacility = await this._medicalCenter.updateOne({
      filter: {
        ...filter,
        "tests.testName": { $nin: testNames },
      },
      update: {
        $push: { tests: { $each: normalizedTests } },
        $inc: { __v: 1 },
      },
    });

    if (updateFacility.modifiedCount === 0) {
      throw new BadRequestException(
        "Facility Failed To Update Or Test Already Exists",
      );
    }

    return res.status(200).json({ message: "Update Tests Successfully" });
  };

  getTests = async (req: Request, res: Response): Promise<Response> => {
    const { facilityId } = req.params as getTestsDTO;

    const filter: Record<string, any> = { _id: facilityId };

    const facility = await this._medicalCenter.findOne({ filter });
    if (!facility) throw new NotFoundException("Facility Not Found");

    const tests = facility.tests || [];

    return res.status(200).json({ message: "Get Tests Successfully", tests });
  };

  updateTest = async (req: Request, res: Response): Promise<Response> => {
    const { facilityId, userId, testId } =
      req.params as updateTestDetailesParamsDTO;

    const {
      testName,
      price,
      precautions,
      resultDuration,
      isAvailable,
    }: updateTestDetailesDTO = req.body;

    const filter: Record<string, any> = {
      _id: facilityId,
      "tests._id": testId,
    };

    if (req.decoded.role === RoleEnum.ADMIN) {
      filter.createdBy = userId !== undefined ? userId : req.decoded._id;
    } else if (req.decoded.role === RoleEnum.FACILITY) {
      filter.createdBy = req.decoded._id;
    }

    const facility = await this._medicalCenter.findOne({
      filter,
    });

    if (!facility) {
      throw new NotFoundException("Facility Not Found");
    }

    if (testName !== undefined) {
      const trimmedTestName = testName.trim();

      if (!trimmedTestName) {
        throw new BadRequestException("Test Name Cannot Be Empty");
      }

      const normalizedTestName = trimmedTestName.toLowerCase();

      const isDuplicate = facility.tests?.some(
        (test) =>
          test._id?.toString() !== testId &&
          test.testName.trim().toLowerCase() === normalizedTestName,
      );

      if (isDuplicate) {
        throw new BadRequestException("This Test Already Exists");
      }

      let isValidSpecialization = false;

      if (facility.serviceType === MedicalServiceTypeEnum.LABORATORY) {
        isValidSpecialization =
          Object.values(labSpecializationEnum).some(
            (specialization) => specialization === trimmedTestName,
          ) &&
          facility.labSpecialization?.includes(
            trimmedTestName as labSpecializationEnum,
          ) === true;
      } else if (facility.serviceType === MedicalServiceTypeEnum.RADIOLOGY) {
        isValidSpecialization =
          Object.values(RadiologySpecialtyEnum).some(
            (specialization) => specialization === trimmedTestName,
          ) &&
          facility.radiologySpecialty?.includes(
            trimmedTestName as RadiologySpecialtyEnum,
          ) === true;
      }

      if (!isValidSpecialization) {
        throw new NotFoundException("This Test Not Found In Services");
      }
    }

    const updateFields: Record<string, any> = {};

    if (testName !== undefined) {
      updateFields["tests.$.testName"] = testName.trim();
    }

    if (price !== undefined) {
      updateFields["tests.$.price"] = price;
    }

    if (precautions !== undefined) {
      updateFields["tests.$.precautions"] = precautions.trim();
    }

    if (resultDuration !== undefined) {
      updateFields["tests.$.resultDuration"] = resultDuration.trim();
    }

    if (isAvailable !== undefined) {
      updateFields["tests.$.isAvailable"] = isAvailable;
    }

    if (Object.keys(updateFields).length === 0) {
      throw new BadRequestException("No Fields Provided To Update");
    }

    const updateTest = await this._medicalCenter.findOneAndUpdate({
      filter,
      update: {
        $set: updateFields,
        $inc: { __v: 1 },
      },
    });

    if (!updateTest) {
      throw new BadRequestException("Failed To Update Test");
    }

    return res.status(200).json({
      message: "Test Updated Successfully",
    });
  };

  deleteTest = async (req: Request, res: Response): Promise<Response> => {
    const { facilityId, userId, testId } = req.params as deleteTestDTO;

    const filter: Record<string, any> = {
      _id: facilityId,
      "tests._id": testId,
    };

    if (req.decoded.role === RoleEnum.ADMIN) {
      filter.createdBy = userId !== undefined ? userId : req.decoded._id;
    } else if (req.decoded.role === RoleEnum.FACILITY) {
      filter.createdBy = req.decoded._id;
    }

    const deletedResult = await this._medicalCenter.findOneAndUpdate({
      filter,
      update: {
        $pull: { tests: { _id: testId } },
        $inc: { __v: 1 },
      },
    });

    if (!deletedResult) {
      throw new NotFoundException(
        "Facility Not Found Or Test Not Found In This Facility",
      );
    }

    return res.status(200).json({ message: "Test Deleted Successfully" });
  };
}
export default new medicalCenterServices();
