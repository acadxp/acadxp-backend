// ─── Types ────────────────────────────────────────────────────────────────────

export type RuleType =
  | "COMPLETION"
  | "SCORE"
  | "SUBMISSION"
  | "GRADE"
  | "COUNT";
export type Operator = "EQ" | "GTE" | "LTE" | "GT" | "LT";
export type LogicGate = "AND" | "OR";
export type Difficulty = "easy" | "medium" | "hard";

export interface Rule {
  type: RuleType;
  target: string;
  operator: Operator;
  value: number;
}

export interface Criteria {
  logic: LogicGate;
  rules: Rule[];
}

export interface Skill {
  title: string;
  description: string;
  xpValue: number;
  iconPrompt: string | null;
  criteria: Criteria;
}

export interface Challenge {
  title: string;
  description: string;
  difficulty: Difficulty;
  xpReward: number;
  criteria: Criteria;
}

export interface Badge {
  title: string;
  description: string;
  xpValue: number;
  iconPrompt: string | null;
  criteria: Criteria;
}

export interface UsageStats {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface Meta {
  totalSkills: number;
  totalChallenges: number;
  totalBadges: number;
  totalXPAvailable: number;
  sourceModel: string;
  conversationId: string | null;
  usage: UsageStats | null;
  parsedAt: string;
}

export interface GamificationData {
  skills: Skill[];
  challenges: Challenge[];
  badges: Badge[];
  meta: Meta;
}

export interface ParseSuccess {
  success: true;
  data: GamificationData;
  errors: [];
}

export interface ParseFailure {
  success: false;
  data: null;
  errors: string[];
}

export type ParseResult = ParseSuccess | ParseFailure;

// ─── Raw input shapes (unvalidated) ──────────────────────────────────────────

export interface RawOutput {
  object?: string;
  type?: string;
  id?: string;
  model?: string;
  role?: string;
  content?: unknown;
  createdAt?: string;
  completedAt?: string;
}

export interface RawConversationResponse {
  object?: string;
  conversationId?: string;
  outputs?: RawOutput[];
  usage?: UsageStats;
}

export interface RawGamificationData {
  skills?: unknown[];
  challenges?: unknown[];
  badges?: unknown[];
}

export type CreateBlueprintInput = {
  courseId: string;
  generatedChallenges: object;
  generatedSkills: object;
  generatedBadges: object;
  aiModel: string;
  aiVersion?: string;
  promptVersion?: string;
};

export type AIBlueprintStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "PARTIALLY_ACCEPTED";
