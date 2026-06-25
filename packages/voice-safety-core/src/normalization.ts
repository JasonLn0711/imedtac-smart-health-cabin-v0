import type { VoiceDomainPack } from "@shc/contracts";

const fillers = [/嗯+/g, /呃+/g, /那個/g, /就是/g, /然後/g];

function cleanup(text: string): string {
  return fillers.reduce((value, pattern) => value.replace(pattern, ""), text.normalize("NFKC")).replace(/\s+/g, "");
}

export function normalizeTranscript(text: string, packs: VoiceDomainPack[]): string {
  let normalized = cleanup(text);
  const repairs = packs
    .flatMap((pack) => pack.canonicalTerms.flatMap((term) => term.commonAsrErrors.map((error) => [error, term.term] as const)))
    .sort((a, b) => b[0].length - a[0].length);

  for (const [from, to] of repairs) {
    normalized = normalized.replaceAll(from, to);
  }

  return normalized;
}
