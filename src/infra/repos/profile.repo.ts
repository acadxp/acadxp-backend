import prisma from "../../lib/db";
import type { Profile } from "../../generated/prisma/client";

// find profile by userId
const findProfileByUserId = async (userId: string): Promise<Profile | null> => {
  return await prisma.profile.findUnique({
    where: {
      userId: userId,
    },
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
  profileData: Partial<Profile>
): Promise<Profile> => {
  return await prisma.profile.create({
    data: profileData,
  });
};

export const profileRepo = {
  findProfileByUserId,
  findByUsername,
  createProfile,
};
