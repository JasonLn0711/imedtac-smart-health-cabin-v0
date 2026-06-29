---
id: smart-health-cabin-sprint-5-five-run-demo
title: "Sprint 5 Five-Run Demo Evidence"
date: 2026-07-10
topic: smart-health-cabin
type: validation-evidence
status: accepted
---

# Sprint 5 Five-Run Demo Evidence

Sprint 5 live acceptance requires five complete runs with live ASR, live Gemma 4
E4B through vLLM, live BreezyVoice default voice, live Redpanda publication, and
public report access.

## Measurement Environment

The live-provider and LLM comparison numbers in this evidence set were measured
on the following local workstation. Latency, VRAM pressure, and token budget
conclusions should be compared against this environment, not treated as
hardware-independent constants.

| Layer | Value |
| --- | --- |
| OS | Ubuntu 24.04.4 LTS (`noble`) |
| Kernel | Linux `6.17.0-35-generic` x86_64 |
| CPU | Intel Core i9-14900HX, 32 logical CPUs, 24 cores / 32 threads |
| RAM | 62 GiB total; 42 GiB available at measurement time |
| GPU | NVIDIA GeForce RTX 4090 Laptop GPU |
| GPU memory | 16,376 MiB total |
| NVIDIA driver | 580.159.03 |
| CUDA runtime reported by `nvidia-smi` | 13.0 |
| Loaded GPU process state during later Ollama comparison | Ollama `llama-server` about 4,522 MiB VRAM; ASR sidecar about 2,234 MiB VRAM; Xorg about 4 MiB VRAM |
| Node.js | v22.23.1 |
| pnpm / package manager | pnpm 9.15.0 through Corepack |
| npm | 10.9.8 |
| Python | 3.12.3 |
| Ollama | 0.30.7 |
| Ollama Gemma model | `gemma4:e4b`, GGUF `Q4_K_M`, 8.0B, digest `c6eb396dbd5992bbe3f5cdb947e8bbc0ee413d7c17e2beaae69f5d569cf982eb`, context length 4096 |
| ASR sidecar | faster-whisper Breeze-ASR-26 CT2 int8; health reported `engine=faster-whisper`, `sourceModel=MediaTek-Research/Breeze-ASR-26`, loaded `true` |
| ASR Python packages | `torch==2.11.0+cu128`, `ctranslate2==4.8.0`, `faster-whisper==1.2.1`, `transformers==5.10.2` |
| vLLM comparison environment | `vllm==0.22.1`, `torch==2.11.0`, `transformers==5.11.0` |
| Docker | Docker 29.1.3, Docker Compose v2.30.3 |
| Repo package stack | TypeScript 5.7.x, Vite 6.0.x, Vitest 2.1.x, Playwright 1.49.1 |

## Strict Provider Smoke

Recorded on the current workstation with GPU-only AI model inference controls:

| Provider | Endpoint | Result |
| --- | --- | --- |
| ASR | `http://localhost:8001/health` and `POST /asr` | Live. Provider status reports `computeBackend=gpu`, `cpuOffload=false`, `cpuFallbackAllowed=false`; Breeze-ASR-26 int8 transcribed BreezyVoice answer audio. |
| vLLM | `http://localhost:8000/v1` | Live. `/v1/models` lists `gemma-4-e4b`; provider status reports `provider=vllm_openai_compatible`, `computeBackend=gpu`, `cpuOffload=false`, `cpuFallbackAllowed=false`. |
| TTS | `http://localhost:9003/v1` | Live. `/v1/models` lists `MediaTek-Research/BreezyVoice`; provider status reports GPU-only controls and default voice. |
| Voice Agent server | `http://localhost:3004/healthz` | Live. API ready, strict vLLM ready, `acceptanceEligible=true`, GPU-only controls present. |
| Redpanda | `http://localhost:9644/v1/status/ready` | Live. `corepack pnpm smoke:redpanda` returned `{"status":"ready"}`. |

## API-Level Provider Smoke

The API was started with strict Sprint 5 live provider settings:

```text
ASR_SERVICE_URL=http://localhost:8001
ASR_TRANSCRIBE_PATH=/asr
ASR_DEVICE=cuda
LLM_PROVIDER=vllm_openai_compatible
VLLM_BASE_URL=http://localhost:8000/v1
VLLM_MODEL=gemma-4-e4b
LLM_DEVICE=cuda
VLLM_CPU_OFFLOAD_GB=0
BREEZYVOICE_BASE_URL=http://localhost:9003/v1
TTS_DEVICE=cuda
TTS_VOICE=default
```

Results:

| API path | Result |
| --- | --- |
| `POST /api/v1/agent-turns/respond` | Returned `provider=vllm_openai_compatible`, `model=gemma-4-e4b`, and PHQ-9 guidance. |
| `POST /api/v1/agent-turns/tts` | Returned `provider=breezyvoice_default`, `model=MediaTek-Research/BreezyVoice`, and a WAV data URL. |
| `POST /api/v1/agent-turns/asr` | Returned `provider=faster_whisper_breeze_asr_26`, `model=Breeze-ASR-26-CT2-int8`; answer audio transcribed to `幾乎每天`. |
| Customized TTS voice request | Rejected with HTTP 400 and `Custom TTS voice field is not accepted: reference_audio_base64`. |
| `corepack pnpm smoke:api` | Passed; provider status reported `allRequiredLive=true`, `eligible=true`. |
| `corepack pnpm live:check` | Passed; ASR, LLM, TTS, Redpanda, and voice-agent-server were strict eligible. |
| `corepack pnpm smoke:voice-agent` | Passed; service `voice-agent-server`, API ready, LLM strict vLLM eligible, GPU-only controls present. |
| `corepack pnpm smoke:sprint5-live-demo` | Passed five complete live demo runs. |

## Five-Run Matrix

| Run | Status | Evidence |
| --- | --- | --- |
| 1 | Accepted | Session `sess_sprint5_live_1782379741562_1`; vLLM guidance, BreezyVoice question audio 660046 bytes, ASR transcript `幾乎每天`, candidate value `3`, report `rpt_fb9893e9-fe94-4b19-b0a3-12fc9d317d5c`, public status `NORMAL_REFERENCE`. |
| 2 | Accepted | Session `sess_sprint5_live_1782379751836_2`; vLLM guidance, BreezyVoice question audio 621134 bytes, ASR transcript `幾乎每天`, candidate value `3`, report `rpt_80988ab9-46d0-4d9a-9bf5-adc05cfeab03`, public status `NORMAL_REFERENCE`. |
| 3 | Accepted | Session `sess_sprint5_live_1782379761239_3`; vLLM guidance, BreezyVoice question audio 608846 bytes, ASR transcript `幾乎每天兌全大額`, candidate value `3`, report `rpt_e664f468-fe3d-4c3a-a997-4239021af330`, public status `NORMAL_REFERENCE`. |
| 4 | Accepted | Session `sess_sprint5_live_1782379770995_4`; vLLM guidance, BreezyVoice question audio 620622 bytes, ASR transcript `幾乎每天…`, candidate value `3`, report `rpt_6750e7bc-588b-4997-b4f8-5d69167cccba`, public status `NORMAL_REFERENCE`. |
| 5 | Accepted | Session `sess_sprint5_live_1782379780449_5`; vLLM guidance, BreezyVoice question audio 609870 bytes, ASR transcript `幾乎每天`, candidate value `3`, report `rpt_9ad363dc-4e5d-4ad3-993a-836f7367c513`, public status `CONSULT_STAFF`, human review required. |

## Outbox Evidence

The five-run demo wrote outbox events. The outbox worker published all pending
events to live Redpanda:

```bash
DATABASE_URL=postgres://smart_health_cabin:smart_health_cabin_dev@localhost:5432/smart_health_cabin \
OUTBOX_BATCH_SIZE=100 \
corepack pnpm --filter @shc/outbox-worker start
```

Result: `{"published":56,"failed":0}`. Database status after worker:
`published=82`, no pending rows.

## Validation Commands

```bash
corepack pnpm test
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm validate:json
corepack pnpm build
corepack pnpm smoke:redpanda
corepack pnpm smoke:api
corepack pnpm smoke:voice-agent
corepack pnpm live:check
corepack pnpm smoke:sprint5-live-demo
```

The frontend build includes both admin and kiosk apps. Vite reported existing
large chunk warnings for SurveyJS bundles; the builds completed successfully.

## LLM Provider Comparison Update

After the accepted vLLM five-run evidence, Ollama was tested with the same
Gemma 4 E4B PHQ-9 guidance prompt. vLLM and Ollama OpenAI-compatible both
returned empty visible content because thinking-mode tokens consumed the output
budget before final text was emitted. Native Ollama `/api/chat` with
`think:false` returned usable short Traditional Chinese guidance and is now the
preferred LLM runtime. Strict eligibility now accepts providers listed in
`SPRINT5_ALLOWED_LLM_PROVIDERS`; the full experiment log is
`docs/evidence/2026-06-25-llm-thinking-mode-provider-log.md`.
