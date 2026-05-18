import { notificationPreferenceRepo } from "../infra/repos/notificationPreference.repo";
import { academicInfosRepos } from "../infra/repos/academicInfos.repo";

const getNotificationPreferences = async (userId: string) => {
  const acadInfo = await academicInfosRepos.getAcademicInfoByUserId(userId);
  if (!acadInfo) return [];

  return await notificationPreferenceRepo.findByAcademicInfoId(acadInfo.id);
};

const updateNotificationPreferences = async (
  userId: string,
  preferences: { type: string; enabled: boolean }[],
) => {
  const acadInfo = await academicInfosRepos.getAcademicInfoByUserId(userId);
  if (!acadInfo) return [];

  return await notificationPreferenceRepo.upsertMany(
    acadInfo.id,
    preferences,
  );
};

export const notificationPreferenceService = {
  getNotificationPreferences,
  updateNotificationPreferences,
};
