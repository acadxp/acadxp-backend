import express from "express";
import {
  getUserProfile,
  createUserProfile,
  checkUsername,
} from "../../controllers/v1/profile.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import asyncHandler from "../../utils/asyncHandler";
import { resolveSync } from "bun";
const ProfileRoutes = express.Router();

ProfileRoutes.get("/profile/check-username", asyncHandler(checkUsername));
resolveSync;
ProfileRoutes.get(
  "/profile",
  // asyncHandler(authMiddleware),
  asyncHandler(getUserProfile)
);
ProfileRoutes.post("/profile/create", asyncHandler(createUserProfile));

export default ProfileRoutes;
