import { profileRepo } from "../infra/repos/profile.repo";
import type { Profile } from "@prisma/client";
import type { IProfile } from "../types/profile.types";

// get user profile by userId
const getUserProfile = async (userId: string): Profile => {
  const userProfile = await profileRepo.findProfileByUserId(userId);
  return userProfile;
};

// check if username is already used
const isUsernameAlreadyUsed = async (username: string): Promise<boolean> => {
  const usernameExists = await profileRepo.findByUsername(username);
  return !!usernameExists;
};

// Create profile
const createUserProfile = async (profileData: IProfile) => {
  return await profileRepo.createProfile(profileData);
};

export const profileService = {
  getUserProfile,
  isUsernameAlreadyUsed,
  createUserProfile,
};
