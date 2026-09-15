import { Router } from "express";
const router: Router = Router();
import doctorServices from "./doctor.services";
import { authentication } from "../../Middleware/authentication.middleware";
import {
  RoleEnum,
  storageTypeEnum,
  TokenTypeEnum,
} from "../../Utils/Enum/enum.utils";
import { validation } from "../../Middleware/validation.middleware";
import {
  cloudFileValidtion,
  fileValidation,
} from "../../Utils/Multer/multer.utils";
import {
  createDoctorSchema,
  getDoctorSchema,
  getDoctorsSchema,
} from "./doctor.validation";

router.post(
  "/create-doctor{/:userId}",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.ADMIN, RoleEnum.DOCTOR]),
  cloudFileValidtion({
    storageApproach: storageTypeEnum.MEMORY,
    maxSize: 5,
    validation: [...fileValidation.image],
  }).single("doctorImage"),
  validation(createDoctorSchema),
  doctorServices.createDoctor,
);

router.get(
  "/get-doctors",
  validation(getDoctorsSchema),
  doctorServices.getDoctors,
);

router.get(
  "/get-doctor/:doctorId",
  validation(getDoctorSchema),
  doctorServices.getSpecificDoctor,
);

export default router;
