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
ASR_TRANSCRIBE_PATH=/v1/asr/transcribe \
LLM_PROVIDER=vllm_openai_compatible \
LLM_BASE_URL=http://localhost:8000/v1 \
LLM_MODEL=gemma-4-e4b \
TTS_PROVIDER=breezyvoice_default \
TTS_SERVICE_URL=http://localhost:8012 \
TTS_SYNTHESIZE_PATH=/v1/tts/synthesize \
TTS_VOICE_ID=default \
corepack pnpm --filter @shc/api-server dev
```

Expected services:

- `http://localhost:8011/v1/asr/transcribe`: FastAPI sidecar for
  faster-whisper Breeze-ASR-26 CT2 int8.
- `http://localhost:8000/v1/chat/completions`: OpenAI-compatible local Gemma 4
  E4B runtime, normally vLLM.
- `http://localhost:8012/v1/tts/synthesize`: FastAPI sidecar for BreezyVoice
  default voice.

Provider status:

```bash
curl -fsS http://localhost:3000/api/v1/providers/status
```

Compatibility: if the local machine only has Ollama or BreezyVoice's upstream
OpenAI-compatible server running, set `LLM_BASE_URL=http://localhost:11434/v1`
and/or `BREEZYVOICE_BASE_URL=http://localhost:9003/v1`.

For this Smart Health Cabin lane, do not start BreezyVoice with Jason's later
customized prompt audio/text. The TTS API rejects reference audio, speaker
embedding, custom voice ID, and voice-cloning fields.
