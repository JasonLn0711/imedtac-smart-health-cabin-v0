import type { VoiceRoutingDecision, VoiceSemanticFrame } from "@shc/contracts";

export function routeVoiceEvidence(input: {
  frame: VoiceSemanticFrame;
  asrConfidence?: number;
  noSpeechProb?: number;
  minAsrConfidence?: number;
}): VoiceRoutingDecision {
  const minAsrConfidence = input.minAsrConfidence ?? 0.65;
  const text = input.frame.normalizedText.trim();
  if (!text || (input.noSpeechProb ?? 0) >= 0.8) {
    return "no_speech_retry";
  }
  if (input.frame.safetyFlags.some((flag) => flag !== "none")) {
    return "safety_sensitive_staff_review";
  }
  if ((input.asrConfidence ?? 1) < minAsrConfidence) {
    return "low_confidence_retry";
  }
  if (input.frame.questionnaireAnswerCandidates.length > 1) {
    return "ambiguous_multiple_candidates";
  }
  if (input.frame.questionnaireAnswerCandidates.length === 1) {
    return (input.asrConfidence ?? 1) >= 0.85 ? "high_confidence_clear_answer" : "medium_confidence_needs_confirmation";
  }
  if (input.frame.intent === "command_or_faq" || input.frame.intent === "measurement_value") {
    return "medium_confidence_needs_confirmation";
  }
  return "low_confidence_retry";
}
