---
id: smart-health-cabin-voice-first-room-acceptance-minimum-checklist-2026-07-02
title: "Voice-First Room Acceptance Minimum Checklist"
date: 2026-07-02
topic: smart-health-cabin
type: experiment-checklist
status: active
source:
  - ./voice-first-room-acceptance-plan.md
  - ./cosyvoice3-streaming-provider-validation.md
  - ../decisions/2026-06-26-voice-first-cosyvoice3-product-path.md
---

# Voice-First Room Acceptance Minimum Checklist

## Purpose

This checklist records the next executable work for the Smart Health Cabin
ASR + LLM + TTS MVP. The current priority is the user experience core:
real-time, low-latency voice questionnaire interaction. RAG accuracy, vision,
hearing, HIS integration, Avatar animation, and expanded questionnaire scope
are outside this pilot.

This is a one-speaker minimum pilot. It can produce a `LIVE_MINIMUM_COMPLETED`
signal for the minimum room trial when all pilot gates pass. It does not replace
the full field-ready gate, which still requires the broader multi-speaker room
acceptance plan.

## Pilot Scope

| Field | Pilot setting |
| --- | --- |
| Run ID | `voice_first_room_acceptance_20260702_s1_v1`; retest `voice_first_room_retest_20260702_s1_v2` |
| Speaker count | `1` speaker |
| Speaker ID | `S1` |
| Questionnaire | PHQ-9 |
| Target stack | live ASR + live LLM + live CosyVoice3 streaming TTS |
| TTS candidate | `cosyvoice3_streaming` |
| LLM setting | `ollama_native`, `gemma4:e4b`, `think=false`, `temperature=0.3`, `max_tokens=80` |
| Primary UX gate | low-latency voice-first turn loop |
| Fallback paths | retry, touch fallback, staff assist |

## Connection Map

Use this checklist as the one-speaker execution entrypoint. The broader context
and evidence boundaries live in these connected files:

| File | Connection |
| --- | --- |
| `docs/evidence/voice-first-room-acceptance-plan.md` | Full physical-room acceptance protocol. This checklist narrows that plan to one speaker for the first minimum pilot. |
| `docs/evidence/EVIDENCE_CHRONOLOGY.md` | Evidence interpretation policy. This checklist is planning/reference until a run artifact and evidence report are written. |
| `docs/evidence/2026-07-02-voice-first-room-acceptance-s1-v2.md` | Current S1 accepted evidence. It records the retest with automatic microphone selection, live room loop, item 9 staff-review routing, report token creation, and background runtime/agent-turn collection. |
| `docs/evidence/2026-07-02-voice-first-room-acceptance-s1-v1.md` | Prior blocked S1 runtime evidence. It remains the failure/recovery history for the VRAM/OOM and empty-ASR blocker. |
| `docs/evidence/cosyvoice3-streaming-provider-validation.md` | TTS provider validation record for `cosyvoice3_streaming`, including provider gates, live mini benchmark, and remaining room/Taiwan-speaker gates. |
| `docs/decisions/2026-06-26-voice-first-cosyvoice3-product-path.md` | Product decision that makes `VOICE_CONVERSATION_PRIMARY` and CosyVoice3 streaming the current product path. |
| `docs/evidence/2026-06-25-wakeword-continuous-live-voice-loop-experiment-log.md` | Prior local continuous-loop evidence using simulated wake and fake microphone audio. The current pilot upgrades that scope to real room and real microphone. |
| `docs/evidence/2026-06-25-llm-one-to-five-guidance-experiment-log.md` | LLM prompt and latency evidence for the bounded questionnaire guidance path used in this pilot. |
| `docs/evidence/2026-06-25-llm-temperature-sweep-experiment-log.md` | Evidence supporting `LLM_TEMPERATURE=0.3` as the flexible demo default. |
| `docs/voice-asr-safety-six-layer-pipeline.md` | Deterministic ASR safety and confirmation routing reference for answer mapping and safe writes. |
| `packages/voice-safety-core/domain-packs/phq9_zh_tw.json` | PHQ-9 voice vocabulary and normalization domain pack used by the answer-mapping path. |
| `scripts/voice-room/run_voice_first_phq9_room_test.py` | Manual room-test template generator and filled-CSV validator for this pilot. |
| `scripts/voice-room/collect_voice_room_runtime.py` | Background runtime collector for provider health, GPU state, port/process snapshots, and static environment metadata during the pilot. |
| `scripts/smoke-cosyvoice3.mjs` | CosyVoice3 live-readiness smoke. |
| `scripts/smoke-voice-conversation-live.mjs` | Voice conversation streaming-descriptor smoke. |
| `docs/ops/LIVE_PROVIDER_RUNBOOK.md` | Live-provider startup guide. Treat as an operating guide, paired with evidence logs before making completion claims. |
| `docs/ops/ROLLBACK_AND_FALLBACK.md` | Fallback and rollback controls for keeping questionnaire completion available when live voice providers fail. |
| `apps/kiosk-web/src/features/avatar/VoiceConversationController.ts` | Kiosk voice-first command routing for retry, touch fallback, staff assist, and answer utterances. |
| `apps/kiosk-web/src/features/avatar/StreamingAudioPlayer.ts` | Browser Web Audio playback path for CosyVoice WebSocket PCM16 chunks and completed-WAV fallback. |
| `apps/model-sidecars/cosyvoice-service/` | CosyVoice3 streaming sidecar implementation boundary. |

## Status Vocabulary

- `PREFLIGHT_ONLY`: setup or smoke evidence exists, but no real-room pilot run.
- `RUNTIME_READY`: live providers are started and eligible, but the speaker run
  has not completed.
- `LIVE_MINIMUM_COMPLETED`: one-speaker room pilot completed with live ASR,
  LLM, streaming TTS, safe writes, recovery, fallback, and latency records.
- `BLOCKED_UNRESOLVED`: the live runtime or real-room trial cannot complete,
  and the exact blocker is recorded.

## Checklist

Current S1 outcome: `LIVE_MINIMUM_COMPLETED` after retest
`voice_first_room_retest_20260702_s1_v2`. The retest produced automatic
microphone selection, live wakeword, real microphone ASR, Ollama LLM guidance,
CosyVoice3 streaming TTS, PHQ-9 voice mapping, item 9 staff-review routing,
public report token creation, and background runtime/agent-turn collection.
The earlier `voice_first_room_acceptance_20260702_s1_v1` result remains the
blocked recovery history.

### 0. Freeze Pilot Goal

- [x] Confirm this run only evaluates ASR + LLM + TTS real-time voice UX.
- [x] Confirm RAG accuracy is out of scope for this run.
- [x] Confirm vision, hearing, HIS, Avatar animation, and new questionnaire
  expansion are out of scope.
- [x] Confirm the pilot has one speaker only: `S1`.
- [x] Confirm the full three-speaker field-ready gate remains a future
  validation layer.

### 1. Create Run Folder And Data Template

- [x] Create `experiments/voice_first_room_acceptance_20260702_s1_v1/`.
- [x] Generate the one-speaker room-test template:

```bash
python3 scripts/voice-room/run_voice_first_phq9_room_test.py \
  --output experiments/voice_first_room_acceptance_20260702_s1_v1 \
  --speakers 1
```

- [x] Confirm the template includes wakeword, 9 PHQ-9 items, retry, touch
  fallback, staff assist, no-speech, and background-noise rows.
- [x] Start or prepare the background runtime collector:

```bash
python3 scripts/voice-room/collect_voice_room_runtime.py \
  --run-id voice_first_room_acceptance_20260702_s1_v1 \
  --output experiments/voice_first_room_acceptance_20260702_s1_v1/logs/runtime_collector \
  --interval-sec 5
```

- [x] Record the repo branch, base commit, and worktree state.
- [x] Record local time in `Asia/Taipei` and UTC time for the pilot start.

### 2. Start Live Runtime

- [x] Start ASR sidecar with Breeze-ASR-26 / faster-whisper on GPU.
- [x] Start Ollama native LLM with `gemma4:e4b`.
- [x] Start CosyVoice3 streaming sidecar with a real configured backend or local
  model path.
- [x] Start API server with live ASR, live LLM, and live CosyVoice3 TTS env.
- [x] Start kiosk web in voice-first mode.
- [x] Start wakeword service for spoken `你好小慧`.
- [x] Record service ports, PIDs or container names, and log paths.

### 3. Run Preflight Smoke

- [x] ASR `/health` returns live and ready.
- [x] LLM guidance returns visible Traditional Chinese content with
  `think=false`.
- [x] CosyVoice3 `/readyz` is live and eligible.
- [x] CosyVoice3 WebSocket emits `first_audio_chunk` and PCM16 audio chunks
  before utterance completion.
- [x] Kiosk receives a streaming TTS descriptor.
- [ ] Touch fallback can still complete a questionnaire answer.
- [x] PHQ-9 item 9 safety wording routes to staff-support language.
- [x] Provider status confirms live providers, not mock providers.

### 4. Test Spoken Wakeword With S1

- [x] S1 says `你好小慧` 10 times at the selected room distance.
- [x] Record wake detected count.
- [x] Record wake miss count.
- [x] Run one quiet no-speech period.
- [ ] Run one background-noise period.
- [x] Record false trigger count.
- [x] Decide whether wakeword is good enough to continue the pilot.

### 5. Test ASR Option Mapping With S1

- [x] S1 says `完全沒有`.
- [x] S1 says `有幾天`.
- [x] S1 says `一半以上的天數`.
- [x] S1 says `幾乎每天`.
- [x] Record ASR transcript for each phrase.
- [x] Record mapped candidate for each phrase.
- [x] Record confidence or confirmation requirement when available.
- [x] Record ambiguity, misfill, or fallback reason.
- [x] Pay special attention to `完全沒有`, because prior evidence showed an ASR
  confusion case for this phrase.

Round 1 status: partial live evidence only. `有幾天` and `幾乎每天` mapped
correctly. `一半以上的天數` was transcribed but mapped ambiguously toward
`幾天`. Empty ASR transcript incorrectly inherited the debug text value
`完全沒有`; the kiosk live-recording path has been corrected, and this item
must be retested before the full PHQ-9 session.

Mapping repair status: the deterministic answer-evidence matcher now requires
exact matching for single-character aliases, so `一半以上的天數` and
`一半以上` map to value `2` in the direct endpoint check. Empty transcript now
routes to `no_speech_retry`. The next live step is the corrected S1 microphone
retest of all four option phrases.

### 6. Run One Full PHQ-9 Voice-First Session With S1

- [ ] S1 completes all 9 PHQ-9 questions primarily by voice.
- [ ] Each question records ASR transcript.
- [ ] Each question records mapped candidate.
- [ ] Each question records write decision.
- [ ] Each question records turn latency.
- [ ] Each question records TTS first-audio latency when available.
- [x] Completed response creates report section and public report token.
- [x] PHQ-9 item 9 positive answer routes to staff-review support wording.

### 7. Test Recovery And Fallback With S1

- [ ] S1 says `重新回答`; system retries without writing an unsafe answer.
- [ ] S1 says `改用觸控`; touch answer stage is restored.
- [ ] S1 says `找人協助`; staff-assist path is triggered.
- [ ] No-speech trial does not write an answer.
- [ ] Ambiguous answer trial requires confirmation or fallback.
- [ ] Critical unsafe auto-write count remains `0`.

### 8. Review CosyVoice3 Audio UX

- [ ] Save or locate TTS audio artifacts for the pilot turns.
- [ ] Check for severe audio break, repeat, truncation, or corruption.
- [ ] Check PHQ-9 wording intelligibility.
- [ ] Check Taiwan Mandarin naturalness for the health-kiosk context.
- [ ] Record Taiwan Mandarin acceptability notes.
- [ ] If audio quality is weak, route next work to prompt wav and normalization
  controls before any fine-tuning path.

S1 note: Taiwan Mandarin acceptability cannot be scored as pass while post-OOM
real-time spoken feedback can become incoherent. Treat spoken-feedback
coherence after recovery as a required next gate.

### 9. Compute Pilot Latency Summary

- [ ] Compute ASR latency when available.
- [ ] Compute LLM latency when available.
- [ ] Compute TTS TTFA.
- [ ] Compute full turn latency.
- [ ] Record p50 and p95 for available per-turn timings.
- [ ] Identify the slowest layer: ASR, LLM, TTS, browser playback, wakeword, or
  confirmation flow.
- [ ] Decide whether the one-speaker pilot feels responsive enough for the next
  room test.

### 10. Write Evidence Report

- [x] Create
  `docs/evidence/2026-07-02-voice-first-room-acceptance-s1-v1.md`.
- [x] Record environment, hardware, commands, ports, run ID, provider versions,
  and artifact paths.
- [x] Include background collector outputs:
  `logs/runtime_collector/static_environment_snapshot.json`,
  `logs/runtime_collector/runtime_samples.jsonl`, and
  `logs/runtime_collector/collector_summary.json`.
- [x] Record live counts and audio files.
- [x] Record pass/fail gates.
- [x] Record exact blocker if any.
- [ ] Use the final response contract:

```text
Status: <PREFLIGHT_ONLY / RUNTIME_READY / LIVE_MINIMUM_COMPLETED / BLOCKED_UNRESOLVED>

Runtime validity:
- ASR: <valid_target_runtime / blocked_runtime>
- LLM: <valid_target_runtime / blocked_runtime>
- CosyVoice3 TTS: <valid_target_runtime / blocked_runtime>
- Full voice-first room loop: <valid_target_runtime / blocked_runtime>

Live counts:
- speaker: <1>
- PHQ-9 full sessions: <N>
- real microphone turns: <N>
- generated audio files: <N>

Artifacts:
- <path>
- <path>
- <path>

Decision:
- Production default: <variant or none>
- Operational fallback: <variant or none>
- Research candidate: <variant or none>
- Next optimization candidate: <variant or none>
```

## Pilot Completion Rule

Mark this pilot `LIVE_MINIMUM_COMPLETED` only when S1 completes a real-room,
real-microphone PHQ-9 voice-first run with live ASR, live LLM, live CosyVoice3
streaming TTS, safe write behavior, recovery/fallback evidence, and latency
records.

If the run stops at setup or smoke checks, keep the status at `PREFLIGHT_ONLY`
or `RUNTIME_READY`. If the runtime cannot complete and the same blocker remains,
write `BLOCKED_UNRESOLVED` with the exact failing command and provider state.
