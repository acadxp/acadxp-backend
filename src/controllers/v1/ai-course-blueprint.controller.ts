import type { Request, Response } from "express";
import { BlueprintService } from "../../services/blueprint.services";
import { sendSuccessResponse } from "../../utils/http-response";

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
