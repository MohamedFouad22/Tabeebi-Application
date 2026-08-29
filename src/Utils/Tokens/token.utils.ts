import {
  PrivateKey,
  PublicKey,
  Secret,
  sign,
  SignOptions,
  verify,
  VerifyOptions,
} from "jsonwebtoken";

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
