import type {
  ActiveQuestionnaireResponse,
  AdminQuestionnaireResponsesResponse,
  AdminQuestionnaireTemplatesResponse,
  AgentSessionResponse,
  AgentTurnResponse,
  CompletedQuestionnaireRequest,
  CompletedQuestionnaireResponse,
  CreateQuestionnaireTemplateRequest,
  CreateQuestionnaireVersionRequest,
  PublicReportResponse,
  VoiceAnswerMappingResponse
} from "@shc/contracts";
import {
  getSurveyQuestionContexts,
  mapTranscriptToSurveyChoice,
  QuestionnaireValidationError,
  scoreQuestionnaire,
  validateSurveyJsQuestionnaire
} from "@shc/questionnaire-core";
import { assertPublicSummaryIsNonDiagnostic, buildPhq9PublicSummary } from "@shc/report-core";
import type { QuestionnaireRepository } from "../repositories/questionnaireRepository";

const seedPath = "modules/questionnaire/seed/phq9.zh-TW.surveyjs.json";
const scoringConfigPath = "modules/questionnaire/scoring/phq9.public-scoring-config.json";
const mockWav =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=";

export class QuestionnaireService {
  constructor(private readonly repository: QuestionnaireRepository) {}

  async getActiveQuestionnaire(): Promise<ActiveQuestionnaireResponse> {
    const active = await this.repository.getActiveQuestionnaire();

    return {
      questionnaire_code: active.questionnaireCode,
      questionnaire_version: active.version,
      questionnaire_version_id: active.id,
      title: active.title,
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

    if (request.questionnaire_code !== "phq9") {
      throw new QuestionnaireValidationError("Only phq9 is supported");
    }

    if (!request.raw_answers || typeof request.raw_answers !== "object") {
      throw new QuestionnaireValidationError("raw_answers is required");
    }

    const active = await this.repository.getActiveQuestionnaire();
    if (request.questionnaire_version !== active.version) {
      throw new QuestionnaireValidationError("questionnaire_version must match the active published version");
    }

    const scored = scoreQuestionnaire(request.questionnaire_code, request.raw_answers);
    const publicSummary = buildPhq9PublicSummary(scored.internalScore, scored.safetyFlags);
    assertPublicSummaryIsNonDiagnostic(publicSummary);

    return this.repository.saveQuestionnaireResponse({
      sessionId: request.session_id,
      questionnaireVersion: active,
      rawAnswers: scored.normalizedAnswers,
      internalScore: scored.internalScore,
      safetyFlags: scored.safetyFlags,
      publicSummary
    });
  }

  async listTemplates(): Promise<AdminQuestionnaireTemplatesResponse> {
    return { templates: await this.repository.listTemplates() };
  }

  async createTemplate(request: CreateQuestionnaireTemplateRequest) {
    if (request.code !== "phq9") {
      throw new QuestionnaireValidationError("Only phq9 templates are supported in the MVP");
    }
    if (!request.title || !request.description) {
      throw new QuestionnaireValidationError("title and description are required");
    }
    return this.repository.createTemplate(request);
  }

  async createVersion(request: CreateQuestionnaireVersionRequest) {
    if (!request.template_id || !request.version) {
      throw new QuestionnaireValidationError("template_id and version are required");
    }
    if (request.scoring_config_code !== "phq9_public_v1") {
      throw new QuestionnaireValidationError("Only phq9_public_v1 scoring is supported");
    }
    validateSurveyJsQuestionnaire(request.surveyjs_json);
    return this.repository.createVersion({
      templateId: request.template_id,
      version: request.version,
      surveyjsJson: request.surveyjs_json,
      scoringConfigCode: request.scoring_config_code,
      status: request.status ?? "draft"
    });
  }

  async publishVersion(versionId: string) {
    if (!versionId) {
      throw new QuestionnaireValidationError("version id is required");
    }
    return this.repository.publishVersion(versionId);
  }

  async listResponses(): Promise<AdminQuestionnaireResponsesResponse> {
    return { responses: await this.repository.listResponses() };
  }

  async getPublicReport(token: string): Promise<PublicReportResponse | null> {
    if (!token) {
      throw new QuestionnaireValidationError("report token is required");
    }
    return this.repository.getPublicReport(token);
  }

  async createAgentSession(sessionId?: string): Promise<AgentSessionResponse> {
    return {
      agent_session_id: await this.repository.createAgentSession(sessionId),
      status: "created"
    };
  }

  async runMockAsr(input: {
    agent_session_id?: string;
    session_id?: string;
    question_name?: string;
    audio_text?: string;
    transcript?: string;
  }): Promise<AgentTurnResponse> {
    const transcript = input.transcript ?? input.audio_text ?? "";
    const turnId = await this.repository.saveAgentTurn({
      agentSessionId: input.agent_session_id,
      sessionId: input.session_id,
      turnType: "asr",
      questionName: input.question_name,
      transcript,
      payload: { provider: "mock", transcript }
    });
    return { agent_turn_id: turnId, provider: "mock", transcript };
  }

  async buildMockGuidance(input: {
    agent_session_id?: string;
    session_id?: string;
    question_name?: string;
  }): Promise<AgentTurnResponse> {
    const active = await this.repository.getActiveQuestionnaire();
    const question = getSurveyQuestionContexts(active.surveyjsJson).find(
      (item) => item.name === input.question_name
    );
    const guidance = question
      ? `請依照過去兩週的狀況回答：「${question.title}」。選項是：${question.choices
          .map((choice) => choice.text)
          .join("、")}。`
      : "請依照畫面上的問卷題目作答，也可以隨時改用觸控填答。";

    const turnId = await this.repository.saveAgentTurn({
      agentSessionId: input.agent_session_id,
      sessionId: input.session_id,
      turnType: "respond",
      questionName: input.question_name,
      payload: { provider: "mock", guidance }
    });
    return { agent_turn_id: turnId, provider: "mock", guidance };
  }

  async runMockTts(input: {
    agent_session_id?: string;
    session_id?: string;
    question_name?: string;
    text?: string;
  }): Promise<AgentTurnResponse> {
    const turnId = await this.repository.saveAgentTurn({
      agentSessionId: input.agent_session_id,
      sessionId: input.session_id,
      turnType: "tts",
      questionName: input.question_name,
      payload: { provider: "mock", text: input.text ?? "", audio_data_url: mockWav }
    });
    return { agent_turn_id: turnId, provider: "mock", audio_data_url: mockWav };
  }

  async mapVoiceAnswer(input: {
    agent_session_id?: string;
    session_id?: string;
    question_name: string;
    transcript: string;
  }): Promise<VoiceAnswerMappingResponse> {
    const active = await this.repository.getActiveQuestionnaire();
    const question = getSurveyQuestionContexts(active.surveyjsJson).find(
      (item) => item.name === input.question_name
    );
    if (!question) {
      throw new QuestionnaireValidationError(`Unknown question_name: ${input.question_name}`);
    }
    const candidate = mapTranscriptToSurveyChoice(input.transcript, question.choices);
    await this.repository.saveAgentTurn({
      agentSessionId: input.agent_session_id,
      sessionId: input.session_id,
      turnType: "map_answer",
      questionName: input.question_name,
      transcript: input.transcript,
      payload: { candidate }
    });
    return { candidate, transcript: input.transcript };
  }
}
