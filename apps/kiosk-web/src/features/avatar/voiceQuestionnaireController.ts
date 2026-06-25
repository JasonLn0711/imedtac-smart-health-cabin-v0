import type { Model, Question } from "survey-core";
import type { SurveyChoice, VoiceAnswerCandidate } from "@shc/contracts";
import { mapTranscriptToSurveyChoice } from "@shc/questionnaire-core";

function isQuestion(element: unknown): element is Question {
  const candidate = element as Question | null | undefined;
  const type = candidate?.getType?.();
  return Boolean(candidate?.name && type && type !== "page" && type !== "panel");
}

export function getCurrentSurveyQuestion(model: Model): Question | null {
  if (isQuestion(model.currentSingleQuestion)) {
    return model.currentSingleQuestion;
  }
  if (isQuestion(model.currentElement)) {
    return model.currentElement;
  }
  const visiblePageQuestion = model.currentPage?.questions.find((question: Question) => question.isVisible);
  if (visiblePageQuestion) {
    return visiblePageQuestion;
  }
  return model.getAllQuestions().find((question) => question.value === undefined || question.value === null) ?? null;
}

export function getQuestionChoices(question: Question): SurveyChoice[] {
  const choices = question.visibleChoices as Array<{ value: unknown; text: unknown }>;
  return choices.map((choice) => ({
    value: Number(choice.value),
    text: String(choice.text)
  }));
}

export function candidateFromTranscript(question: Question, transcript: string): VoiceAnswerCandidate | null {
  return mapTranscriptToSurveyChoice(transcript, getQuestionChoices(question));
}

export function confirmVoiceAnswer(question: Question, candidate: VoiceAnswerCandidate): void {
  if (!getQuestionChoices(question).some((choice) => choice.value === candidate.value)) {
    throw new Error("Candidate value is not available for this question");
  }
  question.value = candidate.value;
}
