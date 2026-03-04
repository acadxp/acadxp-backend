import express from "express";
import asyncHandler from "../../utils/asyncHandler";
import {
  createCourseHandler,
  checkCourseAvailabilityHandler,
  getAllCoursesHandler,
  getCourseByIdHandler,
  deleteCourseHandler,
} from "../../controllers/v1/course.controller";

const CourseRoutes = express.Router();

CourseRoutes.post("/create", asyncHandler(createCourseHandler));
CourseRoutes.post("/check", asyncHandler(checkCourseAvailabilityHandler));
CourseRoutes.get("/all", asyncHandler(getAllCoursesHandler));
CourseRoutes.get("/:courseId", asyncHandler(getCourseByIdHandler));
CourseRoutes.delete("/:courseId", asyncHandler(deleteCourseHandler));

export default CourseRoutes;
