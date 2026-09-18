import { Router } from "express";
const router: Router = Router();
import appointmentRouterServices from "./appointments.services";
import { authentication } from "../../Middleware/authentication.middleware";
import { RoleEnum, TokenTypeEnum } from "../../Utils/Enum/enum.utils";
import { validation } from "../../Middleware/validation.middleware";
import {
  bookAppointmentSchema,
  getPatientSchema,
} from "./appointments.validation";

router.post(
  "/book-appointment/:doctorId",
  authentication(TokenTypeEnum.ACCESS, [
    RoleEnum.ADMIN,
    RoleEnum.COMPANY,
    RoleEnum.DOCTOR,
    RoleEnum.USER,
  ]),
  validation(bookAppointmentSchema),
  appointmentRouterServices.bookAppointment,
);

router.get(
  "/get-patient{/:patientId}",
  authentication(TokenTypeEnum.ACCESS, [
    RoleEnum.ADMIN,
    RoleEnum.DOCTOR,
    RoleEnum.USER,
  ]),
  validation(getPatientSchema),
  appointmentRouterServices.getPatientHistory,
);

router.get("/get-appointments/:appointmentId" , authentication(TokenTypeEnum.ACCESS,[RoleEnum.ADMIN,RoleEnum.DOCTOR,RoleEnum.USER]),validation(),appointmentRouterServices.getAppointment)
export default router;
