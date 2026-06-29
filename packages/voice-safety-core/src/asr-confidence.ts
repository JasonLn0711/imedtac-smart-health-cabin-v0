import type { AsrHypothesisSet } from "@shc/contracts";

export function buildAsrHypothesisSet(input: {
  primaryText: string;
  confidence?: number;
  avgLogprob?: number;
  nBestTranscripts?: Array<{ text: string; rank: number; confidence?: number; avgLogprob?: number }>;
  hotwordsRequested?: string[];
  hotwordsApplied?: boolean;
}): AsrHypothesisSet {
  const nBest = input.nBestTranscripts?.filter((item) => item.text.trim()) ?? [];
  const hypotheses = nBest.length
    ? nBest.map((item) => ({
        text: item.text,
        rank: item.rank,
        confidence: item.confidence,
        avgLogprob: item.avgLogprob,
        source: "provider_n_best" as const
      }))
    : [
        {
          text: input.primaryText,
          rank: 1,
          confidence: input.confidence,
          avgLogprob: input.avgLogprob,
          source: "provider_top1" as const
        }
      ];

  return {
    primaryText: input.primaryText,
    nBestAvailable: nBest.length > 1,
    hypotheses,
    hotwordsRequested: input.hotwordsRequested ?? [],
    hotwordsApplied: input.hotwordsApplied ?? false
  };
}
