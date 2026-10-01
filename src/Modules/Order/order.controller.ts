import { Router } from "express";
const router: Router = Router();
import OrderServices from "./order.services";
import { authentication } from "../../Middleware/authentication.middleware";
import { RoleEnum, TokenTypeEnum } from "../../Utils/Enum/enum.utils";
import { validation } from "../../Middleware/validation.middleware";
import { createOrderSchema } from "./order.validation";

router.post(
  "/create-order{/:userId}",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER, RoleEnum.ADMIN]),
  validation(createOrderSchema),
  OrderServices.createOrder,
);

export default router;
