import type { Request, Response } from "express";
import * as z from "zod";
import prisma from "../../lib/db";
import { HttpError } from "../../error/httpError";
import { sendSuccessResponse } from "../../lib/utils/utils";

export const checkUsername = async (req: Request, res: Response) => {
  const username = req.query.username as string;

  // Validate request body
  const usernameSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long"),
  });

  usernameSchema.parse({ username });

  const usernameExists = await prisma.profile.findUnique({
    where: { username },
  });

  if (usernameExists) {
    // throw new HttpError(409, "Username already exists");
    sendSuccessResponse(res, 200, "Username already exists");
  }

  sendSuccessResponse(res, 200, "Username is available");
};
