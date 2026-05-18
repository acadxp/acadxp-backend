import { profileRepo } from "../infra/repos/profile.repo";
import prisma from "../lib/db";
import type { Profile } from "../generated/prisma/client";
import type { IProfile } from "../types/profile.types";

const getUserProfile = async (userId: string): Promise<Profile | null> => {
  const userProfile = await profileRepo.findProfileByUserId(userId);
  return userProfile;
};

const isUsernameAlreadyUsed = async (username: string): Promise<boolean> => {
  const usernameExists = await profileRepo.findByUsername(username);
  return !!usernameExists;
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

export const profileService = {
  getUserProfile,
  isUsernameAlreadyUsed,
  createUserProfile,
  updateUserProfile,
};
