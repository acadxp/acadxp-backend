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

const RuleSchema = z.object({
  type: z.enum(["COMPLETION", "SCORE", "SUBMISSION", "GRADE", "COUNT"]),
  target: z.string(),
  operator: z.enum(["EQ", "GTE", "LTE", "GT", "LT"]),
  value: z.number(),
});

const CriteriaSchema = z.object({
  logic: z.enum(["AND", "OR"]),
  rules: z.array(RuleSchema),
});

const GeneratedChallengeSchema = z.object({
  title: z.string(),
  description: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  xpReward: z.number().positive(),
  criteria: CriteriaSchema,
});

const GeneratedSkillSchema = z.object({
  title: z.string(),
  description: z.string(),
  xpValue: z.number().positive(),
  iconPrompt: z.string().nullable(),
  criteria: CriteriaSchema,
});

const GeneratedBadgeSchema = z.object({
  title: z.string(),
  description: z.string(),
  xpValue: z.number().positive(),
  iconPrompt: z.string().nullable(),
  criteria: CriteriaSchema,
});

export const confirmBlueprintSchema = z.object({
  confirmPayload: z.object({
    selectedSkills: z.array(GeneratedSkillSchema),
    selectedChallenges: z.array(GeneratedChallengeSchema),
    selectedBadges: z.array(GeneratedBadgeSchema).optional(),
  }),
});
