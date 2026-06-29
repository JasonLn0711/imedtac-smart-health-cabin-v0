import type {
  AsrHypothesis,
  AsrHypothesisSet,
  VoiceDomainPack,
  VoiceEvidenceMetadata,
  VoiceRoutingDecision,
  VoiceSemanticFrame
} from "@shc/contracts";

export type { AsrHypothesis, AsrHypothesisSet, VoiceDomainPack, VoiceEvidenceMetadata, VoiceRoutingDecision, VoiceSemanticFrame };

export interface VoiceChoice {
  value: string | number | boolean;
  text: string;
}

export interface ProcessVoiceEvidenceInput {
  rawText: string;
  asrProvider?: string;
  asrModel?: string;
  asrConfidence?: number;
  vadConfidence?: number;
  noSpeechProb?: number;
  utteranceDurationMs?: number;
  endpointingMode?: "standard" | "elder";
  questionName?: string;
  questionTitle?: string;
  choices?: VoiceChoice[];
  domainPackIds?: string[];
  nBestTranscripts?: Array<{ text: string; rank: number; confidence?: number; avgLogprob?: number }>;
  hotwordsApplied?: boolean;
}

export interface ProcessVoiceEvidenceResult {
  hypothesisSet: AsrHypothesisSet;
  normalizedText: string;
  semanticFrame: VoiceSemanticFrame;
  routingDecision: VoiceRoutingDecision;
  confirmationRequired: boolean;
  metadata: VoiceEvidenceMetadata;
}
