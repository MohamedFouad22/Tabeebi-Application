import { Router } from "express";
import { authentication } from "../../Middleware/authentication.middleware";
import {
  RoleEnum,
  storageTypeEnum,
  TokenTypeEnum,
} from "../../Utils/Enum/enum.utils";
import productServices from "./product.services";
import { validation } from "../../Middleware/validation.middleware";
import { createProductSchema } from "./product.validation";
import {
  cloudFileValidtion,
  fileValidation,
} from "../../Utils/Multer/multer.utils";
export const router: Router = Router();

router.post(
  "/create-product",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.ADMIN, RoleEnum.COMPANY]),
  cloudFileValidtion({
    storageApproach: storageTypeEnum.MEMORY,
    maxSize: 50,
    validation: [...fileValidation.image],
  }).array("productImages", 10),
  validation(createProductSchema),
  productServices.createProduct,
);

export default router;
