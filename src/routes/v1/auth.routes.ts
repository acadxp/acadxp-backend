import express from "express";

import {
  createUser,
  loginUser,
  checkEmail,
  refreshToken,
} from "../../controllers/v1/auth.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import asyncHandler from "../../utils/asyncHandler";

const AuthRoutes = express.Router();

AuthRoutes.post("/register", asyncHandler(createUser));
AuthRoutes.post("/login", asyncHandler(loginUser));
AuthRoutes.get("/check-email", asyncHandler(checkEmail));
AuthRoutes.post("/refresh-token", asyncHandler(refreshToken));
// AuthRoutes.get("/me", asyncHandler(authMiddleware), asyncHandler(getCurrentUser));

export default AuthRoutes;
