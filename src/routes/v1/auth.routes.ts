import express from "express";

import {
  createUser,
  loginUser,
  checkEmail,
  refreshToken,
  logoutUser,
  changePassword,
  getSessions,
  revokeAllSessions,
} from "../../controllers/v1/auth.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import asyncHandler from "../../utils/asyncHandler";

const AuthRoutes = express.Router();

AuthRoutes.post("/register", asyncHandler(createUser));
AuthRoutes.post("/login", asyncHandler(loginUser));
AuthRoutes.get("/check-email", asyncHandler(checkEmail));
AuthRoutes.post("/refresh-token", asyncHandler(refreshToken));
AuthRoutes.post("/logout", asyncHandler(logoutUser));
AuthRoutes.post("/change-password", asyncHandler(authMiddleware), asyncHandler(changePassword));
AuthRoutes.get("/sessions", asyncHandler(authMiddleware), asyncHandler(getSessions));
AuthRoutes.post("/sessions/revoke-all", asyncHandler(authMiddleware), asyncHandler(revokeAllSessions));

export default AuthRoutes;
