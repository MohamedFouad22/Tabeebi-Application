import { Router } from "express";
import { authentication } from "../../Middleware/authentication.middleware";
import {
  RoleEnum,
  storageTypeEnum,
  TokenTypeEnum,
} from "../../Utils/Enum/enum.utils";
import productServices from "./product.services";
import { validation } from "../../Middleware/validation.middleware";
import {
  createProductSchema,
  deleteProductSchema,
  getProductSchema,
  updateProductSchema,
} from "./product.validation";
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

router.get("/get-products", productServices.getProducts);

router.get(
  "/get-product/:productId",
  validation(getProductSchema),
  productServices.getSpecificProduct,
);

router.patch(
  "/update-product/:productId",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.ADMIN, RoleEnum.COMPANY]),
  cloudFileValidtion({
    storageApproach: storageTypeEnum.MEMORY,
    maxSize: 50,
    validation: [...fileValidation.image],
  }).array("productImages", 10),
  validation(updateProductSchema),
  productServices.updateProduct,
);

router.delete(
  "/delete-product/:productId",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.ADMIN, RoleEnum.COMPANY]),
  validation(deleteProductSchema),
  productServices.deleteProduct,
);

export default router;
