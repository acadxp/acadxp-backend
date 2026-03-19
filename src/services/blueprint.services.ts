import { HttpError } from "../error/httpError";
import { BlueprintRepo } from "../infra/repos/blueprint.repo";
import { CourseRepo } from "../infra/repos/course.repo";
import type {
  CreateBlueprintInput,
  GamificationData,
} from "../types/aiResponse.type";
import { aiGeneratedBluePrint } from "../lib/ai-generator";
import { parseAIResponse } from "../utils/parse-ai-response";

type CourseInfo = {
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  academicLevel: string;
};

const callAI = async (courseInfo: CourseInfo): Promise<GamificationData> => {
  const blueprint = await aiGeneratedBluePrint(courseInfo);

  const parseResult = parseAIResponse(blueprint);

  if (parseResult.success) {
    const data: GamificationData = parseResult.data;
    return data;
  } else {
    console.error(parseResult.errors);
    throw new HttpError(
      500,
      `Failed to parse AI response: ${parseResult.errors.join(", ")}`,
    );
  }
};

const generate = async (courseInfo: CourseInfo) => {
  const course = await CourseRepo.getById(courseInfo.courseId);
  if (!course) throw new HttpError(404, "Course not found");

  // Check if a blueprint already exists for this course
  const existing = await BlueprintRepo.findByCourseId(courseInfo.courseId);
  if (
    existing &&
    ["ACCEPTED", "PARTIALLY_ACCEPTED"].includes(existing.status)
  ) {
    throw new HttpError(400, "A blueprint already exists for this course");
  }

  let blueprintData: GamificationData;
  try {
    blueprintData = await callAI(courseInfo);
  } catch (error: any) {
    throw new HttpError(500, `AI generation failed: ${error.message}`);
  }

  await BlueprintRepo.create({
    courseId: courseInfo.courseId,
    generatedChallenges: blueprintData.challenges,
    generatedSkills: blueprintData.skills,
    generatedBadges: blueprintData.badges,
    aiModel: blueprintData.meta.sourceModel,
  });

  return blueprintData;
};

export const BlueprintService = {
  generate,
};
