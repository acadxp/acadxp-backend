import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import asyncHandler from "../../utils/asyncHandler";
import {
  createAcademicInfo,
  getAcademicInfo,
  updateAcademicInfo,
} from "../../controllers/v1/academicInfos.controller";

const AcademicInfosRoutes = express.Router();

AcademicInfosRoutes.get(
  "/me",
  asyncHandler(authMiddleware),
  asyncHandler(getAcademicInfo)
);
AcademicInfosRoutes.post("/create", asyncHandler(createAcademicInfo));
AcademicInfosRoutes.patch(
  "/me",
  asyncHandler(authMiddleware),
  asyncHandler(updateAcademicInfo),
);

export default AcademicInfosRoutes;
