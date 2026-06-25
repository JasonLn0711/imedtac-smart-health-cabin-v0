import type { InternalScore, Phq9ItemKey, Phq9RawAnswers, SafetyFlags } from "@shc/contracts";

export const PHQ9_REQUIRED_ITEMS: Phq9ItemKey[] = [
  "phq9_01",
  "phq9_02",
  "phq9_03",
  "phq9_04",
  "phq9_05",
  "phq9_06",
  "phq9_07",
  "phq9_08",
  "phq9_09"
];

export class QuestionnaireValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuestionnaireValidationError";
  }
}

export interface Phq9ScoredResult {
  normalizedAnswers: Phq9RawAnswers;
  internalScore: InternalScore;
  safetyFlags: SafetyFlags;
}

export function validatePhq9Answers(rawAnswers: Record<string, unknown>): Phq9RawAnswers {
  const normalized = {} as Phq9RawAnswers;

  for (const item of PHQ9_REQUIRED_ITEMS) {
    const value = rawAnswers[item];
    if (!Number.isInteger(value) || typeof value !== "number" || value < 0 || value > 3) {
      throw new QuestionnaireValidationError(`${item} must be an integer from 0 to 3`);
    }
    normalized[item] = value;
  }

  return normalized;
}

export function scorePhq9(rawAnswers: Record<string, unknown>): Phq9ScoredResult {
  const normalizedAnswers = validatePhq9Answers(rawAnswers);
  const total = PHQ9_REQUIRED_ITEMS.reduce((sum, item) => sum + normalizedAnswers[item], 0);
  const item9 = normalizedAnswers.phq9_09;
  const item9Positive = item9 > 0;

  return {
    normalizedAnswers,
    internalScore: {
      total,
      item9,
      internal_band: total <= 9 ? "minimal_reference" : "staff_review_reference"
    },
    safetyFlags: {
      requires_human_review: item9Positive,
      item9_positive: item9Positive
    }
  };
}

export function scoreQuestionnaire(
  questionnaireCode: string,
  rawAnswers: Record<string, unknown>
): Phq9ScoredResult {
  if (questionnaireCode !== "phq9") {
    throw new QuestionnaireValidationError(`Unsupported questionnaire_code: ${questionnaireCode}`);
  }

  return scorePhq9(rawAnswers);
}
