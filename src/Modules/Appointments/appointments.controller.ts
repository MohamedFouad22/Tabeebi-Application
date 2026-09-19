import { Router } from "express";
const router: Router = Router();
import appointmentServices from "./appointments.services";
import { authentication } from "../../Middleware/authentication.middleware";
import { RoleEnum, TokenTypeEnum } from "../../Utils/Enum/enum.utils";
import { validation } from "../../Middleware/validation.middleware";
import {
  bookAppointmentSchema,
  getAppointmentSchema,
  getDoctorHistorySchema,
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
  appointmentServices.bookAppointment,
);

router.get(
  "/get-patient{/:patientId}",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.ADMIN, RoleEnum.USER]),
  validation(getPatientSchema),
  appointmentServices.getPatientHistory,
);

router.get(
  "/get-appointment/:appointmentId",
  authentication(TokenTypeEnum.ACCESS, [
    RoleEnum.ADMIN,
    RoleEnum.DOCTOR,
    RoleEnum.USER,
  ]),
  validation(getAppointmentSchema),
  appointmentServices.getAppointment,
);

router.get(
  "/doctor-history/:doctorId{/:patientId}",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.DOCTOR, RoleEnum.ADMIN]),
  validation(getDoctorHistorySchema),
  appointmentServices.getDoctorHistory,
);
export default router;
