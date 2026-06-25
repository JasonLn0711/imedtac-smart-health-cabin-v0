import type {
  InternalScore,
  Phq9ItemKey,
  Phq9RawAnswers,
  SafetyFlags,
  SurveyChoice,
  SurveyQuestionContext,
  VoiceAnswerCandidate
} from "@shc/contracts";

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

export function validateSurveyJsQuestionnaire(surveyJson: unknown): void {
  if (typeof surveyJson !== "object" || surveyJson === null) {
    throw new QuestionnaireValidationError("SurveyJS JSON must be an object");
  }

  const survey = surveyJson as {
    title?: unknown;
    pages?: Array<{ elements?: Array<{ name?: unknown; type?: unknown; choices?: unknown[] }> }>;
  };

  if (typeof survey.title !== "string" || !Array.isArray(survey.pages)) {
    throw new QuestionnaireValidationError("SurveyJS JSON is missing title or pages");
  }

  const names = new Set(
    survey.pages.flatMap((page) => (Array.isArray(page.elements) ? page.elements : [])).map((item) => item.name)
  );

  for (const item of PHQ9_REQUIRED_ITEMS) {
    if (!names.has(item)) {
      throw new QuestionnaireValidationError(`SurveyJS JSON is missing ${item}`);
    }
  }
}

export function getSurveyQuestionContexts(surveyJson: unknown): SurveyQuestionContext[] {
  validateSurveyJsQuestionnaire(surveyJson);
  const survey = surveyJson as {
    pages: Array<{
      elements?: Array<{
        name?: Phq9ItemKey;
        title?: string;
        choices?: Array<SurveyChoice | string | number>;
      }>;
    }>;
  };

  return survey.pages
    .flatMap((page) => page.elements ?? [])
    .filter((element): element is { name: Phq9ItemKey; title: string; choices: SurveyChoice[] } =>
      PHQ9_REQUIRED_ITEMS.includes(element.name as Phq9ItemKey)
    )
    .map((element) => ({
      name: element.name,
      title: element.title,
      choices: normalizeChoices(element.choices ?? [])
    }));
}

function normalizeChoices(choices: Array<SurveyChoice | string | number>): SurveyChoice[] {
  return choices.map((choice) => {
    if (typeof choice === "object") {
      return {
        value: Number(choice.value),
        text: choice.text
      };
    }

    return {
      value: Number(choice),
      text: String(choice)
    };
  });
}

const transcriptAliases: Array<[number, string[]]> = [
  [0, ["完全沒有", "沒有", "都沒有", "0", "零"]],
  [2, ["一半以上", "一半以上的天數", "超過一半", "2", "二"]],
  [1, ["幾天", "有幾天", "偶爾", "1", "一"]],
  [3, ["幾乎每天", "每天", "幾乎天天", "3", "三"]]
];

export function mapTranscriptToSurveyChoice(
  transcript: string,
  choices: SurveyChoice[]
): VoiceAnswerCandidate | null {
  const normalized = transcript.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  for (const [value, aliases] of transcriptAliases) {
    if (!choices.some((choice) => choice.value === value)) {
      continue;
    }
    if (aliases.some((alias) => normalized.includes(alias.toLowerCase()))) {
      const choice = choices.find((item) => item.value === value);
      if (!choice) {
        return null;
      }
      return {
        value,
        text: choice.text,
        confidence: 1,
        requires_confirmation: true
      };
    }
  }

  return null;
}
