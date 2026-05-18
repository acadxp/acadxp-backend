import { HttpError } from "../error/httpError";
import type { Request, Response, NextFunction } from "express";

export const validateSearchCourses = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { title, courseCode } = req.query;

  if (!title && !courseCode) {
    throw new HttpError(
      400,
      "At least one of 'title' or 'courseCode' must be provided",
    );
  }

  next();
};
