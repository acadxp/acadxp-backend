import type {
  RuleType,
  Operator,
  LogicGate,
  Difficulty,
  Rule,
  Criteria,
  Skill,
  Challenge,
  Badge,
  UsageStats,
  GamificationData,
  ParseResult,
  RawConversationResponse,
  RawGamificationData,
} from "../types/aiResponse.type";

// ─── Constants ────────────────────────────────────────────────────────────────

const VALID_RULE_TYPES: RuleType[] = [
  "COMPLETION",
  "SCORE",
  "SUBMISSION",
  "GRADE",
  "COUNT",
];
const VALID_OPERATORS: Operator[] = ["EQ", "GTE", "LTE", "GT", "LT"];
const VALID_LOGIC: LogicGate[] = ["AND", "OR"];
const VALID_DIFFICULTY: Difficulty[] = ["easy", "medium", "hard"];

// ─── Guards ───────────────────────────────────────────────────────────────────

function isRuleType(value: string): value is RuleType {
  return (VALID_RULE_TYPES as string[]).includes(value);
}

function isOperator(value: string): value is Operator {
  return (VALID_OPERATORS as string[]).includes(value);
}

function isLogicGate(value: string): value is LogicGate {
  return (VALID_LOGIC as string[]).includes(value);
}

function isDifficulty(value: string): value is Difficulty {
  return (VALID_DIFFICULTY as string[]).includes(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// ─── Low-level parsers ────────────────────────────────────────────────────────

function parseRule(raw: unknown, index: number): Rule {
  if (!isRecord(raw)) throw new Error(`Rule[${index}] must be an object`);

  const type = String(raw["type"] ?? "").toUpperCase();
  const operator = String(raw["operator"] ?? "").toUpperCase();
  const target = String(raw["target"] ?? "").trim();
  const value = Number(raw["value"]);

  if (!isRuleType(type))
    throw new Error(
      `Rule[${index}] invalid type "${type}". Expected: ${VALID_RULE_TYPES.join(", ")}`,
    );
  if (!isOperator(operator))
    throw new Error(
      `Rule[${index}] invalid operator "${operator}". Expected: ${VALID_OPERATORS.join(", ")}`,
    );
  if (!target) throw new Error(`Rule[${index}] target is required`);
  if (isNaN(value))
    throw new Error(
      `Rule[${index}] value must be a number, got "${raw["value"]}"`,
    );

  return { type, target, operator, value };
}

function parseCriteria(raw: unknown, path: string): Criteria {
  if (!isRecord(raw)) throw new Error(`${path}.criteria must be an object`);

  const logic = String(raw["logic"] ?? "AND").toUpperCase();
  if (!isLogicGate(logic))
    throw new Error(`${path}.criteria.logic must be AND or OR`);

  if (!Array.isArray(raw["rules"]) || raw["rules"].length === 0)
    throw new Error(`${path}.criteria.rules must be a non-empty array`);

  return {
    logic,
    rules: (raw["rules"] as unknown[]).map((r, i) => parseRule(r, i)),
  };
}

// ─── Item parsers ─────────────────────────────────────────────────────────────

function parseSkill(raw: unknown, index: number): Skill {
  const path = `skills[${index}]`;
  if (!isRecord(raw)) throw new Error(`${path} must be an object`);

  const title = String(raw["title"] ?? "").trim();
  const description = String(raw["description"] ?? "").trim();
  const xpValue = Number(raw["xpValue"]);
  const iconPrompt =
    raw["iconPrompt"] != null ? String(raw["iconPrompt"]).trim() : null;

  if (!title) throw new Error(`${path}.title is required`);
  if (!description) throw new Error(`${path}.description is required`);
  if (isNaN(xpValue) || xpValue < 0)
    throw new Error(`${path}.xpValue must be a non-negative number`);

  return {
    title,
    description,
    xpValue,
    iconPrompt,
    criteria: parseCriteria(raw["criteria"], path),
  };
}

function parseChallenge(raw: unknown, index: number): Challenge {
  const path = `challenges[${index}]`;
  if (!isRecord(raw)) throw new Error(`${path} must be an object`);

  const title = String(raw["title"] ?? "").trim();
  const description = String(raw["description"] ?? "").trim();
  const xpReward = Number(raw["xpReward"]);
  const difficulty = String(raw["difficulty"] ?? "").toLowerCase();

  if (!title) throw new Error(`${path}.title is required`);
  if (!description) throw new Error(`${path}.description is required`);
  if (isNaN(xpReward) || xpReward < 0)
    throw new Error(`${path}.xpReward must be a non-negative number`);
  if (!isDifficulty(difficulty))
    throw new Error(
      `${path}.difficulty must be one of: ${VALID_DIFFICULTY.join(", ")}`,
    );

  return {
    title,
    description,
    difficulty,
    xpReward,
    criteria: parseCriteria(raw["criteria"], path),
  };
}

function parseBadge(raw: unknown, index: number): Badge {
  const path = `badges[${index}]`;
  if (!isRecord(raw)) throw new Error(`${path} must be an object`);

  const title = String(raw["title"] ?? "").trim();
  const description = String(raw["description"] ?? "").trim();
  const xpValue = Number(raw["xpValue"]);
  const iconPrompt =
    raw["iconPrompt"] != null ? String(raw["iconPrompt"]).trim() : null;

  if (!title) throw new Error(`${path}.title is required`);
  if (!description) throw new Error(`${path}.description is required`);
  if (isNaN(xpValue) || xpValue < 0)
    throw new Error(`${path}.xpValue must be a non-negative number`);

  return {
    title,
    description,
    xpValue,
    iconPrompt,
    criteria: parseCriteria(raw["criteria"], path),
  };
}

// ─── Conversation response extractor ─────────────────────────────────────────

function extractFromConversationResponse(response: RawConversationResponse): {
  gamificationRaw: RawGamificationData;
  sourceModel: string;
  conversationId: string | null;
  usage: UsageStats | null;
} {
  if (response.object !== "conversation.response")
    throw new Error(`Unexpected response object type: "${response.object}"`);

  if (!Array.isArray(response.outputs) || response.outputs.length === 0)
    throw new Error("Response has no outputs");

  const output = response.outputs.find((o) => o.type === "message.output");
  if (!output) throw new Error('No output of type "message.output" found');

  if (typeof output.content !== "string" || !output.content.trim())
    throw new Error("Output content is empty or not a string");

  let gamificationRaw: RawGamificationData;
  try {
    gamificationRaw = JSON.parse(output.content.trim()) as RawGamificationData;
  } catch {
    throw new Error("Output content is not valid JSON");
  }

  return {
    gamificationRaw,
    sourceModel: output.model ?? null,
    conversationId: response.conversationId ?? null,
    usage: response.usage ?? null,
  };
}

// ─── Main parser ──────────────────────────────────────────────────────────────

/**
 * Parses an AI model conversation response into structured, validated gamification data.
 *
 * Accepts two input shapes:
 *  1. A full conversation response object `{ object: "conversation.response", outputs: [...] }`
 *  2. A plain gamification object or JSON string `{ skills: [...], challenges: [...], badges: [...] }`
 *
 * @param input - Raw AI response object or JSON string
 * @returns ParseResult with typed GamificationData on success, or error list on failure
 *
 * @example
 * const result = parseAIResponse(rawApiResponse);
 * if (result.success) {
 *   console.log(result.data.skills);
 *   console.log(result.data.meta.totalXPAvailable);
 * } else {
 *   console.error(result.errors);
 * }
 */
export function parseAIResponse(input: unknown): ParseResult {
  const errors: string[] = [];

  // 1. Accept JSON strings
  let raw: unknown = input;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return {
        success: false,
        data: null,
        errors: ["Invalid JSON string: could not parse"],
      };
    }
  }

  if (!isRecord(raw))
    return {
      success: false,
      data: null,
      errors: ["Input must be a JSON object or JSON string"],
    };

  // 2. Detect & unwrap conversation response envelope
  let gamificationRaw: RawGamificationData = raw as RawGamificationData;
  let sourceModel: string = "unknown";
  let conversationId: string | null = null;
  let usage: UsageStats | null = null;

  if (raw["object"] === "conversation.response") {
    try {
      const extracted = extractFromConversationResponse(
        raw as RawConversationResponse,
      );
      gamificationRaw = extracted.gamificationRaw;
      sourceModel = extracted.sourceModel || "unknown";
      conversationId = extracted.conversationId;
      usage = extracted.usage;
    } catch (err) {
      return {
        success: false,
        data: null,
        errors: [`Failed to extract content: ${(err as Error).message}`],
      };
    }
  }

  // 3. Parse each collection
  const skills: Skill[] = [];
  const challenges: Challenge[] = [];
  const badges: Badge[] = [];

  (gamificationRaw.skills ?? []).forEach((item, i) => {
    try {
      skills.push(parseSkill(item, i));
    } catch (err) {
      errors.push((err as Error).message);
    }
  });

  (gamificationRaw.challenges ?? []).forEach((item, i) => {
    try {
      challenges.push(parseChallenge(item, i));
    } catch (err) {
      errors.push((err as Error).message);
    }
  });

  (gamificationRaw.badges ?? []).forEach((item, i) => {
    try {
      badges.push(parseBadge(item, i));
    } catch (err) {
      errors.push((err as Error).message);
    }
  });

  // 4. Compute meta
  const totalXP =
    skills.reduce((s, x) => s + x.xpValue, 0) +
    challenges.reduce((s, x) => s + x.xpReward, 0) +
    badges.reduce((s, x) => s + x.xpValue, 0);

  const data: GamificationData = {
    skills,
    challenges,
    badges,
    meta: {
      totalSkills: skills.length,
      totalChallenges: challenges.length,
      totalBadges: badges.length,
      totalXPAvailable: totalXP,
      sourceModel,
      conversationId,
      usage,
      parsedAt: new Date().toISOString(),
    },
  };

  if (errors.length > 0) {
    // Partial success — return data with errors
    return { success: false, data: null, errors };
  }

  return { success: true, data, errors: [] };
}
