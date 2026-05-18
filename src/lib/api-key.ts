import crypto from "crypto";

const KEY_PREFIX = "axp_live";
const KEY_BYTES = 32;
const HASH_ALGO = "sha256";
const HASH_ENCODING: BufferEncoding = "hex";

export const generateApiKey = (): string => {
  const random = crypto.randomBytes(KEY_BYTES).toString("hex");
  return `${KEY_PREFIX}_${random}`;
};

export const hashApiKey = (key: string): string => {
  return crypto.createHash(HASH_ALGO).update(key).digest(HASH_ENCODING);
};

export const verifyApiKey = (key: string, hash: string): boolean => {
  const computed = hashApiKey(key);
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
};

export const maskApiKey = (key: string): string => {
  if (key.length <= 12) return `${key.slice(0, 8)}****`;
  return `${key.slice(0, 8)}****${key.slice(-4)}`;
};

export const validateApiKeyFormat = (key: string): boolean => {
  const pattern = new RegExp(`^${KEY_PREFIX}_[a-f0-9]{${KEY_BYTES * 2}}$`);
  return pattern.test(key);
};

export const abbreviateApiKey = (key: string): string => {
  if (key.length <= 12) return key;
  return `${key.slice(0, 8)}...${key.slice(-4)}`;
};
