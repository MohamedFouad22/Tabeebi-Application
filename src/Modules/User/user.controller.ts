import { Router } from "express";
const router: Router = Router();
import userServices from "./user.services";
import { authentication } from "../../Middleware/authentication.middleware";
import { RoleEnum, TokenTypeEnum } from "../../Utils/Enum/enum.utils";
import { validation } from "../../Middleware/validation.middleware";
import {
  editProfileSchema,
  freezeAccountSchema,
  restoreAccountSchema,
} from "./user.validation";

router.get(
  "/get-profile",
  authentication(TokenTypeEnum.ACCESS, [
    RoleEnum.USER,
    RoleEnum.ADMIN,
    RoleEnum.DOCTOR,
  ]),
  userServices.getProfile,
);
router.patch(
  "/freeze-account{/:userId}",
  authentication(TokenTypeEnum.ACCESS, [
    RoleEnum.USER,
    RoleEnum.ADMIN,
    RoleEnum.DOCTOR,
  ]),
  validation(freezeAccountSchema),
  userServices.freezeAccount,
);
router.patch(
  "/restore-account{/:userId}",
  authentication(TokenTypeEnum.ACCESS, [
    RoleEnum.USER,
    RoleEnum.ADMIN,
    RoleEnum.DOCTOR,
  ]),
  validation(restoreAccountSchema),
  userServices.restoreAccount,
);
router.patch(
  "/edit-profile",
  authentication(TokenTypeEnum.ACCESS, [
    RoleEnum.USER,
    RoleEnum.ADMIN,
    RoleEnum.DOCTOR,
  ]),
  validation(editProfileSchema),
  userServices.editProfile,
);

export default router;
