import type { User } from "@prisma/client";
import { userRepos } from "../infra/repos/user.repo";
import type { ICreateUser } from "../validation/user.schema";
import { generateAccessToken, generateRefreshToken } from "../lib/jwt";
import { sanitizeUser } from "../utils/manageUser";

// Register a new user
const registerUser = async (data: ICreateUser): Promise<User> => {
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
const getUser = async (userId: string): Promise<User | null> => {};

export const AuthService = { registerUser, getUser };
