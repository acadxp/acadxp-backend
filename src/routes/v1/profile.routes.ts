import express from "express";
import {
  checkEmail,
  checkUsername,
} from "../../controllers/v1/userExist.controller";
import asyncHandler from "../../lib/utils/asyncHandler";
const ProfileRoutes = express.Router();

ProfileRoutes.get("/check-username", asyncHandler(checkUsername));
ProfileRoutes.get("/check-email", asyncHandler(checkEmail));

export default ProfileRoutes;
