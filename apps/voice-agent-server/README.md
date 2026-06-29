# Voice Agent Server Route

Sprint 3 uses the existing `apps/api-server` process for the first voice Agent
seam. A separate runtime remains an activation gate, not a requirement for the
local MVP.

Implemented Sprint 3 routes:

- ASR endpoint;
- LLM flow-guidance endpoint;
- TTS endpoint;
- `agent_turns` logging;
- confirmation before voice answers write to questionnaire state.

Scope control: the voice Agent guides flow, reads questions/options, and asks
for confirmation. It does not diagnose, recommend treatment, or change PHQ-9
scoring.

Routes:

```text
GET  /api/v1/providers/status
POST /api/v1/agent-sessions
POST /api/v1/agent-turns/asr
POST /api/v1/agent-turns/respond
POST /api/v1/agent-turns/tts
POST /api/v1/agent-turns/map-answer
```

## Local Model Mode

Set `VOICE_PROVIDER_MODE=live` or `VOICE_MODEL_MODE=real` on
`apps/api-server` to use local model services:

```bash
VOICE_PROVIDER_MODE=live \
ASR_SERVICE_URL=http://localhost:8011 \
ASR_PROVIDER=faster_whisper_breeze_asr_26 \
ASR_MODEL=Breeze-ASR-26-CT2-int8 \
ASR_DEVICE=cuda \
ASR_CPU_OFFLOAD=false \
LLM_PROVIDER=ollama_native \
LLM_DEVICE=cuda \
LLM_CPU_OFFLOAD=false \
LLM_BASE_URL=http://localhost:11434 \
LLM_MODEL=gemma4:e4b \
TTS_PROVIDER=breezyvoice_default \
TTS_DEVICE=cuda \
TTS_CPU_OFFLOAD=false \
TTS_SERVICE_URL=http://localhost:8012 \
TTS_VOICE_ID=default \
corepack pnpm --filter @shc/api-server dev
```

Model service contracts:

- ASR: `POST {ASR_SERVICE_URL}/v1/asr/transcribe`.
- LLM: `POST {LLM_BASE_URL}/chat/completions`, model `gemma-4-e4b`.
- TTS: `POST {TTS_SERVICE_URL}/v1/tts/synthesize`, voice `default`.

Sprint 5 acceptance is GPU-only for AI model inference. CPU backend, CPU
fallback, or CPU offload is not eligible for live acceptance.

Voice control: do not start BreezyVoice with Jason's later customized prompt
audio/text for this lane. The API rejects reference audio, speaker embeddings,
custom voice IDs, and voice-cloning fields.
