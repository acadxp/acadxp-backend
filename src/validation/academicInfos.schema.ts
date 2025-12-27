import * as z from "zod";

export const createAcademicInfoSchema = z.object({
  profileId: z.string(),
  institution: z.string().min(1).max(255).optional(),
  degree: z
    .enum(["BACHELORS", "MASTERS", "PHD", "DIPLOMA", "CERTIFICATE"])
    .optional(),
  major: z.string().min(1).max(255).optional(),
  semester: z.string().min(1).max(100).optional(),
  enrollmentStatus: z.enum([
    "FULL_TIME",
    "PART_TIME",
    "SUSPENDED",
    "GRADUATED",
  ]),
  graduationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
    .optional(),
  enrolledDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
    .optional(),
});
