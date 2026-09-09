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
import { createBrandSchema, getSpecificBrandSchema } from "./brand.validation";

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

export default router;
