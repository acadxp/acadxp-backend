import * as z from "zod";

// ✅ Flat, clean enums — no custom messages
export const RuleTypeEnum = z.enum([
  "COUNT",
  "SCORE",
  "COMPLETION",
  "SUBMISSION",
  "GRADE",
]);
export const OperatorEnum = z.enum(["GTE", "GT", "EQ"]);
export const LogicEnum = z.enum(["AND", "OR"]);
export const DifficultyEnum = z.enum(["easy", "medium", "hard"]);

// ✅ Rule schema — removed optional metadata to keep it simple for AI
export const RuleSchema = z.object({
  type: RuleTypeEnum,
  target: z.string(),
  operator: OperatorEnum,
  value: z.number(),
});

// ✅ Criteria schema — removed .default() as Mistral doesn't handle it well
export const CriteriaSchema = z.object({
  logic: LogicEnum,
  rules: z.array(RuleSchema),
});

// ✅ Skill schema — criteria is required (AI struggles with optional nested objects)
export const aiSkillBluePrintSchema = z.object({
  title: z.string(),
  description: z.string(),
  xpValue: z.number(),
  iconPrompt: z.string(),
  criteria: CriteriaSchema,
});

// ✅ Challenge schema
export const aiChallengeBluePrintSchema = z.object({
  title: z.string(),
  description: z.string(),
  difficulty: DifficultyEnum,
  xpReward: z.number(),
  criteria: CriteriaSchema,
});

// ✅ Badge schema
export const aiBadgeBluePrintSchema = z.object({
  title: z.string(),
  description: z.string(),
  xpValue: z.number(),
  iconPrompt: z.string(),
  criteria: CriteriaSchema,
});

// ✅ Root blueprint schema — the one passed to responseFormat
export const aiBluePrintSchema = z.object({
  skills: z.array(aiSkillBluePrintSchema),
  challenges: z.array(aiChallengeBluePrintSchema),
  badges: z.array(aiBadgeBluePrintSchema),
});

// ✅ Inferred types
export type Rule = z.infer<typeof RuleSchema>;
export type Criteria = z.infer<typeof CriteriaSchema>;
export type AiSkillBluePrint = z.infer<typeof aiSkillBluePrintSchema>;
export type AiChallengeBluePrint = z.infer<typeof aiChallengeBluePrintSchema>;
export type AiBadgeBluePrint = z.infer<typeof aiBadgeBluePrintSchema>;
export type AiBluePrint = z.infer<typeof aiBluePrintSchema>;
