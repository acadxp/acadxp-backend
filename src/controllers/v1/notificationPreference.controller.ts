import type { Request, Response } from "express";
import { notificationPreferenceService } from "../../services/notificationPreference.services";
import {
  sendSuccessResponse,
} from "../../utils/http-response";

export const getNotificationPreferences = async (req: Request, res: Response) => {
  const user = req.user;
  const prefs = await notificationPreferenceService.getNotificationPreferences(user!.id);
  return sendSuccessResponse(res, 200, "Notification preferences retrieved", prefs);
};

export const updateNotificationPreferences = async (req: Request, res: Response) => {
  const user = req.user;
  const { preferences } = req.body;
  const updated = await notificationPreferenceService.updateNotificationPreferences(
    user!.id,
    preferences,
  );
  return sendSuccessResponse(res, 200, "Notification preferences updated", updated);
};
