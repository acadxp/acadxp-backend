import type { Request, Response } from "express";
import { apiKeyService } from "../../services/apiKey.services";
import {
  sendSuccessResponse,
} from "../../utils/http-response";

export const getApiKeys = async (req: Request, res: Response) => {
  const user = req.user;
  const keys = await apiKeyService.getUserApiKeys(user!.id);
  return sendSuccessResponse(res, 200, "API keys retrieved", keys);
};

export const createApiKey = async (req: Request, res: Response) => {
  const user = req.user;
  const { name } = req.body;
  const result = await apiKeyService.generateApiKeyForUser(user!.id, name);
  return sendSuccessResponse(res, 201, "API key created", {
    ...result,
  });
};

export const deleteApiKey = async (req: Request, res: Response) => {
  const user = req.user;
  const { id } = req.params;
  await apiKeyService.deleteApiKey(id!, user!.id);
  return sendSuccessResponse(res, 200, "API key deleted");
};
