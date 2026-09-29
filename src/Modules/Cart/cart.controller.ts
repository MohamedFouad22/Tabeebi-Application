import { Router } from "express";
const router: Router = Router();
import CartServices from "./cart.services";
import { authentication } from "../../Middleware/authentication.middleware";
import { validation } from "../../Middleware/validation.middleware";
import { RoleEnum, TokenTypeEnum } from "../../Utils/Enum/enum.utils";
import {
  applyCouponSchema,
  clearCartSchema,
  createCartSchema,
  getCartSchema,
  removeCouponSchema,
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

router.post(
  "/apply-coupon{/:userId}",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER, RoleEnum.ADMIN]),
  validation(applyCouponSchema),
  CartServices.applyCoupon,
);

router.delete(
  "/remove-coupon{/:userId}",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER, RoleEnum.ADMIN]),
  validation(removeCouponSchema),
  CartServices.removeCoupon,
);

router.get(
  "/get-active-carts",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.ADMIN]),
  CartServices.getActiveCarts,
);

export default router;
