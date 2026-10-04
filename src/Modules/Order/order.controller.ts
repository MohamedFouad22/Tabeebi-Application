import { Router } from "express";
const router: Router = Router();
import OrderServices from "./order.services";
import { authentication } from "../../Middleware/authentication.middleware";
import { RoleEnum, TokenTypeEnum } from "../../Utils/Enum/enum.utils";
import { validation } from "../../Middleware/validation.middleware";
import {
  cancelOrderSchema,
  createCheckoutSchema,
  createOrderSchema,
  getOrdersAdminSchema,
  getOrderSchema,
  getOrdersSchema,
  updateStatusSchema,
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

router.post("/order-webhook", OrderServices.webhookStripe);

router.get(
  "/get-all-orders{/:userId}",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER, RoleEnum.ADMIN]),
  validation(getOrdersSchema),
  OrderServices.getOrders,
);

router.get(
  "/get-order/:orderId",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER, RoleEnum.ADMIN]),
  validation(getOrderSchema),
  OrderServices.getOrder,
);

router.patch(
  "/cancel-order{/:userId}/:orderId",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER, RoleEnum.ADMIN]),
  validation(cancelOrderSchema),
  OrderServices.cancelOrder,
);

router.get(
  "/get-orders",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.ADMIN]),
  validation(getOrdersAdminSchema),
  OrderServices.getAllOrders,
);

router.patch(
  "/update-status/:orderId",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.ADMIN]),
  validation(updateStatusSchema),
  OrderServices.updateStatus,
);

export default router;
