import crypto from "node:crypto";

export const encryption = (plaintext: string): string => {
  const ENCRYPTION_SECRET_KEY = Buffer.from(
    String(process.env.ENCRYPTION_SECRET_KEY) as string,
  );
  const IV_LENGTH = Number(process.env.IV_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(
    process.env.CRYPTO_ALGORITHM as string,
    ENCRYPTION_SECRET_KEY,
    iv,
  );

  let encrypted = cipher.update(plaintext, "utf-8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
};

export const decryption = (cipherText: string): string => {
  const ENCRYPTION_SECRET_KEY = Buffer.from(
    String(process.env.ENCRYPTION_SECRET_KEY) as string,
  );
  const [ivHex, encrypted] = cipherText.split(":");
  const iv = Buffer.from(ivHex as string, "hex");

  const decipher = crypto.createDecipheriv(
    process.env.CRYPTO_ALGORITHM as string,
    ENCRYPTION_SECRET_KEY,
    iv,
  );

  let decrypterd = decipher.update(encrypted as string, "hex", "utf8");
  decrypterd += decipher.final("utf8");
  return decrypterd;
};
