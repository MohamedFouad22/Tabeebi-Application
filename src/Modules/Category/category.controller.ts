import { Router } from "express";
const router: Router = Router();
import categoryServices from "./category.services";
import { authentication } from "../../Middleware/authentication.middleware";
import {
  RoleEnum,
  storageTypeEnum,
  TokenTypeEnum,
} from "../../Utils/Enum/enum.utils";
import { validation } from "../../Middleware/validation.middleware";
import { createCategorySchema, getCategorySchema } from "./category.validation";
import {
  cloudFileValidtion,
  fileValidation,
} from "../../Utils/Multer/multer.utils";

router.post(
  "/create-category",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.ADMIN]),
  cloudFileValidtion({
    storageApproach: storageTypeEnum.MEMORY,
    maxSize: 10,
    validation: [...fileValidation.image],
  }).array("categoryImages", 5),
  validation(createCategorySchema),
  categoryServices.createCategory,
);

router.get("/get-all-categories", categoryServices.getCategories);

router.get(
  "/get-specific-category/:categoryId",
  validation(getCategorySchema),
  categoryServices.getSpecificCategory,
);

export default router;
