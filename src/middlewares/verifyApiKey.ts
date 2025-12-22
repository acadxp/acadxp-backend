import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../error/httpError";
import { hashApiKey } from "../lib/apiKey";
import prisma from "../lib/db";

const apiKeyHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // TODO need to verify the user if it is thesame as the person having the api key
  const { userId } = req.body;
  const apiKey = String(req.headers["x-api-key"] || "");

  if (!apiKey) {
    throw new HttpError(401, "API Key missen, Can't acces the APP.");
  }
  const hashed = hashApiKey(apiKey);

  const apiKeyExist = await prisma.apiKey.findFirst({
    where: {
      key: hashed,
    },
  });

  if (!apiKeyExist) {
    throw new HttpError(404, "Invalid or expired API key.");
  }

  next();
};

export default apiKeyHandler;
