import { Request, Response } from "express";
import { userModel } from "../../DB/Models/user.model";
import { confirmEmailDTO, loginDTO, resendOTPDTO, signupDTO } from "./auth.dto";
import { UserRepository } from "../../DB/Repositories/user.repository";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../Utils/Security/Error/global.error.utils";
import { generateOtp } from "../../Utils/Security/OTP/generateOtp.utils";
import { compareData, hashData } from "../../Utils/Security/Hash/hash.utils";
import { eventEmitter } from "../../Utils/Events/event.utils";
import { v4 as uuid } from "uuid";
import { generateToken } from "../../Utils/Tokens/token.utils";

class AuthenticationServices {
  private _userModel = new UserRepository(userModel);
  constructor() {}

  signup = async (req: Request, res: Response): Promise<Response> => {
    const signupSchema: signupDTO = req.body;
    const checkUser = await this._userModel.findOne({
      filter: { email: signupSchema.email },
    });
    if (checkUser) throw new ConflictException("User Already Exists");

    const otp = await generateOtp();

    const [user] = await this._userModel.create({
      data: [
        {
          firstName: signupSchema.firstName,
          lastName: signupSchema.lastName,
          email: signupSchema.email,
          password: await hashData(signupSchema.password),
          age: signupSchema.age,
          gender: signupSchema.gender,
          role: signupSchema.role,
          VerificationAccountExpiredAt: new Date(Date.now() + 10 * 60 * 1000),
          phone: signupSchema.phone,
          profileImage: signupSchema.profileImage,
          coverImages: signupSchema.coverImages,
          OTPVerificationCode: await hashData(String(otp)),
          OTPExpiredAt: new Date(Date.now() + 5 * 60 * 1000),
        },
      ],
    });

    if (!user) throw new BadRequestException("Failed To Create User");

    eventEmitter.emit("confirmEmail", {
      to: user.email,
      code: otp,
      firstName: user.userName,
    });

    return res.status(201).json({ message: "User Created Successfully" });
  };

  resendOTP = async (req: Request, res: Response): Promise<Response> => {
    const resendOTPSchema: resendOTPDTO = req.body;

    const checkUser = await this._userModel.findOne({
      filter: {
        email: resendOTPSchema.email,
        OTPExpiredAt: { $exists: true },
        OTPVerificationCode: { $exists: true },
      },
    });
    if (!checkUser)
      throw new BadRequestException(
        "User Not Found , There Is No Operation Currently Underway",
      );

    const otp = await generateOtp();

    await this._userModel.updateOne({
      filter: { email: resendOTPSchema.email },
      update: {
        OTPVerificationCode: await hashData(String(otp)),
        OTPExpiredAt: new Date(Date.now() + 5 * 60 * 1000),
        ...(checkUser.VerificationAccountExpiredAt && {
          VerificationAccountExpiredAt: new Date(Date.now() + 10 * 60 * 1000),
        }),
      },
    });

    eventEmitter.emit("resendOTP", {
      to: checkUser.email,
      code: otp,
      firstName: checkUser.userName,
    });

    return res.status(200).json({ message: "New OTP Send Successfully" });
  };

  confirmEmail = async (req: Request, res: Response): Promise<Response> => {
    const confirmEmailSchema: confirmEmailDTO = req.body;

    const checkUser = await this._userModel.findOne({
      filter: {
        email: confirmEmailSchema.email,
        confirmedAt: { $exists: false },
        VerificationAccountExpiredAt: { $exists: true },
      },
    });
    if (!checkUser)
      throw new NotFoundException("User Not Found Or Email Already Confirmed");

    if (
      !(await compareData(
        confirmEmailSchema.otp,
        checkUser.OTPVerificationCode,
      ))
    ) {
      throw new BadRequestException("Invalid OTP");
    }

    if (checkUser.OTPExpiredAt < new Date(Date.now())) {
      throw new BadRequestException("OTP Expired");
    }

    await this._userModel.findOneAndUpdate({
      filter: { email: confirmEmailSchema.email },
      update: {
        confirmedAt: new Date(Date.now()),
        $unset: {
          VerificationAccountExpiredAt: true,
          OTPExpiredAt: true,
          OTPVerificationCode: true,
        },
        $inc: { __v: 1 },
      },
    });

    eventEmitter.emit("welcome", {
      to: checkUser.email,
      firstName: checkUser.userName,
    });

    return res.status(200).json({ message: "Email Confirmed Successfully" });
  };

  login = async (req: Request, res: Response): Promise<Response> => {
    const loginSchema: loginDTO = req.body;

    const user = await this._userModel.findOne({
      filter: { email: loginSchema.email },
    });
    if (!user) throw new NotFoundException("Invalid Data");

    if (!user.confirmedAt) {
      throw new BadRequestException("Please confirm your email first");
    }

    if (!(await compareData(loginSchema.password, user.password))) {
      throw new BadRequestException("Invalid Data");
    }

    const accessToken = await generateToken({
      payload: {
        _id: user._id,
        email: user.email,
        userName: user.userName,
        role: user.role,
      },
      secretOrPrivateKey: process.env.ACCESS_TOKEN_SECRET_KEY as string,
      options: {
        expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN),
        jwtid: uuid(),
      },
    });

    const refreshToken = await generateToken({
      payload: {
        _id: user._id,
        email: user.email,
        userName: user.userName,
        role: user.role,
      },
      secretOrPrivateKey: process.env.REFRESH_TOKEN_SECRET_KEY as string,
      options: {
        expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
        jwtid: uuid(),
      },
    });

    return res.status(200).json({
      message: "Login Successfully",
      credentials: {
        accessToken,
        refreshToken,
      },
    });
  };
}
export default new AuthenticationServices();
