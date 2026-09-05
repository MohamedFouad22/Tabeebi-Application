import { Request, Response } from "express";
import { IUser, userModel } from "../../DB/Models/user.model";
import {
  confirmEmailDTO,
  forgetPasswordDTO,
  loginDTO,
  loginWithGoogleDTO,
  logoutDTO,
  resendOTPDTO,
  resetPasswordDTO,
  signupDTO,
  updatedPasswordDTO,
  verifyTwoAuthFactorDTO,
} from "./auth.dto";
import { UserRepository } from "../../DB/Repositories/user.repository";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from "../../Utils/Security/Error/global.error.utils";
import { generateOtp } from "../../Utils/Security/OTP/generateOtp.utils";
import { compareData, hashData } from "../../Utils/Security/Hash/hash.utils";
import { eventEmitter } from "../../Utils/Events/event.utils";
import {
  createLoginCredentials,
  generateToken,
  revokedToken,
  verifyToken,
} from "../../Utils/Tokens/token.utils";
import { encryption } from "../../Utils/Security/Encryption/encryption.utils";
import {
  LogoutEnum,
  ProviderEnum,
  TwoAuthFactorEnum,
} from "../../Utils/Enum/enum.utils";
import { OAuth2Client } from "google-auth-library";
import { tokenModel } from "../../DB/Models/token.model";
import { TokenRepository } from "../../DB/Repositories/token.repository";
import { UpdateQuery } from "mongoose";
import { JwtPayload } from "jsonwebtoken";
import { v4 as uuid } from "uuid";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || "");

class AuthenticationServices {
  private _userModel = new UserRepository(userModel);
  private _tokenModel = new TokenRepository(tokenModel);
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
          phone: encryption(signupSchema.phone),
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
        $or: [
          { OTPVerificationCode: { $exists: true } },
          { TwoAuthFactorVerificationCode: { $exists: true } },
        ],
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
        ...(checkUser.OTPVerificationCode && {
          OTPVerificationCode: await hashData(String(otp)),
        }),
        ...(checkUser.TwoAuthFactorVerificationCode && {
          TwoAuthFactorVerificationCode: await hashData(String(otp)),
        }),
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
      filter: {
        email: loginSchema.email,
      },
    });
    if (!user) throw new NotFoundException("Invalid Data");

    if (!(await compareData(loginSchema.password, user.password))) {
      throw new BadRequestException("Invalid Data");
    }

    if (user.freezedAt && user.freezedBy) {
      if (user.freezedBy.toString() !== user._id.toString()) {
        throw new UnauthorizedException("Your Account Has Been Frozen");
      } else {
        await this._userModel.updateOne({
          filter: { email: user.email },
          update: {
            $unset: { freezedAt: true, freezedBy: true },
            restoredAt: new Date(Date.now()),
            restoredBy: user._id,
            $inc: { __v: 1 },
          },
        });
      }
    }

    if (!user.confirmedAt) {
      throw new BadRequestException("Please confirm your email first");
    }

    if (user.twoFactorAuthStatus === TwoAuthFactorEnum.ACTIVE) {
      const otp = await generateOtp();

      await this._userModel.updateOne({
        filter: { email: user.email },
        update: {
          TwoAuthFactorVerificationCode: await hashData(otp.toString()),
          OTPExpiredAt: new Date(Date.now() + 5 * 60 * 1000),
          $inc: { __v: 1 },
        },
      });

      eventEmitter.emit("twoAuthFactorAuthConfirm", {
        to: user.email,
        code: otp,
        firstName: user.userName,
      });
      return res.status(200).json({
        message: "2FA OTP sent to your email. Please verify to complete login.",
        requires2FA: true,
      });
    }

    const credentials = await createLoginCredentials(user);
    return res.status(200).json({
      message: "Login Successfully",
      credentials,
    });
  };

  verifyTwoAuthFactor = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { email, otp }: verifyTwoAuthFactorDTO = req.body;

    const user = await this._userModel.findOne({
      filter: {
        email,
        OTPExpiredAt: { $exists: true },
        TwoAuthFactorVerificationCode: { $exists: true },
      },
    });
    if (!user) throw new BadRequestException("Invalid Or Missing Data");

    if (!user?.OTPExpiredAt)
      throw new BadRequestException("Data Missing OTP Expiration Time");

    if (new Date(Date.now()) > user?.OTPExpiredAt) {
      throw new BadRequestException("OTP Expired");
    }

    if (!(await compareData(otp, user.TwoAuthFactorVerificationCode))) {
      throw new BadRequestException("Invalid OTP");
    }

    await this._userModel.updateOne({
      filter: { _id: user._id },
      update: {
        $unset: {
          TwoAuthFactorVerificationCode: true,
          OTPExpiredAt: true,
        },
        $inc: { __v: 1 },
      },
    });

    const credentials = await createLoginCredentials(user);

    return res
      .status(200)
      .json({ message: "Verify Accout Successfully", credentials });
  };

  forgetPassword = async (req: Request, res: Response): Promise<Response> => {
    const forgetPasswordSchema: forgetPasswordDTO = req.body;

    const user = await this._userModel.findOne({
      filter: {
        email: forgetPasswordSchema.email,
        confirmedAt: { $exists: true },
      },
    });
    if (!user)
      throw new BadRequestException("Invalid Data Or Confirm Your Email First");

    const otp = await generateOtp();

    await this._userModel.updateOne({
      filter: { email: user.email },
      update: {
        OTPVerificationCode: await hashData(otp.toString()),
        OTPExpiredAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    eventEmitter.emit("resetPassword", {
      to: user.email,
      code: otp,
      firstName: user.userName,
    });
    return res
      .status(200)
      .json({ message: "The Password Reset Email Has Been Sent Successfully" });
  };

  resetPassword = async (req: Request, res: Response): Promise<Response> => {
    const resetPasswordSchema: resetPasswordDTO = req.body;

    const user = await this._userModel.findOne({
      filter: {
        email: resetPasswordSchema.email,
        OTPVerificationCode: { $exists: true },
        OTPExpiredAt: { $exists: true },
      },
    });
    if (!user) throw new NotFoundException("Invalid Data");

    if (new Date(Date.now()) > user.OTPExpiredAt) {
      throw new BadRequestException("OTP Expired , Please Click Resend OTP");
    }

    if (
      !(await compareData(resetPasswordSchema.otp, user.OTPVerificationCode))
    ) {
      throw new BadRequestException("Invalid OTP");
    }

    await this._userModel.updateOne({
      filter: { email: resetPasswordSchema.email },
      update: {
        password: await hashData(resetPasswordSchema.password),
        $unset: {
          OTPVerificationCode: true,
          OTPExpiredAt: true,
        },
        $inc: { __v: 1 },
      },
    });

    eventEmitter.emit("resetPasswordAlert", {
      to: user.email,
      firstName: user.userName,
    });

    return res.status(200).json({ message: "Password Updated Successfully" });
  };

  updatePassword = async (req: Request, res: Response): Promise<Response> => {
    const { oldPassword, password, confirmPassword }: updatedPasswordDTO =
      req.body;

    if (!(await compareData(oldPassword, req.user.password))) {
      throw new BadRequestException("Invalid Data");
    }

    if (password === oldPassword)
      throw new BadRequestException("This Is Indeed The Current Password");

    const user = await this._userModel.findOneAndUpdate({
      filter: { email: req.user.email },
      update: {
        password: await hashData(password),
        $inc: { __v: 1 },
      },
    });
    if (!user) throw new BadRequestException("Failed To Update User");

    eventEmitter.emit("updatePasswordAlert", {
      to: user.email,
      firstName: user.userName,
    });

    return res.status(200).json({ message: "Password Updated Successfully" });
  };

  async verifyIdToken(idToken: string) {
    try {
      const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID || "",
      });
      const payload = ticket.getPayload();
      return payload;
    } catch (error) {
      throw new BadRequestException("Failed To Fetch");
    }
  }

  loginWithGoogle = async (req: Request, res: Response): Promise<Response> => {
    const { idToken }: loginWithGoogleDTO = req.body;

    const userPayload = await this.verifyIdToken(idToken);
    const email = userPayload?.email;
    if (!userPayload || !userPayload.email) {
      throw new BadRequestException("Invalid Google Account Payload");
    }
    let user = await this._userModel.findOne({ filter: { email } });

    if (!user) {
      const [newUser] = await this._userModel.create({
        data: [
          {
            email,
            firstName: userPayload?.given_name,
            lastName: userPayload?.family_name,
            provider: ProviderEnum.GOOGLE,
            profileImage: userPayload?.picture,
            googleId: userPayload?.sub,
            confirmedAt: new Date(Date.now()),
          },
        ],
      });

      user = Array.isArray(newUser) ? newUser[0] : newUser;
    }
    if (!user) throw new BadRequestException("Failed To Create User");

    const crendiantles = await createLoginCredentials(user);

    eventEmitter.emit("welcome", { to: user.email, firstName: user.userName });

    return res
      .status(200)
      .json({ message: "Login Successfully", crendiantles });
  };

  logout = async (req: Request, res: Response): Promise<Response> => {
    const { flag }: logoutDTO = req.body;

    let status = 200;
    const update: UpdateQuery<IUser> = {};

    switch (flag) {
      case LogoutEnum.ONLY:
        await revokedToken(req.decoded as JwtPayload);
        break;

      case LogoutEnum.ALL:
        update.changeCredientialsTime = new Date();

        await this._userModel.updateOne({
          filter: {
            email: req.user.email,
          },
          update,
        });

        break;

      default:
        break;
    }

    return res.status(status).json({ message: "Logout Successfully" });
  };

  refreshToken = async (req: Request, res: Response): Promise<Response> => {
    const { authorization } = req.headers;

    if (!authorization) {
      throw new BadRequestException("Missing Headers");
    }

    const parts = authorization.split(" ");
    if (parts.length !== 2) {
      throw new BadRequestException(
        "Invalid Authorization Header Format. Expected format: 'ROLE TOKEN'",
      );
    }

    const [role, refreshToken] = parts;

    const secretKey = process.env.REFRESH_TOKEN_SECRET_KEY;
    if (!secretKey) {
      throw new BadRequestException("REFRESH_TOKEN_SECRET_KEY is missing");
    }

    const decoded = (await verifyToken({
      token: refreshToken as string,
      secretOrPublicKey: secretKey,
    })) as JwtPayload;

    if (!decoded?.email) {
      throw new BadRequestException("Invalid Token Payload");
    }

    const user = await this._userModel.findOne({
      filter: { email: decoded.email },
    });

    if (!user) {
      throw new NotFoundException("User Not Found");
    }

    if (user.role && user.role !== role) {
      throw new UnauthorizedException("Unauthorized Role Access");
    }

    const credentials = (await createLoginCredentials(user)).accessToken;

    return res
      .status(200)
      .json({ message: "Token Refreshed Successfully", credentials });
  };
}
export default new AuthenticationServices();
