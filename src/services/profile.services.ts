import { profileRepo } from "../infra/repos/profile.repo";
import prisma from "../lib/db";
import type { Profile } from "../generated/prisma/client";
import type { IProfile } from "../types/profile.types";

const getUserProfile = async (userId: string): Promise<Profile | null> => {
  const userProfile = await profileRepo.findProfileByUserId(userId);
  return userProfile;
};

const isUsernameAlreadyUsed = async (username: string): Promise<Profile | null> => {
  return await profileRepo.findByUsername(username);
};

const createUserProfile = async (profileData: IProfile) => {
  return await profileRepo.createProfile(profileData);
};

const updateUserProfile = async (
  userId: string,
  data: {
    name?: string;
    username?: string;
    bio?: string;
    location?: string;
    socials?: Record<string, string>;
    preferences?: { theme?: string; accentColor?: string };
  },
) => {
  const { name, ...profileData } = data;

  if (name) {
    await prisma.user.update({
      where: { id: userId },
      data: { name },
    });
  }

  if (Object.keys(profileData).length > 0) {
    return await profileRepo.updateProfile(userId, profileData);
  }

  return await profileRepo.findProfileByUserId(userId);
};

const updateUserName = async (userId: string, name: string) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { name },
  });
};

export const profileService = {
  getUserProfile,
  isUsernameAlreadyUsed,
  createUserProfile,
  updateUserProfile,
  updateUserName,
  resetProgress,
  deleteAccount,
};

async function resetProgress(userId: string) {
  const profile = await profileRepo.findProfileByUserId(userId);
  if (!profile?.academicInfo) return;

  const infoId = profile.academicInfo.id;

  await prisma.$transaction([
    prisma.studentBadge.deleteMany({ where: { academicInfoId: infoId } }),
    prisma.studentChallenge.deleteMany({ where: { academicInfoId: infoId } }),
    prisma.xPEvent.deleteMany({ where: { academicInfoId: infoId } }),
    prisma.goal.deleteMany({ where: { academicInfoId: infoId } }),
    prisma.notification.deleteMany({ where: { academicInfoId: infoId } }),
    prisma.studentSkill.updateMany({
      where: { academicInfoId: infoId },
      data: { xpEarned: 0, proficiencyLevel: "BEGINNER" },
    }),
    prisma.studentCourseEnrollment.updateMany({
      where: { academicInfoId: infoId },
      data: { xpEarned: 0, completedStatus: false, completedAt: null },
    }),
    prisma.academicInfo.update({
      where: { id: infoId },
      data: { xp: 0, level: 1 },
    }),
  ]);
}

async function deleteAccount(userId: string) {
  const profile = await profileRepo.findProfileByUserId(userId);
  if (profile?.academicInfo) {
    await prisma.studentCourseEnrollment.deleteMany({
      where: { academicInfoId: profile.academicInfo.id },
    });
  }
  await prisma.user.delete({ where: { id: userId } });
}
