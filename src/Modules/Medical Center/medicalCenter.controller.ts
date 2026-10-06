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
  createFacilitySchema,
  getFacilitiesSchema,
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

export default router;
