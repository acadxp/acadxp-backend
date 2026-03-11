import express from "express";
import asyncHandler from "../../utils/asyncHandler";
import {
  createCourseHandler,
  checkCourseAvailabilityHandler,
  getAllCoursesHandler,
  getCourseByIdHandler,
  deleteCourseHandler,
} from "../../controllers/v1/course.controller";
import { createCourseEnrollment } from "../../controllers/v1/course-enrollement.controller";
import { generateCourseBlueprint } from "../../controllers/v1/ai-course-blueprint.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const CourseRoutes = express.Router();

CourseRoutes.post("/create", asyncHandler(createCourseHandler));
CourseRoutes.post("/check", asyncHandler(checkCourseAvailabilityHandler));
CourseRoutes.get("/all", asyncHandler(getAllCoursesHandler));
CourseRoutes.get("/:courseId", asyncHandler(getCourseByIdHandler));
CourseRoutes.delete("/:courseId", asyncHandler(deleteCourseHandler));
CourseRoutes.post(
  "/:courseId/enroll",
  asyncHandler(authMiddleware),
  asyncHandler(createCourseEnrollment),
);
CourseRoutes.post(
  "/:courseId/generate-blueprint",
  asyncHandler(generateCourseBlueprint),
);

export default CourseRoutes;
