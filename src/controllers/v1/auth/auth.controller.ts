import type { Request, Response } from "express";
import * as z from "zod";
import prisma from "../../../utils/db";
import { hashPassword, sendSuccessResponse } from "../../../utils/utils";
import { HttpError } from "../../../error/httpError";
import { generateAccessToken, generateRefreshToken } from "../../../utils/jwt";
import type { TokenPayload } from "../../../types/auth.types";
import { generateApiKey } from "../../../utils/apiKey";
import { generateUUID } from "@neylorxt/generate-unique-key";

const COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  path: "/",
};

export const createUser = async (req: Request, res: Response) => {
  const { name, email, password, username } = req.body;

  // Validate request body
  const createUserSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    username: z.string().min(3, "Username must be at least 3 characters long"),
  });

  createUserSchema.parse({ name, email, password, username });

  const usernameExists = await prisma.user.findUnique({
    where: { username },
  });

  if (usernameExists) {
    throw new HttpError(409, "Username already exists");
  }

  const emailExists = await prisma.user.findUnique({
    where: { email },
  });

  if (emailExists) {
    throw new HttpError(409, "Email already exists");
  }

  const hashedPassword = await hashPassword(password);

  const newUser = await prisma.user.create({
    data: {
      username,
      name,
      email,
      password: hashedPassword,
    },
  });

  if (!newUser) {
    throw new HttpError(500, "Failed to create user");
  }

  const payload: TokenPayload = {
    id: newUser.id,
    email: newUser.email,
    username: newUser.username,
    role: newUser.role,
    name: newUser.name as string,
  };

  const apiKey = generateApiKey();
  const hashedApiKey = await hashPassword(apiKey);

  await prisma.apiKey.create({
    data: {
      userId: newUser.id,
      key: hashedApiKey,
    },
  });
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await prisma.session.create({
    data: {
      userId: newUser.id,
      refreshToken: refreshToken,
      expiryDate: 30 * 24 * 60 * 60, // 30 days in seconds
    },
  });

  res.cookie("refreshToken", refreshToken, COOKIE_CONFIG);

  sendSuccessResponse(res, 201, "User created successfully", {
    accessToken,
    apiKey,
  });
};
