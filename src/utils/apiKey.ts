import crypto from "node:crypto";

export const generateApiKey = (): string => {
  const prefix = "acxp_";
  const key = crypto.randomBytes(32).toString("hex");

  return `${prefix}${key}`;
};

export const hashApiKey = (apiKey: string): string => {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
};

// export const verifyApiKey
