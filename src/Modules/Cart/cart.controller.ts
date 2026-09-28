import { Router } from "express";
const router: Router = Router();
import CartServices from "./cart.services";
import { authentication } from "../../Middleware/authentication.middleware";
import { validation } from "../../Middleware/validation.middleware";
import { RoleEnum, TokenTypeEnum } from "../../Utils/Enum/enum.utils";
import {
  clearCartSchema,
  createCartSchema,
  getCartSchema,
  removeItemSchema,
  updateItemQuantitySchema,
} from "./cart.validation";

router.get(
  "/get-cart{/:userId}",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER, RoleEnum.ADMIN]),
  validation(getCartSchema),
  CartServices.getCart,
);

router.post(
  "/add-to-cart",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER, RoleEnum.ADMIN]),
  validation(createCartSchema),
  CartServices.createCart,
);

router.patch(
  "/update-item-quantity{/:userId}/:itemId",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER, RoleEnum.ADMIN]),
  validation(updateItemQuantitySchema),
  CartServices.updateItemQuantity,
);

router.delete(
  "/delete-item{/:userId}/:itemId",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.ADMIN, RoleEnum.USER]),
  validation(removeItemSchema),
  CartServices.removeItem,
);

router.delete(
  "/clear-cart{/:userId}",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER, RoleEnum.ADMIN]),
  validation(clearCartSchema),
  CartServices.clearCart,
);

export default router;
