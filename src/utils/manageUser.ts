import type { User } from "../generated/prisma/client";

export type UserWithoutPassword = Omit<User, "password">;

export const sanitizeUser = (user: User): UserWithoutPassword => {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
};
