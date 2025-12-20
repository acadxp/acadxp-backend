import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "../generated/prisma/client";
import { betterAuth } from "better-auth";

const connectionString = `${process.env.DEV_DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });

export const auth = betterAuth({
  // baseURL: process.env.PROD_BETTER_AUTH_URL!,
  baseURL: process.env.DEV_BETTER_AUTH_URL!,
  basePath: "/api/v1/auth",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: process.env.BETTER_AUTH_SECRET!,

  // Email & Password Auth
  emailAndPassword: {
    enabled: true,
    autoSignUpEmail: false, // Don't auto-create user, allow custom logic
  },

  // Sessions config
  session: {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes cache
    },
  },

  // Callbacks for custom logic
  //   callbacks: {
  //     async signUpEmail({ user, email }) {
  //       // Custom logic after email signup
  //       return user;
  //     },
  //     async signInEmail({ user }) {
  //       // Custom logic after email signin
  //       return user;
  //     },
  //   },

  // Trust host in development
  trustHost: true,
});

export default auth;
