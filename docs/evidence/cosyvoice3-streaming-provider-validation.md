---
id: smart-health-cabin-cosyvoice3-streaming-provider-validation
title: "CosyVoice3 Streaming Provider Validation"
date: 2026-06-26
topic: smart-health-cabin
type: evidence-log
status: live_cosyvoice3_validation_completed
source:
  - ../decisions/2026-06-26-voice-first-cosyvoice3-product-path.md
  - ../prompts/voice-first-cosyvoice3-streaming-tts-codex-goal-prompt.md
  - ../../apps/model-sidecars/cosyvoice-service/README.md
---

# CosyVoice3 Streaming Provider Validation

## Current Status

TTS provider validation status:

```text
LIVE_COSYVOICE3_VALIDATION_COMPLETED
```

Voice-first room status:

```text
PREFLIGHT_ONLY
```

The repo now has the CosyVoice3 provider boundary, sidecar endpoints, provider
status contract, benchmark manifest, streaming playback path, fallback handoff,
and smoke commands needed for live validation. A local official CosyVoice3
backend was installed under `.local/`, and the sidecar produced real WebSocket
PCM16 chunks before utterance completion. Physical-room voice acceptance and
Taiwan-speaker listener review are the remaining product gates.

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
If the API returns no stream descriptor, kiosk-web falls back to completed WAV
playback. Streaming transport failures are surfaced as provider failures for
live validation. AudioWorklet remains a future upgrade only if room or browser
testing shows buffer underruns or jitter.

The sidecar WebSocket stream emits JSON metadata and binary PCM16 chunks. Each
audio chunk now has `audio_chunk` metadata with `chunk_index`, `sample_rate`,
`format`, `duration_ms`, `bytes`, and `is_final`; the first chunk also emits
`first_audio_chunk`. This keeps one-chunk utterances inside the same required
metadata contract as longer streams.

Voice-first recovery commands are handled before answer mapping. After ASR,
`重新回答`, `改用觸控`, and `找人協助` now route to retry, touch fallback, and
staff assist respectively instead of being sent to deterministic PHQ-9 answer
mapping.

Voice-first collapsed-touch mode is implemented as a recoverable UI state.
When `VITE_VOICE_CONVERSATION_MODE=voice_first_touch_collapsed`, the SurveyJS
touch answer stage is visually collapsed while the Avatar voice controller
remains available. Low-confidence mapping, ambiguous mapping, browser voice
capture failure, or the spoken command `改用觸控` restores the touch stage. The
voice audit payload records the effective `touch_visible` value, so evidence can
distinguish hidden-touch voice turns from fallback-assisted turns. When the last
question is answered through a high-confidence voice route, the SurveyJS model
is completed directly so a collapsed touch UI does not block questionnaire
submission.

Voice answer mapping now stores a `voice_turn_audit` payload on the existing
`map_answer` agent turn. The audit payload records transcript, normalized
transcript, candidate answer, ASR and candidate confidence, write decision,
fallback reason, active question id, voice mode, touch visibility, and provider
metrics for ASR, reranker when present, and the configured TTS provider.
PHQ-9 item 9 positive voice answers, such as `幾乎每天`, now route to
`safety_sensitive_staff_review` with `write_decision=staff_review` even when
the transcript does not contain an explicit self-harm keyword.

Taiwan healthcare TTS normalization covers PHQ-9 and common AI acronyms,
HbA1c, blood-pressure readings with halfwidth or fullwidth slash, numeric dates
such as `2026-06-26`, and common Taiwan wording replacements such as
`资料 -> 資料`, `身份证 -> 身分證`, `屏幕 -> 螢幕`, and `质量 -> 品質`.

The TTS provider benchmark JSONL schema includes the prompt-required
`buffer_underrun_count`, `taiwan_mandarin_acceptability`, `audio_file_path`
when audio is persisted, and `fallback_use` fields. The runner clears prior
summary/error JSONL files for the same output directory before each run so a
rerun cannot mix stale rows into a new report.

Provider status now exposes `blockerReason` for unavailable providers and
GPU-only acceptance failures, alongside `error_code`, `computeBackend`,
`gpuRequired`, `cpuOffload`, `cpuFallbackAllowed`, and `acceptanceEligible`.

## Live Provider Validation Gate

CosyVoice3 streaming provider validation is accepted when:

- `/readyz` proves a real backend is configured;
- `WS /v1/audio/stream` emits real non-final PCM16 chunks before full utterance
  completion;
- p95 TTFA <= 1500 ms;
- p95 RTF <= 1.0;
- failure rate <= 0.5%.

Those provider gates passed in `cosyvoice3_streaming_provider_live_mini_v4`.

Product field acceptance still requires:

- Taiwan Mandarin listener review passes;
- room voice acceptance passes with real microphone and real users.

## Remaining Product Gates

- Taiwan healthcare prompt audio: live smoke used the official sample
  `asset/zero_shot_prompt.wav`; production review still needs a recorded
  Taiwan Mandarin healthcare prompt.
- Room acceptance: real microphone, real wakeword, ASR answer mapping, retry,
  touch fallback, staff assist, and item 9 path still need the physical-room
  protocol.
- Full provider matrix: this run validates CosyVoice3 streaming. BreezyVoice
  fallback on `8012` was not running in the subset benchmark.

The current sidecar remains an honest adapter. Without:

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

## 2026-06-26 Local CosyVoice3 Installation

Environment:

```text
Python 3.10.20 installed with uv
Official CosyVoice repo commit: 074ca6d
Model path: .local/CosyVoice/pretrained_models/Fun-CosyVoice3-0.5B
Model disk size: 9.1G
CosyVoice venv disk size: 11G
GPU during probe: RTX 4090 Laptop, 16GB VRAM
```

Commands:

```bash
uv python install 3.10
git clone --recursive https://github.com/FunAudioLLM/CosyVoice.git .local/CosyVoice
uv venv .local/cosyvoice-venv --python 3.10
uv pip install --python .local/cosyvoice-venv/bin/python --index-strategy unsafe-best-match -r .local/CosyVoice/requirements.txt
uv pip install --python .local/cosyvoice-venv/bin/python 'setuptools<81'
.local/cosyvoice-venv/bin/python - <<'PY'
from huggingface_hub import snapshot_download
snapshot_download(
    'FunAudioLLM/Fun-CosyVoice3-0.5B-2512',
    local_dir='.local/CosyVoice/pretrained_models/Fun-CosyVoice3-0.5B',
)
PY
```

Why the extra install flags exist:

- `--index-strategy unsafe-best-match` was required because the official
  requirements include multiple package indexes and `uv` otherwise stopped at
  the first index containing `protobuf`.
- `setuptools<81` was required because CosyVoice imports a dependency path that
  still expects `pkg_resources`.

Live sidecar command:

```bash
cd apps/model-sidecars/cosyvoice-service
COSYVOICE3_PROVIDER_MODE=live \
COSYVOICE3_REPO_PATH=/home/jnclaw/every_on_git_jnclaw/phd-life-system/imedtac-smart-health-cabin-v0/.local/CosyVoice \
COSYVOICE3_MODEL_DIR=/home/jnclaw/every_on_git_jnclaw/phd-life-system/imedtac-smart-health-cabin-v0/.local/CosyVoice/pretrained_models/Fun-CosyVoice3-0.5B \
COSYVOICE3_PROMPT_WAV=/home/jnclaw/every_on_git_jnclaw/phd-life-system/imedtac-smart-health-cabin-v0/.local/CosyVoice/asset/zero_shot_prompt.wav \
COSYVOICE3_COMPUTE_BACKEND=gpu \
/home/jnclaw/every_on_git_jnclaw/phd-life-system/imedtac-smart-health-cabin-v0/.local/cosyvoice-venv/bin/python -m uvicorn server:app --host 127.0.0.1 --port 8015
```

Readiness smoke:

```text
corepack pnpm smoke:cosyvoice3 -> passed
provider=cosyvoice3_streaming
mode=live
ready=true
streaming=true
audioTransport=ws_pcm16
computeBackend=gpu
acceptanceEligible=true
```

Cold completed-speech smoke:

```text
POST /v1/audio/speech
text=您好。
status=200
elapsed_sec=112.622
content_type=application/json
```

Direct WebSocket streaming probe:

```text
WS /v1/audio/stream
text=您好，請回答第一題。
elapsed_sec=1.171
first_audio_sec=0.746
chunks=2
bytes=153600
events=request_received,text_normalized,stream_start,first_audio_chunk,audio_chunk,stream_end
```

API voice-conversation smoke:

```text
PORT=3020 ... corepack pnpm --filter @shc/api-server start
API_BASE_URL=http://127.0.0.1:3020 corepack pnpm smoke:voice-conversation-live -> passed
provider=cosyvoice3_streaming
stream_url=ws://127.0.0.1:8015/v1/audio/stream
audio_transport=ws_pcm16
acceptanceEligible=true
```

`live:check` still failed because ASR was unavailable, LLM status lacked GPU
acceptance metadata, and the voice-agent server was not reachable. TTS was no
longer the failing gate in this API run.

## 2026-06-26 Live Mini Benchmark

Run ID:

```text
cosyvoice3_streaming_provider_live_mini_v4
```

Command:

```bash
COSYVOICE3_BASE_URL=http://127.0.0.1:8015 \
.local/cosyvoice-venv/bin/python scripts/tts-benchmark/run_tts_provider_matrix.py \
  --manifest experiments/manifests/tts_provider_eval_manifest.jsonl \
  --variants G_cosyvoice3_stream \
  --repeats 1 \
  --warmup 1 \
  --randomize true \
  --output experiments/cosyvoice3_streaming_provider_live_mini_v4 \
  --timeout-sec 240
```

Result:

```text
total=6
ok=6
valid WebSocket PCM16 streams=6
p50 TTFA server ms=1254.791
p95 TTFA server ms=1333.76
p50 total synthesis ms=2399.256
p95 total synthesis ms=4187.732
p95 RTF=0.339
GPU memory peak MB=12853
failure rate=0.0
```

Artifact paths:

```text
experiments/cosyvoice3_streaming_provider_live_mini_v4/logs/request_summary.jsonl
experiments/cosyvoice3_streaming_provider_live_mini_v4/reports/streaming_validity_report.md
experiments/cosyvoice3_streaming_provider_live_mini_v4/audio/G_cosyvoice3_stream/
```

The `--warmup 1` run is the preferred gate read because the first cold model
load is not representative of steady-state kiosk turns.

Subset provider matrix:

```text
run_id=cosyvoice3_streaming_provider_validation_live_subset
total=30
ok=24
valid WebSocket PCM16 streams=24
p50 TTFA server ms=1235.184
p95 TTFA server ms=1248.954
p50 total synthesis ms=2505.362
p95 total synthesis ms=4093.542
```

Per-variant count:

```text
B_breezyvoice_segment: 0/6, connection refused on 8012
G_cosyvoice3_stream: 6/6 valid_ws_pcm16
H_cosyvoice3_hybrid: 6/6 valid_ws_pcm16 through the same provider stream path
I_cosyvoice3_tw_prompt: 6/6 valid_ws_pcm16 through the same provider stream path
J_cosyvoice3_tw_prompt_cache: 6/6 valid_ws_pcm16 through the same provider stream path
```

The H/I/J labels are provider-routing variants in this subset run; they do not
yet prove separate hybrid segmentation, Taiwan speaker-prompt quality, or cache
hit behavior.

## 2026-06-26 Preflight Results

Passed:

```text
corepack pnpm validate:json
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
corepack pnpm --filter @shc/kiosk-web lint
corepack pnpm --filter @shc/api-server lint
corepack pnpm test -- apps/api-server/src/services/questionnaireService.test.ts
corepack pnpm test
corepack pnpm test -- apps/api-server/src/services/ttsProvider.test.ts apps/kiosk-web/src/features/avatar/StreamingAudioPlayer.test.ts apps/kiosk-web/src/features/avatar/voiceConversationMode.test.ts
python3 -m py_compile apps/model-sidecars/cosyvoice-service/*.py scripts/tts-benchmark/run_tts_provider_matrix.py scripts/voice-room/run_voice_first_phq9_room_test.py
python3 -m py_compile apps/model-sidecars/cosyvoice-service/tw_normalization.py apps/model-sidecars/cosyvoice-service/test_tw_normalization.py
python3 -m py_compile scripts/tts-benchmark/run_tts_provider_matrix.py
python3 scripts/voice-room/run_voice_first_phq9_room_test.py --self-test
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

Clean unavailable-mode smoke failed as expected:

```text
corepack pnpm smoke:cosyvoice3
```

Reason:

```text
healthz=200, readyz=503, eligible=false on the clean sidecar preflight; COSYVOICE3 backend/model/prompt paths are not configured
```

Live-configured provider smoke passed after the official CosyVoice repo, model,
and prompt wav were configured:

```text
corepack pnpm smoke:cosyvoice3 -> passed
```

Reason:

```text
provider=cosyvoice3_streaming
mode=live
ready=true
streaming=true
audio_transport=ws_pcm16
acceptanceEligible=true
```

Clean API smoke failed as expected before the API was started with live
CosyVoice3 provider env:

```text
corepack pnpm smoke:voice-conversation-live
```

Reason: the currently running API status still reported mock
`breezyvoice_default` TTS, not live `cosyvoice3_streaming`.

Live-configured API voice-conversation smoke passed after starting the API with
`TTS_PROVIDER=cosyvoice3_streaming` and `COSYVOICE3_BASE_URL=http://127.0.0.1:8015`:

```text
API_BASE_URL=http://127.0.0.1:3020 corepack pnpm smoke:voice-conversation-live -> passed
```

Result:

```text
provider=cosyvoice3_streaming
stream_url=ws://127.0.0.1:8015/v1/audio/stream
audio_transport=ws_pcm16
acceptanceEligible=true
```

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

Room-test template and validator:

```text
python3 scripts/voice-room/run_voice_first_phq9_room_test.py --output experiments/voice_first_room_acceptance_manual --speakers 3
python3 scripts/voice-room/run_voice_first_phq9_room_test.py --validate experiments/voice_first_room_acceptance_manual/raw_runs_template.csv
```

Generated:

```text
experiments/voice_first_room_acceptance_manual/raw_runs_template.csv
experiments/voice_first_room_acceptance_manual/README.md
```

The template contains 42 rows: 3 speakers x wake + 9 PHQ-9 items + retry,
touch fallback, staff assist, and no-speech trials. The empty manual template
validator returns `field_ready=false`, as expected, until real room rows are
filled with microphone, wakeword, ASR, mapping, confidence/confirmation, write,
latency, background-noise, and fallback evidence.

## 2026-06-26 19:41 CST Continuation Validation

The provider default was aligned with the adopted product path:

```text
getTtsProviderConfig() default provider=cosyvoice3_streaming
fallbackProvider=breezyvoice_default
```

Local CosyVoice3 sidecar readiness passed on port `8015`:

```text
corepack pnpm smoke:cosyvoice3 -> passed
provider=cosyvoice3_streaming
mode=live
ready=true
streaming_ready=true
audio_transport=ws_pcm16
compute_backend=gpu
```

The current-worktree API was started on port `3020` with live CosyVoice3 TTS
env and passed the voice-conversation stream descriptor smoke:

```text
API_BASE_URL=http://localhost:3020 corepack pnpm smoke:voice-conversation-live -> passed
provider=cosyvoice3_streaming
stream_url=ws://localhost:8015/v1/audio/stream
audio_transport=ws_pcm16
acceptanceEligible=true
```

`corepack pnpm smoke:api` passed against the same API. `corepack pnpm
live:check` and `corepack pnpm smoke:voice-agent` remained outside this
CosyVoice3 provider gate because the current external state did not include the
ASR sidecar on `8011` or voice-agent server on `3004`; `live:check` also
reported missing LLM GPU acceptance metadata. TTS was live and eligible in the
3020 API smoke.

Static validation after the default-provider change:

```text
corepack pnpm validate:json -> passed
corepack pnpm lint -> passed
corepack pnpm typecheck -> passed
corepack pnpm test -> 11 files / 90 tests passed
corepack pnpm build -> passed with existing Vite large-chunk warnings
python3 -m py_compile apps/model-sidecars/cosyvoice-service/*.py scripts/tts-benchmark/run_tts_provider_matrix.py scripts/voice-room/run_voice_first_phq9_room_test.py -> passed
python3 apps/model-sidecars/cosyvoice-service/test_streaming.py -> passed
python3 apps/model-sidecars/cosyvoice-service/test_tw_normalization.py -> passed
python3 scripts/voice-room/run_voice_first_phq9_room_test.py --self-test -> passed
git diff --check -> passed
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

Keep `cosyvoice3_streaming` as the production TTS candidate because live
provider metrics now pass the TTFA, RTF, failure-rate, and non-fake-streaming
provider gates. Keep `breezyvoice_default` as operational fallback and research
baseline while the project completes Taiwan healthcare prompt review and
physical-room voice-first acceptance.
