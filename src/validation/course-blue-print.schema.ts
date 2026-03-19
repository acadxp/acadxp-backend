import * as z from "zod";

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

export const RuleSchema = z.object({
  type: RuleTypeEnum,
  target: z.string(),
  operator: OperatorEnum,
  value: z.number(),
});

export const CriteriaSchema = z.object({
  logic: LogicEnum,
  rules: z.array(RuleSchema),
});

export const aiSkillBluePrintSchema = z.object({
  title: z.string(),
  description: z.string(),
  xpValue: z.number(),
  iconPrompt: z.string(),
  criteria: CriteriaSchema,
});

export const aiChallengeBluePrintSchema = z.object({
  title: z.string(),
  description: z.string(),
  difficulty: DifficultyEnum,
  xpReward: z.number(),
  criteria: CriteriaSchema,
});

export const aiBadgeBluePrintSchema = z.object({
  title: z.string(),
  description: z.string(),
  xpValue: z.number(),
  iconPrompt: z.string(),
  criteria: CriteriaSchema,
});

export const aiBluePrintSchema = z.object({
  skills: z.array(aiSkillBluePrintSchema),
  challenges: z.array(aiChallengeBluePrintSchema),
  badges: z.array(aiBadgeBluePrintSchema),
});

export type Rule = z.infer<typeof RuleSchema>;
export type Criteria = z.infer<typeof CriteriaSchema>;
export type AiSkillBluePrint = z.infer<typeof aiSkillBluePrintSchema>;
export type AiChallengeBluePrint = z.infer<typeof aiChallengeBluePrintSchema>;
export type AiBadgeBluePrint = z.infer<typeof aiBadgeBluePrintSchema>;
export type AiBluePrint = z.infer<typeof aiBluePrintSchema>;
