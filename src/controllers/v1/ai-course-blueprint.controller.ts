import type { Request, Response } from "express";
import { BlueprintService } from "../../services/blueprint.services";
import {
  sendSuccessResponse,
  sendErrorResponse,
} from "../../utils/http-response";
import { CourseEnrollmentService } from "../../services/course-enrollemnt.services";
import type { BlueprintConfirmPayload } from "../../types/course.types";
import { confirmBlueprintSchema } from "../../validation/course.schema";

type CourseInfo = {
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  academicLevel: string;
};

export const generateCourseBlueprint = async (req: Request, res: Response) => {
  const { courseId } = req.params as { courseId: string };
  const { courseTitle, courseDescription, academicLevel } = req.body;

  if (!courseTitle || !courseDescription || !academicLevel) {
    return res.status(400).json({
      error:
        "Missing required fields: courseTitle, courseDescription, academicLevel",
    });
  }

  const courseInfo: CourseInfo = {
    courseId,
    courseTitle,
    courseDescription,
    academicLevel,
  };

  const gamificationData = await BlueprintService.generate(courseInfo);

  return sendSuccessResponse(
    res,
    200,
    "Blueprint generated successfully",
    gamificationData,
  );
};

export const acceptCourseBlueprint = async (req: Request, res: Response) => {
  const { courseId, confirmPayload } = req.body as {
    courseId: string;
    confirmPayload: BlueprintConfirmPayload;
  };

  const confirmationResult = await BlueprintService.confirm(
    courseId,
    confirmPayload,
  );

  if (!confirmationResult) {
    throw new Error("Failed to confirm blueprint");
  }

  const courseEnrollment = await CourseEnrollmentService.createCourseEnrollemnt(
    courseId,
    req.user!.id,
  );

  if (!courseEnrollment) {
    throw new Error(
      "Failed to enroll user to the course after blueprint confirmation",
    );
  }

  return sendSuccessResponse(
    res,
    200,
    "Blueprint confirmed and user enrolled successfully",
  );
};
