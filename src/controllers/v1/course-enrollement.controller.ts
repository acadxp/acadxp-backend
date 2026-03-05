import type { Request, Response } from "express";
import { CourseEnrollmentService } from "../../services/course-enrollemnt.services";
import { createCourseIdSchema } from "../../validation/course.schema";
import {
  sendSuccessResponse,
  sendErrorResponse,
} from "../../utils/http-response";

export const createCourseEnrollment = async (req: Request, res: Response) => {
  const { id } = req.user!;
  const { courseId } = req.params!;

  const data = createCourseIdSchema.parse({ courseId });

  const courseEnrollment = await CourseEnrollmentService.createCourseEnrollemnt(
    data.courseId,
    id,
  );

  return sendSuccessResponse(
    res,
    201,
    "You have been successfully enrolled in the course",
    courseEnrollment,
  );
};

export const getCourseEnrollmentByAcadId = async (
  req: Request,
  res: Response,
) => {
  const { id } = req.user!;

  const courseEnrollments =
    await CourseEnrollmentService.getCourseEnrollmentByAcadId(id);

  return sendSuccessResponse(
    res,
    200,
    "Course enrollments retrieved successfully",
    courseEnrollments,
  );
};

export const unEnrollFromCourse = async (req: Request, res: Response) => {
  const { id } = req.user!;
  const { courseId } = req.params!;

  const data = createCourseIdSchema.parse({ courseId });

  const courseEnrollment = await CourseEnrollmentService.unEnrollFromCourse(
    data.courseId,
    id,
  );

  return sendSuccessResponse(
    res,
    200,
    "You have been successfully unenrolled from the course",
  );
};
