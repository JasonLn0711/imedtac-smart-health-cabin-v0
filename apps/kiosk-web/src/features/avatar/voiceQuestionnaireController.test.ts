import { describe, expect, it } from "vitest";
import { Model } from "survey-core";
import phq9Seed from "../../../../../modules/questionnaire/seed/phq9.zh-TW.surveyjs.json";
import { createKioskSurveyModel } from "../questionnaire/SurveyJsQuestionnaireRenderer";
import { candidateFromTranscript, confirmVoiceAnswer, getCurrentSurveyQuestion } from "./voiceQuestionnaireController";

function makeModel() {
  return new Model(phq9Seed);
}

describe("voice questionnaire controller", () => {
  it.each([
    ["完全沒有", 0],
    ["沒有", 0],
    ["都沒有", 0],
    ["幾天", 1],
    ["偶爾", 1],
    ["一半以上", 2],
    ["超過一半", 2],
    ["幾乎每天", 3],
    ["每天", 3]
  ])("maps %s to option value %i", (transcript, value) => {
    const model = makeModel();
    const question = model.getQuestionByName("phq9_01");

    expect(candidateFromTranscript(question, transcript)?.value).toBe(value);
  });

  it("does not write until confirmation", () => {
    const model = makeModel();
    const question = model.getQuestionByName("phq9_01");
    const candidate = candidateFromTranscript(question, "幾天");

    expect(question.value).toBeUndefined();
    expect(candidate).not.toBeNull();
    confirmVoiceAnswer(question, candidate!);
    expect(question.value).toBe(1);
  });

  it("fills at least three questions through mocked voice-confirmed answers", () => {
    const model = makeModel();

    for (const name of ["phq9_01", "phq9_02", "phq9_03"]) {
      const question = model.getQuestionByName(name);
      const candidate = candidateFromTranscript(question, "完全沒有");
      confirmVoiceAnswer(question, candidate!);
    }

    expect(model.data).toMatchObject({
      phq9_01: 0,
      phq9_02: 0,
      phq9_03: 0
    });
  });

  it("uses the current visible question for one-question-per-page voice mapping", () => {
    const model = createKioskSurveyModel(phq9Seed);
    const firstQuestion = getCurrentSurveyQuestion(model);

    expect(firstQuestion?.name).toBe("phq9_01");
    confirmVoiceAnswer(firstQuestion!, candidateFromTranscript(firstQuestion!, "完全沒有")!);
    expect(model.nextPage()).toBe(true);
    expect(getCurrentSurveyQuestion(model)?.name).toBe("phq9_02");
    expect(model.prevPage()).toBe(true);
    expect(getCurrentSurveyQuestion(model)?.name).toBe("phq9_01");
  });

  it("returns no candidate for invalid speech so touch fallback remains needed", () => {
    const model = makeModel();
    const question = model.getQuestionByName("phq9_01");

    expect(candidateFromTranscript(question, "不知道怎麼回答")).toBeNull();
  });
});
