import * as z from "zod";

export const createProfileSchema = z.object({
  userId: z.string(),
  username: z.string().min(3, "Username must be at least 3 characters long"),
  bio: z
    .string()
    .max(160, "Bio must be at most 160 characters long")
    .optional(),
  location: z
    .string()
    .max(100, "Location must be at most 100 characters long")
    .optional(),
  socials: z.record(z.string(), z.url("Invalid URL")).optional(),
});

export const createUsernameSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
});
