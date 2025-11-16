import type { Request, Response } from "express";
import * as z from "zod";
import prisma from "../../../utils/db";
import { HttpError } from "../../../error/httpError";
import { sendSuccessResponse } from "../../../utils/utils";

export const checkUsername = async (req: Request, res: Response) => {
  const username = req.query.username as string;

  // Validate request body
  const usernameSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long"),
  });

  usernameSchema.parse({ username });

  const usernameExists = await prisma.user.findUnique({
    where: { username },
  });

  if (usernameExists) {
    throw new HttpError(409, "Username already exists");
  }

  sendSuccessResponse(res, 200, "Username is available");
};

export const checkEmail = async (req: Request, res: Response) => {
  const email = req.query.email as string;

  // Validate request body
  const emailSchema = z.object({
    email: z.email("Invalid email address"),
  });

  emailSchema.parse({ email });

  const usenameExists = await prisma.user.findUnique({
    where: { email },
  });

  if (usenameExists) {
    throw new HttpError(409, "Email already exists");
  }

  sendSuccessResponse(res, 200, "Email is available");
};
