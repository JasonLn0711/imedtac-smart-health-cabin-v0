import { describe, expect, it } from "vitest";
import type { CompletedQuestionnaireResponse } from "@shc/contracts";
import phq9Seed from "../../../../modules/questionnaire/seed/phq9.zh-TW.surveyjs.json";
import type {
  CreateTemplateInput,
  CreateVersionInput,
  QuestionnaireRepository,
  QuestionnaireVersionRecord,
  SaveAgentTurnInput,
  SaveQuestionnaireResponseInput
} from "../repositories/questionnaireRepository";
import { QuestionnaireService } from "./questionnaireService";

class InMemoryQuestionnaireRepository implements QuestionnaireRepository {
  saved?: SaveQuestionnaireResponseInput;

  async ensurePhq9Seed(): Promise<void> {}

  async getActiveQuestionnaire(): Promise<QuestionnaireVersionRecord> {
    return {
      id: "qv_demo",
      templateId: "qtpl_phq9",
      questionnaireCode: "phq9",
      version: "0.1.0",
      title: "病人健康狀況問卷-9（PHQ-9）",
      surveyjsJson: phq9Seed,
      scoringConfig: {}
    };
  }

  async saveQuestionnaireResponse(
    input: SaveQuestionnaireResponseInput
  ): Promise<CompletedQuestionnaireResponse> {
    this.saved = input;
    return {
      response_id: "qres_demo",
      session_id: input.sessionId,
      questionnaire_code: "phq9",
      questionnaire_version: "0.1.0",
      internal_score: input.internalScore,
      safety_flags: input.safetyFlags,
      public_summary: input.publicSummary,
      public_report_token: "rpt_demo",
      public_report_url: "http://localhost:5173/reports/rpt_demo",
      qr_payload: "http://localhost:5173/reports/rpt_demo"
    };
  }

  async listTemplates() {
    return [
      {
        id: "qtpl_phq9",
        code: "phq9" as const,
        title: "病人健康狀況問卷-9（PHQ-9）",
        description: "健康自我檢測問卷",
        active_version_id: "qv_demo",
        active_version: "0.1.0",
        status: "published" as const,
        updated_at: new Date(0).toISOString()
      }
    ];
  }

  async createTemplate(input: CreateTemplateInput) {
    return {
      id: `qtpl_${input.code}`,
      code: input.code,
      title: input.title,
      description: input.description,
      active_version_id: null,
      active_version: null,
      status: "none" as const,
      updated_at: new Date(0).toISOString()
    };
  }

  async createVersion(input: CreateVersionInput) {
    return {
      id: "qv_new",
      template_id: input.templateId,
      questionnaire_code: "phq9" as const,
      version: input.version,
      status: input.status,
      is_active: false
    };
  }

  async publishVersion(versionId: string) {
    return {
      id: versionId,
      template_id: "qtpl_phq9",
      questionnaire_code: "phq9" as const,
      version: "0.2.0",
      status: "published" as const,
      is_active: true
    };
  }

  async listResponses() {
    return [];
  }

  async getPublicReport() {
    return null;
  }

  async createAgentSession() {
    return "agent_sess_demo";
  }

  async saveAgentTurn(_input: SaveAgentTurnInput) {
    return "turn_demo";
  }

  async close(): Promise<void> {}
}

const validAnswers = {
  phq9_01: 0,
  phq9_02: 1,
  phq9_03: 0,
  phq9_04: 1,
  phq9_05: 0,
  phq9_06: 0,
  phq9_07: 1,
  phq9_08: 0,
  phq9_09: 0
};

describe("QuestionnaireService", () => {
  it("submits a low-risk PHQ-9 response", async () => {
    const repository = new InMemoryQuestionnaireRepository();
    const service = new QuestionnaireService(repository);

    const response = await service.submitResponse({
      session_id: "sess_demo_low_risk",
      questionnaire_code: "phq9",
      questionnaire_version: "0.1.0",
      raw_answers: validAnswers
    });

    expect(response.internal_score.total).toBe(3);
    expect(response.safety_flags.requires_human_review).toBe(false);
    expect(response.public_summary.public_status_code).toBe("NORMAL_REFERENCE");
    expect(response.public_report_url).toContain("/reports/");
    expect(repository.saved?.rawAnswers).toEqual(validAnswers);
  });

  it("routes item 9 positive responses to staff review", async () => {
    const service = new QuestionnaireService(new InMemoryQuestionnaireRepository());

    const response = await service.submitResponse({
      session_id: "sess_demo_item9_positive",
      questionnaire_code: "phq9",
      questionnaire_version: "0.1.0",
      raw_answers: { ...validAnswers, phq9_09: 1 }
    });

    expect(response.safety_flags.item9_positive).toBe(true);
    expect(response.safety_flags.requires_human_review).toBe(true);
    expect(response.public_summary.public_status_code).toBe("CONSULT_STAFF");
    expect(response.public_summary.message).not.toMatch(/憂鬱症|中度憂鬱|重度憂鬱|診斷|治療建議/);
  });

  it("rejects response versions that are not the active published version", async () => {
    const service = new QuestionnaireService(new InMemoryQuestionnaireRepository());

    await expect(
      service.submitResponse({
        session_id: "sess_demo_wrong_version",
        questionnaire_code: "phq9",
        questionnaire_version: "0.2.0",
        raw_answers: validAnswers
      })
    ).rejects.toThrow("active published version");
  });

  it("validates and creates a questionnaire version draft", async () => {
    const service = new QuestionnaireService(new InMemoryQuestionnaireRepository());

    const response = await service.createVersion({
      template_id: "qtpl_phq9",
      version: "0.2.0",
      surveyjs_json: phq9Seed,
      scoring_config_code: "phq9_public_v1",
      status: "draft"
    });

    expect(response.status).toBe("draft");
  });

  it("rejects invalid SurveyJS JSON with a stable validation error", async () => {
    const service = new QuestionnaireService(new InMemoryQuestionnaireRepository());

    await expect(
      service.createVersion({
        template_id: "qtpl_phq9",
        version: "0.2.0",
        surveyjs_json: { title: "bad", pages: [{ elements: [] }] },
        scoring_config_code: "phq9_public_v1"
      })
    ).rejects.toThrow("phq9_01");
  });

  it("maps voice answers through active SurveyJS choices", async () => {
    const service = new QuestionnaireService(new InMemoryQuestionnaireRepository());

    const mapped = await service.mapVoiceAnswer({
      question_name: "phq9_01",
      transcript: "幾乎每天"
    });

    expect(mapped.candidate).toMatchObject({
      value: 3,
      requires_confirmation: true
    });
  });
});
