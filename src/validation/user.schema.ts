import * as z from "zod";
export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(8),
});

export type ICreateUser = z.infer<typeof createUserSchema>;

export const createEmailSchema = z.object({
  email: z.email("Invalid email address"),
});
