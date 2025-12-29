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

  const { userWithoutPwd, accessToken, refreshToken } =
    await AuthService.registerUser(data);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return sendSuccessResponse(
    res,
    201,
    "User registered successfully",
    userWithoutPwd
  );
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const { userWithoutPwd, accessToken } = await AuthService.loginUser(
    email,
    password
  );

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return sendSuccessResponse(
    res,
    200,
    "User logged in successfully",
    userWithoutPwd
  );
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
    userId!
  );

  return sendSuccessResponse(res, 200, "Current user fetched", {
    userWithoutPwd,
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

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return sendSuccessResponse(res, 200, "Access token refreshed", {
    userWithoutPwd,
  });
};
