import type { VoiceDomainAnswerAlias, VoiceDomainPack, VoiceSafetyFlag, VoiceSemanticFrame } from "@shc/contracts";
import type { VoiceChoice } from "./types";

function includesAny(text: string, terms: string[]): string | null {
  const sorted = [...terms].sort((a, b) => b.length - a.length);
  return sorted.find((term) => text.includes(term)) ?? null;
}

function includesAnswerEvidence(text: string, terms: string[]): string | null {
  const sorted = [...terms].sort((a, b) => b.length - a.length);
  return (
    sorted.find((term) => {
      if (term.length === 1) {
        return text === term;
      }
      return text.includes(term);
    }) ?? null
  );
}

function choiceAllows(alias: VoiceDomainAnswerAlias, choices: VoiceChoice[]): boolean {
  if (choices.length === 0) {
    return true;
  }
  return choices.some((choice) => choice.value === alias.optionValue || choice.text === alias.optionText);
}

function optionId(value: string | number | boolean): string {
  return String(value);
}

function answerCandidates(text: string, packs: VoiceDomainPack[], choices: VoiceChoice[]) {
  return packs
    .flatMap((pack) => pack.answerAliases)
    .filter((alias) => choiceAllows(alias, choices))
    .flatMap((alias) => {
      const evidence = includesAnswerEvidence(text, [alias.optionText, ...alias.aliases]);
      if (!evidence) {
        return [];
      }
      return [
        {
          optionId: optionId(alias.optionValue),
          optionText: choices.find((choice) => choice.value === alias.optionValue)?.text ?? alias.optionText,
          confidence: evidence === alias.optionText ? 0.92 : 0.86,
          evidenceText: evidence
        }
      ];
    })
    .filter((candidate, index, candidates) => candidates.findIndex((item) => item.optionId === candidate.optionId) === index);
}

function safetyFlags(text: string, packs: VoiceDomainPack[]): VoiceSafetyFlag[] {
  const flags = new Set<VoiceSafetyFlag>();
  for (const rule of packs.flatMap((pack) => pack.safetyRules)) {
    if (includesAny(text, rule.triggerTerms)) {
      flags.add(rule.flag);
    }
  }
  return flags.size ? [...flags] : ["none"];
}

function symptoms(text: string, packs: VoiceDomainPack[]): string[] {
  return packs
    .flatMap((pack) => pack.canonicalTerms)
    .filter((term) => ["symptom", "safety"].includes(term.category))
    .filter((term) => includesAny(text, [term.term, ...term.aliases]))
    .map((term) => term.term);
}

function hasMeasurement(text: string): boolean {
  return /(身高|體重|腰圍|血壓|血糖|脈搏|BMI|心跳).*(\d|一|二|三|四|五|六|七|八|九|十|百|比|\/)/.test(text);
}

function hasCommand(text: string, packs: VoiceDomainPack[]): boolean {
  return packs
    .flatMap((pack) => pack.canonicalTerms)
    .filter((term) => term.category === "module_command" || term.category === "report_access")
    .some((term) => includesAny(text, [term.term, ...term.aliases]));
}

function temporalExpressions(text: string): string[] {
  return ["最近", "過去兩週", "過去二週", "兩週", "最近半年"].filter((term) => text.includes(term));
}

export function buildSemanticFrame(input: {
  rawText: string;
  normalizedText: string;
  packs: VoiceDomainPack[];
  choices?: VoiceChoice[];
}): VoiceSemanticFrame {
  const choices = input.choices ?? [];
  const questionnaireAnswerCandidates = answerCandidates(input.normalizedText, input.packs, choices);
  const frameSymptoms = symptoms(input.normalizedText, input.packs);
  const frameSafetyFlags = safetyFlags(input.normalizedText, input.packs);
  const intent =
    questionnaireAnswerCandidates.length > 0
      ? "questionnaire_answer"
      : hasMeasurement(input.normalizedText)
        ? "measurement_value"
        : hasCommand(input.normalizedText, input.packs)
          ? "command_or_faq"
          : frameSymptoms.length > 0
            ? "symptom_description"
            : input.normalizedText
              ? "other"
              : "unclear";
  const retrievalQuery =
    intent === "symptom_description" || intent === "measurement_value"
      ? `語音語意：${input.normalizedText}；安全旗標：${frameSafetyFlags.join(",")}`
      : undefined;

  return {
    rawText: input.rawText,
    normalizedText: input.normalizedText,
    language: "zh-TW",
    intent,
    symptoms: frameSymptoms,
    questionnaireAnswerCandidates,
    temporalExpressions: temporalExpressions(input.normalizedText),
    negations: ["沒有", "不"].filter((term) => input.normalizedText.includes(term)),
    safetyFlags: frameSafetyFlags,
    retrievalQuery
  };
}
