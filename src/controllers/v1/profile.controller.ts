import type { Request, Response } from "express";
import { profileService } from "../../services/profile.services";
import {
  createProfileSchema,
  createUsernameSchema,
} from "../../validation/profile.schema";
import {
  sendSuccessResponse,
  sendErrorResponse,
} from "../../utils/http-response";

export const getUserProfile = async (req: Request, res: Response) => {
  const user = req.user;
  const userProfile = await profileService.getUserProfile(user?.id as string);

  if (!userProfile) {
    return sendErrorResponse(res, 404, "User profile not found");
  }

  return sendSuccessResponse(res, 200, "User profile fetched successfully", {
    profile: userProfile,
  });
};

export const createUserProfile = async (req: Request, res: Response) => {
  const { username, bio, location, socials } = req.body;
  const user = req.user;

  const data = createProfileSchema.parse({
    userId: user!.id,
    username,
    ...(bio && { bio }),
    ...(location && { location }),
    ...(socials && { socials }),
  });

  const usernameExists = await profileService.isUsernameAlreadyUsed(
    data.username
  );

  if (usernameExists) {
    return sendErrorResponse(res, 409, "Username already exists");
  }

  const createdProfile = await profileService.createUserProfile(data);

  if (!createdProfile) {
    return sendErrorResponse(res, 500, "Failed to create user profile");
  }

  return sendSuccessResponse(res, 201, "User profile created successfully", {
    profile: createdProfile,
  });
};

export const updateUserProfile = async (req: Request, res: Response) => {
  const user = req.user;
  const { name, username, bio, location, socials, preferences } = req.body;

  if (username) {
    const exists = await profileService.isUsernameAlreadyUsed(username);
    if (exists) {
      return sendErrorResponse(res, 409, "Username already exists");
    }
  }

  const updated = await profileService.updateUserProfile(user!.id, {
    name,
    username,
    bio,
    location,
    socials,
    preferences,
  });

  return sendSuccessResponse(res, 200, "Profile updated successfully", {
    profile: updated,
  });
};

export const checkUsername = async (req: Request, res: Response) => {
  const username = req.query.username as string;
  const data = createUsernameSchema.parse({ username });
  const usernameExists = await profileService.isUsernameAlreadyUsed(data.username);

  if (usernameExists) {
    return sendErrorResponse(res, 409, "Username already exists");
  }

  return sendSuccessResponse(res, 200, "Username is available");
};
