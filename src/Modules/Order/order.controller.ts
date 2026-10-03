import { Router } from "express";
const router: Router = Router();
import OrderServices from "./order.services";
import { authentication } from "../../Middleware/authentication.middleware";
import { RoleEnum, TokenTypeEnum } from "../../Utils/Enum/enum.utils";
import { validation } from "../../Middleware/validation.middleware";
import {
  createCheckoutSchema,
  createOrderSchema,
  getOrdersSchema,
} from "./order.validation";

router.post(
  "/create-order{/:userId}",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER, RoleEnum.ADMIN]),
  validation(createOrderSchema),
  OrderServices.createOrder,
);

router.post(
  "/checkout-order{/:userId}/:orderId",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER, RoleEnum.ADMIN]),
  validation(createCheckoutSchema),
  OrderServices.checkoutOrder,
);

router.get(
  "/get-all-orders{/:userId}",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER, RoleEnum.ADMIN]),
  validation(getOrdersSchema),
  OrderServices.getOrders,
);

export default router;
