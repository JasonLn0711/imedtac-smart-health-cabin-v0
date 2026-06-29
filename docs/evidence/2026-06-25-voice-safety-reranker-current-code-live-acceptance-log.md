---
id: voice-safety-reranker-current-code-live-acceptance-log-2026-06-25
title: "Voice Safety + Reranker Current-Code Live Acceptance Log"
date: 2026-06-25
topic: smart-health-cabin
type: evidence-log
status: active
---

# Voice Safety + Reranker Current-Code Live Acceptance Log

## Summary

This run validated the current Smart Health Cabin voice-safety and reranker
provider-status path against the local live Sprint 5 stack.

Result:

```text
corepack pnpm live:check
  API_BASE_URL=http://localhost:3007
  VOICE_AGENT_SERVER_URL=http://localhost:3008
  -> passed

corepack pnpm smoke:sprint5-live-demo
  API_BASE_URL=http://localhost:3007
  VOICE_AGENT_SERVER_URL=http://localhost:3008
  -> passed, 5 / 5 runs
```

Scope control:

```text
Reranker status is visible in provider status.
Reranker was unavailable during this run because no Qwen3-Reranker sidecar was
running on port 8014.
RERANKER_REQUIRED_FOR_LIVE_ACCEPTANCE=false, so Sprint 5 base live acceptance
remains eligible through ASR, LLM, TTS, Redpanda, and voice-agent readiness.
When RERANKER_REQUIRED_FOR_LIVE_ACCEPTANCE=true, the reranker must report
mode=live from /status; mock mode is visible but not live-eligible.
```

## Timestamp

```text
2026-06-25T23:43:56+08:00
```

All experiment records in this log use Taiwan local time unless explicitly
marked UTC:

```text
Timezone: Asia/Taipei
UTC offset: +08:00
Evidence collection timestamp: 2026-06-25T23:43:56+08:00
Log update timestamp for date/time completion: 2026-06-25T23:46:40+08:00
UTC equivalent: 2026-06-25T15:46:40+00:00
```

## Experiment Timeline

Each experiment/check below records date, time, command, and outcome.

| Date | Time (Asia/Taipei) | Experiment / check | Command or source | Outcome |
| --- | --- | --- | --- | --- |
| 2026-06-25 | 23:33:48 | Focused safety/API/kiosk unit verification | `corepack pnpm exec vitest run apps/api-server/src/services/questionnaireService.test.ts packages/voice-safety-core/src/voice-safety-core.test.ts apps/kiosk-web/src/features/avatar/avatarStateMachine.test.ts apps/kiosk-web/src/features/avatar/voiceQuestionnaireController.test.ts` | Passed, 57 tests |
| 2026-06-25 | 23:34:38 | Voice-safety smoke gate | `corepack pnpm smoke:voice-safety` | Passed, 10 tests |
| 2026-06-25 | 23:34:53 | Full unit test suite | `corepack pnpm test` | Passed, 75 tests |
| 2026-06-25 | 23:34:53 session | JSON validation | `corepack pnpm validate:json` | Passed |
| 2026-06-25 | 23:34 session | Full workspace typecheck | `corepack pnpm typecheck` | Passed |
| 2026-06-25 | 23:34 session | Full workspace lint | `corepack pnpm lint` | Passed |
| 2026-06-25 | 23:34 session | Full workspace build | `corepack pnpm build` | Passed with Vite chunk-size warnings |
| 2026-06-25 | 23:34 session | Reranker sidecar smoke | temporary `/tmp/shc-reranker-smoke-venv` + `corepack pnpm smoke:reranker` | Passed against mock sidecar |
| 2026-06-25 | 23:40:20 | API focused test after reranker `/status` patch | `corepack pnpm exec vitest run apps/api-server/src/services/questionnaireService.test.ts` | Passed, 26 tests |
| 2026-06-25 | 23:41:17 | API focused retest after type fixes | `corepack pnpm exec vitest run apps/api-server/src/services/questionnaireService.test.ts` | Passed, 26 tests |
| 2026-06-25 | 23:41 session | Full workspace typecheck after type fixes | `corepack pnpm typecheck` | Passed |
| 2026-06-25 | 23:41 session | Diff whitespace check | `git diff --check` | Passed |
| 2026-06-25 | 23:42 session | Current-code API startup | `corepack pnpm --filter @shc/api-server start`, `PORT=3007` | Started at `http://127.0.0.1:3007` |
| 2026-06-25 | 23:42 session | Current-code voice-agent startup | `corepack pnpm --filter @shc/voice-agent-server start`, `VOICE_AGENT_PORT=3008` | Started on port `3008` |
| 2026-06-25 | 23:42 session | Current-code live provider check | `API_BASE_URL=http://localhost:3007 VOICE_AGENT_SERVER_URL=http://localhost:3008 corepack pnpm live:check` | Passed, `eligible=true`; reranker status included as `unavailable` |
| 2026-06-25 | 23:42:09 | Sprint 5 live demo publish + run 1 | `corepack pnpm smoke:sprint5-live-demo`, session timestamp `1782402129449` | Passed run 1 |
| 2026-06-25 | 23:42:30 | Sprint 5 live demo run 2 | session timestamp `1782402150196` | Passed run 2 |
| 2026-06-25 | 23:42:41 | Sprint 5 live demo run 3 | session timestamp `1782402161357` | Passed run 3 |
| 2026-06-25 | 23:42:53 | Sprint 5 live demo run 4 | session timestamp `1782402173785` | Passed run 4 |
| 2026-06-25 | 23:43:04 | Sprint 5 live demo run 5 | session timestamp `1782402184684` | Passed run 5, `CONSULT_STAFF` public status |
| 2026-06-25 | 23:43 session | Redpanda smoke | `REDPANDA_ADMIN_URL=http://localhost:9644 corepack pnpm smoke:redpanda` | Passed, `{"status":"ready"}` |
| 2026-06-25 | 23:43 session | API smoke | `API_BASE_URL=http://localhost:3007 corepack pnpm smoke:api` | Passed, active questionnaire `0.2.1782402129431`, eligible=true |
| 2026-06-25 | 23:43 session | Voice-agent smoke | `VOICE_AGENT_SERVER_URL=http://localhost:3008 corepack pnpm smoke:voice-agent` | Passed, API ready and LLM eligible |
| 2026-06-25 | 23:43:56 | Hardware / OS / infra capture | `date -Is`, `uname -a`, `lsb_release -a`, `lscpu`, `free -h`, Docker status | Captured in this log |
| 2026-06-25 | 23:44:13 | GPU runtime capture | `nvidia-smi` and GPU query | Captured in this log |
| 2026-06-25 | 23:46:40 | Log date/time completion pass | `date -Is`, `TZ=UTC date -Is` | Captured Taiwan and UTC timestamps |

Five-run timestamp conversion:

```text
1782402129431 -> 2026-06-25 23:42:09 CST, questionnaire version publish
1782402129449 -> 2026-06-25 23:42:09 CST, run 1
1782402150196 -> 2026-06-25 23:42:30 CST, run 2
1782402161357 -> 2026-06-25 23:42:41 CST, run 3
1782402173785 -> 2026-06-25 23:42:53 CST, run 4
1782402184684 -> 2026-06-25 23:43:04 CST, run 5
```

## Git State

Base commit at evidence collection:

```text
2b80859dbfb64f761ffd592f9a869aadf335c55f
```

Working tree status during this evidence run:

```text
## main
 M .env.example
 M apps/api-server/src/routes/questionnaireRoutes.ts
 M apps/api-server/src/services/questionnaireService.test.ts
 M apps/api-server/src/services/questionnaireService.ts
 M apps/kiosk-web/src/features/avatar/AvatarPanel.tsx
 M apps/kiosk-web/src/features/avatar/voiceAgentApi.ts
 M docs/reranker-qwen3-0.6b-integration.md
```

Interpretation:

```text
This evidence validates the current worktree, not a clean release commit.
The current-code API used port 3007 and the current-code voice-agent server
used port 3008 so the run would not reuse the older mock API on port 3000 or
the older live API on port 3005.
```

## Hardware And OS

OS:

```text
Ubuntu 24.04.4 LTS (noble)
Linux jnclaw 6.17.0-35-generic #35~24.04.1-Ubuntu SMP PREEMPT_DYNAMIC Tue May 26 19:30:42 UTC 2 x86_64
```

CPU:

```text
Intel(R) Core(TM) i9-14900HX
32 logical CPUs
24 cores, 2 threads per core
CPU max MHz: 5800.0000
CPU min MHz: 800.0000
L3 cache: 36 MiB
```

Memory:

```text
Mem: 62Gi total, 22Gi used, 4.0Gi free, 36Gi buff/cache, 39Gi available
Swap: 8.0Gi total, 648Ki used, 8.0Gi free
```

GPU:

```text
NVIDIA GeForce RTX 4090 Laptop GPU
Driver Version: 580.159.03
CUDA Version: 13.0
Total VRAM: 16376 MiB
Used VRAM during evidence capture: 9433 MiB
Free VRAM during evidence capture: 6512 MiB
Temperature: 47 C
Power draw: 7.94 W
```

GPU processes during evidence capture:

```text
PID 4820    /usr/lib/xorg/Xorg                                  4 MiB
PID 86692   ASR uvicorn / faster-whisper Breeze-ASR             2234 MiB
PID 388803  BreezyVoice uvicorn                                 3840 MiB
PID 444785  Ollama llama-server gemma4:e4b                      3326 MiB
```

## Runtime Versions

```text
node: v22.23.1
pnpm: 9.15.0
python3: 3.12.3
docker: 29.1.3
jq: 1.7
```

Ollama local models:

```json
{
  "models": [
    {
      "name": "gemma4:e4b",
      "model": "gemma4:e4b",
      "modified_at": "2026-06-25T15:42:41.766741901+08:00",
      "size": 9608350718,
      "digest": "c6eb396dbd5992bbe3f5cdb947e8bbc0ee413d7c17e2beaae69f5d569cf982eb",
      "details": {
        "format": "gguf",
        "family": "gemma4",
        "parameter_size": "8.0B",
        "quantization_level": "Q4_K_M"
      },
      "capabilities": ["completion", "tools", "thinking"]
    },
    {
      "name": "gemma4:e2b",
      "model": "gemma4:e2b",
      "modified_at": "2026-06-10T06:48:21.580327137+08:00",
      "size": 7162405886,
      "digest": "7fbdbf8f5e45a75bb122155ed546e765b4d9c53a1285f62fd9f506baa1c5a47e",
      "details": {
        "format": "gguf",
        "family": "gemma4",
        "parameter_size": "5.1B",
        "quantization_level": "Q4_K_M"
      },
      "capabilities": ["completion", "tools", "thinking"]
    }
  ]
}
```

## Running Infrastructure

Docker services:

```text
smart-health-cabin-postgres
  image: postgres:16-alpine
  status: Up 6 hours (healthy)
  port: 5432

smart-health-cabin-redpanda
  image: docker.redpanda.com/redpandadata/redpanda:v24.2.7
  status: Up 6 hours
  ports: 9092, 9644

smart-health-cabin-redpanda-console
  image: docker.redpanda.com/redpandadata/console:v2.7.2
  status: Up 6 hours
  port: 8080
```

Live local services:

```text
ASR:
  URL: http://localhost:8001/health
  status: ok
  service: asr
  runtime: breeze_asr_25
  model: ../../models/breeze-asr-26-ct2-int8
  sourceModel: MediaTek-Research/Breeze-ASR-26
  engine: faster-whisper
  loaded: true

BreezyVoice:
  URL: http://localhost:9003/v1/models
  model: MediaTek-Research/BreezyVoice

Ollama:
  URL: http://localhost:11434
  active model for this run: gemma4:e4b

Wake word:
  URL: http://localhost:8013/status
  provider: sherpa-onnx
  phrase: 你好小慧
  model: sherpa-onnx-kws-zipformer-zh-en-3M-2025-12-20
  mode: live
  ready: true
  listening: true
  local_only: true
  threshold: 0.65
  sample_rate: 16000
  chunk_size: 1280
  execution provider: cpu
  last_error: null

Reranker:
  URL: http://localhost:8014/status
  status during this run: unavailable
  reason: no reranker sidecar was running on port 8014
```

## Temporary Current-Code Stack

The current-code stack was started on ports that did not overlap with older
processes:

```bash
PORT=3007 \
PUBLIC_REPORT_BASE_URL=http://localhost:3007/api/v1/reports \
VOICE_PROVIDER_MODE=live \
ASR_PROVIDER=faster_whisper_breeze_asr_26 \
ASR_SERVICE_URL=http://localhost:8001 \
ASR_HEALTH_PATH=/health \
ASR_TRANSCRIBE_PATH=/asr \
ASR_MODEL=Breeze-ASR-26-CT2-int8 \
ASR_COMPUTE_BACKEND=gpu \
ASR_DEVICE=cuda \
ASR_COMPUTE_TYPE=int8 \
ASR_CPU_OFFLOAD=false \
ASR_ALLOW_CPU_FALLBACK=false \
ASR_LANGUAGE=zh \
LLM_PROVIDER=ollama_native \
LLM_COMPUTE_BACKEND=gpu \
LLM_DEVICE=cuda \
LLM_CPU_OFFLOAD=false \
LLM_ALLOW_CPU_FALLBACK=false \
LLM_BASE_URL=http://localhost:11434 \
LLM_MODEL=gemma4:e4b \
LLM_TEMPERATURE=0.3 \
OLLAMA_THINK=false \
LLM_MAX_TOKENS=80 \
TTS_PROVIDER=breezyvoice_default \
TTS_COMPUTE_BACKEND=gpu \
TTS_DEVICE=cuda \
TTS_CPU_OFFLOAD=false \
TTS_ALLOW_CPU_FALLBACK=false \
BREEZYVOICE_BASE_URL=http://localhost:9003/v1 \
BREEZYVOICE_MODEL=MediaTek-Research/BreezyVoice \
TTS_VOICE=default \
BREEZYVOICE_VOICE_ID=default \
REDPANDA_ADMIN_URL=http://localhost:9644 \
RERANKER_SERVICE_URL=http://localhost:8014 \
RERANKER_STATUS_PATH=/status \
RERANKER_REQUIRED_FOR_LIVE_ACCEPTANCE=false \
corepack pnpm --filter @shc/api-server start
```

```bash
API_BASE_URL=http://localhost:3007 \
VOICE_AGENT_PORT=3008 \
LLM_PROVIDER=ollama_native \
LLM_COMPUTE_BACKEND=gpu \
LLM_DEVICE=cuda \
LLM_CPU_OFFLOAD=false \
LLM_ALLOW_CPU_FALLBACK=false \
LLM_BASE_URL=http://localhost:11434 \
LLM_MODEL=gemma4:e4b \
LLM_TEMPERATURE=0.3 \
OLLAMA_THINK=false \
LLM_MAX_TOKENS=80 \
corepack pnpm --filter @shc/voice-agent-server start
```

## Provider Status Evidence

Command:

```bash
API_BASE_URL=http://localhost:3007 \
VOICE_AGENT_SERVER_URL=http://localhost:3008 \
corepack pnpm live:check
```

Result:

```json
{
  "eligible": true,
  "providers": {
    "asr": {
      "provider": "faster_whisper_breeze_asr_26",
      "model": "Breeze-ASR-26-CT2-int8",
      "mode": "live",
      "endpoint": "http://localhost:8001",
      "ready": true,
      "healthy": true,
      "computeBackend": "gpu",
      "gpuRequired": true,
      "cpuOffload": false,
      "cpuFallbackAllowed": false,
      "acceptanceEligible": true
    },
    "llm": {
      "provider": "ollama_native",
      "model": "gemma4:e4b",
      "mode": "live",
      "endpoint": "http://localhost:11434",
      "ready": true,
      "healthy": true,
      "computeBackend": "gpu",
      "gpuRequired": true,
      "cpuOffload": false,
      "cpuFallbackAllowed": false,
      "acceptanceEligible": true
    },
    "tts": {
      "provider": "breezyvoice_default",
      "model": "MediaTek-Research/BreezyVoice",
      "mode": "live",
      "endpoint": "http://localhost:9003/v1",
      "ready": true,
      "healthy": true,
      "computeBackend": "gpu",
      "gpuRequired": true,
      "cpuOffload": false,
      "cpuFallbackAllowed": false,
      "acceptanceEligible": true
    },
    "reranker": {
      "provider": "qwen3_reranker_0_6b",
      "model": "Qwen3-Reranker-0.6B",
      "mode": "unavailable",
      "endpoint": "http://localhost:8014",
      "ready": false,
      "healthy": false,
      "error_code": "TypeError",
      "computeBackend": "unknown",
      "gpuRequired": true,
      "cpuOffload": false,
      "cpuFallbackAllowed": false,
      "acceptanceEligible": false
    },
    "redpanda": {
      "provider": "redpanda",
      "mode": "live",
      "endpoint": "http://localhost:9644",
      "ready": true,
      "healthy": true,
      "acceptanceEligible": true
    }
  },
  "voiceAgent": {
    "status": "ok",
    "service": "voice-agent-server",
    "api": {
      "endpoint": "http://localhost:3007",
      "ready": true,
      "healthy": true,
      "error_code": null
    },
    "llm": {
      "provider": "ollama_native",
      "model": "gemma4:e4b",
      "mode": "live",
      "endpoint": "http://localhost:11434",
      "ready": true,
      "healthy": true,
      "computeBackend": "gpu",
      "gpuRequired": true,
      "cpuOffload": false,
      "cpuFallbackAllowed": false,
      "acceptanceEligible": true,
      "error_code": null
    }
  }
}
```

## Five-Run Live Demo Evidence

Command:

```bash
API_BASE_URL=http://localhost:3007 \
VOICE_AGENT_SERVER_URL=http://localhost:3008 \
corepack pnpm smoke:sprint5-live-demo
```

Published questionnaire version:

```text
0.2.1782402129431
```

Run table:

| Run | Session ID | ASR transcript | Candidate | Response ID | Public status | Staff review |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `sess_sprint5_live_1782402129449_1` | `幾乎每天` | `3 / 幾乎每天` | `18bc9646-7a09-4346-8c7f-1299032688d5` | `NORMAL_REFERENCE` | `false` |
| 2 | `sess_sprint5_live_1782402150196_2` | `幾乎每天` | `3 / 幾乎每天` | `7ae906e9-f80a-460a-806a-8e1e8d334e56` | `NORMAL_REFERENCE` | `false` |
| 3 | `sess_sprint5_live_1782402161357_3` | `幾乎每天` | `3 / 幾乎每天` | `f80c41a8-9ae5-4508-9633-a5040cd9d3df` | `NORMAL_REFERENCE` | `false` |
| 4 | `sess_sprint5_live_1782402173785_4` | `幾乎每天…` | `3 / 幾乎每天` | `8e6f5286-637d-4cb2-9faa-e468e2bb8667` | `NORMAL_REFERENCE` | `false` |
| 5 | `sess_sprint5_live_1782402184684_5` | `幾乎每天` | `3 / 幾乎每天` | `44982027-1680-4cab-b9f9-5a6a732f98b3` | `CONSULT_STAFF` | `true` |

Full run metrics:

```json
[
  {
    "run": 1,
    "llm_provider": "ollama_native",
    "tts_provider": "breezyvoice_default",
    "asr_provider": "faster_whisper_breeze_asr_26",
    "transcript": "幾乎每天",
    "candidate": {
      "value": 3,
      "text": "幾乎每天",
      "confidence": 0.92,
      "requires_confirmation": true,
      "evidence_text": "幾乎每天"
    },
    "question_tts_bytes": 842830,
    "answer_tts_bytes": 103502
  },
  {
    "run": 2,
    "llm_provider": "ollama_native",
    "tts_provider": "breezyvoice_default",
    "asr_provider": "faster_whisper_breeze_asr_26",
    "transcript": "幾乎每天",
    "candidate": {
      "value": 3,
      "text": "幾乎每天",
      "confidence": 0.92,
      "requires_confirmation": true,
      "evidence_text": "幾乎每天"
    },
    "question_tts_bytes": 861262,
    "answer_tts_bytes": 101454
  },
  {
    "run": 3,
    "llm_provider": "ollama_native",
    "tts_provider": "breezyvoice_default",
    "asr_provider": "faster_whisper_breeze_asr_26",
    "transcript": "幾乎每天",
    "candidate": {
      "value": 3,
      "text": "幾乎每天",
      "confidence": 0.92,
      "requires_confirmation": true,
      "evidence_text": "幾乎每天"
    },
    "question_tts_bytes": 947790,
    "answer_tts_bytes": 104526
  },
  {
    "run": 4,
    "llm_provider": "ollama_native",
    "tts_provider": "breezyvoice_default",
    "asr_provider": "faster_whisper_breeze_asr_26",
    "transcript": "幾乎每天…",
    "candidate": {
      "value": 3,
      "text": "幾乎每天",
      "confidence": 0.92,
      "requires_confirmation": true,
      "evidence_text": "幾乎每天"
    },
    "question_tts_bytes": 854094,
    "answer_tts_bytes": 59982
  },
  {
    "run": 5,
    "llm_provider": "ollama_native",
    "tts_provider": "breezyvoice_default",
    "asr_provider": "faster_whisper_breeze_asr_26",
    "transcript": "幾乎每天",
    "candidate": {
      "value": 3,
      "text": "幾乎每天",
      "confidence": 0.92,
      "requires_confirmation": true,
      "evidence_text": "幾乎每天"
    },
    "question_tts_bytes": 768590,
    "answer_tts_bytes": 80462
  }
]
```

Observed safety behavior:

```text
All five runs required confirmation before a questionnaire answer could be
written.
Run 5 intentionally produced item-9-positive raw answers in the smoke script,
so the public summary returned CONSULT_STAFF and requires_human_review=true.
The smoke script checked that public report output did not expose raw PHQ-9
answers, internal score, diagnostic labels, or treatment-advice terms.
```

## Additional Smoke Checks

```text
REDPANDA_ADMIN_URL=http://localhost:9644 corepack pnpm smoke:redpanda
  -> {"status":"ready"}

API_BASE_URL=http://localhost:3007 corepack pnpm smoke:api
  -> health ok
  -> active questionnaire code phq9
  -> active version 0.2.1782402129431
  -> sprint5Acceptance eligible=true

VOICE_AGENT_SERVER_URL=http://localhost:3008 corepack pnpm smoke:voice-agent
  -> voice-agent-server ok
  -> API endpoint http://localhost:3007 ready=true
  -> Ollama gemma4:e4b live, gpu, acceptanceEligible=true
```

Earlier same-session checks before this log:

```text
corepack pnpm test
  -> 75 tests passed

corepack pnpm typecheck
  -> passed after reranker /status gate patch

corepack pnpm lint
  -> passed

corepack pnpm build
  -> passed with Vite chunk-size warnings for admin-web and kiosk-web

corepack pnpm validate:json
  -> passed

corepack pnpm smoke:voice-safety
  -> 10 voice-safety-core tests passed

corepack pnpm smoke:reranker
  -> passed against a temporary mock reranker sidecar in /tmp venv
```

## Reranker Acceptance Interpretation

Current result:

```text
Provider status includes reranker.
Reranker status is unavailable because no sidecar was running at 8014.
Base Sprint 5 live acceptance passed because reranker promotion was not
required in this run.
```

Implemented gate:

```text
API provider status now checks RERANKER_STATUS_PATH=/status.
If /status reports mode=mock, the provider remains visible but is not live
eligible.
If RERANKER_REQUIRED_FOR_LIVE_ACCEPTANCE=true, live:check includes reranker in
the required provider set and mock/unavailable reranker status blocks
acceptance.
```

Next validation layer:

```text
Start Qwen3-Reranker-0.6B sidecar in mode=live with a real local model path.
Set RERANKER_REQUIRED_FOR_LIVE_ACCEPTANCE=true.
Run live:check again and expect reranker mode=live, ready=true, and
acceptanceEligible=true.
```

## Notes

This experiment used direct-port live providers:

```text
ASR: http://localhost:8001
TTS/BreezyVoice: http://localhost:9003/v1
LLM/Ollama: http://localhost:11434
API current-code: http://localhost:3007
Voice-agent current-code: http://localhost:3008
Redpanda Admin: http://localhost:9644
Wakeword: http://localhost:8013
Reranker: http://localhost:8014, unavailable during this run
```

The older local API process on port `3000` was still running in mock provider
mode. The previous live API process on port `3005` was also running, but it did
not expose the current reranker provider-status changes. This log uses the
current-code temporary stack on `3007/3008`.
