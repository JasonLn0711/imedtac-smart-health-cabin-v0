# Local Development

## Install

```bash
pnpm install
```

If the `pnpm` shim is not on PATH, use Corepack:

```bash
corepack pnpm install
```

## PostgreSQL

```bash
docker compose -f infra/docker-compose.yml up -d postgres
pnpm --filter @shc/api-server migrate
```

Default local database URL:

```text
postgres://smart_health_cabin:smart_health_cabin_dev@localhost:5432/smart_health_cabin
```

## API

```bash
pnpm --filter @shc/api-server dev
```

Verify:

```bash
curl -fsS http://localhost:3000/healthz
curl -fsS http://localhost:3000/api/v1/questionnaires/active
curl -fsS -X POST http://localhost:3000/api/v1/questionnaire-responses \
  -H 'content-type: application/json' \
  --data @samples/phq9-response-low-risk.json
```

## Kiosk

```bash
pnpm --filter @shc/kiosk-web dev
```

Open:

```text
http://localhost:5173
```

The kiosk fetches the active questionnaire from the API when available and
falls back to the local PHQ-9 SurveyJS seed during frontend-only checks.

## Admin

```bash
pnpm --filter @shc/admin-web dev
```

Open:

```text
http://localhost:5174
```

Admin CMS / versioning is active in Sprint 2. Use it to validate SurveyJS JSON,
preview PHQ-9, create a draft version, and publish one active questionnaire
version.

## Redpanda / Outbox Worker

```bash
docker compose -f infra/docker-compose.yml up -d redpanda redpanda-console
pnpm --filter @shc/outbox-worker start
```

Redpanda Console:

```text
http://localhost:8080
```

The API writes outbox rows inside PostgreSQL transactions. The worker publishes
pending rows asynchronously; Redpanda is not required for kiosk questionnaire
completion or public report creation.

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test
pnpm validate:json
docker compose -f infra/docker-compose.yml config
git diff --check
```

## Scope

- Sprint 0: monorepo, module registry, API skeleton, PostgreSQL migration,
  PHQ-9 seed path, local dev docs, CI skeleton, and closeout devlog.
- Sprint 1: PHQ-9 SurveyJS render, touch answer capture, API submit,
  PostgreSQL persistence, server-side score, item-9 safety flag, and
  non-diagnostic public summary.
- Sprint 2: questionnaire CMS / versioning / public report token.
- Sprint 3: ASR / LLM / TTS voice Agent seam and agent turn log.
- Sprint 4: Avatar UI and Redpanda outbox publishing.
- Sprint 4.5: static Avatar image, xstate state machine, MediaRecorder
  browser capture, provider-status route, Zod contracts, and local-first
  ASR/LLM/TTS provider config.
- Phase 2: vision and hearing implementation.

## Local Voice Models

Default mode is deterministic mock, so Sprint 4 demo paths do not require
model files. Set `VOICE_PROVIDER_MODE=live` or `VOICE_MODEL_MODE=real` to call
local model services:

```bash
VOICE_PROVIDER_MODE=live \
ASR_SERVICE_URL=http://localhost:8011 \
ASR_PROVIDER=faster_whisper_breeze_asr_26 \
ASR_MODEL=Breeze-ASR-26-CT2-int8 \
ASR_COMPUTE_BACKEND=gpu \
ASR_DEVICE=cuda \
ASR_CPU_OFFLOAD=false \
ASR_ALLOW_CPU_FALLBACK=false \
ASR_TRANSCRIBE_PATH=/v1/asr/transcribe \
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
TTS_SERVICE_URL=http://localhost:8012 \
TTS_SYNTHESIZE_PATH=/v1/tts/synthesize \
TTS_VOICE_ID=default \
corepack pnpm --filter @shc/api-server dev
```

Expected services:

- `http://localhost:8011/v1/asr/transcribe`: FastAPI sidecar for
  faster-whisper Breeze-ASR-26 CT2 int8.
- `http://localhost:11434/api/chat`: native Ollama local Gemma 4 E4B runtime
  with `think:false` for 1-5 sentence questionnaire guidance.
- `http://localhost:8012/v1/tts/synthesize`: FastAPI sidecar for BreezyVoice
  default voice.

## Wake Word Activation Gate

Sprint 5.6 adds a local wake word gate. It activates the recording state only;
ASR candidate mapping and user confirmation still control questionnaire writes.
Tap-to-start and touch questionnaire remain complete fallback paths.

Run the sidecar in mock/simulated mode:

```bash
cd apps/model-sidecars/wakeword-service
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
WAKE_WORD_ENABLED=true \
WAKE_WORD_MODE=mock \
WAKE_WORD_PROVIDER=openwakeword \
WAKE_WORD_SERVICE_URL=http://localhost:8013 \
WAKE_WORD_THRESHOLD=0.65 \
WAKE_WORD_COOLDOWN_MS=2000 \
WAKE_WORD_LOCAL_ONLY=true \
.venv/bin/python -m uvicorn app:app --host 0.0.0.0 --port 8013
```

Run the sidecar in live microphone mode after a wake phrase model and
microphone device are selected:

```bash
cd apps/model-sidecars/wakeword-service
WAKE_WORD_ENABLED=true \
WAKE_WORD_MODE=live \
WAKE_WORD_PROVIDER=openwakeword \
WAKE_WORD_SERVICE_URL=http://localhost:8013 \
WAKE_WORD_MODEL_PATH=/models/wakeword/smart-health-cabin.tflite \
WAKE_WORD_INFERENCE_FRAMEWORK=tflite \
WAKE_WORD_THRESHOLD=0.65 \
WAKE_WORD_COOLDOWN_MS=2000 \
WAKE_WORD_SAMPLE_RATE=16000 \
WAKE_WORD_CHUNK_SIZE=1280 \
WAKE_WORD_DEVICE_INDEX=0 \
WAKE_WORD_LOCAL_ONLY=true \
.venv/bin/python -m uvicorn app:app --host 0.0.0.0 --port 8013
```

Check:

```bash
curl -fsS http://localhost:8013/healthz
curl -fsS http://localhost:8013/status
curl -fsS -X POST http://localhost:8013/simulate-wake \
  -H 'content-type: application/json' \
  -d '{"score":0.82}'
corepack pnpm smoke:wakeword
```

Provider status:

```bash
curl -fsS http://localhost:3000/api/v1/providers/status
```

Sprint 5 live checks:

```bash
corepack pnpm smoke:redpanda
corepack pnpm smoke:api
corepack pnpm smoke:voice-agent
corepack pnpm live:check
corepack pnpm smoke:sprint5-live-demo
```

Strict acceptance is GPU-only for AI model inference. `live:check` rejects ASR,
LLM, or TTS provider status that reports `computeBackend` other than `gpu`,
`cpuOffload=true`, `cpuFallbackAllowed=true`, or missing GPU-only controls.

vLLM remains available as an alternative for provider comparison, but the
current workstation path uses native Ollama because it is lower-friction,
lower-VRAM, faster on the same Gemma 4 E4B prompt, and can disable thinking for
questionnaire guidance. The deterministic Chinese guidance fallback remains
active when model output is unusable.

Current workstation compatibility path:

```bash
VOICE_PROVIDER_MODE=live \
ASR_SERVICE_URL=http://localhost:8001 \
ASR_HEALTH_PATH=/health \
ASR_TRANSCRIBE_PATH=/asr \
ASR_MODEL=Breeze-ASR-26-CT2-int8 \
ASR_COMPUTE_BACKEND=gpu \
ASR_DEVICE=cuda \
ASR_CPU_OFFLOAD=false \
ASR_ALLOW_CPU_FALLBACK=false \
ASR_LANGUAGE=zh \
LLM_PROVIDER=ollama_native \
LLM_COMPUTE_BACKEND=gpu \
LLM_DEVICE=cuda \
LLM_CPU_OFFLOAD=false \
LLM_ALLOW_CPU_FALLBACK=false \
VLLM_CPU_OFFLOAD_GB=0 \
LLM_BASE_URL=http://localhost:11434 \
LLM_MODEL=gemma4:e4b \
LLM_TEMPERATURE=0.3 \
OLLAMA_THINK=false \
LLM_MAX_TOKENS=80 \
TTS_COMPUTE_BACKEND=gpu \
TTS_DEVICE=cuda \
TTS_CPU_OFFLOAD=false \
TTS_ALLOW_CPU_FALLBACK=false \
BREEZYVOICE_BASE_URL=http://localhost:9003/v1 \
BREEZYVOICE_MODEL=MediaTek-Research/BreezyVoice \
TTS_VOICE=default \
BREEZYVOICE_VOICE_ID=default \
corepack pnpm --filter @shc/api-server start
```

Voice Agent server:

```bash
API_BASE_URL=http://localhost:3000 \
LLM_BASE_URL=http://localhost:11434 \
LLM_MODEL=gemma4:e4b \
LLM_PROVIDER=ollama_native \
LLM_DEVICE=cuda \
LLM_CPU_OFFLOAD=false \
LLM_TEMPERATURE=0.3 \
OLLAMA_THINK=false \
LLM_MAX_TOKENS=80 \
corepack pnpm --filter @shc/voice-agent-server start
```

Strict LLM acceptance uses `SPRINT5_ALLOWED_LLM_PROVIDERS`; the default allows
`ollama_native`, `ollama_openai_compatible`, and `vllm_openai_compatible`.
For this 1-5 sentence questionnaire-guidance path, keep `OLLAMA_THINK=false`,
`LLM_TEMPERATURE=0.3`, and `LLM_MAX_TOKENS=80`. The 2026-06-25 threshold
experiment found `72` as the lowest passing cap across the tested prompt set
and keeps `80` as the operating default for margin. The temperature sweep found
`0.3` as the largest flexible default because it kept hard-rule success without
length stops or markup, while `0` remains the most stable validation baseline.
If a future experiment
explicitly enables thinking, use `LLM_MAX_TOKENS=768` as the current minimum
stable budget.

For this Smart Health Cabin lane, do not start BreezyVoice with Jason's later
customized prompt audio/text. The TTS API rejects reference audio, speaker
embedding, custom voice ID, and voice-cloning fields.
