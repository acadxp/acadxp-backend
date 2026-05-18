import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import asyncHandler from "../../utils/asyncHandler";
import {
  getApiKeys,
  createApiKey,
  deleteApiKey,
} from "../../controllers/v1/apiKey.controller";

const ApiKeyRoutes = express.Router();

ApiKeyRoutes.get(
  "/",
  asyncHandler(authMiddleware),
  asyncHandler(getApiKeys),
);
ApiKeyRoutes.post(
  "/",
  asyncHandler(authMiddleware),
  asyncHandler(createApiKey),
);
ApiKeyRoutes.delete(
  "/:id",
  asyncHandler(authMiddleware),
  asyncHandler(deleteApiKey),
);

export default ApiKeyRoutes;
