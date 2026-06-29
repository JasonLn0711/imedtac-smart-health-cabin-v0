import type { AvatarState, VoiceAnswerCandidate, VoiceRoutingDecision } from "@shc/contracts";

export type { AvatarState };

export interface VoiceAnswerDraft {
  questionName: string;
  questionTitle: string;
  transcript: string;
  normalizedTranscript?: string;
  routingDecision?: VoiceRoutingDecision;
  confirmationRequired?: boolean;
  candidate: VoiceAnswerCandidate;
}
