---
id: smart-health-cabin-voice-first-cosyvoice3-product-path-2026-06-26
title: "Voice-First CosyVoice3 Product Path"
date: 2026-06-26
topic: smart-health-cabin
type: decision-record
status: accepted
supersedes:
  - ./2026-06-26-product-path-after-tts-matrix.md
source:
  - ../evidence/2026-06-26-expert-review-voice-first-cosyvoice3-update.md
  - ../evidence/2026-06-26-breezyvoice-true-streaming-runtime-unblock-log.md
  - ../evidence/2026-06-26-breezyvoice-true-parallel-segment-batch-experiment-log.md
  - ../evidence/2026-06-25-wakeword-continuous-live-voice-loop-experiment-log.md
---

# Voice-First CosyVoice3 Product Path

## Decision

The next Smart Health Cabin product path is:

```text
VOICE_CONVERSATION_PRIMARY questionnaire
+ CosyVoice3 real-time streaming TTS production candidate
+ deterministic answer mapping
+ conservative write safety gate
+ touch/staff fallback retained
+ BreezyVoice fallback/research/baseline
```

This supersedes the previous touch-first/static-prompt product default. Static
or cached prompts remain useful fallback assets, but the product mainline now
targets a voice-first questionnaire conversation.

## Provider Decision

- Production candidate: `cosyvoice3_streaming`
- Streaming baseline: `cosyvoice2_streaming` when available
- Operational fallback: `breezyvoice_default`
- Research lane: strict BreezyVoice `D_hybrid` cache-aware streaming
- Cached/static prompt candidate: BreezyVoice default voice or accepted
  CosyVoice3 Taiwan-healthcare voice profile

Do not remove BreezyVoice. Do not keep BreezyVoice runtime modification as the
main product path.

## Questionnaire Mode Decision

Default mode:

```text
VOICE_CONVERSATION_PRIMARY
```

Touch behavior:

```text
Touch-assisted optional.
Touch may be collapsed or hidden in voice-first mode.
Touch and staff fallback must remain available internally.
```

The phrase "no touch" means UI presentation can hide or collapse touch answers.
It does not mean deleting recovery paths.

## Product Loop

The owned product loop is:

```text
wake / start
-> TTS reads current question
-> user answers by voice
-> ASR transcribes
-> deterministic answer mapping selects allowed candidate
-> safety gate decides write / confirmation / fallback
-> system confirms by voice and advances
-> retry / touch / staff path recovers failures
```

LLM may produce bounded guidance and clarification copy. LLM must not decide
questionnaire answers, alter scores, or produce diagnosis.

## Why

BreezyVoice strict ABCD is no longer source-blocked, but no BreezyVoice variant
passes product hard gates:

| Variant | p95 TTFA | p95 total | p95 RTF | Product interpretation |
| --- | ---: | ---: | ---: | --- |
| A_original | 11.407s | 11.410s | 1.135 | Fallback only |
| B_segment | 5.935s | 12.036s | 1.101 | Too slow |
| C_token | 1.922s | 53.910s | 4.377 | Research only |
| D_hybrid | 1.933s | 48.335s | 3.733 | Research only |

PD2/PD3 parallel hybrid also remain research-only, with p95 first ordered
around 45-51 seconds and total time around 46-52 seconds.

The limiting product problem is not another BreezyVoice batch or prompt sweep.
The limiting product problem is a reliable, low-latency, recoverable,
auditable voice questionnaire loop in a real room.

## CosyVoice3 Acceptance Gates

CosyVoice3 becomes the production candidate only after live validation passes:

- p95 TTFA client <= 1500 ms, or p95 TTFA server <= 1500 ms if client timing is
  unavailable;
- p95 RTF <= 1.0;
- failure rate <= 0.5%;
- zero fake streaming;
- no severe seam, repeat, truncation, or audio corruption;
- Taiwan Mandarin listener acceptability passes the project threshold;
- PHQ-9 medical terms and option wording are intelligible;
- GPU memory fits the field-demo runtime budget.

If CosyVoice3 live validation fails, BreezyVoice/cached prompts remain the
operational fallback while provider work continues as research.

## Taiwan Mandarin Control Path

Do not start with fine-tuning. Use the cheaper controls first:

1. Taiwan healthcare speaker prompt profiles.
2. `zh-TW_tts_normalization` for healthcare terms, PHQ-9, acronyms, dates,
   blood pressure, HbA1c, and public-health phrasing.
3. Prompt instruction for natural Taiwan Mandarin, no erhua, no Mainland
   broadcast tone, medium-slow health-kiosk delivery.
4. Fine-tune only after listener review shows the controls are insufficient.

## Stop / Defer List

Stop treating these as product mainline work:

- BreezyVoice PD2/PD3 as near-product candidates;
- larger BreezyVoice batch-size expansion;
- more LLM prompt or temperature sweeps;
- reranker promotion unless room-test ASR confusion proves it is needed;
- Phase 1 vision/hearing expansion;
- Avatar animation, lip-sync, 3D, or Live2D;
- Redpanda in the kiosk critical path.

## Required Next Experiments

1. CosyVoice3 streaming provider live benchmark.
2. Voice-first PHQ-9 real-room test.
3. ASR PHQ-9 option confusion pack.
4. Human TTS review with Taiwan listeners.

## Next Implementation Prompt

Use:

```text
docs/prompts/voice-first-cosyvoice3-streaming-tts-codex-goal-prompt.md
```
