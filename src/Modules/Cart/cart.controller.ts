import { Router } from "express";
const router: Router = Router();
import CartServices from "./cart.services";
import { authentication } from "../../Middleware/authentication.middleware";
import { validation } from "../../Middleware/validation.middleware";
import { RoleEnum, TokenTypeEnum } from "../../Utils/Enum/enum.utils";
import { createCartSchema } from "./cart.validation";

router.post(
  "/add-to-cart",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER, RoleEnum.ADMIN]),
  validation(createCartSchema),
  CartServices.createCart,
);

export default router;
