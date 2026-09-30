import { Router } from "express";
const router: Router = Router();
import OrderServices from "./order.services";
import { authentication } from "../../Middleware/authentication.middleware";
import { RoleEnum, TokenTypeEnum } from "../../Utils/Enum/enum.utils";

router.post("/create-order" , authentication(TokenTypeEnum.ACCESS ,[RoleEnum.USER,RoleEnum.ADMIN]),OrderServices.createOrder)

export default router;
