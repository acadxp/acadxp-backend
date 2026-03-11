import * as z from "zod";

// Individual rule schema
export const RuleSchema = z.object({
  type: z.enum(["COUNT", "SCORE", "COMPLETION", "SUBMISSION", "GRADE"]),
  target: z.string(),
  operator: z.enum(["GTE", "GT", "EQ"]),
  value: z.number(),
  metadata: z
    .object({
      courseId: z.string(),
    })
    .optional(),
});

// Criteria schema with multiple rules and logic
export const CriteriaSchema = z.object({
  logic: z.enum(["AND", "OR"]).default("AND"),
  rules: z.array(RuleSchema).min(1, "At least one rule is required"),
});

export const aiChallengeBluePrintSchema = z.object({
  title: z.string().min(10, "Title is required"),
  description: z.string().min(10, "Description is required"),
  difficulty: z.enum(["easy", "medium", "hard"], {
    message: "Difficulty level must be one of 'easy', 'medium', or 'hard'",
  }),
  xpReward: z.number().int().positive("XP reward must be a positive integer"),
  criteria: CriteriaSchema,
});

export const aiSkillBluePrintSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(10, "Description is required"),
  xpValue: z.number().int().positive("XP value must be a positive integer"),
  iconPrompt: z.string().min(10, "Icon prompt is required"),
  criteria: CriteriaSchema.optional(),
});

export const aiBadgeBluePrintSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(10, "Description is required"),
  xpValue: z.number().int().positive("XP value must be a positive integer"),
  iconPrompt: z.string().min(10, "Icon prompt is required"),
  criteria: CriteriaSchema.optional(),
});

export const aiBluePrintSchema = z.object({
  skills: z
    .array(aiSkillBluePrintSchema)
    .min(3, "At least three skill is required"),
  challenges: z
    .array(aiChallengeBluePrintSchema)
    .min(3, "At least three challenge is required"),
  badges: z
    .array(aiBadgeBluePrintSchema)
    .min(3, "At least three badge is required"),
});

// Type inference
export type aiBluePrintSchema = z.infer<typeof aiBluePrintSchema>;
