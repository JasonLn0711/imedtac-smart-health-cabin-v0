import type { AvatarState, VoiceAnswerCandidate } from "@shc/contracts";

export type { AvatarState };

export interface VoiceAnswerDraft {
  questionName: string;
  questionTitle: string;
  transcript: string;
  candidate: VoiceAnswerCandidate;
}
