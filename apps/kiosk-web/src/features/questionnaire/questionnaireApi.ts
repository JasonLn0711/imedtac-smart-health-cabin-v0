import type {
  ActiveQuestionnaireResponse,
  CompletedQuestionnaireRequest,
  CompletedQuestionnaireResponse,
  ErrorResponse
} from "@shc/contracts";
import phq9Seed from "../../../../../modules/questionnaire/seed/phq9.zh-TW.surveyjs.json";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

function isErrorResponse(body: unknown): body is ErrorResponse {
  return (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof (body as ErrorResponse).error?.message === "string"
  );
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const body = (await response.json()) as unknown;

  if (!response.ok) {
    const message = isErrorResponse(body)
      ? body.error.message
      : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return body as T;
}

export async function fetchActiveQuestionnaire(): Promise<ActiveQuestionnaireResponse> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/v1/questionnaires/active`);
    return parseJsonResponse<ActiveQuestionnaireResponse>(response);
  } catch {
    return {
      questionnaire_code: "phq9",
      questionnaire_version: "0.1.0",
      title: "病人健康狀況問卷-9（PHQ-9）",
      surveyjs_json: phq9Seed,
      surveyjs_json_path: "modules/questionnaire/seed/phq9.zh-TW.surveyjs.json",
      public_scoring_config_path: "modules/questionnaire/scoring/phq9.public-scoring-config.json",
      scoring_config_code: "phq9_public_v1"
    };
  }
}

export async function submitQuestionnaireResponse(
  questionnaire: ActiveQuestionnaireResponse,
  rawAnswers: Record<string, unknown>
): Promise<CompletedQuestionnaireResponse> {
  const payload: CompletedQuestionnaireRequest = {
    session_id: "sess_demo_001",
    questionnaire_code: questionnaire.questionnaire_code,
    questionnaire_version: questionnaire.questionnaire_version,
    raw_answers: rawAnswers
  };

  const response = await fetch(`${apiBaseUrl}/api/v1/questionnaire-responses`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return parseJsonResponse<CompletedQuestionnaireResponse>(response);
}
