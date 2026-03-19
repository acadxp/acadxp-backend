import {
  sendSuccessResponse,
  sendErrorResponse,
} from "../../utils/http-response";
import type { Request, Response } from "express";
import { CourseService } from "../../services/course.services";
import {
  createCourseSchema,
  searchCourseSchema,
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

export const searchCoursesHandler = async (req: Request, res: Response) => {
  const { title = "", courseCode = "" } = req.query as {
    title?: string;
    courseCode?: string;
  };

  const data = searchCourseSchema.parse({ title, courseCode });

  const result = await CourseService.searchCourses(data.courseCode, data.title);

  return sendSuccessResponse(res, 200, "Search completed", result);
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
