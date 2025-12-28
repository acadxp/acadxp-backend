import express from "express";

import {
  createUser,
  loginUser,
  checkEmail,
} from "../../controllers/v1/auth.controller";
import asyncHandler from "../../utils/asyncHandler";

const AuthRoutes = express.Router();

AuthRoutes.post("/register", asyncHandler(createUser));
AuthRoutes.post("/login", asyncHandler(loginUser));
AuthRoutes.get("/check-email", asyncHandler(checkEmail));

export default AuthRoutes;
