---
id: smart-health-cabin-cosyvoice3-streaming-provider-validation
title: "CosyVoice3 Streaming Provider Validation"
date: 2026-06-26
topic: smart-health-cabin
type: evidence-log
status: blocked_unresolved
source:
  - ../decisions/2026-06-26-voice-first-cosyvoice3-product-path.md
  - ../prompts/voice-first-cosyvoice3-streaming-tts-codex-goal-prompt.md
  - ../../apps/model-sidecars/cosyvoice-service/README.md
---

# CosyVoice3 Streaming Provider Validation

## Current Status

Live validation status:

```text
BLOCKED_UNRESOLVED
```

Implementation status:

```text
COSYVOICE3_PROVIDER_IMPLEMENTED
```

The repo now has the CosyVoice3 provider boundary, sidecar endpoints, provider
status contract, benchmark manifest, streaming playback path, fallback handoff,
and smoke commands needed for live validation. A real CosyVoice3 streaming
backend is not yet configured in this worktree, so live validation remains
blocked.

## Provider Decision

- Production candidate: `cosyvoice3_streaming`
- Fallback: `breezyvoice_default`
- Research lane: BreezyVoice strict `D_hybrid` cache-aware streaming and
  CosyVoice2 comparison when available

BreezyVoice remains fallback/research because prior live evidence shows valid
research events but product-gate failure for TTFA, total latency, and RTF.
CosyVoice3 is the production candidate because the current product bottleneck
is low-latency voice-first questionnaire conversation.

## External Source Verification

Official FunAudioLLM / Hugging Face documentation was checked on
`2026-06-26`.

The official CosyVoice README and Fun-CosyVoice3 model card describe
CosyVoice3 as a CosyVoice2 successor with content consistency, speaker
similarity, prosody naturalness, text normalization, pronunciation inpainting,
instruct support, and bi-streaming audio-out capability. The official install
path requires cloning `FunAudioLLM/CosyVoice`, installing its Python
environment, and downloading `FunAudioLLM/Fun-CosyVoice3-0.5B-2512`.

Source pointers:

- `https://github.com/FunAudioLLM/CosyVoice`
- `https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512`

## Implemented Artifacts

- `apps/api-server/src/services/ttsProvider.ts`
- `apps/kiosk-web/src/features/avatar/StreamingAudioPlayer.ts`
- `apps/kiosk-web/src/features/avatar/VoiceConversationController.ts`
- `apps/model-sidecars/cosyvoice-service/`
- `scripts/smoke-cosyvoice3.mjs`
- `scripts/smoke-voice-conversation-live.mjs`
- `scripts/tts-benchmark/run_tts_provider_matrix.py`
- `scripts/voice-room/run_voice_first_phq9_room_test.py`
- `experiments/manifests/tts_provider_eval_manifest.jsonl`
- `docs/evidence/voice-first-room-acceptance-plan.md`

The CosyVoice sidecar supports two activation paths:

- proxy mode through a real external CosyVoice3 backend via
  `COSYVOICE3_BACKEND_URL` and `COSYVOICE3_STREAMING_BACKEND_WS`;
- local mode through the official CosyVoice repo, model directory, and Taiwan
  healthcare prompt wav via `COSYVOICE3_REPO_PATH`, `COSYVOICE3_MODEL_DIR`, and
  `COSYVOICE3_PROMPT_WAV`.

Both paths are activation gates. The sidecar remains unavailable until one real
path is configured. When `COSYVOICE3_STREAMING_BACKEND_WS` is configured, the
sidecar proxies backend WebSocket bytes and metadata; it does not claim live
audio-out streaming from a completed WAV wrapper.

Kiosk web now routes voice-first TTS playback through
`/api/v1/agent-turns/tts/stream` when `VITE_TTS_STREAMING=true`. The browser
playback path accepts WebSocket PCM16 chunks and schedules them with Web Audio.
If streaming playback fails, the kiosk retries completed-speech TTS so the
BreezyVoice fallback path can preserve questionnaire continuity. AudioWorklet
remains a future upgrade only if room or browser testing shows buffer
underruns or jitter.

## Live Validation Gate

CosyVoice3 is not accepted until:

- `/readyz` proves a real backend is configured;
- `WS /v1/audio/stream` emits real non-final PCM16 chunks before full utterance
  completion;
- p95 TTFA <= 1500 ms;
- p95 RTF <= 1.0;
- failure rate <= 0.5%;
- Taiwan Mandarin listener review passes;
- room voice acceptance passes with real microphone and real users.

## Known Blocker

The current sidecar is an honest adapter. Without:

```text
COSYVOICE3_BACKEND_URL
COSYVOICE3_STREAMING_BACKEND_WS
```

or:

```text
COSYVOICE3_REPO_PATH
COSYVOICE3_MODEL_DIR
COSYVOICE3_PROMPT_WAV
```

it reports unavailable and does not generate fake audio.

## 2026-06-26 Preflight Results

Passed:

```text
corepack pnpm validate:json
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
corepack pnpm test -- apps/api-server/src/services/ttsProvider.test.ts apps/kiosk-web/src/features/avatar/StreamingAudioPlayer.test.ts apps/kiosk-web/src/features/avatar/voiceConversationMode.test.ts
python3 -m py_compile apps/model-sidecars/cosyvoice-service/*.py scripts/tts-benchmark/run_tts_provider_matrix.py scripts/voice-room/run_voice_first_phq9_room_test.py
python3 apps/model-sidecars/cosyvoice-service/test_tw_normalization.py
git diff --check
```

CosyVoice sidecar dependency setup:

```text
apps/model-sidecars/cosyvoice-service/.venv/bin/pip install -r requirements.txt
```

Sidecar preflight:

```text
env -i PATH="$PATH" COSYVOICE3_PROVIDER_MODE=unavailable .venv/bin/python -m uvicorn server:app --host 127.0.0.1 --port 8019
curl http://127.0.0.1:8019/healthz -> 200
curl http://127.0.0.1:8019/readyz -> 503
```

The `503` is the expected honest result until a real backend is configured.
Current blocker text:

```text
Configure COSYVOICE3_BACKEND_URL, or COSYVOICE3_REPO_PATH + COSYVOICE3_MODEL_DIR + COSYVOICE3_PROMPT_WAV
```

Failed as expected:

```text
corepack pnpm smoke:cosyvoice3
```

Reason:

```text
healthz=200, readyz=503, eligible=false on the clean sidecar preflight; COSYVOICE3 backend/model/prompt paths are not configured
```

Failed as expected:

```text
corepack pnpm smoke:voice-conversation-live
```

Reason: the currently running API status still reported mock
`breezyvoice_default` TTS, not live `cosyvoice3_streaming`.

Live provider checks:

```text
corepack pnpm smoke:api -> passed
corepack pnpm live:check -> failed
corepack pnpm smoke:voice-agent -> failed
```

`live:check` reported ASR, LLM, TTS, and Redpanda in mock mode with
`acceptanceEligible=false`; TTS reported `breezyvoice_default`,
`streaming=false`, and `audioTransport=http_wav`. The voice-agent readiness
probe reported `fetch failed`.

Provider matrix preflight:

```text
python3 scripts/tts-benchmark/run_tts_provider_matrix.py \
  --manifest experiments/manifests/tts_provider_eval_manifest.jsonl \
  --variants B_breezyvoice_segment,G_cosyvoice3_stream,H_cosyvoice3_hybrid,I_cosyvoice3_tw_prompt,J_cosyvoice3_tw_prompt_cache \
  --repeats 1 \
  --warmup 0 \
  --randomize true \
  --output experiments/cosyvoice3_streaming_provider_validation \
  --timeout-sec 2
```

Result:

```text
total=30
ok=0
status=provider unavailable / connection refused
```

Artifacts:

```text
experiments/cosyvoice3_streaming_provider_validation/logs/request_summary.jsonl
experiments/cosyvoice3_streaming_provider_validation/logs/error_log.jsonl
experiments/cosyvoice3_streaming_provider_validation/reports/streaming_validity_report.md
experiments/cosyvoice3_streaming_provider_validation/reports/failure_analysis.md
```

Room-test template:

```text
python3 scripts/voice-room/run_voice_first_phq9_room_test.py --output experiments/voice_first_room_acceptance_manual --speakers 1
```

Generated:

```text
experiments/voice_first_room_acceptance_manual/raw_runs_template.csv
experiments/voice_first_room_acceptance_manual/README.md
```

## Commands

Preflight:

```bash
python3 -m py_compile apps/model-sidecars/cosyvoice-service/*.py
python3 apps/model-sidecars/cosyvoice-service/test_tw_normalization.py
corepack pnpm smoke:cosyvoice3
corepack pnpm smoke:voice-conversation-live
```

Benchmark:

```bash
python3 scripts/tts-benchmark/run_tts_provider_matrix.py \
  --manifest experiments/manifests/tts_provider_eval_manifest.jsonl \
  --variants B_breezyvoice_segment,G_cosyvoice3_stream,H_cosyvoice3_hybrid,I_cosyvoice3_tw_prompt,J_cosyvoice3_tw_prompt_cache \
  --repeats 3 \
  --warmup 1 \
  --randomize true \
  --output experiments/cosyvoice3_streaming_provider_validation
```

## Final Provider Recommendation

Keep `cosyvoice3_streaming` as the production candidate and
`breezyvoice_default` as fallback until live CosyVoice3 metrics and room
acceptance evidence exist.
