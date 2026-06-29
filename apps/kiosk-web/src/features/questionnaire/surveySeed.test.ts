import { describe, expect, it } from "vitest";
import { Model } from "survey-core";
import phq9Seed from "../../../../../modules/questionnaire/seed/phq9.zh-TW.surveyjs.json";
import { createKioskSurveyModel } from "./SurveyJsQuestionnaireRenderer";

describe("PHQ-9 SurveyJS seed", () => {
  it("loads as 9 required radio questions", () => {
    const survey = new Model(phq9Seed);
    const questions = survey.getAllQuestions();

    expect(questions).toHaveLength(9);
    expect(questions.map((question) => question.name)).toEqual([
      "phq9_01",
      "phq9_02",
      "phq9_03",
      "phq9_04",
      "phq9_05",
      "phq9_06",
      "phq9_07",
      "phq9_08",
      "phq9_09"
    ]);
    expect(questions.every((question) => question.isRequired)).toBe(true);
    expect(questions.every((question) => question.getType() === "radiogroup")).toBe(true);
  });

  it("uses one-question-per-page kiosk navigation with explicit final submit", () => {
    const survey = createKioskSurveyModel(phq9Seed);

    expect(survey.questionsOnPageMode).toBe("questionPerPage");
    expect(survey.goNextPageAutomatic).toBe(true);
    expect(survey.allowCompleteSurveyAutomatic).toBe(false);
    expect(survey.completeText).toBe("送出問卷");
  });
});
