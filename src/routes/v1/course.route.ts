import express from "express";
import asyncHandler from "../../utils/asyncHandler";
import {
  createCourseHandler,
  searchCoursesHandler,
  getAllCoursesHandler,
  getCourseByIdHandler,
  deleteCourseHandler,
} from "../../controllers/v1/course.controller";
import { createCourseEnrollment } from "../../controllers/v1/course-enrollement.controller";
import { generateCourseBlueprint } from "../../controllers/v1/ai-course-blueprint.controller";
import { validateSearchCourses } from "../../middlewares/validation.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";

const CourseRoutes = express.Router();

CourseRoutes.post("/create", asyncHandler(createCourseHandler));
CourseRoutes.post(
  "/search",
  asyncHandler(validateSearchCourses),
  asyncHandler(searchCoursesHandler),
);
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
