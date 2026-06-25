import type { VoiceDomainPack } from "@shc/contracts";
import phq9 from "../domain-packs/phq9_zh_tw.json";
import hpaAdultPreventive from "../domain-packs/hpa_adult_preventive_zh_tw.json";
import smartCabinMeasurement from "../domain-packs/smart_cabin_measurement.json";
import visionScreeningPhase2 from "../domain-packs/vision_screening_phase2.json";
import hearingScreeningPhase2 from "../domain-packs/hearing_screening_phase2.json";
import kioskFaq from "../domain-packs/kiosk_faq.json";

const packs = [
  phq9,
  hpaAdultPreventive,
  smartCabinMeasurement,
  visionScreeningPhase2,
  hearingScreeningPhase2,
  kioskFaq
] as VoiceDomainPack[];
const packMap = new Map(packs.map((pack) => [pack.domainId, pack]));
const defaultPackIds = ["phq9_zh_tw", "smart_cabin_measurement", "kiosk_faq"];

export function allDomainPacks(): VoiceDomainPack[] {
  return [...packs];
}

export function parseDomainPackIds(value?: string): string[] {
  return (value ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export function domainPackIdsForContext(input: {
  questionnaireCode?: string;
  questionName?: string;
  extraPackIds?: string[];
} = {}): string[] {
  const ids = new Set<string>(["smart_cabin_measurement", "kiosk_faq"]);
  const questionnaireCode = input.questionnaireCode?.toLowerCase();
  const questionName = input.questionName?.toLowerCase();

  if (questionnaireCode === "phq9" || questionName?.startsWith("phq9_")) {
    ids.add("phq9_zh_tw");
  }
  if (questionnaireCode === "hpa_adult_preventive" || questionName?.startsWith("adult_preventive_")) {
    ids.add("hpa_adult_preventive_zh_tw");
  }
  for (const id of input.extraPackIds ?? []) {
    ids.add(id);
  }

  return [...ids];
}

export function getDomainPacks(ids = defaultPackIds): VoiceDomainPack[] {
  return ids.map((id) => packMap.get(id)).filter((pack): pack is VoiceDomainPack => Boolean(pack));
}

export function domainPackVersions(packsToVersion: VoiceDomainPack[]): Record<string, string> {
  return Object.fromEntries(packsToVersion.map((pack) => [pack.domainId, pack.version]));
}
