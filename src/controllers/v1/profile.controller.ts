import type { Request, Response } from "express";
import { profileService } from "../../services/profile.services";
import {
  createProfileSchema,
  createUsernameSchema,
  createEmailSchema,
} from "../../validation/profile.schema";
import {
  sendSuccessResponse,
  sendErrorResponse,
} from "../../utils/http-response";

export const getUserProfile = async (req: Request, res: Response) => {
  const userId = req.query.userId;

  const userProfile = await profileService.getUserProfile(userId as string);

  if (!userProfile) {
    return sendErrorResponse(res, 404, "User profile not found");
  }

  return sendSuccessResponse(res, 200, "User profile fetched successfully", {
    profile: userProfile,
  });
};

export const createUserProfile = async (req: Request, res: Response) => {
  const { username, bio, location, socials } = req.body;
  const userId = req.query.userId;

  const data = createProfileSchema.parse({
    userId,
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

export const checkUsername = async (req: Request, res: Response) => {
  const username = req.query.username as string;

  const data = createUsernameSchema.parse({ username });

  const usernameExists = profileService.isUsernameAlreadyUsed(data.username);

  if (!usernameExists) {
    sendErrorResponse(res, 409, "Username already exists");
  }

  sendSuccessResponse(res, 200, "Username is available");
};

export const checkEmail = async (req: Request, res: Response) => {
  const email = req.query.email as string;

  const data = createEmailSchema.parse({ email });

  const emailExists = profileService.isEmailAlreadyUsed(data.email);

  if (!emailExists) {
    sendErrorResponse(res, 409, "Email already exists");
  }

  sendSuccessResponse(res, 200, "Email is available");
};
