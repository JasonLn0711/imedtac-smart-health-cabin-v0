---
id: smart-health-cabin-sprint-4-5-model-selection
title: "Sprint 4.5 Model Selection And Provider Boundary"
date: 2026-07-09
topic: smart-health-cabin
type: handoff
status: active
source:
  - ../prompts/sprint-4.5-codex-goal-prompt.md
  - ../devlog/2026-07-09.md
---

# Sprint 4.5 Model Selection And Provider Boundary

Sprint 4.5 freezes the local-first AI stack while preserving Sprint 4 mock E2E
behavior.

## Frozen Choices

| Layer | Selection | Code / Config |
| --- | --- | --- |
| ASR | `faster-whisper` + `Breeze-ASR-26` CTranslate2 int8 | `ASR_PROVIDER=faster_whisper_breeze_asr_26`, `ASR_SERVICE_URL=http://localhost:8011` |
| LLM | Local Gemma 4 E4B through OpenAI-compatible runtime | `LLM_PROVIDER=vllm_openai_compatible`, `LLM_BASE_URL=http://localhost:8000/v1` |
| TTS | Local BreezyVoice default voice only | `TTS_PROVIDER=breezyvoice_default`, `TTS_SERVICE_URL=http://localhost:8012`, `TTS_VOICE_ID=default` |
| Avatar visual | Static image | `/avatar/default-avatar.svg` |
| Avatar state | `xstate` + `@xstate/react` | `apps/kiosk-web/src/features/avatar/avatarStateMachine.ts` |
| Browser capture | Web `MediaRecorder` | `apps/kiosk-web/src/features/avatar/AvatarPanel.tsx` |
| Contracts | Zod DTO schemas | `packages/contracts/src/index.ts` |
| Sidecars | Python FastAPI | `apps/model-sidecars/asr-service`, `apps/model-sidecars/tts-service` |
| Event layer | Redpanda via `kafkajs` | `apps/outbox-worker` |

## Provider Modes

`GET /api/v1/providers/status` returns each provider as:

```text
mock | live | unavailable
```

Mock mode is the default. It keeps the Sprint 4 demo path runnable without GPU
models. Live mode is enabled with `VOICE_PROVIDER_MODE=live` or
`VOICE_MODEL_MODE=real`.

## Default Voice Rule

BreezyVoice is bounded to the default voice for this lane. API requests reject
reference audio, uploaded speaker samples, speaker embeddings, custom voice IDs,
and voice-cloning fields.

## Live Activation

The canonical Sprint 4.5 live path is:

```text
API server
-> ASR FastAPI sidecar :8011
-> vLLM OpenAI-compatible Gemma endpoint :8000/v1
-> TTS FastAPI sidecar :8012
```

Compatibility is available for an operator who already has local Ollama or the
BreezyVoice upstream OpenAI-compatible service running:

```text
LLM_BASE_URL=http://localhost:11434/v1
BREEZYVOICE_BASE_URL=http://localhost:9003/v1
```

This compatibility path does not change the frozen provider contract.

## ASR Provider Validation Cases

Before using Breeze-ASR-26 as more than a demo adapter, run and record these
manual smoke cases with real audio fixtures:

| Case | Fixture intent | Expected result |
| --- | --- | --- |
| Mandarin PHQ-9 answer | User says `完全沒有`, `幾天`, `一半以上的天數`, or `幾乎每天`. | Transcript maps to the matching SurveyJS option value `0..3`. |
| Taigi phrase | User answers a short Taiwan Taigi phrase relevant to frequency. | Transcript is recorded, confidence/error is logged, and ambiguous output routes to repeat/touch fallback. |
| Mixed Mandarin / Taigi | User mixes Mandarin question words with Taigi answer phrase. | Transcript does not auto-write; candidate mapping requires confirmation. |
| Noise or empty audio | No speech, background noise, or silence. | No candidate answer is written; UI stays in repeat/touch fallback path. |

## Deferred

Animation, lip-sync, viseme extraction, Live2D, 3D, Avatar SDKs, customized TTS
voice, reference audio, and production clinical validation remain outside
Sprint 4.5.
