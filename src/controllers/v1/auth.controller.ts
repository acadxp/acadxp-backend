import { sendSuccessResponse } from "../../utils/http-response";
import type { Request, Response } from "express";
import { AuthService } from "../../services/auth.services";
import { createUserSchema } from "../../validation/user.schema";
import type { ICreateUser } from "../../validation/user.schema";

export const createUser = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  const data: ICreateUser = createUserSchema.parse({
    name,
    email,
    password,
  });

  const { userWithoutPwd, accessToken, refreshToken } =
    await AuthService.registerUser(data);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return sendSuccessResponse(
    res,
    201,
    "User registered successfully",
    userWithoutPwd
  );
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const { userWithoutPwd, accessToken } = await AuthService.loginUser(
    email,
    password
  );

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  return sendSuccessResponse(
    res,
    200,
    "User logged in successfully",
    userWithoutPwd
  );
};
