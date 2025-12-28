import express from "express";

import { createUser, getUser } from "../../controllers/v1/auth.controller";
import asyncHandler from "../../utils/asyncHandler";

const AuthRoutes = express.Router();

AuthRoutes.post("/register", asyncHandler(createUser));
AuthRoutes.post("/login", asyncHandler(getUser));

export default AuthRoutes;
