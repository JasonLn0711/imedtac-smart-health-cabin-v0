import type { Question } from "survey-core";
import type { VoiceAnswerCandidate } from "@shc/contracts";
import {
  candidateFromTranscript,
  confirmVoiceAnswerAndMoveNext,
  getCurrentSurveyQuestion,
  getQuestionChoices
} from "./voiceQuestionnaireController";

export type VoiceConversationCommand = "retry" | "touch_fallback" | "staff_assist" | "answer";

export interface VoiceTurnDecision {
  command: VoiceConversationCommand;
  candidate: VoiceAnswerCandidate | null;
}

export function commandFromTranscript(transcript: string): VoiceConversationCommand {
  const text = transcript.trim();
  if (/重新回答|重錄|再說一次/.test(text)) return "retry";
  if (/改用觸控|用觸控|點選答案/.test(text)) return "touch_fallback";
  if (/找人協助|現場人員|請人幫忙/.test(text)) return "staff_assist";
  return "answer";
}

export function decideVoiceTurn(question: Question, transcript: string): VoiceTurnDecision {
  const command = commandFromTranscript(transcript);
  return {
    command,
    candidate: command === "answer" ? candidateFromTranscript(question, transcript) : null
  };
}

export { confirmVoiceAnswerAndMoveNext, getCurrentSurveyQuestion, getQuestionChoices };
