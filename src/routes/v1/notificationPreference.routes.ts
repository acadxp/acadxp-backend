import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import asyncHandler from "../../utils/asyncHandler";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "../../controllers/v1/notificationPreference.controller";

const NotificationPreferenceRoutes = express.Router();

NotificationPreferenceRoutes.get(
  "/",
  asyncHandler(authMiddleware),
  asyncHandler(getNotificationPreferences),
);
NotificationPreferenceRoutes.put(
  "/",
  asyncHandler(authMiddleware),
  asyncHandler(updateNotificationPreferences),
);

export default NotificationPreferenceRoutes;
