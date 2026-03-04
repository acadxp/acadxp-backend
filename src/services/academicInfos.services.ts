import type { AcademicInfo } from "@prisma/client";
import { academicInfosRepos } from "../infra/repos/academicInfos.repo";

const createAcademicInfo = async (data: Partial<AcademicInfo>) => {
  // Transform YYYY-MM-DD dates to ISO-8601 DateTime format
  const processedData = {
    ...data,
    ...(data.graduationDate && {
      graduationDate: new Date(`${data.graduationDate}T00:00:00Z`),
    }),
    ...(data.enrolledDate && {
      enrolledDate: new Date(`${data.enrolledDate}T00:00:00Z`),
    }),
  };

  return await academicInfosRepos.createAcademicInfo(processedData);
};

const getAcademicInfoByProfileId = async (profileId: string) => {
  return await academicInfosRepos.getAcademicInfoByProfileId(profileId);
};

const getAcademicInfoByUserId = async (userId: string) => {
  const acadInfo = await academicInfosRepos.getAcademicInfoByUserId(userId);

  if (!acadInfo) {
    throw new Error("Academic information not found for the user");
  }

  return acadInfo;
};

export const academicInfosService = {
  createAcademicInfo,
  getAcademicInfoByProfileId,
  getAcademicInfoByUserId,
};
