import express from "express";
import {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  updateUserName,
  checkUsername,
} from "../../controllers/v1/profile.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import asyncHandler from "../../utils/asyncHandler";

const ProfileRoutes = express.Router();

ProfileRoutes.get("/profile/check-username", asyncHandler(checkUsername));

ProfileRoutes.get(
  "/profile",
  asyncHandler(authMiddleware),
  asyncHandler(getUserProfile),
);
ProfileRoutes.post(
  "/profile/create",
  asyncHandler(authMiddleware),
  asyncHandler(createUserProfile),
);
ProfileRoutes.patch(
  "/profile",
  asyncHandler(authMiddleware),
  asyncHandler(updateUserProfile),
);
ProfileRoutes.patch(
  "/name",
  asyncHandler(authMiddleware),
  asyncHandler(updateUserName),
);

export default ProfileRoutes;
