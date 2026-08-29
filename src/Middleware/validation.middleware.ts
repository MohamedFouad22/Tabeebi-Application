import { NextFunction, Request, Response } from "express";
import * as z from "zod";
import { BadRequestException } from "../Utils/Security/Error/global.error.utils";

type keyReqType = keyof Request;
type schemaType = Partial<Record<keyReqType, z.ZodType>>;

export const validation = (schema: schemaType) => {
  return (req: Request, res: Response, next: NextFunction): NextFunction => {
    const validationError: Array<{
      key: keyReqType;
      issues: Array<{ message: string; path: (string | number | symbol)[] }>;
    }> = [];

    for (const key of Object.keys(schema) as keyReqType[]) {
      if (!schema[key]) continue;
      const validationResult = schema[key].safeParse(req[key]);
      if (!validationResult.success) {
        const error = validationResult.error as z.ZodError;
        validationError.push({
          key,
          issues: error.issues.map((issue) => {
            return { message: issue.message, path: issue.path };
          }),
        });
      }
    }

    if (validationError.length > 0) {
      throw new BadRequestException("Validation Error", {
        cause: validationError,
      });
    }
    return next() as unknown as NextFunction;
  };
};
