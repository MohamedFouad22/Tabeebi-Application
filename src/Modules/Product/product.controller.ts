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
  deleteImageSchema,
  deleteProductSchema,
  getProductSchema,
  searchProductSchema,
  updateProductSchema,
  updateProductStockSchema,
} from "./product.validation";
import {
  cloudFileValidtion,
  fileValidation,
} from "../../Utils/Multer/multer.utils";
export const router: Router = Router();

router.get(
  "/search-product",
  validation(searchProductSchema),
  productServices.searchProduct,
);

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

router.patch(
  "/update-stock/:productId",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.ADMIN, RoleEnum.COMPANY]),
  validation(updateProductStockSchema),
  productServices.updateProductStock,
);

router.delete(
  "/delete-image/:productId",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.ADMIN, RoleEnum.COMPANY]),
  validation(deleteImageSchema),
  productServices.deleteImage,
);

export default router;
