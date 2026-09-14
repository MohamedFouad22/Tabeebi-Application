import { Router } from "express";
import { authentication } from "../../Middleware/authentication.middleware";
import {
  RoleEnum,
  storageTypeEnum,
  TokenTypeEnum,
} from "../../Utils/Enum/enum.utils";
import { validation } from "../../Middleware/validation.middleware";
import clinicServices from "./clinic.services";
import { createClinicSchema, getAllClinicsSchema } from "./clinic.validation";
import {
  cloudFileValidtion,
  fileValidation,
} from "../../Utils/Multer/multer.utils";
const router: Router = Router();

router.post(
  "/create-clinic",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.ADMIN, RoleEnum.DOCTOR]),
  cloudFileValidtion({
    storageApproach: storageTypeEnum.MEMORY,
    maxSize: 5,
    validation: [...fileValidation.image],
  }).single("clinicLogo"),
  validation(createClinicSchema),
  clinicServices.createClinic,
);

router.get(
  "/get-all-clinics",
  validation(getAllClinicsSchema),
  clinicServices.getAllClinics,
);

export default router;
