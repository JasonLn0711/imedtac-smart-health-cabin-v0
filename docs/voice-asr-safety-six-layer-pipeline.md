# Voice ASR Safety Six-Layer Pipeline

Smart Health Cabin treats ASR text as evidence, not truth. The voice path now
has an implementation boundary in `packages/voice-safety-core` that prevents a
misheard transcript from directly becoming questionnaire state or RAG context.

## Six Layers

1. ASR confidence routing: low-confidence, empty, or safety-sensitive speech
   routes to retry, confirmation, touch fallback, or staff review.
2. N-best / beam capability interface: the contract supports provider N-best,
   but top-1 providers report `nBestAvailable=false`; no fake alternatives are
   produced.
3. Domain lexicon normalization: versioned domain packs repair known zh-TW ASR
   confusions such as `機天 -> 幾天` and `心情滴落 -> 心情低落`.
4. Semantic frame: normalized transcript becomes intent, answer candidates,
   symptoms, temporal expressions, safety flags, and optional retrieval query.
5. Evidence metadata: ASR text, normalized text, domain pack versions,
   hotword capability, N-best capability, semantic frame, and routing decision
   are kept as metadata; raw audio remains off by default.
6. Confirmation / touch fallback: questionnaire writes still require explicit
   confirmation. Reranker output is never a state writer.

## Domain Packs

Domain packs live under:

```text
packages/voice-safety-core/domain-packs/
```

Current packs:

- `phq9_zh_tw`: PHQ-9 frequency options and self-harm staff-review flag.
- `hpa_adult_preventive_zh_tw`: adult preventive health behavior, disease
  history, measurement, and lab vocabulary.
- `smart_cabin_measurement`: shared measurement and kiosk command vocabulary.

Future packs for vision, hearing, and kiosk FAQ can be added without changing
the core router.

## MVP Rules

- Raw ASR text is never questionnaire truth.
- Domain packs cannot create answers outside the active SurveyJS choices.
- Low-confidence ASR does not retrieve, rerank, generate, or write as if it
  were reliable.
- Safety-sensitive speech routes to confirmation or staff review.
- Touch questionnaire remains complete when ASR, LLM, TTS, reranker, or
  Redpanda is unavailable.
