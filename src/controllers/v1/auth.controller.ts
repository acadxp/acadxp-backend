import {
  sendSuccessResponse,
  sendErrorResponse,
} from "../../utils/http-response";
import type { Request, Response } from "express";
import { AuthService } from "../../services/auth.services";
import { createUserSchema } from "../../validation/user.schema";
import type { ICreateUser } from "../../validation/user.schema";
import { createEmailSchema } from "../../validation/user.schema";

export const createUser = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  const data: ICreateUser = createUserSchema.parse({
    name,
    email,
    password,
  });

  // check if email already exists
  const emailExists = await AuthService.isEmailAlreadyUsed(data.email);

  if (emailExists) {
    return sendErrorResponse(res, 409, "Email is already in use");
  }

  const { userWithoutPwd, accessToken, refreshToken } =
    await AuthService.registerUser(data);

  const isProduction = process.env.NODE_ENV === "production";
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" as const : "lax" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  res.cookie("refreshToken", refreshToken, cookieOptions);

  sendSuccessResponse(res, 201, "User registered successfully", {
    user: userWithoutPwd,
    accessToken,
  });
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const { userWithoutPwd, accessToken, refreshToken } =
    await AuthService.loginUser(email, password);

  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  sendSuccessResponse(res, 200, "User logged in successfully", {
    user: userWithoutPwd,
    accessToken,
  });
};

export const logoutUser = async (req: Request, res: Response) => {
  const refreshTokenFromCookie = req.cookies.refreshToken;
  if (!refreshTokenFromCookie) {
    return sendErrorResponse(res, 401, "No refresh token provided");
  }

  await AuthService.deleteRefreshToken(refreshTokenFromCookie);

  const isProduction = process.env.NODE_ENV === "production";
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });

  sendSuccessResponse(res, 200, "User logged out successfully");
};

export const checkEmail = async (req: Request, res: Response) => {
  const email = req.query.email as string;

  const data = createEmailSchema.parse({ email });

  const emailExists = await AuthService.isEmailAlreadyUsed(data.email);

  if (emailExists) {
    return sendErrorResponse(res, 409, "Email is already in use");
  }
  sendSuccessResponse(res, 200, "Email is available");
};

// Get current user (session)
export const getCurrentUser = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const { userWithoutPwd, accessToken } = await AuthService.getCurrentUser(
    userId!,
  );

  return sendSuccessResponse(res, 200, "Current user fetched", {
    user: userWithoutPwd,
    accessToken,
  });
};

export const refreshToken = async (req: Request, res: Response) => {
  const refreshTokenFromCookie = req.cookies.refreshToken;
  if (!refreshTokenFromCookie) {
    return sendErrorResponse(res, 401, "No refresh token provided");
  }

  const { userWithoutPwd, accessToken, refreshToken } =
    await AuthService.refreshAccessToken(refreshTokenFromCookie);

  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return sendSuccessResponse(res, 200, "Access token refreshed", {
    user: userWithoutPwd,
    accessToken,
  });
};
