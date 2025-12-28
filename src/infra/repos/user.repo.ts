import prisma from "../../lib/db";
import { v4 as uuidv4 } from "uuid";
import { hashPassword } from "../../lib/managePassword";
import type { ICreateUser } from "../../validation/user.schema";
import type { IStoreRefreshToken } from "../../types/profile.types";

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

const storeRefreshToken = async (data: IStoreRefreshToken) => {
  return await prisma.account.create({
    data: {
      id: uuidv4(),
      userId: data.userId,
      refreshToken: data.refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });
};

export const userRepos = { createUser, storeRefreshToken };
