import type {
  ActiveQuestionnaireResponse,
  CompletedQuestionnaireRequest,
  CompletedQuestionnaireResponse
} from "@shc/contracts";
import { QuestionnaireValidationError, scoreQuestionnaire } from "@shc/questionnaire-core";
import { assertPublicSummaryIsNonDiagnostic, buildPhq9PublicSummary } from "@shc/report-core";
import type { QuestionnaireRepository } from "../repositories/questionnaireRepository";

const seedPath = "modules/questionnaire/seed/phq9.zh-TW.surveyjs.json";
const scoringConfigPath = "modules/questionnaire/scoring/phq9.public-scoring-config.json";

export class QuestionnaireService {
  constructor(private readonly repository: QuestionnaireRepository) {}

  async getActiveQuestionnaire(): Promise<ActiveQuestionnaireResponse> {
    const active = await this.repository.getActiveQuestionnaire();

    return {
      questionnaire_code: active.questionnaireCode,
      questionnaire_version: active.version,
      title: "病人健康狀況問卷-9（PHQ-9）",
      surveyjs_json: active.surveyjsJson,
      surveyjs_json_path: seedPath,
      public_scoring_config_path: scoringConfigPath,
      scoring_config_code: "phq9_public_v1"
    };
  }

  async submitResponse(request: CompletedQuestionnaireRequest): Promise<CompletedQuestionnaireResponse> {
    if (!request.session_id || typeof request.session_id !== "string") {
      throw new QuestionnaireValidationError("session_id is required");
    }

    if (request.questionnaire_code !== "phq9" || request.questionnaire_version !== "0.1.0") {
      throw new QuestionnaireValidationError("Only phq9 version 0.1.0 is supported in Sprint 1");
    }

    if (!request.raw_answers || typeof request.raw_answers !== "object") {
      throw new QuestionnaireValidationError("raw_answers is required");
    }

    const active = await this.repository.getActiveQuestionnaire();
    const scored = scoreQuestionnaire(request.questionnaire_code, request.raw_answers);
    const publicSummary = buildPhq9PublicSummary(scored.internalScore, scored.safetyFlags);
    assertPublicSummaryIsNonDiagnostic(publicSummary);

    return this.repository.saveQuestionnaireResponse({
      sessionId: request.session_id,
      questionnaireVersionId: active.id,
      rawAnswers: scored.normalizedAnswers,
      internalScore: scored.internalScore,
      safetyFlags: scored.safetyFlags,
      publicSummary
    });
  }
}
