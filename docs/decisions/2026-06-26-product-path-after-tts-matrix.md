---
id: smart-health-cabin-product-path-after-tts-matrix-2026-06-26
title: "Product Path After Voice Loop And TTS Matrix"
date: 2026-06-26
topic: smart-health-cabin
type: decision-record
status: superseded
superseded_by:
  - ./2026-06-26-voice-first-cosyvoice3-product-path.md
source:
  - ../evidence/2026-06-26-expert-review-product-path-analysis.md
  - ../evidence/2026-06-26-breezyvoice-true-streaming-runtime-unblock-log.md
  - ../evidence/2026-06-26-breezyvoice-true-parallel-segment-batch-experiment-log.md
  - ../evidence/2026-06-25-wakeword-continuous-live-voice-loop-experiment-log.md
---

# Product Path After Voice Loop And TTS Matrix

## Superseded Status

This decision records the first post-TTS-matrix product path. It is preserved as
decision history and superseded by
`docs/decisions/2026-06-26-voice-first-cosyvoice3-product-path.md`.

## Decision

The next Smart Health Cabin product path is:

```text
touch-first questionnaire
+ voice guidance assist
+ tap-to-start / wakeword optional
+ pre-rendered static audio prompt assets
+ conservative ASR mapping
+ confirmation/fallback for uncertainty
+ staff review for sensitive cases
```

Runtime BreezyVoice TTS is removed from the fixed-question critical path until
it passes product latency, audio-quality, and recovery gates. BreezyVoice
streaming, PD hybrid, true parallel segment batching, CosyVoice2-style backend
comparison, and cache-aware streaming work continue only as research lanes.

## Why

The repo now proves that the system can be connected end to end:

```text
questionnaire CMS
+ PHQ-9 kiosk
+ public report
+ ASR/LLM/TTS Avatar loop
+ wakeword activation
+ voice answer auto-fill
+ Redpanda outbox evidence
```

The repo does not yet prove a field-ready voice product. The current limiting
questions are:

1. Can a person in the target room complete the questionnaire by voice with
   recoverable errors?
2. Can fixed prompts play without waiting on slow runtime TTS?
3. Can ASR evidence be trusted enough to write questionnaire state, especially
   when current confidence is not a reliable signal?

## Product Lane

The product lane owns the real-room questionnaire-completion path:

- static audio prompt assets for fixed PHQ-9 content;
- physical-room wakeword and spoken-answer acceptance;
- ASR confidence truthfulness and conservative routing;
- visible correction, confirmation, touch fallback, and staff-review paths;
- full 9-question completion rate;
- voice misfill and critical misfill measurement;
- audit events for mapping, write, fallback, and correction;
- field-demo runbook and operator fallback behavior.

## Research Lane

The research lane may continue only if it does not block the product lane:

- strict BreezyVoice cache-aware streaming;
- CosyVoice2-style product backend comparison;
- PD hybrid and parallel TTS;
- larger batch TTS experiments;
- reranker live promotion;
- additional LLM prompt/temperature sweeps;
- Avatar animation/lip-sync.

## TTS Product Rule

For fixed questionnaire prompts, prefer pre-rendered static audio assets over
runtime TTS.

Runtime TTS must not be placed on the critical path unless all of these pass:

- p95 TTFA <= 1500 ms;
- p95 RTF <= 1.0;
- p95 total latency does not regress against the fallback path;
- no severe audio corruption, truncation, repetition, or unusable seams;
- human audio review passes;
- recovery/fallback behavior is still available.

Serial fallback, fake streaming, batch harnesses, and smoke tests are baseline
or preflight evidence only. They cannot be labeled as product success.

## TTS Evidence Behind This Decision

ABCD minimum matrix:

| Variant | p95 TTFA | p95 total | p95 RTF | Decision |
| --- | ---: | ---: | ---: | --- |
| A_original | 11.4s | 11.4s | 1.135 | Demo fallback only if latency accepted |
| B_segment | 5.9s | 12.0s | 1.101 | Research |
| C_token | 1.9s | 53.9s | 4.377 | Research only |
| D_hybrid | 1.9s | 48.3s | 3.733 | Research only |

Parallel and PD hybrid batch:

| Variant | p95 first ordered | p95 total | Decision |
| --- | ---: | ---: | --- |
| S_serial_segment_baseline | ~4.4s | ~7.3s | Fallback |
| P2_parallel_segment_batch2 | ~7.0s | ~7.3s | Research |
| P3_parallel_segment_batch3 | ~7.5s | ~7.6s | Research |
| PD2_parallel_hybrid_batch2 | ~45.9s | ~46.0s | Research only |
| PD3_parallel_hybrid_batch3 | ~50.9s | ~52.3s | Research only |

Interpretation:

- C/D and PD2/PD3 produce real streaming events.
- They do not pass product latency gates.
- The likely root cause is prefix/window recomputation without cache-aware
  flow/vocoder streaming.
- More batch sizes or more PD variants do not address the product bottleneck.

## ASR Safety Rule

ASR confidence must not be faked.

If the ASR sidecar cannot provide a reliable confidence signal, the response
must expose that truth, for example:

```json
{
  "confidence_available": false
}
```

Downstream routing must treat unavailable confidence as requiring confirmation
or fallback.

Known option confusion:

```text
完全沒有 -> 完全沒用
```

This may be mapped as a PHQ-9 answer candidate only in PHQ-9 answer-slot
context, and it must require confirmation. It must not directly auto-commit.

## Voice Answer Safety Policy

Initial PHQ-9 policy:

- high-confidence general answers may be preselected, but must remain visible
  and correctable;
- PHQ-9 item 9 or self-harm-related content always requires confirmation or
  staff-review routing;
- low confidence does not write state;
- ambiguous answers do not write state;
- no-speech does not write state;
- non-answer speech does not write state;
- unavailable confidence requires confirmation;
- the user must be able to modify the previous answer.

Product posture:

```text
AI helps select.
The user can see, confirm, correct, or fall back.
```

## UI State Requirement

Voice correction is part of the primary flow, not a backup feature.

The UI should make these states explicit:

- `listening`;
- `transcribing`;
- `mapped_candidate`;
- `needs_confirmation`;
- `committed`;
- `retry_or_touch`;
- `staff_review`.

The event vocabulary should move away from repeated `ASR_DONE` for multiple
meanings and toward:

- `ASR_TRANSCRIBED`;
- `TEXT_NORMALIZED`;
- `CANDIDATE_MAPPED`;
- `CONFIRMATION_REQUIRED`;
- `ANSWER_COMMITTED`;
- `FALLBACK_REQUIRED`.

## Redpanda Rule

The user critical path is:

```text
Kiosk -> API -> DB transaction -> response/report
```

Redpanda remains an evidence, replay, audit, multi-consumer, analytics, and
staff-review infrastructure layer. It must not block questionnaire completion
in the MVP path.

## Next Sprints

### Sprint A: Decision Freeze

Duration: 1-2 days.

Goals:

- freeze this product/research split;
- prevent runtime TTS variants from being promoted as product path;
- add evidence chronology discipline;
- update agent/project rules if needed.

### Sprint B: Static Audio Prompt Assets

Duration: 2-3 days.

Goals:

- create `audio_prompt_manifest.json`;
- generate fixed PHQ-9 audio prompts;
- add static audio mode to kiosk;
- ensure standard PHQ-9 flow calls `/tts` zero times for fixed prompts;
- target static prompt playback start p95 < 300 ms;
- complete human audio review for frozen prompts.

### Sprint C: Physical-Room Voice Loop Acceptance

Duration: 3-5 days.

Goals:

- test spoken `你好小慧`;
- test real microphone capture and endpointing;
- test spoken PHQ-9 answer mapping;
- record wake misses, false triggers, ASR transcript, mapped answer,
  confirmation, fallback, correction, turn latency, full completion time, and
  manual intervention;
- require critical unsafe auto-write = 0;
- require touch fallback success = 100%.

### Sprint D: ASR / Mapping Safety Hardening

Duration: 2-4 days.

Goals:

- remove fake ASR confidence;
- add `confidence_available`;
- route unavailable confidence to confirmation;
- add `完全沒用` confusion test;
- harden PHQ-9 answer phrase pack;
- protect PHQ-9 item 9.

### Sprint E: TTS Research Timebox

Duration: 3-5 days, non-blocking.

Goal:

```text
Decide whether BreezyVoice C/D slowness is from recomputation and whether a
cache-aware implementation is realistic.
```

Required metrics:

- text length;
- speech token count;
- mel/acoustic frame count;
- chunk count;
- unique generated tokens;
- total processed tokens;
- recompute ratio;
- LLM / flow / acoustic / vocoder time;
- first speech token;
- first PCM;
- first audio sent;
- total latency;
- RTF;
- VRAM peak;
- CPU/GPU utilization.

Stop rule:

```text
If D_hybrid-like streaming cannot reach p95 TTFA <= 1500 ms, p95 RTF <= 1.0,
non-regressed total latency, and acceptable seam/audio quality within the
timebox, stop productizing BreezyVoice streaming.
```

### Sprint F: Field Demo Hardening

Duration: 3-5 days.

Goals:

- one-command dev/demo startup;
- `smoke:field-demo`;
- provider status panel;
- audio asset readiness;
- microphone permission readiness;
- UI correction controls;
- report token expiry/revocation risk handling;
- tenant/kiosk config cleanup;
- raw-audio consent/retention/anonymization policy for any ASR dataset capture.

## Hard Gates

### Product-Level Gates

| Category | Gate |
| --- | --- |
| Completion | 9 questions can be completed, with touch fallback on failure |
| Safety | critical unsafe auto-write = 0 |
| ASR | known confusions must not directly commit |
| Confirmation | unavailable confidence requires confirmation |
| Wakeword | not the only entry until physical-room acceptance passes |
| Latency | static prompt playback p95 < 300 ms |
| Voice turn | p95 end-to-end turn latency measured and bounded |
| Recovery | user can modify previous answer |
| Audit | every mapping/write/fallback has an event |
| Privacy | raw audio default off; collection requires consent |

### TTS Research Gates

| Category | Gate |
| --- | --- |
| TTFA | p95 <= 1500 ms |
| RTF | p95 <= 1.0 |
| Total latency | not worse than A/B fallback |
| Audio | no truncation, repetition, severe distortion, or unusable seams |
| Streaming | no fake streaming |
| Batch | serial fallback is not true batch |
| Cache | recompute ratio and stage metrics required |

## Stop / Defer List

Do not prioritize:

- more batch-size expansion;
- PD2/PD3 as product candidates;
- more LLM prompt variants unless real users fail to understand;
- reranker as required infrastructure before ambiguity evidence;
- Avatar animation or lip-sync;
- vision/hearing Phase 2;
- Redpanda as user critical path;
- fake confidence for auto-fill;
- simulated wake as field readiness;
- streaming events alone as product success.

## Next Immediate Action

Implement Sprint B and Sprint D before more TTS model research:

1. static PHQ-9 audio prompt assets;
2. ASR confidence truthfulness;
3. conservative confirmation/fallback routing;
4. physical-room voice-loop protocol.

These actions directly reduce user waiting, unsafe writes, and field-readiness
uncertainty.
