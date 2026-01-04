import prisma from "../../lib/db";
import type { AcademicInfo } from "@prisma/client";

const createAcademicInfo = async (data: Partial<AcademicInfo>) => {
  return await prisma.academicInfo.create({
    data,
  });
};

const getAcademicInfoByProfileId = async (profileId: string) => {
  return await prisma.academicInfo.findUnique({
    where: { profileId },
  });
};

export const academicInfosRepos = {
  createAcademicInfo,
  getAcademicInfoByProfileId,
};
