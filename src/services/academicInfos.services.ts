import { academicInfosRepos } from "../infra/repos/academicInfos.repo";
import { profileRepo } from "../infra/repos/profile.repo";
import { HttpError } from "../error/httpError";
import type { createAcademicInfoSchema } from "../validation/academicInfos.schema";
import type { z } from "zod";

type CreateAcademicInfoInput = z.infer<typeof createAcademicInfoSchema>;

const createAcademicInfo = async (data: CreateAcademicInfoInput) => {
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
    throw new HttpError(404, "Academic information not found. Please set up your academic info first.");
  }

  return acadInfo;
};

const updateAcademicInfo = async (
  userId: string,
  data: {
    institution?: string;
    degree?: string;
    major?: string;
    semester?: string;
    enrollmentStatus?: string;
    graduationDate?: string;
    enrolledDate?: string;
  },
) => {
  const profile = await profileRepo.findProfileByUserId(userId);
  if (!profile) {
    throw new HttpError(404, "Profile not found");
  }

  const processedData: any = { ...data };
  if (data.graduationDate) {
    processedData.graduationDate = new Date(`${data.graduationDate}T00:00:00Z`);
  }
  if (data.enrolledDate) {
    processedData.enrolledDate = new Date(`${data.enrolledDate}T00:00:00Z`);
  }

  return await academicInfosRepos.updateAcademicInfo(profile.id, processedData);
};

export const academicInfosService = {
  createAcademicInfo,
  getAcademicInfoByProfileId,
  getAcademicInfoByUserId,
  updateAcademicInfo,
};
