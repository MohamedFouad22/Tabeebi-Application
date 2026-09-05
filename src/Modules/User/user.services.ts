import { Request, Response } from "express";
import { UserRepository } from "../../DB/Repositories/user.repository";
import { userModel } from "../../DB/Models/user.model";
import {
  deleteAccountDTO,
  editProfileDTO,
  enableTwoAuthFactorDTO,
  freezeAccountDTO,
  restoreAccountDTO,
} from "./user.dto";
import { RoleEnum, TwoAuthFactorEnum } from "../../Utils/Enum/enum.utils";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../../Utils/Security/Error/global.error.utils";
import { encryption } from "../../Utils/Security/Encryption/encryption.utils";
import { eventEmitter } from "../../Utils/Events/event.utils";
import { generateOtp } from "../../Utils/Security/OTP/generateOtp.utils";
import { compareData, hashData } from "../../Utils/Security/Hash/hash.utils";

export class userServices {
  private _userModel = new UserRepository(userModel);
  constructor() {}

  getProfile = async (req: Request, res: Response): Promise<Response> => {
    const user = await this._userModel.findOne({
      filter: { email: req.user.email },
      projection: "-password",
    });

    return res.status(200).json({ message: "Get Profile Successfully", user });
  };

  freezeAccount = async (req: Request, res: Response): Promise<Response> => {
    const { userId }: freezeAccountDTO = req.params;

    if (userId && req.user?.role !== RoleEnum.ADMIN) {
      throw new UnauthorizedException("Missing User Role");
    }

    const user = await this._userModel.findOneAndUpdate({
      filter: {
        _id: userId ? userId : req.user.id,
        freezedAt: { $exists: false },
        freezedBy: { $exists: false },
        confirmedAt: { $exists: true },
      },
      update: {
        freezedBy: req.user.id,
        freezedAt: new Date(Date.now()),
        $inc: { __v: 1 },
      },
    });
    if (!user)
      throw new NotFoundException("Invalid Data Or Account Already Freezed");

    if (user.restoredAt && user.restoredBy) {
      await this._userModel.updateOne({
        filter: { email: user.email },
        update: { $unset: { restoredAt: true, restoredBy: true } },
      });
    }

    return res.status(200).json({ message: "Account Freezed Successfully" });
  };

  restoreAccount = async (req: Request, res: Response): Promise<Response> => {
    const { userId }: restoreAccountDTO = req.params;

    if (userId && req.user.role !== RoleEnum.ADMIN) {
      throw new UnauthorizedException("Missing User Role");
    }

    const user = await this._userModel.findOneAndUpdate({
      filter: {
        _id: userId ? userId : req.user.id,
        freezedAt: { $exists: true },
        freezedBy: { $exists: true },
      },
      update: {
        $unset: { freezedAt: true, freezedBy: true },
        restoredAt: new Date(Date.now()),
        restoredBy: req.user.id,
        $inc: { __v: 1 },
      },
    });
    if (!user)
      throw new UnauthorizedException("Invalid Data Or Account Frozen Now");

    return res.status(200).json({ message: "Account Restored Successfully" });
  };

  editProfile = async (req: Request, res: Response): Promise<Response> => {
    const { firstName, lastName, phone, gender, age }: editProfileDTO =
      req.body;

    const user = await this._userModel.findOneAndUpdate({
      filter: { email: req.user.email },
      update: {
        firstName,
        lastName,
        gender,
        age,
        ...(phone && { phone: encryption(String(phone)) }),
        updatedAt: new Date(Date.now()),
        $inc: { __v: 1 },
      },
    });
    if (!user) throw new BadRequestException("Failed To Edit Your Profile");

    return res.status(200).json({ message: "Profile Updated Successfully" });
  };

  twoAuthFactorRequest = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const otp = await generateOtp();

    const user = await this._userModel.findOneAndUpdate({
      filter: {
        email: req.user.email,
        twoFactorAuthStatus: TwoAuthFactorEnum.INACTIVE,
      },
      update: {
        TwoAuthFactorVerificationCode: await hashData(otp.toString()),
        OTPExpiredAt: new Date(Date.now() + 5 * 60 * 1000),
      },
      options: { new: true },
    });
    if (!user) {
      throw new BadRequestException("2FA is already enabled or user not found");
    }

    eventEmitter.emit("twoAuthFactorAuthRequest", {
      to: user.email,
      code: otp,
      firstName: user.userName,
    });

    return res
      .status(200)
      .json({ message: "An Identity Confirmation Request Has Been Sent" });
  };

  enableTwoAuthFactor = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { otp }: enableTwoAuthFactorDTO = req.body;

    const user = await this._userModel.findOne({
      filter: {
        email: req.user.email,
        TwoAuthFactorVerificationCode: { $exists: true },
        OTPExpiredAt: { $exists: true },
        twoFactorAuthStatus: TwoAuthFactorEnum.INACTIVE,
        confirmedAt: { $exists: true },
      },
    });
    if (!user)
      throw new BadRequestException(
        "This Feature Is Already Enabled In Your Account, Or There's a Problem With Its Activation",
      );

    if (new Date() > user.OTPExpiredAt) {
      await this._userModel.updateOne({
        filter: { email: user.email },
        update: {
          $unset: { TwoAuthFactorVerificationCode: true, OTPExpiredAt: true },
        },
      });
      throw new BadRequestException("OTP Expired");
    }

    if (!(await compareData(otp, user.TwoAuthFactorVerificationCode))) {
      throw new BadRequestException("Invalid OTP");
    }

    await this._userModel.updateOne({
      filter: { email: user.email },
      update: {
        twoFactorAuthStatus: TwoAuthFactorEnum.ACTIVE,
        twoAuthFactorEnabledAt: new Date(Date.now()),
        $unset: { TwoAuthFactorVerificationCode: true, OTPExpiredAt: true },
        $inc: { __v: 1 },
      },
    });

    return res
      .status(200)
      .json({ message: "Two Auth Factor Enabled Successfully" });
  };

  deleteAccountReq = async (req: Request, res: Response): Promise<Response> => {
    const otp = await generateOtp();

    await this._userModel.updateOne({
      filter: { email: req.user.email },
      update: {
        OTPVerificationCode: await hashData(otp.toString()),
        OTPExpiredAt: new Date(Date.now() + 5 * 60 * 1000),
        $inc: { __v: 1 },
      },
    });

    eventEmitter.emit("deleteAccountRequest", {
      to: req.user.email,
      code: otp,
      firstName: req.user.userName,
    });

    return res
      .status(200)
      .json({ message: "The Account Deletion Request Was Successfully Sent" });
  };

  deleteAccount = async (req: Request, res: Response): Promise<Response> => {
    const { otp }: deleteAccountDTO = req.body;

    const user = await this._userModel.findOne({
      filter: {
        email: req.user.email,
        OTPExpiredAt: { $exists: true },
        OTPVerificationCode: { $exists: true },
      },
    });
    if (!user) throw new NotFoundException("User Not Found Or Missing Data");

    if (new Date(Date.now()) > user.OTPExpiredAt) {
      throw new BadRequestException("OTP Expired");
    }

    if (!(await compareData(otp, user.OTPVerificationCode))) {
      throw new BadRequestException("Invalid OTP");
    }

    await this._userModel.deleteOne({ filter: { email: req.user.email } });

    eventEmitter.emit("deleteAccount", {
      to: user.email,
      firstName: user.userName,
    });

    return res.status(200).json({ message: "Account Deleted Successfully" });
  };
}

export default new userServices();
