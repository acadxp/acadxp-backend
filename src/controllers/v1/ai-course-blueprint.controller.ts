import type { Request, Response } from "express";
import { BlueprintService } from "../../services/blueprint.services";
import {
  sendSuccessResponse,
  sendErrorResponse,
} from "../../utils/http-response";
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
  const { courseId } = req.params as { courseId: string };
  const { ConfirmPayload } = req.body as {
    ConfirmPayload: BlueprintConfirmPayload;
  };

  const payload = confirmBlueprintSchema.safeParse(ConfirmPayload);

  if (!payload.success) {
    return sendErrorResponse(
      res,
      400,
      `Invalid course blueprint payload: ${payload.error.message}`,
    );
  }

  const confirmationResult = await BlueprintService.confirm(
    courseId,
    ConfirmPayload,
  );

  if (!confirmationResult) {
    throw new Error("Failed to confirm blueprint");
  }

  return sendSuccessResponse(
    res,
    200,
    "Blueprint confirmed and stored successfully",
    confirmationResult,
  );
};
