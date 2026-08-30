import { NextFunction, Request, Response } from "express";
import { RoleEnum, TokenTypeEnum } from "../Utils/Enum/enum.utils";
import {
  BadRequestException,
  UnauthorizedException,
} from "../Utils/Security/Error/global.error.utils";
import { decodedToken } from "../Utils/Tokens/token.utils";

export const authentication = (
  tokenType: TokenTypeEnum = TokenTypeEnum.ACCESS,
  accessRoles: RoleEnum[],
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<NextFunction> => {
    if (!req.headers.authorization) {
      throw new UnauthorizedException("Missing authorization");
    }

    const { decoded, user } = await decodedToken({
      authorization: req.headers.authorization,
      tokenType,
    });

    if (!accessRoles.includes(user.role)) {
      throw new BadRequestException("Invalid Auth Format");
    }

    req.user = user;
    req.decoded = decoded;
    return next() as unknown as NextFunction;
  };
};
