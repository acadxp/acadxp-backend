import type { Request, Response } from "express";
import { BlueprintService } from "../../services/blueprint.services";
import {
  sendSuccessResponse,
  sendErrorResponse,
} from "../../utils/http-response";
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
  const { courseId, confirmPayload } = req.body;

  // Validate incoming data before touching the DB
  confirmBlueprintSchema.parse({ confirmPayload });

  // Everything runs in one transaction — blueprint + enrollment
  await BlueprintService.confirm(courseId, confirmPayload, req.user!.id);

  return sendSuccessResponse(
    res,
    200,
    "Blueprint confirmed and user enrolled successfully",
  );
};
