import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import asyncHandler from "../../utils/asyncHandler";
import { createAcademicInfo } from "../../controllers/v1/academicInfos.controller";

const AcademicInfosRoutes = express.Router();

// AcademicInfosRoutes.get("/academic-info/me", asyncHandler(authMiddleware), asyncHandler(getAcademicInfo));
AcademicInfosRoutes.post("/create", asyncHandler(createAcademicInfo));

export default AcademicInfosRoutes;
