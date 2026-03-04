import {
  sendSuccessResponse,
  sendErrorResponse,
} from "../../utils/http-response";
import type { Request, Response } from "express";
import { CourseService } from "../../services/course.services";
import {
  createCourseSchema,
  createCourseIdSchema,
} from "../../validation/course.schema";

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
    newCourse,
  );
};

export const checkCourseAvailabilityHandler = async (
  req: Request,
  res: Response,
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

export const getAllCoursesHandler = async (req: Request, res: Response) => {
  const courses = await CourseService.getAllCourses();

  return sendSuccessResponse(
    res,
    200,
    "Courses retrieved successfully",
    courses,
  );
};

export const getCourseByIdHandler = async (req: Request, res: Response) => {
  const { courseId } = req.params;

  const data = createCourseIdSchema.parse({ courseId });

  const course = await CourseService.getCourseById(data.courseId);
  return sendSuccessResponse(res, 200, "Course Found", course);
};

export const deleteCourseHandler = async (req: Request, res: Response) => {
  const { courseId } = req.params;

  const data = createCourseIdSchema.parse({ courseId });

  await CourseService.deleteCourse(data.courseId);
  return sendSuccessResponse(res, 200, "Course deleted successfully");
};
