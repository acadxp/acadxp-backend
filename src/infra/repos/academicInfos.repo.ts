import prisma from "../../lib/db";
import type { Prisma } from "../../generated/prisma/client";
import { profileRepo } from "./profile.repo";
import { HttpError } from "../../error/httpError";

const acadInfoIncludes = {
  courses: {
    include: { course: true },
    orderBy: { enrollmentDate: "desc" } as const,
  },
  studentSkills: {
    include: { skill: true },
    orderBy: { proficiencyLevel: "desc" } as const,
  },
  badges: {
    include: { badge: true },
    orderBy: { unlockedAt: "desc" } as const,
  },
  studentChallenges: {
    include: { challenge: true },
  },
  notifications: {
    orderBy: { sentAt: "desc" } as const,
  },
  goals: {
    orderBy: { createdAt: "desc" } as const,
  },
  notificationPreferences: true,
} satisfies Prisma.AcademicInfoInclude;

const createAcademicInfo = async (data: Prisma.AcademicInfoUncheckedCreateInput) => {
  return await prisma.academicInfo.create({
    data,
  });
};

const getAcademicInfoByProfileId = async (profileId: string) => {
  return await prisma.academicInfo.findUnique({
    where: { profileId },
    include: acadInfoIncludes,
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
    include: acadInfoIncludes,
  });

  return acadInfo;
};

const updateAcademicInfo = async (
  profileId: string,
  data: Prisma.AcademicInfoUpdateInput,
) => {
  return await prisma.academicInfo.update({
    where: { profileId },
    data,
    include: acadInfoIncludes,
  });
};

export const academicInfosRepos = {
  createAcademicInfo,
  getAcademicInfoByProfileId,
  getAcademicInfoByUserId,
  updateAcademicInfo,
};
