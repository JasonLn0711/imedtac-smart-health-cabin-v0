export * from "./types";
export * from "./domain-pack-loader";
export * from "./hotwords";
export * from "./normalization";
export * from "./asr-confidence";
export * from "./semantic-frame";
export * from "./routing";

import { buildAsrHypothesisSet } from "./asr-confidence";
import { getDomainPacks, domainPackVersions } from "./domain-pack-loader";
import { collectHotwords } from "./hotwords";
import { normalizeTranscript } from "./normalization";
import { routeVoiceEvidence } from "./routing";
import { buildSemanticFrame } from "./semantic-frame";
import type { ProcessVoiceEvidenceInput, ProcessVoiceEvidenceResult } from "./types";

function confirmationRequired(routingDecision: ProcessVoiceEvidenceResult["routingDecision"]): boolean {
  return [
    "medium_confidence_needs_confirmation",
    "ambiguous_multiple_candidates",
    "safety_sensitive_staff_review"
  ].includes(routingDecision);
}

export function processVoiceEvidence(input: ProcessVoiceEvidenceInput): ProcessVoiceEvidenceResult {
  const packs = getDomainPacks(input.domainPackIds);
  const hotwords = collectHotwords(packs);
  const rawText = input.rawText.trim();
  const hypothesisSet = buildAsrHypothesisSet({
    primaryText: rawText,
    confidence: input.asrConfidence,
    nBestTranscripts: input.nBestTranscripts,
    hotwordsRequested: hotwords,
    hotwordsApplied: input.hotwordsApplied ?? false
  });
  const normalizedText = normalizeTranscript(rawText, packs);
  const semanticFrame = buildSemanticFrame({
    rawText,
    normalizedText,
    packs,
    choices: input.choices
  });
  const routingDecision = routeVoiceEvidence({
    frame: semanticFrame,
    asrConfidence: input.asrConfidence,
    noSpeechProb: input.noSpeechProb,
    minAsrConfidence: Number(process.env.VOICE_MIN_ASR_CONFIDENCE ?? 0.65)
  });
  const confirmation = confirmationRequired(routingDecision);

  return {
    hypothesisSet,
    normalizedText,
    semanticFrame,
    routingDecision,
    confirmationRequired: confirmation,
    metadata: {
      audioId: `audio_${Date.now()}`,
      rawAudioStored: false,
      asrProvider: input.asrProvider ?? "unknown",
      asrModel: input.asrModel ?? "unknown",
      activeDomainPackIds: packs.map((pack) => pack.domainId),
      hotwordsRequested: hotwords,
      hotwordsApplied: input.hotwordsApplied ?? false,
      asrText: rawText,
      normalizedText,
      asrConfidence: input.asrConfidence,
      vadConfidence: input.vadConfidence,
      utteranceDurationMs: input.utteranceDurationMs ?? 0,
      endpointingMode: input.endpointingMode ?? "standard",
      segmentTimestamps: [],
      nBestAvailable: hypothesisSet.nBestAvailable,
      nBestTranscripts: hypothesisSet.hypotheses.map((hypothesis) => ({
        text: hypothesis.text,
        rank: hypothesis.rank,
        confidence: hypothesis.confidence
      })),
      semanticFrame,
      routingDecision,
      confirmationRequired: confirmation,
      domainPackVersions: domainPackVersions(packs)
    }
  };
}
