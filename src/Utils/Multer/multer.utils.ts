import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import path from "node:path";
import { v4 as uuid } from "uuid";
import { storageTypeEnum } from "../Enum/enum.utils";
import { BadRequestException } from "../Security/Error/global.error.utils";

export const fileValidation = {
  image: ["image/png", "image/jpeg", "image/webp"],
  video: ["video/jpm", "video/mp4", "video/webm"],
  documents: [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.template",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/pdf",
  ],
};

export const uploadFile = async ({
  fileValidation = [],
  maxSize = 2,
  storageApproach,
}: {
  fileValidation: string[];
  maxSize: number;
  storageApproach: storageTypeEnum;
}) => {
  const storage =
    storageApproach === storageTypeEnum.MEMORY
      ? multer.memoryStorage()
      : multer.diskStorage({
          destination: async (req: Request, file: Express.Multer.File, cb) => {
            return cb(null, `${path.resolve("/uploads")}`);
          },
          filename: (req: Request, file: Express.Multer.File, cb) => {
            return cb(null, `${file.fieldname} - ${uuid()}`);
          },
        });

  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => {
    if (!fileValidation.length || !fileValidation.includes(file.mimetype)) {
      throw new BadRequestException("File Filter Validation Error");
    }
    return cb(null, true);
  };

  return multer({
    fileFilter,
    limits: { fileSize: maxSize * 1024 * 1024 },
    storage,
  });
};
