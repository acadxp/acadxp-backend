import {
  sendSuccessResponse,
  sendErrorResponse,
} from "../../utils/http-response";
import type { Request, Response } from "express";
import { CourseService } from "../../services/course.services";
import { createCourseSchema } from "../../validation/course.schema";

export const createCourseHandler = async (req: Request, res: Response) => {
  const { courseCode, title, description, xp, department } = req.body;

  const data = createCourseSchema.parse({
    courseCode,
    title,
    ...(description && { description }),
    xp,
    department,
  });

  const newCourse = await CourseService.createCourse(data);
  if (!newCourse) {
    return sendErrorResponse(res, 500, "Failed to create course");
  }

  return sendSuccessResponse(
    res,
    201,
    "Course created successfully",
    newCourse
  );
};

export const checkCourseAvailabilityHandler = async (
  req: Request,
  res: Response
) => {
  const { courseCode, title, description, xp, department } = req.body;

  const data = createCourseSchema.parse({
    courseCode,
    title,
    ...(description && { description }),
    xp,
    department,
  });

  const result = await CourseService.checkBeforeCreate(data);

  return res.status(200).json({
    success: true,
    data: result,
  });
};
