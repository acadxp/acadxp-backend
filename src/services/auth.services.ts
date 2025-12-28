import type { User } from "@prisma/client";
import { userRepos } from "../infra/repos/user.repo";
import type { ICreateUser } from "../validation/user.schema";
import { generateAccessToken, generateRefreshToken } from "../lib/jwt";
import { sanitizeUser } from "../utils/manageUser";
import { verifyPassword } from "../lib/managePassword";

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

  const userWithoutPwd = sanitizeUser(user);

  return { userWithoutPwd, accessToken };
};

// check if email is already used
const isEmailAlreadyUsed = async (email: string): Promise<boolean> => {
  const emailExists = await userRepos.getUserByEmail(email);
  return !!emailExists;
};

export const AuthService = { registerUser, loginUser, isEmailAlreadyUsed };
