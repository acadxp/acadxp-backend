import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { HttpError } from "../error/httpError";

const jwtHandler = (req: Request, res: Response, next: NextFunction) => {
  const auth = String(req.headers["authorization"] || "");

  if (!auth) {
    throw new HttpError(401, "Authorization header missing");
  }

  const token = auth.split(" ")[1] as string;
  const decodeToken = verifyToken(token, process.env.JWT_SECRET!);

  if (!decodeToken) {
    throw new HttpError(401, "Invalid or expired JWT token");
  }

  next();
};

export default jwtHandler;
