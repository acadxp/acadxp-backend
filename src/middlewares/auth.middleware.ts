import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../error/httpError";
import { userRepos } from "../infra/repos/user.repo";
import { verifyToken } from "../lib/jwt";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        emailVerified: boolean;
        role: string;
      };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new HttpError(401, "Unauthorized - No token provided");
  }

  const token = authHeader.split(" ")[1];

  const secret = process.env.JWT_SECRET!;
  let decodedToken = verifyToken(token!, secret);

  if (!decodedToken || !decodedToken.userId) {
    throw new HttpError(401, "Unauthorized - Invalid token");
  }

  const user = await userRepos.getUserById(decodedToken.userId);

  if (!user) {
    throw new HttpError(401, "Unauthorized - User not found");
  }
  req.user = {
    id: user.id,
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerified,
    role: user.role,
  };

  next();
};

// Role-based access control middleware
export const roleMiddleware = (requiredRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new HttpError(401, "Unauthorized");
    }

    if (!req.user.role || !requiredRoles.includes(req.user.role)) {
      throw new HttpError(403, "Forbidden - Insufficient permissions");
    }

    next();
  };
};

export const adminOnly = roleMiddleware(["ADMIN"]);
export const teacherOrAdmin = roleMiddleware(["TEACHER", "ADMIN"]);
export const studentOrTeacher = roleMiddleware(["STUDENT", "TEACHER"]);
