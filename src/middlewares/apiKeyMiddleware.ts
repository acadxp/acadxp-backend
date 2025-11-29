import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../error/httpError";
import prisma from "../utils/db";

const apiKeyHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.body;
  const apiKey = req.get("x-api-key");

  if (!apiKey) {
    throw new HttpError(401, "API Key missen, Can't acces the APP.");
  }

  const apiKeyExist = await prisma.apiKey.findUnique({
    where: {
      key_userId: {
        key: apiKey,
        userId: userId,
      },
    },
  });

  if (!apiKeyExist) {
    throw new HttpError(404, "User with this apikey doesnot exist.");
  }

  next();
};

export default apiKeyHandler;
