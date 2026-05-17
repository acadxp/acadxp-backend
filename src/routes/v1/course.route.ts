import express from "express";
import asyncHandler from "../../utils/asyncHandler";
import {
  createCourseHandler,
  searchCoursesHandler,
  getAllCoursesHandler,
  getCourseByIdHandler,
  deleteCourseHandler,
} from "../../controllers/v1/course.controller";
import {
  createCourseEnrollment,
  getCourseEnrollmentByAcadId,
  unEnrollFromCourse,
} from "../../controllers/v1/course-enrollement.controller";
import {
  generateCourseBlueprint,
  acceptCourseBlueprint,
} from "../../controllers/v1/ai-course-blueprint.controller";
import { validateSearchCourses } from "../../middlewares/validation.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";

const CourseRoutes = express.Router();

// Literal POST routes (before parameterized routes to avoid capture)
CourseRoutes.post("/create", asyncHandler(createCourseHandler));
CourseRoutes.post(
  "/search",
  asyncHandler(validateSearchCourses),
  asyncHandler(searchCoursesHandler),
);
CourseRoutes.post(
  "/blueprint/confirm",
  asyncHandler(authMiddleware),
  asyncHandler(acceptCourseBlueprint),
);

// Parameterized POST routes
CourseRoutes.post(
  "/:courseId/enroll",
  asyncHandler(authMiddleware),
  asyncHandler(createCourseEnrollment),
);
CourseRoutes.post(
  "/:courseId/blueprint",
  asyncHandler(authMiddleware),
  asyncHandler(generateCourseBlueprint),
);

// GET routes (literal before parameterized)
CourseRoutes.get("/all", asyncHandler(getAllCoursesHandler));
CourseRoutes.get(
  "/enrollments",
  asyncHandler(authMiddleware),
  asyncHandler(getCourseEnrollmentByAcadId),
);
CourseRoutes.get("/:courseId", asyncHandler(getCourseByIdHandler));

// DELETE routes
CourseRoutes.delete("/:courseId", asyncHandler(deleteCourseHandler));
CourseRoutes.delete(
  "/:courseId/enroll",
  asyncHandler(authMiddleware),
  asyncHandler(unEnrollFromCourse),
);

export default CourseRoutes;
