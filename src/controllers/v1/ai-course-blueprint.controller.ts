import type { Request, Response } from "express";
import { aiGeneratedBluePrint } from "../../lib/ai-generator";
import { sendSuccessResponse } from "../../utils/http-response";
import { parseAIResponse } from "../../utils/parse-ai-response";
import type { GamificationData } from "../../types/aiResponse.type";

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

  const parseResult = parseAIResponse(blueprint);

  if (parseResult.success) {
    const data: GamificationData = parseResult.data;

    console.log(data.meta.totalXPAvailable);
    return sendSuccessResponse(
      res,
      200,
      "Course blueprint generated successfully",
      data,
    );
  } else {
    console.error(parseResult.errors);
  }
};
