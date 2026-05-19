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

export const getAcademicInfo = async (req: Request, res: Response) => {
  const { profileId } = req.query;
  if (!profileId) {
    return sendErrorResponse(res, 400, "Profile ID is required");
  }

  const academicInfo = await academicInfosService.getAcademicInfoByProfileId(
    profileId as string
  );

  if (!academicInfo) {
    return sendErrorResponse(res, 404, "Academic information not found");
  }

  return sendSuccessResponse(res, 200, "Academic information retrieved", {
    academicInfo,
  });
};

export const updateAcademicInfo = async (req: Request, res: Response) => {
  const user = req.user;
  const data = req.body;

  const updated = await academicInfosService.updateAcademicInfo(user!.id, data);

  return sendSuccessResponse(res, 200, "Academic info updated successfully", {
    academicInfo: updated,
  });
};
