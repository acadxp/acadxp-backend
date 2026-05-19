import { apiKeyRepo } from "../infra/repos/apiKey.repo";
import {
  generateApiKey,
  hashApiKey,
  maskApiKey,
} from "../lib/api-key";

const getUserApiKeys = async (userId: string) => {
  const keys = await apiKeyRepo.findByUserId(userId);
  return keys.map((k) => ({
    ...k,
    key: maskApiKey(k.key),
  }));
};

const generateApiKeyForUser = async (userId: string, name?: string) => {
  const rawKey = generateApiKey();
  const hashed = hashApiKey(rawKey);
  const created = await apiKeyRepo.create({
    key: hashed,
    userId,
    name: name ?? null,
  });
  return {
    ...created,
    key: maskApiKey(created.key),
    rawKey,
  };
};

const deleteApiKey = async (id: string, userId: string) => {
  return await apiKeyRepo.softDelete(id, userId);
};

export const apiKeyService = {
  getUserApiKeys,
  generateApiKeyForUser,
  deleteApiKey,
};
