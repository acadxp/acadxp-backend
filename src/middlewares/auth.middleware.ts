import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../error/httpError";
import prisma from "../lib/db";
import auth from "../lib/auth";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name?: string;
        emailVerified: boolean;
        role?: string;
      };
      session?: {
        id: string;
        token: string;
        userId: string;
        expiresAt: Date;
      };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get session and user from BetterAuth
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session || !session.user) {
      console.error(req.headers);
      throw new HttpError(401, "Unauthorized - No valid session");
    }

    // Fetch user with role from database
    const userWithRole = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        role: true,
      },
    });

    if (!userWithRole) {
      throw new HttpError(401, "Unauthorized - User not found");
    }

    // Attach user and session to request
    req.user = {
      ...session.user,
      role: userWithRole.role,
    };
    req.session = session.session;

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    throw new HttpError(401, "Unauthorized - Invalid session");
  }
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
