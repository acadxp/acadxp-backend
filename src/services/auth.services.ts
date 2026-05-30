import type { User } from "../generated/prisma/client";
import { userRepos } from "../infra/repos/user.repo";
import type { ICreateUser } from "../validation/user.schema";
import { generateAccessToken, generateRefreshToken } from "../lib/jwt";
import { sanitizeUser, type UserWithoutPassword } from "../utils/manageUser";
import { verifyPassword, hashPassword } from "../lib/managePassword";
import { HttpError } from "../error/httpError";

type DeviceInfo = {
  deviceName?: string;
  deviceType?: string;
  ipAddress?: string;
};

const registerUser = async (
  data: ICreateUser,
  device?: DeviceInfo,
): Promise<{
  userWithoutPwd: UserWithoutPassword;
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

  await userRepos.storeRefreshToken({
    userId: newUser.id,
    refreshToken,
    ...device,
  });

  return { userWithoutPwd, accessToken, refreshToken };
};

const loginUser = async (
  email: string,
  password: string,
  device?: DeviceInfo,
): Promise<{
  userWithoutPwd: UserWithoutPassword;
  accessToken: string;
  refreshToken: string;
}> => {
  const user = await userRepos.getUserByEmail(email);
  if (!user) {
    throw new HttpError(401, "Invalid email or password");
  }

  const isPasswordValid = await verifyPassword(password, user.password);

  if (!isPasswordValid) {
    throw new HttpError(401, "Invalid email or password");
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

  await userRepos.storeRefreshToken({
    userId: user.id,
    refreshToken,
    ...device,
  });

  const userWithoutPwd = sanitizeUser(user);

  return { userWithoutPwd, accessToken, refreshToken };
};

const isEmailAlreadyUsed = async (email: string): Promise<boolean> => {
  const emailExists = await userRepos.getUserByEmail(email);
  return !!emailExists;
};

const refreshAccessToken = async (refreshToken: string, device?: DeviceInfo) => {
  const decoded = await userRepos.validateRefreshToken(refreshToken);

  if (!decoded) {
    throw new HttpError(401, "Session expired. Please log in again.");
  }

  const user = await userRepos.getUserById(decoded.userId);

  if (!user) {
    throw new HttpError(401, "Session expired. Please log in again.");
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

  await userRepos.deleteRefreshToken(refreshToken);

  await userRepos.storeRefreshToken({
    userId: user.id,
    refreshToken: newRefreshToken,
    ...device,
  });

  const userWithoutPwd = sanitizeUser(user);

  return {
    userWithoutPwd,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

const getCurrentUser = async (userId: string) => {
  const user = await userRepos.getUserById(userId);
  if (!user) {
    throw new HttpError(404, "User not found");
  }

  const userWithoutPwd = sanitizeUser(user);
  const newAccessToken = generateAccessToken({
    email: user.email,
    userId: user.id,
    role: user.role,
  });

  return { userWithoutPwd, accessToken: newAccessToken };
};

const deleteRefreshToken = async (refreshToken: string) => {
  await userRepos.deleteRefreshToken(refreshToken);
};

const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
) => {
  const user = await userRepos.getUserById(userId);
  if (!user) {
    throw new HttpError(404, "User not found");
  }

  const isValid = await verifyPassword(currentPassword, user.password);
  if (!isValid) {
    throw new HttpError(400, "Current password is incorrect");
  }

  const hashed = await hashPassword(newPassword);
  await userRepos.updatePassword(userId, hashed);
};

const getActiveSessions = async (userId: string) => {
  return await userRepos.getActiveSessions(userId);
};

const revokeAllSessionsExcept = async (userId: string, currentToken: string) => {
  await userRepos.revokeAllSessionsExcept(userId, currentToken);
};

export const AuthService = {
  registerUser,
  loginUser,
  isEmailAlreadyUsed,
  refreshAccessToken,
  getCurrentUser,
  deleteRefreshToken,
  changePassword,
  getActiveSessions,
  revokeAllSessionsExcept,
};
