import type { VoiceDomainPack } from "@shc/contracts";
import phq9 from "../domain-packs/phq9_zh_tw.json";
import hpaAdultPreventive from "../domain-packs/hpa_adult_preventive_zh_tw.json";
import smartCabinMeasurement from "../domain-packs/smart_cabin_measurement.json";

const packs = [phq9, hpaAdultPreventive, smartCabinMeasurement] as VoiceDomainPack[];
const packMap = new Map(packs.map((pack) => [pack.domainId, pack]));

export function allDomainPacks(): VoiceDomainPack[] {
  return [...packs];
}

export function getDomainPacks(ids = ["phq9_zh_tw", "smart_cabin_measurement"]): VoiceDomainPack[] {
  return ids.map((id) => packMap.get(id)).filter((pack): pack is VoiceDomainPack => Boolean(pack));
}

export function domainPackVersions(packsToVersion: VoiceDomainPack[]): Record<string, string> {
  return Object.fromEntries(packsToVersion.map((pack) => [pack.domainId, pack.version]));
}
