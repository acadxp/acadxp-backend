export type CourseInfo = {
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  academicLevel: string;
};

export type ChallengeDifficulty = "EASY" | "MEDIUM" | "HARD" | "EXPERT";
export type ProficiencyLevel =
  | "BEGINNER"
  | "INTERMEDIATE"
  | "ADVANCED"
  | "EXPERT";

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

export interface GeneratedSkill {
  title: string;
  description: string;
  xpValue: number;
  iconPrompt: string | null;
  criteria: Criteria;
}

export interface GeneratedChallenge {
  title: string;
  description: string;
  difficulty: Difficulty;
  xpReward: number;
  criteria: Criteria;
}

export interface GeneratedBadge {
  title: string;
  description: string;
  xpValue: number;
  iconPrompt: string | null;
  criteria: Criteria;
}

export interface GamificationData {
  skills: GeneratedSkill[];
  challenges: GeneratedChallenge[];
  badges: GeneratedBadge[];
}

// What the client sends when confirming selections
export interface BlueprintConfirmPayload {
  selectedSkills: GeneratedSkill[];
  selectedChallenges: GeneratedChallenge[];
  selectedBadges?: GeneratedBadge[];
}
