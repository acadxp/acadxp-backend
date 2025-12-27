import type { AcademicInfo } from "@prisma/client";
import { academicInfosRepos } from "../infra/repos/academicInfos.repo";

const createAcademicInfo = async (data: Partial<AcademicInfo>) => {
  // Transform YYYY-MM-DD dates to ISO-8601 DateTime format
  const processedData = {
    ...data,
    ...(data.graduationDate && {
      graduationDate: new Date(`${data.graduationDate}T00:00:00Z`),
    }),
    ...(data.enrolledDate && {
      enrolledDate: new Date(`${data.enrolledDate}T00:00:00Z`),
    }),
  };

  return await academicInfosRepos.createAcademicInfo(processedData);
};

export const academicInfosService = { createAcademicInfo };
