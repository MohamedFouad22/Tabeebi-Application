import { Router } from "express";
import { authentication } from "../../Middleware/authentication.middleware";
import {
  RoleEnum,
  storageTypeEnum,
  TokenTypeEnum,
} from "../../Utils/Enum/enum.utils";
import { validation } from "../../Middleware/validation.middleware";
import medicalCenterServices from "./medicalCenter.services";
import {
  accountStatusSchema,
  createFacilitySchema,
  deleteAccountSchema,
  deleteFacilityReqSchema,
  getFacilitiesSchema,
  getFacilitySchema,
  getTestsSchema,
  updateFacilitySchema,
  updateTestsSchema,
} from "./medicalCenter.validation";
import {
  cloudFileValidtion,
  fileValidation,
} from "../../Utils/Multer/multer.utils";
const router: Router = Router();

router.post(
  "/create-medical-center",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.ADMIN, RoleEnum.FACILITY]),
  cloudFileValidtion({
    storageApproach: storageTypeEnum.MEMORY,
    maxSize: 5,
    validation: [...fileValidation.image],
  }).single("facilityLogo"),
  validation(createFacilitySchema),
  medicalCenterServices.createCenter,
);

router.get(
  "/get-facilities",
  validation(getFacilitiesSchema),
  medicalCenterServices.getFacilities,
);

router.get(
  "/get-facility/:facilityId",
  validation(getFacilitySchema),
  medicalCenterServices.getFacility,
);

router.patch(
  "/update-facility/:facilityId{/:userId}",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.ADMIN, RoleEnum.FACILITY]),
  cloudFileValidtion({
    storageApproach: storageTypeEnum.MEMORY,
    maxSize: 5,
    validation: [...fileValidation.image],
  }).single("facilityLogo"),
  validation(updateFacilitySchema),
  medicalCenterServices.updateFacility,
);

router.patch(
  "/accout-status/:facilityId{/:userId}",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.ADMIN, RoleEnum.FACILITY]),
  validation(accountStatusSchema),
  medicalCenterServices.accountStatus,
);

router.patch(
  "/delete-facility-req/:facilityId{/:userId}",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.ADMIN, RoleEnum.FACILITY]),
  validation(deleteFacilityReqSchema),
  medicalCenterServices.deleteFacilityRequest,
);

router.delete(
  "/delete-facility/:facilityId{/:userId}",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.FACILITY, RoleEnum.ADMIN]),
  validation(deleteAccountSchema),
  medicalCenterServices.deleteFacility,
);

router.post(
  "/update-tests/:facilityId{/:userId}",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.ADMIN, RoleEnum.FACILITY]),
  validation(updateTestsSchema),
  medicalCenterServices.updateTests,
);

router.get(
  "/get-tests/:facilityId",
  validation(getTestsSchema),
  medicalCenterServices.getTests,
);

export default router;
