import prisma from "../../lib/db";
import type { Prisma, Profile } from "../../generated/prisma/client";
import type { IProfile } from "../../types/profile.types";

const profileIncludes = {
  academicInfo: {
    include: {
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
    },
  },
} satisfies Prisma.ProfileInclude;

// find profile by userId
const findProfileByUserId = async (userId: string): Promise<Profile | null> => {
  return await prisma.profile.findUnique({
    where: {
      userId: userId,
    },
    include: profileIncludes,
  });
};

// update profile
const updateProfile = async (userId: string, data: Partial<IProfile & { preferences: any }>) => {
  return await prisma.profile.update({
    where: { userId },
    data,
  });
};

//find username
const findByUsername = async (username: string): Promise<Profile | null> => {
  return await prisma.profile.findUnique({
    where: { username },
  });
};

// create new profile
const createProfile = async (
  profileData: IProfile
): Promise<Profile> => {
  return await prisma.profile.create({
    data: profileData,
  });
};

export const profileRepo = {
  findProfileByUserId,
  findByUsername,
  createProfile,
  updateProfile,
};
