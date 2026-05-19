import prisma from "../../lib/db";
import type { Prisma } from "../../generated/prisma/client";

const findByUserId = async (userId: string) => {
  return await prisma.apiKey.findMany({
    where: { userId, isActive: true },
    orderBy: { createdAt: "desc" },
  });
};

const create = async (data: Prisma.ApiKeyUncheckedCreateInput) => {
  return await prisma.apiKey.create({ data });
};

const softDelete = async (id: string, userId: string) => {
  return await prisma.apiKey.update({
    where: { id, userId },
    data: { isActive: false },
  });
};

export const apiKeyRepo = {
  findByUserId,
  create,
  softDelete,
};
