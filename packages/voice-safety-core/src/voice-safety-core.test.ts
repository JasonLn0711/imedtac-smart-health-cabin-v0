import { describe, expect, it } from "vitest";
import {
  buildAsrHypothesisSet,
  collectHotwords,
  domainPackIdsForContext,
  getDomainPacks,
  normalizeTranscript,
  processVoiceEvidence
} from ".";

const phq9Choices = [
  { value: 0, text: "完全沒有" },
  { value: 1, text: "幾天" },
  { value: 2, text: "一半以上的天數" },
  { value: 3, text: "幾乎每天" }
];

describe("voice-safety-core", () => {
  it("collects domain-pack hotwords without pretending ASR applied them", () => {
    const packs = getDomainPacks(["phq9_zh_tw", "smart_cabin_measurement"]);
    expect(collectHotwords(packs)).toContain("完全沒有");
    expect(collectHotwords(packs)).toContain("血壓");
    expect(buildAsrHypothesisSet({ primaryText: "幾天", hotwordsRequested: ["幾天"] })).toMatchObject({
      nBestAvailable: false,
      hotwordsApplied: false,
      hypotheses: [{ text: "幾天", source: "provider_top1" }]
    });
  });

  it("normalizes project-specific ASR errors by active domain pack", () => {
    const packs = getDomainPacks(["phq9_zh_tw", "hpa_adult_preventive_zh_tw"]);
    expect(normalizeTranscript("我最近心情滴落而且水不好", packs)).toContain("心情低落");
    expect(normalizeTranscript("我最近心情滴落而且水不好", packs)).toContain("睡不好");
    expect(normalizeTranscript("完全美有", packs)).toBe("完全沒有");
  });

  it("maps high-confidence PHQ-9 answers through active choices for auto-fill", () => {
    const result = processVoiceEvidence({
      rawText: "機天",
      asrConfidence: 0.91,
      choices: phq9Choices,
      domainPackIds: ["phq9_zh_tw"]
    });

    expect(result.normalizedText).toBe("幾天");
    expect(result.semanticFrame.questionnaireAnswerCandidates).toEqual([
      { optionId: "1", optionText: "幾天", confidence: 0.92, evidenceText: "幾天" }
    ]);
    expect(result.routingDecision).toBe("high_confidence_clear_answer");
    expect(result.confirmationRequired).toBe(false);
  });

  it("routes low-confidence ASR to retry/touch instead of answer truth", () => {
    const result = processVoiceEvidence({
      rawText: "幾乎每天",
      asrConfidence: 0.4,
      choices: phq9Choices,
      domainPackIds: ["phq9_zh_tw"]
    });

    expect(result.semanticFrame.questionnaireAnswerCandidates[0]?.optionText).toBe("幾乎每天");
    expect(result.routingDecision).toBe("low_confidence_retry");
  });

  it("flags self-harm language for staff review even when an answer phrase exists", () => {
    const result = processVoiceEvidence({
      rawText: "我不想活了幾天",
      asrConfidence: 0.92,
      choices: phq9Choices,
      domainPackIds: ["phq9_zh_tw"]
    });

    expect(result.semanticFrame.safetyFlags).toContain("self_harm");
    expect(result.routingDecision).toBe("safety_sensitive_staff_review");
  });

  it("maps adult preventive behavior answers only when that option exists", () => {
    const result = processVoiceEvidence({
      rawText: "偶爾喝酒",
      asrConfidence: 0.93,
      choices: [
        { value: 0, text: "不喝酒" },
        { value: 1, text: "偶爾喝酒或應酬才喝" },
        { value: 2, text: "經常喝酒" }
      ],
      domainPackIds: ["hpa_adult_preventive_zh_tw"]
    });

    expect(result.semanticFrame.questionnaireAnswerCandidates[0]).toMatchObject({
      optionId: "1",
      optionText: "偶爾喝酒或應酬才喝"
    });
  });

  it("extracts measurement and FAQ intent without questionnaire write candidates", () => {
    const measurement = processVoiceEvidence({
      rawText: "血壓一百二十比八十",
      asrConfidence: 0.9,
      domainPackIds: ["smart_cabin_measurement"]
    });
    const faq = processVoiceEvidence({
      rawText: "請再說一次",
      asrConfidence: 0.9,
      domainPackIds: ["smart_cabin_measurement"]
    });

    expect(measurement.semanticFrame.intent).toBe("measurement_value");
    expect(measurement.semanticFrame.questionnaireAnswerCandidates).toEqual([]);
    expect(faq.semanticFrame.intent).toBe("command_or_faq");
    expect(faq.semanticFrame.questionnaireAnswerCandidates).toEqual([]);
  });

  it("selects domain packs by questionnaire or future module context", () => {
    expect(domainPackIdsForContext({ questionnaireCode: "phq9" })).toContain("phq9_zh_tw");
    expect(domainPackIdsForContext({ questionnaireCode: "hpa_adult_preventive" })).toContain(
      "hpa_adult_preventive_zh_tw"
    );
    expect(getDomainPacks(["vision_screening_phase2", "hearing_screening_phase2", "kiosk_faq"]).map((pack) => pack.domainId)).toEqual([
      "vision_screening_phase2",
      "hearing_screening_phase2",
      "kiosk_faq"
    ]);
  });

  it("keeps kiosk FAQ commands outside questionnaire answer writes", () => {
    const result = processVoiceEvidence({
      rawText: "我不想錄音改用觸控",
      asrConfidence: 0.92,
      domainPackIds: ["kiosk_faq"]
    });

    expect(result.semanticFrame.intent).toBe("command_or_faq");
    expect(result.semanticFrame.questionnaireAnswerCandidates).toEqual([]);
    expect(result.routingDecision).toBe("medium_confidence_needs_confirmation");
  });

  it("routes empty or no-speech ASR as no-speech retry", () => {
    expect(processVoiceEvidence({ rawText: "", noSpeechProb: 0.9 }).routingDecision).toBe("no_speech_retry");
  });
});
