import type { Question } from "survey-core";
import type { SurveyChoice, VoiceAnswerCandidate } from "@shc/contracts";
import { mapTranscriptToSurveyChoice } from "@shc/questionnaire-core";

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
