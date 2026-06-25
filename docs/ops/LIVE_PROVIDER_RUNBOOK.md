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

AI model inference is GPU-only for Sprint 5 acceptance. Do not start ASR, vLLM,
or BreezyVoice with CPU fallback, CPU backend, or CPU offload. The provider
status route and `corepack pnpm live:check` reject `computeBackend!=gpu`,
`cpuOffload=true`, and `cpuFallbackAllowed=true`.

Current local vLLM Gemma 4 E4B command:

```bash
VLLM_USE_FLASHINFER_SAMPLER=0 \
PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True \
/home/jnclaw/every_on_git_jnclaw/phd-life-system/jarvis-voice-sight/.venv-vllm/bin/vllm serve \
/home/jnclaw/every_on_git_jnclaw/phd-life-system/jarvis-voice-sight/.local/ollama/models/blobs/sha256-4c27e0f5b5adf02ac956c7322bd2ee7636fe3f45a8512c9aba5385242cb6e09a \
--load-format gguf \
--tokenizer /home/jnclaw/.cache/huggingface/hub/models--google--gemma-4-E2B-it/snapshots/70af34e20bd4b7a91f0de6b22675850c43922a03 \
--served-model-name gemma-4-e4b \
--host 127.0.0.1 \
--port 8000 \
--max-model-len 256 \
--max-num-seqs 1 \
--max-num-batched-tokens 256 \
--kv-cache-memory-bytes 67108864 \
--enforce-eager \
--gpu-memory-utilization 0.55
```

`VLLM_USE_FLASHINFER_SAMPLER=0` avoids FlashInfer sampler JIT when the system
CUDA toolkit is not installed. It is not CPU offload. Keep
`VLLM_CPU_OFFLOAD_GB=0` in the API and voice-agent environment.
The current workstation could not install the CUDA toolkit through APT because
`sudo` requires an interactive password in this session; the sampler flag is the
current repeatable GPU-only runtime path.

Local vLLM compatibility note: the current GGUF loader needs a local alias from
`gemma4_text` to `gemma4` in
`jarvis-voice-sight/.venv-vllm/lib/python3.12/site-packages/vllm/model_executor/model_loader/gguf_loader.py`
before this GGUF starts. Keep this as an environment patch until upstream vLLM
handles the architecture name directly.

Current local BreezyVoice command:

```bash
BREEZYVOICE_GPU_DTYPE=float16 \
BREEZYVOICE_MODEL_PATH=MediaTek-Research/BreezyVoice \
BREEZYVOICE_SPEAKER_PROMPT_AUDIO_PATH=/home/jnclaw/every_on_git_jnclaw/BreezyVoice/data/example.wav \
BREEZYVOICE_SPEAKER_PROMPT_TEXT='在密碼學中，加密是將明文資訊改變為難以讀取的密文內容，使之不可讀的方法。只有擁有解密方法的對象，經由解密過程，才能將密文還原為正常可讀的內容。' \
/home/jnclaw/every_on_git_jnclaw/BreezyVoice/.venv/bin/python -m uvicorn api:app --host 0.0.0.0 --port 9003
```

Use this set when claiming Sprint 5 acceptance:

```bash
VOICE_PROVIDER_MODE=live \
ASR_PROVIDER=faster_whisper_breeze_asr_26 \
ASR_SERVICE_URL=http://localhost:8011 \
ASR_HEALTH_PATH=/healthz \
ASR_TRANSCRIBE_PATH=/v1/asr/transcribe \
ASR_MODEL=Breeze-ASR-26-CT2-int8 \
ASR_COMPUTE_BACKEND=gpu \
ASR_DEVICE=cuda \
ASR_COMPUTE_TYPE=int8 \
ASR_CPU_OFFLOAD=false \
ASR_ALLOW_CPU_FALLBACK=false \
ASR_LANGUAGE=zh \
LLM_PROVIDER=vllm_openai_compatible \
LLM_COMPUTE_BACKEND=gpu \
LLM_DEVICE=cuda \
LLM_CPU_OFFLOAD=false \
LLM_ALLOW_CPU_FALLBACK=false \
VLLM_BASE_URL=http://localhost:8000/v1 \
VLLM_MODEL=gemma-4-e4b \
VLLM_CPU_OFFLOAD_GB=0 \
TTS_PROVIDER=breezyvoice_default \
TTS_COMPUTE_BACKEND=gpu \
TTS_DEVICE=cuda \
TTS_CPU_OFFLOAD=false \
TTS_ALLOW_CPU_FALLBACK=false \
TTS_SERVICE_URL=http://localhost:8012 \
TTS_HEALTH_PATH=/healthz \
TTS_SYNTHESIZE_PATH=/v1/tts/synthesize \
TTS_VOICE=default \
REDPANDA_ADMIN_URL=http://localhost:9644 \
corepack pnpm --filter @shc/api-server start
```

Voice Agent server:

```bash
API_BASE_URL=http://localhost:3000 \
VOICE_AGENT_PORT=3004 \
LLM_PROVIDER=vllm_openai_compatible \
LLM_COMPUTE_BACKEND=gpu \
LLM_DEVICE=cuda \
LLM_CPU_OFFLOAD=false \
LLM_ALLOW_CPU_FALLBACK=false \
VLLM_BASE_URL=http://localhost:8000/v1 \
VLLM_MODEL=gemma-4-e4b \
VLLM_CPU_OFFLOAD_GB=0 \
corepack pnpm --filter @shc/voice-agent-server start
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
ASR_COMPUTE_BACKEND=gpu \
ASR_DEVICE=cuda \
ASR_COMPUTE_TYPE=int8 \
ASR_CPU_OFFLOAD=false \
ASR_ALLOW_CPU_FALLBACK=false \
ASR_LANGUAGE=zh \
LLM_PROVIDER=ollama_openai_compatible \
LLM_COMPUTE_BACKEND=gpu \
LLM_DEVICE=cuda \
LLM_CPU_OFFLOAD=false \
LLM_ALLOW_CPU_FALLBACK=false \
LLM_BASE_URL=http://localhost:11434/v1 \
LLM_MODEL=gemma4:e4b \
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
corepack pnpm smoke:voice-agent
corepack pnpm live:check
corepack pnpm smoke:sprint5-live-demo
```

`live:check` passes only when ASR, LLM, TTS, and Redpanda all report
`mode=live`, `ready=true`, and `acceptanceEligible=true`. The five-run demo
script then publishes PHQ-9 through the admin API and runs five live
voice-agent questionnaire submissions against the active version.
