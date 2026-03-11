import type { Request, Response } from "express";
import { aiGeneratedBluePrint } from "../../lib/ai-generator";
import { sendSuccessResponse } from "../../utils/http-response";

export const generateCourseBlueprint = async (req: Request, res: Response) => {
  const { courseTitle, courseDescription, academicLevel } = req.body;
  const courseId = req.params.courseId!;
  const courseInfo = {
    courseId,
    courseTitle,
    courseDescription,
    academicLevel,
  };

  const blueprint = await aiGeneratedBluePrint(courseInfo);

  return sendSuccessResponse(
    res,
    200,
    "Course blueprint generated successfully",
    blueprint,
  );
};
