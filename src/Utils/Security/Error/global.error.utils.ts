import { NextFunction, Request, Response } from "express";

interface IError extends Error {
  statusCode: Number;
}

export class ApplicationException extends Error {
  constructor(
    message: string,
    public statusCode: number,
    options?: ErrorOptions,
  ) {
    super(message, options);
    ((this.name = this.constructor.name), (this.statusCode = statusCode));
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

export const globalError = (
  error: IError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = error.statusCode ?? 500;
  return res.status(statusCode as number).json({
    cause: error.cause,
    stack: process.env.MODE === "DEV" ? error.stack : undefined,
    message: "Something Went Wrong",
  });
};
