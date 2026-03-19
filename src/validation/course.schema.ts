import * as z from "zod";

export const createCourseSchema = z.object({
  courseCode: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  xp: z.number().positive(),
  department: z.enum([
    "SCIENCE",
    "ARTS",
    "COMMERCE",
    "EDUCATION",
    "ENGINEERING",
    "MEDICINE",
    "LAW",
    "TECHNOLOGY",
    "OTHER",
  ]),
});

export const searchCourseSchema = z.object({
  courseCode: z.string(),
  title: z.string(),
});

export const createCourseIdSchema = z.object({
  courseId: z.string(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
