import prisma from "../../lib/db";
import type { AcademicInfo } from "@prisma/client";

const createAcademicInfo = async (data: Partial<AcademicInfo>) => {
  return await prisma.academicInfo.create({
    data,
  });
};

export const academicInfosRepos = { createAcademicInfo };
