import { ObjectCannedACL, PutObjectCommand } from "@aws-sdk/client-s3";
import { storageTypeEnum } from "../Enum/enum.utils";
import { v4 as uuid } from "uuid";
import { s3Config } from "./s3.config";
import { BadRequestException } from "../Security/Error/global.error.utils";

export const uploadFile = async ({
  storageApproach = storageTypeEnum.MEMORY,
  Bucket = process.env.AWS_BUCKET_NAME as string,
  ACL = "private",
  path = "general",
  file,
}: {
  storageApproach?: storageTypeEnum;
  Bucket?: string;
  ACL?: ObjectCannedACL;
  path?: string;
  file: Express.Multer.File;
}) => {
  const command = new PutObjectCommand({
    Bucket,
    ACL,
    Key: `${process.env.APPLICATION_NAME}/${path}/[${uuid()}-${file.originalname}]`,
    Body: storageApproach === storageTypeEnum.MEMORY ? file.buffer : file.path,
    ContentType: file.mimetype,
  });

  await s3Config().send(command);
  if (!command.input.Key) {
    throw new BadRequestException("Failed To Upload File");
  }

  return command.input.Key;
};

export const uploadFiles = async ({
  storageApproach = storageTypeEnum.MEMORY,
  Bucket = process.env.AWS_BUCKET_NAME as string,
  ACL = "private",
  path = "general",
  files,
}: {
  storageApproach?: storageTypeEnum;
  Bucket?: string;
  ACL?: ObjectCannedACL;
  path?: string;
  files: Express.Multer.File[];
}) => {
  let urls: string[] = [];
  urls = await Promise.all(
    files.map((file) => {
      return uploadFile({
        storageApproach,
        Bucket,
        ACL,
        path,
        file,
      });
    }),
  );
  return urls;
};
