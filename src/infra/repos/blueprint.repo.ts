import prisma from "../../lib/db";
import type {
  CreateBlueprintInput,
  AIBlueprintStatus,
} from "../../types/aiResponse.type";

const create = async (data: CreateBlueprintInput) => {
  return prisma.aICourseBluePrint.create({
    data: {
      courseId: data.courseId,
      generatedChallenges: data.generatedChallenges,
      generatedSkills: data.generatedSkills,
      generatedBadges: data.generatedBadges,
      aiModel: data.aiModel,
    },
  });
};

const findByCourseId = async (courseId: string) => {
  return prisma.aICourseBluePrint.findUnique({ where: { courseId } });
};

const updateStatus = async (
  id: string,
  status: AIBlueprintStatus,
  acceptedAt?: Date,
  rejectedAt?: Date,
) => {
  return prisma.aICourseBluePrint.update({
    where: { id },
    data: { status, acceptedAt, rejectedAt },
  });
};

export const BlueprintRepo = {
  create,
  findByCourseId,
  updateStatus,
};
