import {
  sendSuccessResponse,
  sendErrorResponse,
} from "../../utils/http-response";
import type { Request, Response } from "express";
import { AuthService } from "../../services/auth.services";
import { createUserSchema } from "../../validation/user.schema";
import type { ICreateUser } from "../../validation/user.schema";
import { createEmailSchema } from "../../validation/user.schema";

function getDeviceInfo(req: Request) {
  const ua = req.headers["user-agent"] ?? "";
  return {
    deviceName: ua.slice(0, 255),
    deviceType: /mobile|android|iphone|ipad/i.test(ua) ? "mobile" : "desktop",
    ipAddress: req.ip ?? req.socket?.remoteAddress ?? "",
  };
}

const COOKIE_OPTIONS = (isProd = process.env.NODE_ENV === "production") => ({
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" as const : "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

export const createUser = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  const data: ICreateUser = createUserSchema.parse({ name, email, password });

  const emailExists = await AuthService.isEmailAlreadyUsed(data.email);
  if (emailExists) {
    return sendErrorResponse(res, 409, "Email is already in use");
  }

  const { userWithoutPwd, accessToken, refreshToken } =
    await AuthService.registerUser(data, getDeviceInfo(req));

  res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS());

  sendSuccessResponse(res, 201, "User registered successfully", {
    user: userWithoutPwd,
    accessToken,
  });
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const { userWithoutPwd, accessToken, refreshToken } =
    await AuthService.loginUser(email, password, getDeviceInfo(req));

  res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS());

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

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
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

export const getCurrentUser = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { userWithoutPwd, accessToken } = await AuthService.getCurrentUser(userId!);

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
    await AuthService.refreshAccessToken(refreshTokenFromCookie, getDeviceInfo(req));

  res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS());

  return sendSuccessResponse(res, 200, "Access token refreshed", {
    user: userWithoutPwd,
    accessToken,
  });
};

export const changePassword = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return sendErrorResponse(res, 400, "Current password and new password are required");
  }

  if (newPassword.length < 8) {
    return sendErrorResponse(res, 400, "New password must be at least 8 characters");
  }

  await AuthService.changePassword(userId, currentPassword, newPassword);

  sendSuccessResponse(res, 200, "Password updated successfully");
};

export const getSessions = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const sessions = await AuthService.getActiveSessions(userId);

  const currentToken = req.cookies.refreshToken;

  const mapped = sessions.map((s) => ({
    id: s.id,
    deviceName: s.deviceName ?? "Unknown device",
    deviceType: s.deviceType ?? "desktop",
    ipAddress: s.ipAddress ?? "",
    lastActiveAt: s.lastActiveAt,
    createdAt: s.createdAt,
    isCurrent: s.refreshToken === currentToken,
  }));

  sendSuccessResponse(res, 200, "Sessions fetched", { sessions: mapped });
};

export const revokeAllSessions = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const currentToken = req.cookies.refreshToken;

  if (!currentToken) {
    return sendErrorResponse(res, 401, "No session found");
  }

  await AuthService.revokeAllSessionsExcept(userId, currentToken);

  sendSuccessResponse(res, 200, "Other sessions revoked successfully");
};
