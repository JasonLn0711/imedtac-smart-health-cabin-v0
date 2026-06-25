import type { VoiceAnswerCandidate } from "@shc/contracts";

export type AvatarState =
  | "idle"
  | "speaking"
  | "listening"
  | "transcribing"
  | "thinking"
  | "confirming_answer"
  | "error_fallback";

export interface VoiceAnswerDraft {
  questionName: string;
  questionTitle: string;
  transcript: string;
  candidate: VoiceAnswerCandidate;
}

