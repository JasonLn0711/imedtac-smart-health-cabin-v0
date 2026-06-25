---
id: smart-health-cabin-sprint-4-5-codex-goal-prompt
title: "Sprint 4.5 Codex Goal Prompt"
date: 2026-06-25
topic: smart-health-cabin
type: codex-goal-prompt
status: active
source:
  - ../specs/MVP-QUESTIONNAIRE-AVATAR-SPRINT-PLAN.md
  - ./sprint-4-codex-goal-prompt.md
  - ../handoff/sprint-0-4-to-sprint-5-plus-handoff.md
  - ../../modules/questionnaire/seed/phq9.zh-TW.surveyjs.json
  - ../../modules/avatar-agent/module.manifest.json
---

# Sprint 4.5 Codex Goal Prompt

結論：Sprint 4.5 是技術選型凍結 sprint。它不是 Sprint 5 的 handoff，也不是做更炫的 Avatar；它的任務是把 Avatar / ASR / LLM / TTS / runtime / API / testing / observability / deployment 具體化，讓 Sprint 4 demo path 從 adapter 抽象層進入可啟動、可測試、可替換、可回退的 local-first AI pipeline。

## Frozen Technical Choices

| Module | Selection |
| --- | --- |
| ASR | `faster-whisper` + `Breeze-ASR-26` CTranslate2 int8 |
| LLM | local `Gemma 4 E4B` |
| TTS | local `BreezyVoice` default voice only |
| Avatar visual | static image Avatar |
| Avatar state | `xstate` + `@xstate/react` |
| LLM runtime | `vLLM` OpenAI-compatible local server |
| ASR/TTS service | Python FastAPI sidecar |
| Voice orchestrator | TypeScript `apps/voice-agent-server` |
| Browser recording | Web `MediaRecorder` |
| Contract schema | `zod` |
| Redpanda client | `kafkajs` |
| Logging | Node `pino` + Python JSON logging |

## Model And Runtime Notes

- `Breeze-ASR-26` is a Taiwan Taigi-oriented ASR model based on Whisper large-v2 fine-tuning. Sprint 4.5 must include Mandarin, Taigi, and mixed-speech smoke tests so the project does not accidentally treat a Taigi ASR as a general Mandarin PHQ-9 ASR without evidence.
- `faster-whisper` is the ASR runtime direction because it uses CTranslate2 and matches the int8 Breeze-ASR-26 deployment path.
- `vLLM` is selected because it can expose an OpenAI-compatible local server, keeping backend logic independent from Gemma-specific runtime code.
- `BreezyVoice` is selected as local Taiwan Mandarin TTS, but Sprint 4.5 must use the default voice only. Reference audio, speaker embedding, custom voice ID, and voice cloning requests are out of scope.
- Avatar visual output is intentionally simplified to one static image. Animation, lip-sync, viseme extraction, expression rigging, Live2D, 3D, HeyGen, D-ID, Synthesia, Unity, and Unreal are deferred.

Reference links from the planning discussion:

- Breeze-ASR-26: <https://huggingface.co/MediaTek-Research/Breeze-ASR-26>
- faster-whisper: <https://github.com/SYSTRAN/faster-whisper>
- vLLM OpenAI-compatible server: <https://docs.vllm.ai/en/latest/serving/openai_compatible_server/>
- BreezyVoice: <https://github.com/mtkresearch/BreezyVoice>
- XState: <https://stately.ai/docs/xstate>
- Redpanda Kafka compatibility: <https://docs.redpanda.com/streaming/current/develop/kafka-clients/>

## Static Image Avatar Decision

Avatar visual implementation is intentionally simplified.

Use one static image as the Avatar representation for Sprint 4.5. The image
should sit inside the existing kiosk question/voice panel. State should be
represented by text badge, status label, optional border/highlight, and
confirmation card.

Required behavior:

- default image path: `/avatar/default-avatar.svg`;
- in Vite apps, expose this with `VITE_AVATAR_IMAGE_SRC=/avatar/default-avatar.svg`;
- in Next.js apps, expose this with `NEXT_PUBLIC_AVATAR_IMAGE_SRC=/avatar/default-avatar.svg`;
- if `apps/kiosk-web/public/avatar/default-avatar.png` or `.webp` exists, prefer that asset and document the selected path;
- if no Avatar image exists, create a simple replaceable static SVG placeholder at `apps/kiosk-web/public/avatar/default-avatar.svg`;
- add Traditional Chinese alt text, for example `健康檢測助理`;
- do not animate the image;
- do not sync mouth movement to TTS;
- do not add viseme extraction;
- do not add expression image switching unless assets already exist and implementation stays trivial;
- keep an `AvatarRenderer` / `AvatarImage` boundary so a later sprint can replace this with animated Avatar without changing voice/questionnaire logic.

Deferred to a later sprint:

- animated Avatar;
- lip-sync;
- mouth movement;
- viseme mapping;
- facial expression rigging;
- Live2D / 3D / HeyGen / D-ID / Synthesia / Unity / Unreal integration.

## Copy-Paste Codex Prompt

````text
你是 Codex。請以資深 full-stack / AI systems engineer / systems architect 的標準，在本機 repo 直接完成 Smart Health Cabin Sprint 4.5。這次任務是「技術套件與 AI 模型選型凍結 + local-first provider 實作 + Sprint 4 demo path 強化」。

你必須實際修改檔案、補設定、補 provider adapters、補 tests、補 docs/devlog，最後回報 diff summary、validation evidence、live/model status、fallback status、blocker 或 done status。不要只寫計畫。

Repository:

```bash
cd /home/jnclaw/every_on_git_jnclaw/phd-life-system/imedtac-smart-health-cabin-v0
```

Sprint 4.5 完成線：

* ASR provider selected and wired: faster-whisper + Breeze-ASR-26 int8;
* LLM provider selected and wired: local Gemma 4 E4B via vLLM OpenAI-compatible endpoint;
* TTS provider selected and wired: local BreezyVoice default voice only;
* Avatar renderer selected: static image Avatar shell;
* Avatar state machine selected: xstate + @xstate/react;
* browser audio capture selected: MediaRecorder;
* service contracts selected: Zod DTOs in packages/contracts;
* voice model sidecars selected: Python FastAPI for ASR and TTS;
* Node orchestrator selected: existing apps/voice-agent-server TypeScript;
* structured logging selected: pino for Node, JSON logging for Python;
* provider-status route exists;
* .env.example contains all required model/service config;
* live provider can start, or exact blocker is recorded;
* mocked E2E still passes if live provider is blocked;
* Sprint 4 PHQ-9/report/QR/outbox path remains intact;
* docs/devlog/2026-07-09.md is written.

重點判斷：Sprint 4.5 不應該做「更炫的 Avatar」，而是要把 voice stack 變成可啟動、可測試、可替換、可 demo、出錯可回退的本機 AI pipeline。這比外觀更重要。

## 1. Sprint 4.5 Scope

Sprint 4.5 sits between Sprint 4 and Sprint 5.

It should harden the local provider stack before Sprint 5 final demo/handoff.
It should not replace Sprint 5. Sprint 5 still owns E2E hardening, roles,
deployment docs, API docs, DB ERD, known limitations, and Phase 2 activation
plan.

Do:

```text
- freeze ASR / LLM / TTS / Avatar / runtime choices;
- add provider config and .env.example;
- implement provider status route;
- wire local-first adapters behind existing voice interfaces;
- keep deterministic mock fallback;
- add static image Avatar component/boundary;
- keep xstate-managed state flow;
- add model/runtime smoke tests;
- add no-custom-voice guard tests;
- add docs/devlog/2026-07-09.md with exact live/fallback status.
```

Do not:

```text
- implement animated Avatar;
- implement lip-sync, viseme mapping, Live2D, or 3D;
- implement customized TTS voice;
- add reference audio, speaker embedding, custom voice ID, or voice cloning request;
- turn Breeze-ASR-26 into an untested Mandarin ASR claim;
- move PHQ-9 scoring to frontend;
- bypass answer confirmation;
- break touch fallback;
- make Redpanda or live AI providers block kiosk/report completion.
```

## 2. Inspect Before Editing

Run:

```bash
git status --short
find . -maxdepth 4 -type f | sort | sed -n '1,260p'
jq . modules/questionnaire/seed/phq9.zh-TW.surveyjs.json >/dev/null
jq . modules/questionnaire/scoring/phq9.public-scoring-config.json >/dev/null
corepack pnpm validate:json
corepack pnpm test
git diff --check
```

If baseline fails, fix the smallest regression first. Do not implement provider
work on a broken Sprint 4 path.

## 3. Static Image Avatar

Use a static image for Sprint 4.5.

Required files and behavior:

```text
apps/kiosk-web/public/avatar/default-avatar.svg
apps/kiosk-web/src/features/avatar/AvatarImage.tsx
```

Rules:

* default image path: `/avatar/default-avatar.svg`;
* Vite env: `VITE_AVATAR_IMAGE_SRC=/avatar/default-avatar.svg`;
* Next env only if applicable: `NEXT_PUBLIC_AVATAR_IMAGE_SRC=/avatar/default-avatar.svg`;
* if `public/avatar/default-avatar.png` or `.webp` exists, prefer that asset and document it;
* if no image exists, create a simple replaceable SVG placeholder;
* alt text must be Traditional Chinese, e.g. `健康檢測助理`;
* state display uses badge, label, border/highlight, and confirmation card;
* image must not animate;
* no mouth movement, no viseme, no lip-sync, no Live2D, no 3D, no Avatar SDK.

Keep an `AvatarRenderer` / `AvatarImage` boundary so a future sprint can swap in animated Avatar without changing questionnaire or voice logic.

## 4. Avatar State

Use `xstate` + `@xstate/react` for the state machine if not already present.

The important tested state flow is:

```text
idle
-> listening
-> recording
-> transcribing
-> thinking
-> confirming_answer
-> writing_answer
-> idle
```

Fallback:

```text
any provider error -> error_fallback -> touch fallback remains available
```

The static image is only presentation. The state machine remains the governed
part.

## 5. ASR Provider

Selected provider:

```text
faster-whisper + Breeze-ASR-26 CTranslate2 int8
```

Implement through a Python FastAPI sidecar if the repo does not already have a
better provider boundary.

Required config:

```text
ASR_PROVIDER=faster_whisper_breeze_asr_26
ASR_SERVICE_URL=http://localhost:8011
ASR_MODEL_PATH=/models/breeze-asr-26-ct2-int8
ASR_DEVICE=auto
ASR_COMPUTE_TYPE=int8
ASR_LANGUAGE_HINT=zh
```

Add smoke tests or documented test cases for:

```text
Mandarin PHQ-9 answer phrase
Taigi phrase
mixed Mandarin / Taigi phrase
noise or empty audio fallback
```

If model files are missing, keep mock ASR working and record the exact blocker.

## 6. LLM Provider

Selected provider:

```text
local Gemma 4 E4B via vLLM OpenAI-compatible server
```

Required config:

```text
LLM_PROVIDER=vllm_openai_compatible
LLM_BASE_URL=http://localhost:8000/v1
LLM_MODEL=gemma-4-e4b
LLM_TIMEOUT_MS=15000
```

Rules:

* call OpenAI-compatible `/chat/completions`;
* do not hard-code Gemma runtime in business logic;
* keep mock LLM fallback;
* LLM may explain and suggest candidate mapping only;
* LLM must not diagnose, score, or write answer without confirmation.

## 7. TTS Provider

Selected provider:

```text
local BreezyVoice default voice only
```

Required config:

```text
TTS_PROVIDER=breezyvoice_default
TTS_SERVICE_URL=http://localhost:8012
TTS_MODEL_PATH=/models/breezyvoice
TTS_VOICE_ID=default
TTS_CACHE_DIR=.local/tts-cache
```

Forbidden:

```text
reference audio
speaker embedding
custom voice ID
voice cloning request
uploaded speaker sample
```

Add tests that fail if API request shape accepts custom voice fields.

If BreezyVoice cannot start, keep mock TTS playable fallback and record exact blocker.

## 8. Provider Sidecars

Use Python FastAPI sidecars for ASR and TTS:

```text
apps/model-sidecars/asr-service/
apps/model-sidecars/tts-service/
```

Use existing repo conventions if another sidecar path already exists.

Required endpoints:

```text
GET /healthz
GET /readyz
POST /v1/asr/transcribe
POST /v1/tts/synthesize
```

Logging:

* Python services use JSON logging.
* Logs include provider, model path, mode, latency, and error code.
* Logs must not include raw PHQ-9 answers beyond minimal demo text needed for debugging.

Audio:

* browser records with `MediaRecorder`;
* normalize audio with ffmpeg only if already installed or documented as requirement;
* temporary audio belongs in ignored local temp path;
* do not commit generated audio.

## 9. TypeScript Voice Orchestrator

Use existing:

```text
apps/voice-agent-server
```

or existing API route/service if the repo already routes voice through
`apps/api-server`.

Add:

```text
ASRAdapter
LLMAdapter
TTSAdapter
ProviderStatusService
```

Provider modes:

```text
mock
live
unavailable
```

Add route:

```text
GET /api/v1/providers/status
```

Response shape:

```json
{
  "asr": {
    "provider": "faster_whisper_breeze_asr_26",
    "mode": "mock|live|unavailable",
    "ready": true
  },
  "llm": {
    "provider": "vllm_openai_compatible",
    "model": "gemma-4-e4b",
    "mode": "mock|live|unavailable",
    "ready": true
  },
  "tts": {
    "provider": "breezyvoice_default",
    "mode": "mock|live|unavailable",
    "ready": true
  }
}
```

## 10. Contracts

Use `zod` in `packages/contracts` for:

```text
ProviderStatusResponse
ASRTranscribeRequest / Response
LLMGuidanceRequest / Response
TTSSynthesizeRequest / Response
AvatarState
VoiceProviderMode
```

Do not scatter DTO shapes across frontend and backend.

## 11. Redpanda Client

Selected client:

```text
kafkajs
```

Do not replace the transactional outbox design. Redpanda remains async.

Ensure provider changes do not make Redpanda required for kiosk/API success.

## 12. Observability

Node services:

```text
pino
```

Python services:

```text
JSON logging
```

Add or document:

```text
request_id
session_id
provider
mode
latency_ms
error_code
fallback_used
```

## 13. Tests

Add or update tests for:

```text
provider status route
mock/live/unavailable provider mode
ASR Breeze provider config parsing
Mandarin / Taigi / mixed speech smoke fixtures or documented manual cases
LLM vLLM OpenAI-compatible request shape
TTS BreezyVoice default voice only
TTS rejects reference audio / custom voice fields
AvatarImage static render and alt text
xstate Avatar state transitions
confirmation-before-write remains intact
touch fallback remains intact
Sprint 4 report / QR / outbox regression remains intact
```

## 14. Docs

Update or create:

```text
.env.example
docs/dev/LOCAL_DEV.md
docs/devlog/2026-07-09.md
docs/handoff/sprint-4.5-model-selection.md
```

The devlog must record:

```text
ASR live status:
LLM live status:
TTS live status:
mock fallback status:
static Avatar image path:
custom voice disabled:
Mandarin/Taigi/mixed ASR test status:
Sprint 4 regression status:
```

## 15. Validation

Run:

```bash
corepack pnpm validate:json
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm build
corepack pnpm test
git diff --check
```

If Python sidecar checks exist, run them. If not, provide minimal import/health
checks or exact blocker.

Do not claim live model success unless model files and servers actually started.

## 16. Final Response

Report:

```text
status: complete / partial / blocked
files changed
ASR provider live/mock status
LLM provider live/mock status
TTS provider live/mock status
static Avatar image path
validation commands and results
Sprint 4 regression status
exact blockers
next smallest action for Sprint 5
```
````

## Sprint 4.5 Exit Definition

Sprint 4.5 is complete when:

- model/runtime choices are explicit in code and docs;
- provider status route exists;
- `.env.example` has local model/service config;
- static image Avatar path works or placeholder exists;
- customized voice is explicitly disabled;
- live providers start or exact blockers are recorded;
- mock provider path still preserves Sprint 4 E2E behavior;
- tests cover provider status, default voice, Avatar state, and confirmation-before-write;
- `docs/devlog/2026-07-09.md` records live/fallback status.

Sprint 4.5 should make the local AI stack operationally concrete. Sprint 5 should then harden the demo and handoff.
