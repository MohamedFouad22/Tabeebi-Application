import { Request, Response } from "express";
import { UserRepository } from "../../DB/Repositories/user.repository";
import { userModel } from "../../DB/Models/user.model";
import {
  editProfileDTO,
  freezeAccountDTO,
  restoreAccountDTO,
} from "./user.dto";
import { RoleEnum } from "../../Utils/Enum/enum.utils";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../../Utils/Security/Error/global.error.utils";
import {
  decryption,
  encryption,
} from "../../Utils/Security/Encryption/encryption.utils";

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
}

export default new userServices();
