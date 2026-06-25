import { describe, expect, it } from "vitest";
import phq9Seed from "../../../modules/questionnaire/seed/phq9.zh-TW.surveyjs.json";
import {
  getSurveyQuestionContexts,
  mapTranscriptToSurveyChoice,
  scorePhq9,
  validatePhq9Answers,
  validateSurveyJsQuestionnaire
} from "./phq9";

const lowRiskAnswers = {
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

describe("PHQ-9 scoring", () => {
  it("scores low-risk answers", () => {
    const result = scorePhq9(lowRiskAnswers);

    expect(result.internalScore.total).toBe(3);
    expect(result.safetyFlags.item9_positive).toBe(false);
    expect(result.safetyFlags.requires_human_review).toBe(false);
  });

  it("keeps item 9 as the human-review trigger", () => {
    const result = scorePhq9({ ...lowRiskAnswers, phq9_09: 1 });

    expect(result.internalScore.total).toBe(4);
    expect(result.safetyFlags.item9_positive).toBe(true);
    expect(result.safetyFlags.requires_human_review).toBe(true);
  });

  it("rejects missing items", () => {
    const { phq9_09: _removed, ...missingItem } = lowRiskAnswers;

    expect(() => validatePhq9Answers(missingItem)).toThrow("phq9_09");
  });

  it("rejects values outside 0..3", () => {
    expect(() => validatePhq9Answers({ ...lowRiskAnswers, phq9_01: 4 })).toThrow("phq9_01");
  });

  it("validates the PHQ-9 SurveyJS seed", () => {
    expect(() => validateSurveyJsQuestionnaire(phq9Seed)).not.toThrow();
    expect(getSurveyQuestionContexts(phq9Seed)).toHaveLength(9);
  });

  it("rejects SurveyJS JSON missing PHQ-9 keys", () => {
    expect(() => validateSurveyJsQuestionnaire({ title: "bad", pages: [{ elements: [] }] })).toThrow("phq9_01");
  });

  it("maps deterministic voice answers to available choices", () => {
    const choices = getSurveyQuestionContexts(phq9Seed)[0]!.choices;

    expect(mapTranscriptToSurveyChoice("完全沒有", choices)?.value).toBe(0);
    expect(mapTranscriptToSurveyChoice("幾天", choices)?.value).toBe(1);
    expect(mapTranscriptToSurveyChoice("一半以上", choices)?.value).toBe(2);
    expect(mapTranscriptToSurveyChoice("幾乎每天", choices)?.value).toBe(3);
    expect(mapTranscriptToSurveyChoice("不知道", choices)).toBeNull();
  });
});
