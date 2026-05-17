import prisma from "../../lib/db";
import type { Prisma } from "../../generated/prisma/client";
import { profileRepo } from "./profile.repo";
import { HttpError } from "../../error/httpError";

const createAcademicInfo = async (data: Prisma.AcademicInfoUncheckedCreateInput) => {
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
    throw new HttpError(404, "Profile not found. Please create a profile first.");
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
