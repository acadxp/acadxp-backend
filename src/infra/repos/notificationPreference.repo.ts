import prisma from "../../lib/db";
import type { Prisma } from "../../generated/prisma/client";

const findByAcademicInfoId = async (academicInfoId: string) => {
  return await prisma.notificationPreference.findMany({
    where: { academicInfoId },
  });
};

const upsert = async (
  academicInfoId: string,
  type: string,
  enabled: boolean,
) => {
  return await prisma.notificationPreference.upsert({
    where: {
      academicInfoId_type: { academicInfoId, type: type as any },
    },
    update: { enabled },
    create: { academicInfoId, type: type as any, enabled },
  });
};

const upsertMany = async (
  academicInfoId: string,
  preferences: { type: string; enabled: boolean }[],
) => {
  const results = [];
  for (const pref of preferences) {
    const result = await upsert(academicInfoId, pref.type, pref.enabled);
    results.push(result);
  }
  return results;
};

export const notificationPreferenceRepo = {
  findByAcademicInfoId,
  upsert,
  upsertMany,
};
