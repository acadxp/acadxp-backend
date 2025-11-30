import express from "express";
import {
  createUser,
  loginUser,
} from "../../controllers/v1/auth/auth.controller";
import {
  checkUsername,
  checkEmail,
} from "../../controllers/v1/auth/userExist.controller";
import asyncHandler from "../../utils/asyncHandler";

const AuthRoutes = express.Router();

AuthRoutes.post("/signup", asyncHandler(createUser));
AuthRoutes.post("/login", asyncHandler(loginUser));
AuthRoutes.get("/check-username", asyncHandler(checkUsername));
AuthRoutes.get("/check-email", asyncHandler(checkEmail));

export default AuthRoutes;
