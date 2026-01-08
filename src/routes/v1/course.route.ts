import express from "express";
import asyncHandler from "../../utils/asyncHandler";
import {
  createCourseHandler,
  checkCourseAvailabilityHandler,
} from "../../controllers/v1/course.controller";

const CourseRoutes = express.Router();

CourseRoutes.post("/create", asyncHandler(createCourseHandler));
CourseRoutes.post("/check", asyncHandler(checkCourseAvailabilityHandler));

export default CourseRoutes;
