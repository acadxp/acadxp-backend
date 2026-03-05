import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import asyncHandler from "../../utils/asyncHandler";
import { unEnrollFromCourse } from "../../controllers/v1/course-enrollement.controller";

const EnrollmentRouter = express.Router();

EnrollmentRouter.delete(
  "/:courseId",
  authMiddleware,
  asyncHandler(unEnrollFromCourse),
);

export default EnrollmentRouter;
