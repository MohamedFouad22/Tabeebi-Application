import { Router } from "express";
const router: Router = Router();
import userServices from "./user.services";
import { authentication } from "../../Middleware/authentication.middleware";
import {
  RoleEnum,
  storageTypeEnum,
  TokenTypeEnum,
} from "../../Utils/Enum/enum.utils";
import { validation } from "../../Middleware/validation.middleware";
import {
  contactUsSchema,
  deleteAccountSchema,
  disableTwoAuthFactorSchema,
  editProfileSchema,
  freezeAccountSchema,
  restoreAccountSchema,
} from "./user.validation";
import {
  cloudFileValidtion,
  fileValidation,
} from "../../Utils/Multer/multer.utils";

router.get(
  "/get-profile",
  authentication(TokenTypeEnum.ACCESS, [
    RoleEnum.USER,
    RoleEnum.ADMIN,
    RoleEnum.DOCTOR,
    RoleEnum.COMPANY,
    RoleEnum.FACILITY,
  ]),
  userServices.getProfile,
);
router.patch(
  "/freeze-account{/:userId}",
  authentication(TokenTypeEnum.ACCESS, [
    RoleEnum.USER,
    RoleEnum.ADMIN,
    RoleEnum.DOCTOR,
    RoleEnum.COMPANY,
    RoleEnum.FACILITY,
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
    RoleEnum.COMPANY,
    RoleEnum.FACILITY,
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
    RoleEnum.COMPANY,
    RoleEnum.FACILITY,
  ]),
  validation(editProfileSchema),
  userServices.editProfile,
);
router.post(
  "/two-auth-factor-req",
  authentication(TokenTypeEnum.ACCESS, [
    RoleEnum.USER,
    RoleEnum.ADMIN,
    RoleEnum.DOCTOR,
    RoleEnum.COMPANY,
    RoleEnum.FACILITY,
  ]),
  userServices.twoAuthFactorRequest,
);
router.patch(
  "/enable-two-auth-factor",
  authentication(TokenTypeEnum.ACCESS, [
    RoleEnum.USER,
    RoleEnum.ADMIN,
    RoleEnum.DOCTOR,
    RoleEnum.COMPANY,
    RoleEnum.FACILITY,
  ]),
  userServices.enableTwoAuthFactor,
);
router.post(
  "/disable-two-auth-factor-req",
  authentication(TokenTypeEnum.ACCESS, [
    RoleEnum.ADMIN,
    RoleEnum.COMPANY,
    RoleEnum.DOCTOR,
    RoleEnum.USER,
    RoleEnum.FACILITY,
  ]),
  userServices.disableTwoAuthFactorRequest,
);
router.patch(
  "/disable-two-auth-factor",
  authentication(TokenTypeEnum.ACCESS, [
    RoleEnum.ADMIN,
    RoleEnum.COMPANY,
    RoleEnum.DOCTOR,
    RoleEnum.USER,
    RoleEnum.FACILITY,
  ]),
  validation(disableTwoAuthFactorSchema),
  userServices.disableTwoAuthFactor,
);
router.post(
  "/delete-account-request",
  authentication(TokenTypeEnum.ACCESS, [
    RoleEnum.USER,
    RoleEnum.ADMIN,
    RoleEnum.DOCTOR,
    RoleEnum.COMPANY,
    RoleEnum.FACILITY,
  ]),
  userServices.deleteAccountReq,
);
router.delete(
  "/delete-account",
  authentication(TokenTypeEnum.ACCESS, [
    RoleEnum.USER,
    RoleEnum.ADMIN,
    RoleEnum.DOCTOR,
    RoleEnum.COMPANY,
    RoleEnum.FACILITY,
  ]),
  validation(deleteAccountSchema),
  userServices.deleteAccount,
);
router.post(
  "/invite-user",
  authentication(TokenTypeEnum.ACCESS, [
    RoleEnum.USER,
    RoleEnum.ADMIN,
    RoleEnum.DOCTOR,
    RoleEnum.COMPANY,
    RoleEnum.FACILITY,
  ]),
  userServices.inviteUser,
);
router.get(
  "/search-user",
  authentication(TokenTypeEnum.ACCESS, [
    RoleEnum.USER,
    RoleEnum.ADMIN,
    RoleEnum.DOCTOR,
    RoleEnum.COMPANY,
    RoleEnum.FACILITY,
  ]),
  userServices.searchUser,
);
router.patch(
  "/edit-slug",
  authentication(TokenTypeEnum.ACCESS, [
    RoleEnum.USER,
    RoleEnum.ADMIN,
    RoleEnum.DOCTOR,
    RoleEnum.COMPANY,
    RoleEnum.FACILITY,
  ]),
  userServices.editSlug,
);
router.post(
  "/profile-image",
  authentication(TokenTypeEnum.ACCESS, [
    RoleEnum.USER,
    RoleEnum.DOCTOR,
    RoleEnum.ADMIN,
    RoleEnum.COMPANY,
    RoleEnum.FACILITY,
  ]),
  cloudFileValidtion({
    storageApproach: storageTypeEnum.MEMORY,
    maxSize: 3,
    validation: [...fileValidation.image],
  }).single("profileImage"),
  userServices.profileImage,
);
router.post(
  "/cover-images",
  authentication(TokenTypeEnum.ACCESS, [
    RoleEnum.USER,
    RoleEnum.DOCTOR,
    RoleEnum.ADMIN,
    RoleEnum.COMPANY,
    RoleEnum.FACILITY,
  ]),
  cloudFileValidtion({
    storageApproach: storageTypeEnum.MEMORY,
    maxSize: 15,
    validation: [...fileValidation.image],
  }).array("coverImages", 5),
  userServices.coverImages,
);
router.post(
  "/upload-large-file",
  authentication(TokenTypeEnum.ACCESS, [
    RoleEnum.USER,
    RoleEnum.ADMIN,
    RoleEnum.DOCTOR,
    RoleEnum.COMPANY,
    RoleEnum.FACILITY,
  ]),
  cloudFileValidtion({
    storageApproach: storageTypeEnum.MEMORY,
    maxSize: 20,
    validation: [
      ...fileValidation.image,
      ...fileValidation.documents,
      ...fileValidation.video,
      ...fileValidation.audio,
    ],
  }).array("largeFiles", 10),
  userServices.uploadLargeFile,
);
router.delete(
  "/delete-file",
  authentication(TokenTypeEnum.ACCESS, [
    RoleEnum.USER,
    RoleEnum.ADMIN,
    RoleEnum.DOCTOR,
    RoleEnum.COMPANY,
    RoleEnum.FACILITY,
  ]),
  userServices.deleteFile,
);
router.delete(
  "/delete-files",
  authentication(TokenTypeEnum.ACCESS, [
    RoleEnum.USER,
    RoleEnum.ADMIN,
    RoleEnum.DOCTOR,
    RoleEnum.COMPANY,
    RoleEnum.FACILITY,
  ]),
  userServices.deleteFiles,
);
router.post(
  "/contact-us",
  authentication(TokenTypeEnum.ACCESS, [
    RoleEnum.USER,
    RoleEnum.DOCTOR,
    RoleEnum.ADMIN,
    RoleEnum.COMPANY,
    RoleEnum.FACILITY,
  ]),
  validation(contactUsSchema),
  userServices.contactUs,
);

export default router;
