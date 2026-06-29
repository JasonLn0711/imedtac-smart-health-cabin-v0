import type { VoiceDomainPack } from "@shc/contracts";

export function collectHotwords(packs: VoiceDomainPack[], max = 80): string[] {
  const seen = new Set<string>();
  for (const word of packs.flatMap((pack) => pack.hotwords)) {
    const trimmed = word.trim();
    if (trimmed) {
      seen.add(trimmed);
    }
  }
  return [...seen].slice(0, max);
}
