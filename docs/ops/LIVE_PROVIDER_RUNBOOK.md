---
id: smart-health-cabin-live-provider-runbook
title: "Live Provider Runbook"
date: 2026-07-10
topic: smart-health-cabin
type: ops-runbook
status: active
---

# Live Provider Runbook

Sprint 5 live acceptance runs the questionnaire spine with real local services:
PostgreSQL, API, kiosk, admin, SurveyJS, static Avatar state, ASR, LLM, TTS,
outbox worker, Redpanda, provider status, and public report access.

## Strict Sprint 5 Provider Set

Use this set when claiming Sprint 5 acceptance:

```bash
VOICE_PROVIDER_MODE=live \
ASR_PROVIDER=faster_whisper_breeze_asr_26 \
ASR_SERVICE_URL=http://localhost:8011 \
ASR_HEALTH_PATH=/healthz \
ASR_TRANSCRIBE_PATH=/v1/asr/transcribe \
ASR_MODEL=Breeze-ASR-26-CT2-int8 \
ASR_COMPUTE_TYPE=int8 \
ASR_LANGUAGE=zh \
LLM_PROVIDER=vllm_openai_compatible \
VLLM_BASE_URL=http://localhost:8000/v1 \
VLLM_MODEL=gemma-4-e4b \
TTS_PROVIDER=breezyvoice_default \
TTS_SERVICE_URL=http://localhost:8012 \
TTS_HEALTH_PATH=/healthz \
TTS_SYNTHESIZE_PATH=/v1/tts/synthesize \
TTS_VOICE=default \
REDPANDA_ADMIN_URL=http://localhost:9644 \
corepack pnpm --filter @shc/api-server start
```

The TTS path owns BreezyVoice default voice only. Reference audio, speaker
embedding, custom voice ID, and voice-cloning fields are rejected by contract.

## Current Local Compatibility Set

The current workstation also has a compatible live-provider set already running:

```bash
VOICE_PROVIDER_MODE=live \
ASR_PROVIDER=faster_whisper_breeze_asr_26 \
ASR_SERVICE_URL=http://localhost:8001 \
ASR_HEALTH_PATH=/health \
ASR_TRANSCRIBE_PATH=/asr \
ASR_MODEL=Breeze-ASR-26-CT2-int8 \
ASR_COMPUTE_TYPE=int8 \
ASR_LANGUAGE=zh \
LLM_PROVIDER=ollama_openai_compatible \
LLM_BASE_URL=http://localhost:11434/v1 \
LLM_MODEL=gemma4:e4b \
TTS_PROVIDER=breezyvoice_default \
BREEZYVOICE_BASE_URL=http://localhost:9003/v1 \
BREEZYVOICE_MODEL=MediaTek-Research/BreezyVoice \
TTS_VOICE=default \
BREEZYVOICE_VOICE_ID=default \
REDPANDA_ADMIN_URL=http://localhost:9644 \
corepack pnpm --filter @shc/api-server start
```

This compatibility set proves the local ASR, Gemma 4 E4B, and BreezyVoice
adapter path. It is labeled separately from strict Sprint 5 acceptance when the
acceptance packet requires vLLM specifically.

## Infra And Checks

```bash
docker compose -f infra/docker-compose.yml up -d postgres redpanda redpanda-console
corepack pnpm --filter @shc/api-server migrate
corepack pnpm smoke:redpanda
corepack pnpm smoke:api
corepack pnpm live:check
```

`live:check` passes only when ASR, LLM, TTS, and Redpanda all report
`mode=live`, `ready=true`, and `acceptanceEligible=true`.
