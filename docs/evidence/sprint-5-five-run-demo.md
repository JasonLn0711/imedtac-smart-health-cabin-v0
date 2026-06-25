---
id: smart-health-cabin-sprint-5-five-run-demo
title: "Sprint 5 Five-Run Demo Evidence"
date: 2026-07-10
topic: smart-health-cabin
type: validation-evidence
status: partial
---

# Sprint 5 Five-Run Demo Evidence

Sprint 5 live acceptance requires five complete runs with live ASR, live Gemma 4
E4B through vLLM, live BreezyVoice default voice, live Redpanda publication, and
public report access.

## Current Provider Smoke

Recorded on the current workstation:

| Provider | Endpoint | Result |
| --- | --- | --- |
| ASR | `http://localhost:8001/health` and `POST /asr` | Live. Reports faster-whisper, Breeze-ASR-26 source model, CT2 int8 model path, and transcribed BreezyVoice audio as `請回答現在這題`. |
| LLM | `http://localhost:11434/v1` | Live compatibility. `/v1/models` lists `gemma4:e4b`; `/v1/chat/completions` returned `OK`. |
| TTS | `http://localhost:9003/v1` | Live. `/v1/models` lists `MediaTek-Research/BreezyVoice`; default voice generated a 103502-byte PCM WAV. |
| vLLM | `http://localhost:8000/v1` | Blocked for strict Sprint 5: no service listening on port 8000. |
| Redpanda | `http://localhost:9644/v1/status/ready` | Live. `corepack pnpm smoke:redpanda` returned `{"status":"ready"}`. |

## API-Level Provider Smoke

The API was started with the current local compatibility set:

```text
ASR_SERVICE_URL=http://localhost:8001
ASR_TRANSCRIBE_PATH=/asr
LLM_PROVIDER=ollama_openai_compatible
LLM_BASE_URL=http://localhost:11434/v1
LLM_MODEL=gemma4:e4b
BREEZYVOICE_BASE_URL=http://localhost:9003/v1
TTS_VOICE=default
```

Results:

| API path | Result |
| --- | --- |
| `POST /api/v1/agent-turns/respond` | Returned `provider=ollama_openai_compatible`, `model=gemma4:e4b`, and PHQ-9 guidance. |
| `POST /api/v1/agent-turns/tts` | Returned `provider=breezyvoice_default`, `model=MediaTek-Research/BreezyVoice`, and a WAV data URL. |
| `POST /api/v1/agent-turns/asr` | Returned `provider=faster_whisper_breeze_asr_26`, `model=Breeze-ASR-26-CT2-int8`, transcript `請回答現在這題`. |
| Customized TTS voice request | Rejected with HTTP 400 and `Custom TTS voice field is not accepted: reference_audio_base64`. |
| `corepack pnpm smoke:api` | Passed; provider status reported `allRequiredLive=true`, `eligible=false`. |
| `corepack pnpm live:check` | Failed correctly because LLM is live compatibility but not strict vLLM: `LLM_PROVIDER_NOT_VLLM`. |

## Five-Run Matrix

| Run | Status | Evidence |
| --- | --- | --- |
| 1 | Not accepted yet | Strict vLLM gate is not live. |
| 2 | Not accepted yet | Strict vLLM gate is not live. |
| 3 | Not accepted yet | Strict vLLM gate is not live. |
| 4 | Not accepted yet | Strict vLLM gate is not live. |
| 5 | Not accepted yet | Strict vLLM gate is not live. |

## Next Acceptance Action

Start vLLM with Gemma 4 E4B at `http://localhost:8000/v1`, start Redpanda, run
the API with `VOICE_PROVIDER_MODE=live`, then run:

```bash
corepack pnpm smoke:redpanda
corepack pnpm smoke:api
corepack pnpm live:check
```

Only after those checks pass should the five browser/API demo runs be recorded
as Sprint 5 acceptance evidence.
