---
id: smart-health-cabin-evidence-chronology
title: "Smart Health Cabin Evidence Chronology"
date: 2026-06-26
topic: smart-health-cabin
type: evidence-policy
status: active
---

# Evidence Chronology

## Purpose

This chronology separates actual experiment evidence from future-dated plans,
templates, generated packet material, and handoff docs.

It exists because the expert review identified a real evidence-discipline risk:
the repo contains documents dated after the current packet date
`2026-06-26`, including devlog/API/ERD/ops files with `2026-06-29` through
`2026-07-10` dates. Those files may be planning artifacts, generated handoff
material, or future sprint closeout templates. They must not be read as
completed evidence unless their evidence status and supporting logs say so.

## Reading Rule

Use this order when interpreting evidence:

1. Actual experiment timestamp inside the evidence log.
2. Run ID / artifact path / command output.
3. Git commit and repo state at the time.
4. Document frontmatter date.
5. File modification date.

If these disagree, the experiment timestamp and artifact path control the
claim.

## Actual Evidence Recorded By Date

| Date | Evidence | Status | Notes |
| --- | --- | --- | --- |
| `2026-06-25` | `docs/evidence/sprint-5-five-run-demo.md` | accepted evidence | Five-run live-provider demo, strict provider smoke, Redpanda outbox publication, and LLM provider comparison update. |
| `2026-06-25` | `docs/evidence/2026-06-25-llm-thinking-mode-provider-log.md` | accepted evidence | Explains why native Ollama with `think:false` became the working LLM path. |
| `2026-06-25` | `docs/evidence/2026-06-25-llm-one-to-five-guidance-experiment-log.md` | accepted evidence | Selects 1-5 sentence staff-first guidance and `LLM_MAX_TOKENS=80`. |
| `2026-06-25` | `docs/evidence/2026-06-25-llm-temperature-sweep-experiment-log.md` | accepted evidence | Selects `LLM_TEMPERATURE=0.3` as flexible demo default; `0` remains stability baseline. |
| `2026-06-25` | `docs/evidence/2026-06-25-voice-safety-reranker-current-code-live-acceptance-log.md` | accepted evidence | Current-code live acceptance with reranker status visible but not required. |
| `2026-06-25` to `2026-06-26` | `docs/evidence/2026-06-25-wakeword-continuous-live-voice-loop-experiment-log.md` | accepted evidence | Wakeword/voice loop validation, browser request-level evidence, and later voice-answer auto-fill evidence. Simulated wake and fake microphone audio remain scoped controls. |
| `2026-06-26` | `docs/evidence/2026-06-26-breezyvoice-streaming-2x2-experiment-log.md` | smoke/preflight evidence | Deterministic BreezyVoice 2x2 harness and manifest/report generation. |
| `2026-06-26` | `docs/evidence/2026-06-26-breezyvoice-streaming-2x2-live-experiment-log.md` | accepted evidence | Live A/B evidence and original C/D source blocker. |
| `2026-06-26` | `docs/evidence/2026-06-26-breezyvoice-true-streaming-runtime-unblock-log.md` | accepted evidence | Strict BreezyVoice C/D token/audio streaming unblock and ABCD minimum matrix. |
| `2026-06-26` | `docs/evidence/2026-06-26-breezyvoice-batch-tts-2x2-experiment-log.md` | accepted evidence | Batch harness and serial fallback boundary; true batch not proven. |
| `2026-06-26` | `docs/evidence/2026-06-26-breezyvoice-true-parallel-segment-batch-experiment-log.md` | accepted evidence | True parallel segment batch and PD hybrid batch matrix evidence. |
| `2026-06-26` | `docs/evidence/2026-06-26-expert-review-product-path-analysis.md` | expert review evidence | First post-TTS-matrix expert recommendation; superseded as product default by the later voice-first/CosyVoice3 recommendation. |
| `2026-06-26` | `docs/evidence/2026-06-26-expert-review-voice-first-cosyvoice3-update.md` | expert review evidence | Updated expert recommendation adopted as current product direction: voice-first questionnaire conversation, CosyVoice3 streaming as production candidate, BreezyVoice fallback/research. |
| `2026-06-26` | `docs/evidence/cosyvoice3-streaming-provider-validation.md` | accepted evidence | CosyVoice3 provider boundary, local official backend install, provider default alignment, API descriptor smoke, WebSocket PCM16 chunk streaming, and mini live provider benchmark. Physical-room acceptance and Taiwan speaker-prompt review remain future gates. |
| `2026-06-26` | `docs/evidence/voice-first-room-acceptance-plan.md` | planning/reference | Physical-room voice-first PHQ-9 acceptance plan and manual data template command. Not field-ready evidence until real-room runs are recorded. |
| `2026-07-02` | `docs/evidence/2026-07-02-voice-first-room-acceptance-minimum-checklist.md` | planning/reference | One-speaker minimum pilot checklist for the ASR + LLM + CosyVoice3 real-room UX gate. It is not completion evidence until the S1 run artifact and evidence report exist. |
| `2026-07-02` | `docs/evidence/2026-07-02-voice-first-room-acceptance-s1-v1.md` | blocked runtime evidence | One-speaker S1 pilot evidence with live wakeword/ASR/LLM/TTS checks, ASR mapping rounds, VRAM/OOM failure, user-observed incoherent TTS feedback after OOM, and repeated empty-ASR recovery. Current status is `BLOCKED_UNRESOLVED` until the full voice-first loop completes under a clean GPU memory envelope. |
| `2026-07-02` | `docs/evidence/2026-07-02-voice-first-room-acceptance-s1-v2.md` | accepted evidence | S1 retest completed the one-speaker minimum voice-room gate with automatic microphone selection, live wakeword, real microphone ASR, Ollama LLM guidance, CosyVoice3 streaming TTS, item 9 staff-review routing, public report token creation, and background runtime/agent-turn collection. Current status is `LIVE_MINIMUM_COMPLETED`; multi-speaker field readiness remains a future gate. |

## Planning, Handoff, Or Future-Dated Documents

The following file groups may include future sprint dates or generated
handoff/planning dates. Treat them as planning or reference documents unless a
linked evidence log supports the claim.

| Path | How to read |
| --- | --- |
| `docs/devlog/2026-06-29.md` through `docs/devlog/2026-07-10.md` | Sprint closeout or planned closeout material. Verify against evidence logs before treating as completed work. |
| `docs/api/API_SUMMARY.md` | API reference summary. It may carry a later date and should be read as current architecture documentation, not experiment proof. |
| `docs/db/ERD_SUMMARY.md` | DB reference summary. It is architecture documentation, not experiment proof by itself. |
| `docs/ops/LIVE_PROVIDER_RUNBOOK.md` | Operating runbook. It is an execution guide and must be paired with live-check evidence for claims. |
| `docs/handoff/*` | Handoff material. It summarizes capability and next gates but should not replace evidence logs. |
| `docs/prompts/*` | Execution prompts. They define intended work and acceptance gates; they are not proof that the work completed. |

## Evidence Claim Labels

Use these labels in future logs and handoff material:

- `accepted evidence`: command/run/artifact-backed result.
- `smoke/preflight evidence`: useful setup proof, not product success.
- `source-blocked`: source inspection found missing runtime capability.
- `research-only`: technically valid, but not product-ready under gates.
- `planning/reference`: design or future work, not completed evidence.
- `field-ready`: physical-room acceptance passed with real users/devices.

## Current Product-Path Interpretation

As of this chronology, the evidence supports:

```text
System integration MVP exists.
CosyVoice3 streaming TTS provider live validation exists.
Field-ready voice product is not yet proven.
Current product direction is VOICE_CONVERSATION_PRIMARY with CosyVoice3
streaming as the production TTS candidate.
The next execution layer is a one-speaker real-room minimum pilot before the
full multi-speaker field-ready gate.
```

Field readiness still requires:

- physical-room spoken `你好小慧` wakeword test;
- real microphone spoken PHQ-9 answer loop;
- measured wake miss rate and false-trigger rate;
- measured ASR confusion and voice misfill rate;
- confirmation/fallback recovery evidence;
- human TTS audio-quality review with Taiwan healthcare prompt audio;
- CosyVoice3 vs BreezyVoice/CosyVoice2 provider benchmark evidence.

## Required Future Evidence Fields

Every new experiment should record:

- local date/time and timezone;
- UTC date/time when useful;
- run ID;
- repo commit;
- branch;
- command;
- environment and hardware;
- providers and model versions;
- input set;
- output artifact paths;
- pass/fail gates;
- failure taxonomy;
- product/research status.

## Current Evidence Risk

The repo should avoid saying "completed" based only on future-dated devlogs,
prompts, or handoff docs. The controlling evidence must be the actual
experiment log and run artifact.
