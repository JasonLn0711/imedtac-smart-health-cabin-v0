import { describe, expect, it } from "vitest";
import type { CompletedQuestionnaireResponse } from "@shc/contracts";
import type {
  QuestionnaireRepository,
  QuestionnaireVersionRecord,
  SaveQuestionnaireResponseInput
} from "../repositories/questionnaireRepository";
import { QuestionnaireService } from "./questionnaireService";

class InMemoryQuestionnaireRepository implements QuestionnaireRepository {
  saved?: SaveQuestionnaireResponseInput;

  async ensurePhq9Seed(): Promise<void> {}

  async getActiveQuestionnaire(): Promise<QuestionnaireVersionRecord> {
    return {
      id: "qv_demo",
      questionnaireCode: "phq9",
      version: "0.1.0",
      surveyjsJson: {},
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
      public_summary: input.publicSummary
    };
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
});
