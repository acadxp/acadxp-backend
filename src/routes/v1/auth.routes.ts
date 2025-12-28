import express from "express";

import { createUser, loginUser } from "../../controllers/v1/auth.controller";
import asyncHandler from "../../utils/asyncHandler";

const AuthRoutes = express.Router();

AuthRoutes.post("/register", asyncHandler(createUser));
AuthRoutes.post("/login", asyncHandler(loginUser));

export default AuthRoutes;
