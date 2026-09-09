import { Router } from "express";
const router: Router = Router();
import brandServices from "./brand.services";
import { authentication } from "../../Middleware/authentication.middleware";
import {
  RoleEnum,
  storageTypeEnum,
  TokenTypeEnum,
} from "../../Utils/Enum/enum.utils";
import {
  cloudFileValidtion,
  fileValidation,
} from "../../Utils/Multer/multer.utils";
import { validation } from "../../Middleware/validation.middleware";
import {
  createBrandSchema,
  deleteBrandSchema,
  getSpecificBrandSchema,
  updateBrandSchema,
} from "./brand.validation";

router.post(
  "/create-brand",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.ADMIN, RoleEnum.COMPANY]),
  cloudFileValidtion({
    storageApproach: storageTypeEnum.MEMORY,
    maxSize: 10,
    validation: [...fileValidation.image],
  }).single("brandImage"),
  validation(createBrandSchema),
  brandServices.createBrand,
);

router.get("/get-brands", brandServices.getBrands);

router.get(
  "/get-brand/:brandId",
  validation(getSpecificBrandSchema),
  brandServices.getSpecificBrand,
);

router.patch(
  "/update-brand/:brandId",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.ADMIN, RoleEnum.COMPANY]),
  cloudFileValidtion({
    storageApproach: storageTypeEnum.MEMORY,
    maxSize: 10,
    validation: [...fileValidation.image],
  }).single("brandLogo"),
  validation(updateBrandSchema),
  brandServices.updateBrand,
);

router.delete(
  "/delete-brand/:brandId",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.COMPANY, RoleEnum.ADMIN]),
  validation(deleteBrandSchema),
  brandServices.deleteBrand,
);

export default router;
