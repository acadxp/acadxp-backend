import type { Request, Response } from "express";
import { createAcademicInfoSchema } from "../../validation/academicInfos.schema";
import { academicInfosService } from "../../services/academicInfos.services";
import {
  sendSuccessResponse,
  sendErrorResponse,
} from "../../utils/http-response";

export const createAcademicInfo = async (req: Request, res: Response) => {
  const {
    profileId,
    institution,
    degree,
    major,
    semester,
    enrollmentStatus,
    graduationDate,
    enrolledDate,
  } = req.body;

  const data = createAcademicInfoSchema.parse({
    profileId,
    ...(institution && { institution }),
    ...(degree && { degree }),
    ...(major && { major }),
    ...(semester && { semester }),
    enrollmentStatus,
    ...(graduationDate && { graduationDate }),
    ...(enrolledDate && { enrolledDate }),
  });

  const createdAcademicInfo = await academicInfosService.createAcademicInfo(
    data
  );

  if (!createdAcademicInfo) {
    return sendErrorResponse(res, 500, "Failed to create academic information");
  }

  return sendSuccessResponse(
    res,
    201,
    "Academic information created successfully",
    { academicInfo: createdAcademicInfo }
  );
};
/*
export const getAcademicInfo = async (req: Request, res: Response) => {};
export const updateAcademicInfo = async (req: Request, res: Response) => {};
export const deleteAcademicInfo = async (req: Request, res: Response) => {};
*/
