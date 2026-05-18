import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { HttpError } from "../error/httpError";
import { Prisma } from "../generated/prisma/client";

const INTERNAL_MESSAGE = "Something went wrong. Please try again later.";

const isUserFriendly = (message: string): boolean => {
  const internalPatterns = [
    "Cannot find module",
    "prisma",
    "runtime",
    "Internal server error",
    "ECONNREFUSED",
    "ETIMEOUT",
    "ENOTFOUND",
    "connect ECONNREFUSED",
    "Invalid `prisma",
    "Cannot read properties of undefined",
    "Cannot read properties of null",
    "is not a function",
    "is not defined",
    "Unexpected token",
    "stack trace",
  ];
  const lower = message.toLowerCase();
  return !internalPatterns.some((p) => lower.includes(p.toLowerCase()));
};

const sanitizeErrorMessage = (error: any): string => {
  if (error instanceof HttpError) return error.message;
  if (error instanceof ZodError) return "Validation failed";

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return "A record with this value already exists.";
      case "P2025":
        return "The requested record was not found.";
      case "P2003":
        return "This operation failed due to a related record constraint.";
      default:
        return INTERNAL_MESSAGE;
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return INTERNAL_MESSAGE;
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return "Database connection failed. Please try again later.";
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    return INTERNAL_MESSAGE;
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return INTERNAL_MESSAGE;
  }

  if (typeof error === "string") {
    return isUserFriendly(error) ? error : INTERNAL_MESSAGE;
  }

  const msg = error?.message ?? "";
  if (!msg || typeof msg !== "string") return INTERNAL_MESSAGE;

  return isUserFriendly(msg) ? msg : INTERNAL_MESSAGE;
};

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error(`[${new Date().toISOString()}] Error:`, error);

  if (error instanceof ZodError) {
    const messages = error.issues.map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: messages,
    });
  }

  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  const statusCode = error?.statusCode ?? error?.status ?? 500;
  const message = sanitizeErrorMessage(error);

  return res.status(statusCode).json({
    success: false,
    message,
  });
};
