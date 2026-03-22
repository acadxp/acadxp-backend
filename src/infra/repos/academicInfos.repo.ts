import prisma from "../../lib/db";
import type { AcademicInfo } from "@prisma/client";
import { profileRepo } from "./profile.repo";

const createAcademicInfo = async (data: Partial<AcademicInfo>) => {
  return await prisma.academicInfo.create({
    data,
  });
};

const getAcademicInfoByProfileId = async (profileId: string) => {
  return await prisma.academicInfo.findUnique({
    where: { profileId },
  });
};

const getAcademicInfoByUserId = async (userId: string) => {
  // first get the profile for the user
  const profile = await profileRepo.findProfileByUserId(userId);

  if (!profile) {
    throw new Error("Profile not found for the user");
  }

  const acadInfo = await prisma.academicInfo.findFirst({
    where: {
      profileId: profile.id,
    },
  });

  return acadInfo;
};

export const academicInfosRepos = {
  createAcademicInfo,
  getAcademicInfoByProfileId,
  getAcademicInfoByUserId,
};
