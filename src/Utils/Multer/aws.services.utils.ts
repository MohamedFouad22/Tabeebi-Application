import {
  DeleteObjectCommand,
  ObjectCannedACL,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { storageTypeEnum } from "../Enum/enum.utils";
import { v4 as uuid } from "uuid";
import { s3Config } from "./s3.config";
import { BadRequestException } from "../Security/Error/global.error.utils";
import { Upload } from "@aws-sdk/lib-storage";

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

export const uploadLargeFiles = async ({
  stogageApproach = storageTypeEnum.MEMORY,
  Bucket = process.env.AWS_BUCKET_NAME as string,
  ACL = "private",
  path = "general",
  files,
}: {
  stogageApproach?: storageTypeEnum;
  Bucket?: string;
  ACL?: ObjectCannedACL;
  path?: string;
  files: Express.Multer.File[];
}) => {
  let urls = await Promise.all(
    files.map(async (file) => {
      const command = new Upload({
        client: s3Config(),
        params: {
          Bucket: process.env.AWS_BUCKET_NAME as string,
          ACL,
          Body:
            stogageApproach === storageTypeEnum.MEMORY
              ? file.buffer
              : file.path,
          Key: `${process.env.APPLICATION_NAME}/${path}/[${uuid()}-${file.originalname}]`,
          ContentType: file.mimetype,
        },
        partSize: 5 * 1024 * 1024,
      });
      command.on("httpUploadProgress", (progress) => {
        console.log(progress.Key);
      });
      const result = await command.done();
      return result.Key;
    }),
  );
  return urls;
};

export const deleteFile = async ({
  Bucket = process.env.AWS_BUCKET_NAME as string,
  Key,
}: {
  Bucket?: string;
  Key: string;
}) => {
  const command = new DeleteObjectCommand({
    Bucket,
    Key,
  });

  return await s3Config().send(command);
};
