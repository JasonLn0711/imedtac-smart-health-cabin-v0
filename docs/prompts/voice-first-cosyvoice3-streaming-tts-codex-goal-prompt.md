---
id: smart-health-cabin-voice-first-cosyvoice3-streaming-tts-codex-goal-prompt
title: "Voice-First Questionnaire And CosyVoice3 Streaming TTS Codex Goal Prompt"
date: 2026-06-26
topic: smart-health-cabin
type: codex-goal-prompt
status: active
supersedes:
  - ./breezyvoice-true-parallel-segment-batch-runtime-codex-goal-prompt.md
source:
  - ../evidence/2026-06-26-expert-review-voice-first-cosyvoice3-update.md
  - ../decisions/2026-06-26-voice-first-cosyvoice3-product-path.md
---

# Codex Goal Prompt: Voice-First Questionnaire + CosyVoice3 Streaming TTS Integration

Read and obey `~/.codex/AGENTS.md` and this repo's `AGENTS.md`.

This is not a smoke-test-only task. This is a production-path architecture
change for the Smart Health Cabin Phase 1 spine.

## Primary Goal

Convert the current questionnaire + Avatar prototype into a voice-first
questionnaire conversation system, with CosyVoice3 real-time streaming as the
new TTS production candidate, while preserving BreezyVoice as fallback /
research baseline.

Do not remove BreezyVoice. Do not delete touch fallback. Do not expand
vision/hearing scope.

## Context

Current project status:

- Phase 1 spine exists: questionnaire CMS + PHQ-9 kiosk + public report +
  ASR/LLM/TTS Avatar loop + wakeword + voice answer auto-fill + Redpanda
  outbox evidence.
- Current ASR: faster-whisper Breeze-ASR-26 CT2 int8.
- Current LLM: native Ollama `gemma4:e4b`, `think=false`,
  `temperature=0.3`, `max_tokens=80`.
- Current TTS: BreezyVoice default voice.
- BreezyVoice ABCD and PD hybrid experiments show valid research events but
  fail product gates:
  - A/B too slow to first audio.
  - C/D improve TTFA but total synthesis and RTF are too slow.
  - PD2/PD3 are valid but not product candidates.
- The next product bottleneck is real-room, low-latency, safe voice
  questionnaire completion.

## Non-Negotiable Product Rule

The questionnaire must be completed primarily through voice conversation.

Tap-to-answer is secondary and configurable:

- user may choose to keep touch visible;
- user may choose voice-first with touch collapsed;
- system must still retain touch/staff fallback internally for safety and
  recovery.

Do not interpret "no touch" as deleting fallback code paths. It means UI may
hide or collapse touch answers until fallback/recovery is needed.

## Target Provider Decision

Add CosyVoice3 streaming as the production TTS candidate.

Keep:

- BreezyVoice default voice as fallback / baseline / research lane.
- CosyVoice2 streaming as optional benchmark baseline if available.

New provider names:

- `cosyvoice3_streaming`
- `cosyvoice2_streaming` if implemented
- `breezyvoice_default`

Default target:

- `TTS_PROVIDER=cosyvoice3_streaming`
- `TTS_FALLBACK_PROVIDER=breezyvoice_default`

## Required Architecture Changes

### 1. TTS Provider Abstraction

Update the TTS provider layer so it does not assume BreezyVoice.

Add or update:

- `packages/contracts/src/index.ts`
- `apps/api-server/src/services/ttsProvider.ts`
- `apps/api-server/src/routes/questionnaireRoutes.ts`
- `scripts/live-check.mjs`
- `docs/ops/LIVE_PROVIDER_RUNBOOK.md`
- `docs/ops/ROLLBACK_AND_FALLBACK.md`
- `.env.example`

Provider status must expose:

- provider name
- mode: mock/live/unavailable
- streaming true/false
- model id
- compute backend
- GPU required
- CPU fallback allowed false for strict live acceptance
- fallback provider
- acceptance eligibility
- blocker reason if unavailable

### 2. CosyVoice3 Sidecar

Create:

```text
apps/model-sidecars/cosyvoice-service/
```

Required files:

- `README.md`
- `requirements.txt`
- `server.py`
- `provider.py`
- `streaming.py`
- `tw_normalization.py`
- `prompt_profiles/default_tw_healthcare.json`

Required endpoints:

- `GET /healthz`
- `GET /readyz`
- `POST /v1/audio/speech`
- `WS /v1/audio/stream`
- `POST /v1/audio/prewarm`

The streaming endpoint must send real audio chunks before full utterance
completion. Do not fake streaming with completed WAV bytes.

Preferred transport:

- WebSocket binary PCM16 chunks plus JSON metadata events.

Required metadata events:

- `request_received`
- `text_normalized`
- `stream_start`
- `first_audio_chunk`
- `audio_chunk`
- `stream_end`
- `error`

### 3. Taiwan zh-TW Voice Normalization

Implement `tw_normalization.py`.

It must handle:

- Taiwan healthcare terms;
- PHQ-9;
- ASR / LLM / TTS / API / GPU;
- blood pressure formats like `128/76`;
- HbA1c values;
- dates;
- numbers;
- public-health questionnaire phrases;
- avoiding Mainland Mandarin phrasing where possible.

Add a prompt profile:

```text
default_tw_healthcare.json
```

The profile should instruct:

- Taiwan Mandarin;
- natural, clear, warm, professional health-kiosk style;
- no erhua;
- no Mainland broadcast tone;
- medium-slow speech;
- stable volume.

### 4. Voice-First Questionnaire Mode

Add a voice conversation controller in kiosk web.

Create or update:

- `apps/kiosk-web/src/features/avatar/VoiceConversationController.ts`
- `apps/kiosk-web/src/features/avatar/StreamingAudioPlayer.ts`
- `apps/kiosk-web/src/features/avatar/voiceConversationMode.ts`
- existing Avatar panel and state machine files.

Supported modes:

- `voice_first_touch_visible`
- `voice_first_touch_collapsed`
- `touch_first_voice_assist`
- `staff_assisted`

Voice-first flow:

1. System reads the current question and allowed options.
2. User answers by speech.
3. ASR transcribes.
4. Deterministic answer mapping maps only to allowed options.
5. If a single high-confidence option exists, write answer and speak
   confirmation.
6. If ambiguous or low-confidence, ask confirmation or show touch fallback.
7. After TTS playback, automatically continue listening for next answer.
8. User can say "重新回答", "改用觸控", or "找人協助".

LLM must not decide questionnaire answers. LLM may only generate bounded
guidance text.

### 5. Safety Write Policy

Preserve and strengthen:

- no diagnosis;
- no treatment advice;
- no raw-answer public report exposure;
- item 9 staff-support route;
- deterministic option mapping before state write;
- confirmation on ambiguity;
- touch/staff fallback on uncertainty.

Voice writes must log:

- transcript;
- normalized transcript;
- candidate answer;
- confidence;
- write decision;
- fallback reason;
- active question id;
- voice mode;
- touch visibility;
- provider metrics.

### 6. Benchmarks

Create or update:

```text
experiments/manifests/tts_provider_eval_manifest.jsonl
```

Variants:

- `B_breezyvoice_segment`
- `E_cosyvoice2_stream` if available
- `F_cosyvoice2_hybrid` if available
- `G_cosyvoice3_stream`
- `H_cosyvoice3_hybrid`
- `I_cosyvoice3_tw_prompt`
- `J_cosyvoice3_tw_prompt_cache`

Required metrics:

- p50/p95 TTFA server
- p50/p95 TTFA client if available
- p95 RTF
- total synthesis time
- chunk count
- chunk jitter
- buffer underrun
- failure rate
- GPU memory peak
- Taiwan Mandarin acceptability placeholder
- audio file path
- fallback use

Hard gates:

- p95 TTFA client <= 1500 ms if client metric available
- p95 TTFA server <= 1500 ms if client metric unavailable
- p95 RTF <= 1.0
- failure rate <= 0.5%
- no fake streaming
- no severe audio corruption, repetition, truncation, or unusable seams

### 7. Room Voice Acceptance

Add a room-test script or checklist:

```text
docs/evidence/voice-first-room-acceptance-plan.md
```

Must test:

- spoken `你好小慧`;
- real microphone permission;
- spoken PHQ-9 answers;
- no-speech;
- background noise;
- "重新回答";
- "改用觸控";
- "找人協助";
- item 9 positive path.

Record:

- wake misses;
- false triggers;
- ASR transcript;
- answer mapping result;
- write decision;
- fallback reason;
- turn latency;
- user-visible mode.

### 8. Documentation

Create:

```text
docs/evidence/cosyvoice3-streaming-provider-validation.md
```

Update:

- `docs/source-index.md`
- `docs/ops/LIVE_PROVIDER_RUNBOOK.md`
- `docs/ops/ROLLBACK_AND_FALLBACK.md`
- `docs/specs/VOICE-ENTRY-TECH-SELECTION-SDD-DRAFT.md`
- `.env.example`

The evidence document must explain:

- why BreezyVoice remains fallback/research;
- why CosyVoice3 is the production candidate;
- what was actually run live;
- what remains blocked;
- exact commands;
- exact run IDs;
- exact artifacts;
- final provider recommendation.

## Validation Commands

Run, when available:

```bash
corepack pnpm validate:json
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
corepack pnpm live:check
corepack pnpm smoke:api
corepack pnpm smoke:voice-agent
corepack pnpm smoke:cosyvoice3
corepack pnpm smoke:voice-conversation-live
git diff --check
```

Python:

```bash
python3 -m py_compile apps/model-sidecars/cosyvoice-service/*.py
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

If CosyVoice3 cannot run live, final status must be `BLOCKED_UNRESOLVED`, not
goal complete.

## Final Status Labels

Use only:

- `PREFLIGHT_ONLY`
- `COSYVOICE3_PROVIDER_IMPLEMENTED`
- `VOICE_FIRST_UI_IMPLEMENTED`
- `LIVE_COSYVOICE3_VALIDATION_COMPLETED`
- `LIVE_VOICE_FIRST_ROOM_READY`
- `BLOCKED_UNRESOLVED`

Do not say "complete" unless at least `LIVE_COSYVOICE3_VALIDATION_COMPLETED`
is true.

## Final Response Format

Report exactly:

```text
Status:
Run ID:
Files changed:
Provider decision:

* production candidate:
* fallback:
* research lane:

Voice mode decision:

* default:
* touch behavior:
* safety fallback:

Live validation:

* commands:
* results:
* blockers:

Metrics:

* TTFA p50/p95:
* RTF p95:
* failure rate:
* GPU memory peak:

Next required field test:

* room:
* mic:
* wakeword:
* PHQ-9 voice answers:
* fallback:
```
