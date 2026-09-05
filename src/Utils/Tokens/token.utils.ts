import {
  JwtPayload,
  PrivateKey,
  PublicKey,
  Secret,
  sign,
  SignOptions,
  verify,
  VerifyOptions,
} from "jsonwebtoken";
import {
  RoleEnum,
  signatureLevelEnum,
  TokenTypeEnum,
} from "../Enum/enum.utils";
import { UserRepository } from "../../DB/Repositories/user.repository";
import { HUserDocument, userModel } from "../../DB/Models/user.model";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../Security/Error/global.error.utils";
import { v4 as uuid } from "uuid";
import { TokenRepository } from "../../DB/Repositories/token.repository";
import { tokenModel } from "../../DB/Models/token.model";

interface ITokenPayload extends JwtPayload {
  _id: string;
}

export const generateToken = async ({
  payload = "",
  secretOrPrivateKey = process.env.ACCESS_TOKEN_SECRET_KEY as string,
  options,
}: {
  payload: string | Buffer | object;
  secretOrPrivateKey: Secret | PrivateKey;
  options?: SignOptions;
}) => {
  return sign(payload, secretOrPrivateKey, options);
};

export const verifyToken = async ({
  token = "",
  secretOrPublicKey = process.env.ACCESS_TOKEN_SECRET_KEY as string,
  options,
}: {
  token: string;
  secretOrPublicKey: Secret | PublicKey;
  options?: VerifyOptions & { complete: true };
}) => {
  return verify(token, secretOrPublicKey, options);
};

export const getSignatureLevel = async (role: RoleEnum = RoleEnum.USER) => {
  let signatureLevel: signatureLevelEnum = signatureLevelEnum.USER;

  switch (role) {
    case RoleEnum.USER:
      signatureLevel = signatureLevelEnum.USER;
      break;
    case RoleEnum.ADMIN:
      signatureLevel = signatureLevelEnum.ADMIN;
      break;
    case RoleEnum.DOCTOR:
      signatureLevel = signatureLevelEnum.DOCTOR;
      break;
    default:
      break;
  }
  return signatureLevel;
};

export const getSignatures = async (
  signatureLevel: signatureLevelEnum = signatureLevelEnum.USER,
): Promise<{ accessToken: string; refreshToken: string }> => {
  let signatures: { accessToken: string; refreshToken: string } = {
    accessToken: "",
    refreshToken: "",
  };

  switch (signatureLevel) {
    case signatureLevelEnum.USER:
      signatures.accessToken = process.env
        .USER_ACCESS_TOKEN_SECRET_KEY as string;
      signatures.refreshToken = process.env.REFRESH_TOKEN_SECRET_KEY as string;
      break;
    case signatureLevelEnum.ADMIN:
      signatures.accessToken = process.env
        .ADMIN_ACCESS_TOKEN_SECRET_KEY as string;
      signatures.refreshToken = process.env.REFRESH_TOKEN_SECRET_KEY as string;
      break;
    case signatureLevelEnum.DOCTOR:
      signatures.accessToken = process.env
        .DOCTOR_ACCESS_TOKEN_SECRET_KEY as string;
      signatures.refreshToken = process.env.REFRESH_TOKEN_SECRET_KEY as string;
      break;

    default:
      break;
  }
  return signatures;
};

export const createLoginCredentials = async (
  user: HUserDocument,
): Promise<{ accessToken: string; refreshToken: string }> => {
  let signatureLevel = await getSignatureLevel(user.role);
  let signatures = await getSignatures(signatureLevel);

  const accessToken = await generateToken({
    payload: {
      _id: user._id,
      email: user.email,
      userName: user.userName,
      role: user.role,
    },
    secretOrPrivateKey: signatures.accessToken,
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
    secretOrPrivateKey: signatures.refreshToken,
    options: {
      expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
      jwtid: uuid(),
    },
  });

  return { accessToken, refreshToken };
};

export const decodedToken = async ({
  authorization,
  tokenType = TokenTypeEnum.ACCESS,
}: {
  authorization: string;
  tokenType: TokenTypeEnum;
}) => {
  const _userModel = new UserRepository(userModel);
  const _tokenModel = new TokenRepository(tokenModel);

  const [bearer, token] = authorization.split(" ");
  if (!bearer || !token) {
    throw new UnauthorizedException("Invalid Token Format");
  }

  const signatures = await getSignatures(bearer as signatureLevelEnum);

  const decoded = (await verifyToken({
    token,
    secretOrPublicKey:
      tokenType === TokenTypeEnum.REFRESH
        ? signatures.refreshToken
        : signatures.accessToken,
  })) as ITokenPayload;

  if (!decoded._id || !decoded.iat) {
    throw new UnauthorizedException("Invalid Tokens");
  }

  const user = await _userModel.findOne({
    filter: { _id: decoded._id },
  });
  if (!user) throw new NotFoundException("User Not Found");

  const checkToken = await _tokenModel.findOne({
    filter: { jwtId: decoded.jti },
  });
  if (checkToken) throw new BadRequestException("Token Already Revoked");

  if (
    !decoded.iat ||
    (user.changeCredientialsTime?.getTime() as number) > decoded.iat * 1000
  ) {
    throw new BadRequestException("Token Revoked");
  }

  return { user, decoded };
};

export const revokedToken = async (decoded: JwtPayload) => {
  const _tokenModel = new TokenRepository(tokenModel);

  const [token] =
    (await _tokenModel.create({
      data: [
        {
          jwtId: decoded.jti,
          expiredAt: new Date(Date.now() + 10 * 60 * 1000),
          userId: decoded._id,
        },
      ],
    })) || [];
  if (!token) throw new BadRequestException("Failed To Revoked Token");

  return token;
};
