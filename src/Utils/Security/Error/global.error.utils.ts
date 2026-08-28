import { NextFunction, Request, Response } from "express";

export class ApplicationException extends Error {
  constructor(
    message: string,
    private statusCode: number = 400,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.message = this.constructor.name;
    this.statusCode = statusCode;
  }
}

export class BadRequestException extends ApplicationException {
  constructor(message: string, options?: ErrorOptions) {
    super(message, 400, options);
  }
}

export class UnauthorizedException extends ApplicationException {
  constructor(message: string, options?: ErrorOptions) {
    super(message, 401, options);
  }
}

export class ForbiddenException extends ApplicationException {
  constructor(message: string, options?: ErrorOptions) {
    super(message, 403, options);
  }
}

export class NotFoundException extends ApplicationException {
  constructor(message: string, options?: ErrorOptions) {
    super(message, 404, options);
  }
}

export class ConflictException extends ApplicationException {
  constructor(message: string, options?: ErrorOptions) {
    super(message, 409, options);
  }
}

export class InternalServerErrorException extends ApplicationException {
  constructor(message: string, options?: ErrorOptions) {
    super(message, 500, options);
  }
}

interface IError extends Error {
  statusCode: Number;
}

export const globalError = (
  error: IError,
  req: Request,
  res: Response,
  next: NextFunction,
): Response => {
  const statusCode = error.statusCode ?? 500;
  return res.status(statusCode as number).json({
    message: "Something Went Wrong",
    cause: error.cause,
    stack: process.env.MODE === "DEV" ? error.stack : undefined,
  });
};
