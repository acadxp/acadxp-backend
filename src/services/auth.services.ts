import type { User } from "@prisma/client";
import { userRepos } from "../infra/repos/user.repo";
import type { ICreateUser } from "../validation/user.schema";
import { generateAccessToken, generateRefreshToken } from "../lib/jwt";
import { sanitizeUser } from "../utils/manageUser";
import { verifyPassword } from "../lib/managePassword";

// Register a new user
const registerUser = async (
  data: ICreateUser
): Promise<{
  userWithoutPwd: any;
  accessToken: string;
  refreshToken: string;
}> => {
  const newUser = await userRepos.createUser(data);

  const userWithoutPwd = sanitizeUser(newUser);

  const accessToken = generateAccessToken({
    email: newUser.email,
    userId: newUser.id,
    role: newUser.role,
  });

  const refreshToken = generateRefreshToken({
    email: newUser.email,
    userId: newUser.id,
    role: newUser.role,
  });

  // store refresh token in DB
  await userRepos.storeRefreshToken({
    userId: newUser.id,
    refreshToken,
  });

  return { userWithoutPwd, accessToken, refreshToken };
};

// Get user by ID
const loginUser = async (email: string, password: string): Promise<User> => {
  const user = await userRepos.getUserByEmail(email);
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await verifyPassword(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const accessToken = generateAccessToken({
    email: user.email,
    userId: user.id,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    email: user.email,
    userId: user.id,
    role: user.role,
  });

  // revoke existing refresh tokens
  await userRepos.revokeRefreshToken(user.id);

  // store new refresh token in DB
  await userRepos.storeRefreshToken({
    userId: user.id,
    refreshToken,
  });

  const userWithoutPwd = sanitizeUser(user);

  return { userWithoutPwd, accessToken, refreshToken };
};

// check if email is already used
const isEmailAlreadyUsed = async (email: string): Promise<boolean> => {
  const emailExists = await userRepos.getUserByEmail(email);
  return !!emailExists;
};

// Refresh access token using refresh token
const refreshAccessToken = async (refreshToken: string) => {
  // verify refresh token
  const decoded = await userRepos.validateRefreshToken(refreshToken);

  if (!decoded) {
    throw new Error("Invalid or expired refresh token");
  }

  const user = await userRepos.getUserById(decoded.userId);

  if (!user) {
    throw new Error("User not found");
  }

  const newAccessToken = generateAccessToken({
    email: user.email,
    userId: user.id,
    role: user.role,
  });

  const newRefreshToken = generateRefreshToken({
    email: user.email,
    userId: user.id,
    role: user.role,
  });

  // revoke existing refresh tokens
  await userRepos.revokeRefreshToken(user.id);

  // store new refresh token in DB
  await userRepos.storeRefreshToken({
    userId: user.id,
    refreshToken: newRefreshToken,
  });

  const userWithoutPwd = sanitizeUser(user);

  return {
    userWithoutPwd,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

// Get current user (session check)
const getCurrentUser = async (userId: string) => {
  const user = await userRepos.getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const userWithoutPwd = sanitizeUser(user);
  const newAccessToken = generateAccessToken({
    email: user.email,
    userId: user.id,
    role: user.role,
  });

  return { userWithoutPwd, accessToken: newAccessToken };
};

// Delete refresh token (logout)
const deleteRefreshToken = async (refreshToken: string) => {
  await userRepos.deleteRefreshToken(refreshToken);
};

export const AuthService = {
  registerUser,
  loginUser,
  isEmailAlreadyUsed,
  refreshAccessToken,
  getCurrentUser,
  deleteRefreshToken,
};
