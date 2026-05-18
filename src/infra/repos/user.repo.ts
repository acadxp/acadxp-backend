import prisma from "../../lib/db";
import { v4 as uuidv4 } from "uuid";
import { hashPassword } from "../../lib/managePassword";
import type { ICreateUser } from "../../validation/user.schema";
import type { IStoreRefreshToken } from "../../types/profile.types";
import { verifyToken } from "../../lib/jwt";
import { HttpError } from "../../error/httpError";

const createUser = async (data: ICreateUser) => {
  const hashedPwd = await hashPassword(data.password);

  return await prisma.user.create({
    data: {
      id: uuidv4(),
      name: data.name,
      password: hashedPwd,
      email: data.email,
    },
  });
};

const getUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

const storeRefreshToken = async (data: IStoreRefreshToken) => {
  return await prisma.account.create({
    data: {
      id: uuidv4(),
      userId: data.userId,
      refreshToken: data.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });
};

const getUserById = async (userId: string) => {
  return await prisma.user.findUnique({
    where: { id: userId },
  });
};

const validateRefreshToken = async (refreshToken: string) => {
  const secret = process.env.JWT_REFRESH_SECRET!;
  const decoded = verifyToken(refreshToken, secret);

  // check if token exists in DB
  const account = await prisma.account.findFirst({
    where: { refreshToken, isRevoked: false },
  });

  if (!account) {
    throw new HttpError(401, "Session expired. Please log in again.");
  }
  return decoded;
};

const revokeRefreshToken = async (userId: string) => {
  return await prisma.account.updateMany({
    where: { userId },
    data: { isRevoked: true },
  });
};

const deleteRefreshToken = async (refreshToken: string) => {
  return await prisma.account.deleteMany({
    where: { refreshToken },
  });
};

export const userRepos = {
  createUser,
  storeRefreshToken,
  getUserById,
  getUserByEmail,
  validateRefreshToken,
  revokeRefreshToken,
  deleteRefreshToken,
};
