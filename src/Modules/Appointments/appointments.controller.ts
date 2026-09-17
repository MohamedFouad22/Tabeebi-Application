import { Router } from "express";
const router: Router = Router();
import appointmentRouterServices from "./appointments.services";
import { authentication } from "../../Middleware/authentication.middleware";
import { RoleEnum, TokenTypeEnum } from "../../Utils/Enum/enum.utils";
import { validation } from "../../Middleware/validation.middleware";
import { bookAppointmentSchema } from "./appointments.validation";

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
export default router;
