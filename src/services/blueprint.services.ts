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
    aiModel: blueprintData.meta.sourceModel ?? "unknown",
  });

  return blueprintData;
};

/**
 * Confirms the user's selection AND enrolls them — all in one transaction.
 *  1. Resolves user's academic info & creates enrollment if needed
 *  2. Upserts Skills & CourseSkills
 *  3. Creates Challenges & CourseChallenges
 *  4. Creates Badges
 *  5. Updates AICourseBluePrint status
 */
const confirm = async (
  courseId: string,
  payload: BlueprintConfirmPayload,
  userId: string,
) => {
  const { selectedSkills, selectedChallenges, selectedBadges = [] } = payload;

  const totalSelected = selectedSkills.length + selectedChallenges.length;

  const result = await prisma.$transaction(async (tx) => {
    // ── Course + Blueprint checks (inside transaction to avoid races) ──────
    const course = await tx.course.findUnique({ where: { id: courseId } });
    if (!course) throw new HttpError(404, "Course not found");

    const blueprint = await tx.aICourseBluePrint.findUnique({
      where: { courseId },
    });
    if (!blueprint) throw new HttpError(404, "Blueprint not found");
    if (["ACCEPTED", "PARTIALLY_ACCEPTED"].includes(blueprint.status)) {
      throw new HttpError(400, "Blueprint has already been confirmed");
    }

    const totalGenerated =
      (blueprint.generatedSkills as any[]).length +
      (blueprint.generatedChallenges as any[]).length;
    const newStatus =
      totalSelected < totalGenerated ? "PARTIALLY_ACCEPTED" : "ACCEPTED";

    // ── Resolve academic info & check enrollment ─────────────────────────
    const profile = await tx.profile.findUnique({ where: { userId } });
    if (!profile) {
      throw new HttpError(
        404,
        "Profile not found. Please create a profile first.",
      );
    }

    const acadInfo = await tx.academicInfo.findFirst({
      where: { profileId: profile.id },
    });
    if (!acadInfo) {
      throw new HttpError(
        404,
        "Academic information not found. Please set up your academic info first.",
      );
    }

    const existingEnrollment = await tx.studentCourseEnrollment.findUnique({
      where: {
        academicInfoId_courseId: {
          academicInfoId: acadInfo.id,
          courseId,
        },
      },
    });

    if (!existingEnrollment) {
      await tx.studentCourseEnrollment.create({
        data: { courseId, academicInfoId: acadInfo.id },
      });
    }

    // ── Skills ────────────────────────────────────────────────────────────
    const createdSkills = await Promise.all(
      selectedSkills.map((s: GeneratedSkill) => {
        if (!s.criteria || typeof s.criteria !== "object") {
          throw new HttpError(400, `Skill "${s.title}" has invalid criteria`);
        }
        return tx.skill.upsert({
          where: { name: s.title },
          update: {},
          create: {
            name: s.title,
            description: s.description,
            xpValue: s.xpValue,
          },
        });
      }),
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

    // ── Challenges ────────────────────────────────────────────────────────
    const createdChallenges = await Promise.all(
      selectedChallenges.map((c: GeneratedChallenge) => {
        if (!c.criteria || typeof c.criteria !== "object") {
          throw new HttpError(
            400,
            `Challenge "${c.title}" has invalid criteria`,
          );
        }
        return tx.challenge.create({
          data: {
            title: c.title,
            description: c.description,
            type: "ASSIGNMENT",
            difficulty: toPrismadifficulty(c.difficulty),
            xpReward: c.xpReward,
            criteria: c.criteria as any,
          },
        });
      }),
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

    // ── Badges (optional) ─────────────────────────────────────────────────
    const createdBadges = await Promise.all(
      selectedBadges.map((b: GeneratedBadge) => {
        if (!b.criteria || typeof b.criteria !== "object") {
          throw new HttpError(400, `Badge "${b.title}" has invalid criteria`);
        }
        return tx.badge.create({
          data: {
            title: b.title,
            description: b.description,
            xpReward: b.xpValue,
            criteria: b.criteria as any,
          },
        });
      }),
    );

    // ── Blueprint status ─────────────────────────────────────────────────
    await tx.aICourseBluePrint.update({
      where: { id: blueprint.id },
      data: { status: newStatus, acceptedAt: new Date() },
    });

    // ── Publish course ──────────────────────────────────────────────────
    await tx.course.update({
      where: { id: courseId },
      data: { status: "ACTIVE" },
    });

    return {
      skills: createdSkills,
      challenges: createdChallenges,
      badges: createdBadges,
      blueprintStatus: newStatus,
    };
  }, { timeout: 30000 });

  return result;
};

export const BlueprintService = {
  generate,
  confirm,
};
