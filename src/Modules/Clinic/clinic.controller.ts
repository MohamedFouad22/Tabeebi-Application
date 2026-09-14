import { Router } from "express";
import { authentication } from "../../Middleware/authentication.middleware";
import {
  RoleEnum,
  storageTypeEnum,
  TokenTypeEnum,
} from "../../Utils/Enum/enum.utils";
import { validation } from "../../Middleware/validation.middleware";
import clinicServices from "./clinic.services";
import {
  createClinicSchema,
  deleteClinicSchema,
  getAllClinicsSchema,
  getClinicSchema,
  updateClinicDoctorsSchema,
  updateClinicSchema,
} from "./clinic.validation";
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

router.get(
  "/get-clinic/:clinicId",
  validation(getClinicSchema),
  clinicServices.getClinic,
);

router.patch(
  "/update/clinic/:clinicId",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.ADMIN, RoleEnum.DOCTOR]),
  cloudFileValidtion({
    storageApproach: storageTypeEnum.MEMORY,
    maxSize: 5,
    validation: [...fileValidation.image],
  }).single("clinicLogo"),
  validation(updateClinicSchema),
  clinicServices.updateClinic,
);

router.delete(
  "/delete-clinic/:clinicId",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.ADMIN, RoleEnum.DOCTOR]),
  validation(deleteClinicSchema),
  clinicServices.deleteClinic,
);

router.patch(
  "/update-clinic-doctors/:clinicId{/:doctorId}",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.ADMIN, RoleEnum.DOCTOR]),
  validation(updateClinicDoctorsSchema),
  clinicServices.updateClinicDoctor,
);

export default router;
