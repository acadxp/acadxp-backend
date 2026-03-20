import { HttpError } from "../error/httpError";
import prisma from "../lib/db";
import { BlueprintRepo } from "../infra/repos/blueprint.repo";
import { CourseRepo } from "../infra/repos/course.repo";
import type {
  ChallengeDifficulty,
  ProficiencyLevel,
  CourseInfo,
  BlueprintConfirmPayload,
  GeneratedBadge,
  GeneratedChallenge,
  GeneratedSkill,
} from "../types/course.types";
import type {
  CreateBlueprintInput,
  GamificationData,
} from "../types/aiResponse.type";
import { aiGeneratedBluePrint } from "../lib/ai-generator";
import { parseAIResponse } from "../utils/parse-ai-response";

// ─── Difficulty + proficiency mappers ────────────────────────────────────────

const toPrismadifficulty = (d: string): ChallengeDifficulty => {
  const map: Record<string, ChallengeDifficulty> = {
    easy: "EASY",
    medium: "MEDIUM",
    hard: "HARD",
  };
  return map[d.toLowerCase()] ?? "EASY";
};

const toPrismaProficiency = (xpValue: number): ProficiencyLevel => {
  if (xpValue >= 200) return "EXPERT";
  if (xpValue >= 100) return "ADVANCED";
  if (xpValue >= 50) return "INTERMEDIATE";
  return "BEGINNER";
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

/**
 * PATCH /courses/:id/blueprint
 * Confirms the user's selection. Runs as a single Prisma transaction:
 *   1. Creates Skill rows (upsert by name to avoid duplicates across courses)
 *   2. Creates CourseSkill join rows
 *   3. Creates Challenge rows
 *   4. Creates CourseChallenge join rows
 *   5. Optionally creates Badge rows
 *   6. Updates AICourseBluePrint status → ACCEPTED or PARTIALLY_ACCEPTED
 *
 * Returns a summary of what was stored.
 */
const confirm = async (courseId: string, payload: BlueprintConfirmPayload) => {
  const course = await CourseRepo.getById(courseId);
  if (!course) throw new HttpError(404, "Course not found");

  const blueprint = await BlueprintRepo.findByCourseId(courseId);
  if (!blueprint) throw new HttpError(404, "Blueprint not found");
  if (["ACCEPTED", "PARTIALLY_ACCEPTED"].includes(blueprint.status)) {
    throw new HttpError(400, "Blueprint has already been confirmed");
  }

  const { selectedSkills, selectedChallenges, selectedBadges = [] } = payload;

  const totalGenerated =
    (blueprint.generatedSkills as any[]).length +
    (blueprint.generatedChallenges as any[]).length;
  const totalSelected = selectedSkills.length + selectedChallenges.length;
  const newStatus =
    totalSelected < totalGenerated ? "PARTIALLY_ACCEPTED" : "ACCEPTED";

  // Single transaction — all or nothing
  const result = await prisma.$transaction(async (tx) => {
    // ── Skills ──────────────────────────────────────────────────────────────
    const createdSkills = await Promise.all(
      selectedSkills.map((s: GeneratedSkill) =>
        tx.skill.upsert({
          where: { name: s.title },
          update: {},
          create: {
            name: s.title,
            description: s.description,
            xpValue: s.xpValue,
          },
        }),
      ),
    );

    await Promise.all(
      createdSkills.map((skill) =>
        tx.courseSkill.upsert({
          where: { courseId_skillId: { courseId, skillId: skill.id } },
          update: {},
          create: {
            courseId,
            skillId: skill.id,
            proficiencyLevel: toPrismaProficiency(skill.xpValue),
          },
        }),
      ),
    );

    // ── Challenges ──────────────────────────────────────────────────────────
    const createdChallenges = await Promise.all(
      selectedChallenges.map((c: GeneratedChallenge) =>
        tx.challenge.create({
          data: {
            title: c.title,
            description: c.description,
            type: "ASSIGNMENT",
            difficulty: toPrismadifficulty(c.difficulty),
            xpReward: c.xpReward,
            criteria: c.criteria as any,
          },
        }),
      ),
    );

    await Promise.all(
      createdChallenges.map((challenge, i) =>
        tx.courseChallenge.create({
          data: {
            courseId,
            challengeId: challenge.id,
            order: i,
          },
        }),
      ),
    );

    // ── Badges (optional) ───────────────────────────────────────────────────
    const createdBadges = await Promise.all(
      selectedBadges.map((b: GeneratedBadge) =>
        tx.badge.create({
          data: {
            title: b.title,
            description: b.description,
            xpReward: b.xpValue,
            criteria: b.criteria as any,
          },
        }),
      ),
    );

    // ── Blueprint status ─────────────────────────────────────────────────────
    await tx.aICourseBluePrint.update({
      where: { id: blueprint.id },
      data: {
        status: newStatus,
        acceptedAt: new Date(),
      },
    });

    return {
      skills: createdSkills,
      challenges: createdChallenges,
      badges: createdBadges,
      blueprintStatus: newStatus,
    };
  });

  return result;
};

export const BlueprintService = {
  generate,
  confirm,
};
