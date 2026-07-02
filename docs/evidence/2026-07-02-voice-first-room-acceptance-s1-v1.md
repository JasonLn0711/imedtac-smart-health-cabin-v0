---
id: smart-health-cabin-voice-first-room-acceptance-s1-v1-2026-07-02
title: "Voice-First Room Acceptance S1 V1 Evidence"
date: 2026-07-02
topic: smart-health-cabin
type: validation-evidence
status: blocked_unresolved
source:
  - ./2026-07-02-voice-first-room-acceptance-minimum-checklist.md
  - ./voice-first-room-acceptance-plan.md
  - ./cosyvoice3-streaming-provider-validation.md
---

# Voice-First Room Acceptance S1 V1 Evidence

## Current Status

```text
Status: BLOCKED_UNRESOLVED
```

The one-speaker room pilot has a run folder, manual CSV template, live provider
runtime, kiosk URL, and background runtime collector. It produced real
microphone turns, wakeword detections, provider readiness evidence, and
front-end loop evidence, but it did not complete the S1 real-time voice UX gate.
The blocking evidence is now explicit: VRAM pressure triggered ASR CUDA
failures, the user observed incoherent real-time spoken feedback after OOM, and
the post-restart front-end run still produced repeated empty ASR transcripts.
This file is therefore not a `LIVE_MINIMUM_COMPLETED` report.

## Run Scope

| Field | Value |
| --- | --- |
| Run ID | `voice_first_room_acceptance_20260702_s1_v1` |
| Speaker count | `1` |
| Speaker ID | `S1` |
| Questionnaire | PHQ-9 |
| Target UX | ASR + LLM + CosyVoice3 streaming TTS low-latency voice-first loop |
| Kiosk URL | `http://localhost:5173/` |
| Local started_at | `2026-07-02T11:23:10+08:00` |
| Repo | `/home/jnclaw/every_on_git_jnclaw/phd-life-system/imedtac-smart-health-cabin-v0` |
| Branch | `main` |
| Base commit | `3a8a73429df69d29236b7322620a240e262092b6` |

## Artifacts

```text
experiments/voice_first_room_acceptance_20260702_s1_v1/README.md
experiments/voice_first_room_acceptance_20260702_s1_v1/raw_runs_template.csv
experiments/voice_first_room_acceptance_20260702_s1_v1/logs/runtime_collector/static_environment_snapshot.json
experiments/voice_first_room_acceptance_20260702_s1_v1/logs/runtime_collector/runtime_samples.jsonl
experiments/voice_first_room_acceptance_20260702_s1_v1/logs/runtime_collector_live/runtime_samples.jsonl
experiments/voice_first_room_acceptance_20260702_s1_v1/logs/asr-8001.log
experiments/voice_first_room_acceptance_20260702_s1_v1/logs/cosyvoice3-8015.log
experiments/voice_first_room_acceptance_20260702_s1_v1/logs/wakeword-8013.log
experiments/voice_first_room_acceptance_20260702_s1_v1/logs/ollama-11434.log
experiments/voice_first_room_acceptance_20260702_s1_v1/logs/api-3000.log
experiments/voice_first_room_acceptance_20260702_s1_v1/logs/voice-agent-3004.log
experiments/voice_first_room_acceptance_20260702_s1_v1/logs/kiosk-5175.log
experiments/voice_first_room_acceptance_20260702_s1_v1/logs/agent_turn_monitor_asr_options_s1_round1/agent_turn_rows.jsonl
```

The `experiments/` directory is local evidence and is intentionally ignored by
Git. This tracked file preserves the discoverable evidence pointer.

## Runtime Services

| Layer | Endpoint / URL | Status |
| --- | --- | --- |
| API server | `http://localhost:3000` | live |
| Voice-agent server | `http://localhost:3004/readyz` | live |
| Kiosk web | `http://localhost:5173/` | live |
| ASR | `http://localhost:8001/health` | live, GPU, Breeze-ASR-26 CT2 int8 |
| CosyVoice3 TTS | `http://localhost:8015/readyz` | live, WebSocket PCM16 streaming |
| Wakeword | `http://localhost:8013/status` | live, listening, `你好小慧`, mic index `11` |
| Ollama | `http://localhost:11434/api/ps` | live, `gemma4:e4b` loaded |
| Redpanda | `http://localhost:9644/v1/status/ready` | live |

## Commands Run

Template generation:

```bash
python3 scripts/voice-room/run_voice_first_phq9_room_test.py \
  --output experiments/voice_first_room_acceptance_20260702_s1_v1 \
  --speakers 1
```

Background runtime collector:

```bash
python3 scripts/voice-room/collect_voice_room_runtime.py \
  --run-id voice_first_room_acceptance_20260702_s1_v1 \
  --output experiments/voice_first_room_acceptance_20260702_s1_v1/logs/runtime_collector_live \
  --interval-sec 5
```

Preflight validation:

```bash
python3 -m py_compile scripts/voice-room/run_voice_first_phq9_room_test.py scripts/voice-room/collect_voice_room_runtime.py
python3 scripts/voice-room/collect_voice_room_runtime.py --run-id voice_first_room_acceptance_20260702_s1_v1 --output experiments/voice_first_room_acceptance_20260702_s1_v1/logs/runtime_collector --interval-sec 1 --samples 1
python3 scripts/voice-room/run_voice_first_phq9_room_test.py --validate experiments/voice_first_room_acceptance_20260702_s1_v1/raw_runs_template.csv
corepack pnpm --filter @shc/api-server migrate
corepack pnpm smoke:cosyvoice3
API_BASE_URL=http://localhost:3000 corepack pnpm smoke:voice-conversation-live
API_BASE_URL=http://localhost:3000 VOICE_AGENT_SERVER_URL=http://localhost:3004 corepack pnpm live:check
git diff --check
```

The empty CSV validator returned `field_ready=false`, as expected before S1
real-room rows are filled.

## Preflight Result

`corepack pnpm smoke:cosyvoice3` passed:

```text
provider=cosyvoice3_streaming
ready=true
streaming_ready=true
audio_transport=ws_pcm16
eligible=true
```

`corepack pnpm smoke:voice-conversation-live` passed:

```text
provider=cosyvoice3_streaming
stream_url=ws://localhost:8015/v1/audio/stream
audio_transport=ws_pcm16
acceptanceEligible=true
```

`corepack pnpm live:check` passed for the required provider set:

```text
ASR: live, GPU, acceptanceEligible=true
LLM: live, GPU, acceptanceEligible=true
TTS: live, GPU, CosyVoice3 streaming, acceptanceEligible=true
Redpanda: live
Voice-agent: ready, LLM GPU acceptance eligible
```

Reranker is unavailable and not required for this one-speaker ASR + LLM + TTS
UX gate. The fallback path remains deterministic mapping plus confirmation,
touch fallback, and staff assist.

## Runtime Notes

- The kiosk package script fixed the dev port at `5173`; the attempted `5175`
  override was passed through as extra Vite arguments. The active test URL is
  therefore `http://localhost:5173/`.
- Wakeword initially failed on microphone index `0` because the device was HDMI
  output-only. The live sidecar was restarted with `WAKE_WORD_DEVICE_INDEX=11`,
  and `/status` then reported `ready=true`, `listening=true`, and
  `last_error=null`.
- Ollama initially used the empty default `~/.ollama/models` store. It was
  restarted with
  `OLLAMA_MODELS=/home/jnclaw/every_on_git_jnclaw/phd-life-system/jarvis-voice-sight/.local/ollama/models`,
  after which `gemma4:e4b` became available and loaded.
- ASR uses the sibling Jarvis Breeze-ASR-26 CT2 int8 model and venv. The API is
  configured with `ASR_SERVICE_URL=http://localhost:8001`,
  `ASR_HEALTH_PATH=/health`, and `ASR_TRANSCRIBE_PATH=/asr`.
- Background collection is active and records provider health, GPU state,
  ports, and Ollama loaded-model state every 5 seconds.

## S1 Wakeword Attempt 1

Command:

```bash
WAKE_WORD_LIVE_WAIT_MS=30000 corepack pnpm smoke:wakeword:live
```

Command result:

```text
Timed out waiting for real wake.detected from http://localhost:8013/events after 30000ms
```

Follow-up `/status` result showed a real wake event:

```text
last_event.type=wake.detected
last_event.phrase=你好小慧
last_event.score=1.0
last_event.timestamp=2026-07-02T03:29:08.586495+00:00
```

Interpretation:

```text
The wakeword sidecar detected the phrase, but the smoke command did not capture
the event before its timeout window closed. Count this as sidecar detection
evidence, not as a clean smoke pass. The next wakeword step should repeat the
spoken check while watching both the WebSocket smoke output and `/status`.
```

## S1 Wakeword Round 1

Command:

```bash
python3 scripts/voice-room/monitor_wakeword_attempts.py \
  --run-id voice_first_room_acceptance_20260702_s1_v1 \
  --output experiments/voice_first_room_acceptance_20260702_s1_v1/logs/wakeword_attempts_s1_round1 \
  --expected-attempts 10 \
  --duration-sec 90 \
  --interval-sec 0.5
```

Result:

```text
started_at_utc=2026-07-02T03:31:02.517+00:00
ended_at_utc=2026-07-02T03:32:32.856+00:00
expected_attempts=10
detected_events_raw=16
detected_events_in_window=15
wake_misses_estimate=0
```

The first raw event was the pre-monitor baseline event from
`2026-07-02T03:30:14.892528+00:00` and is excluded from the in-window count.
The remaining events were new detections during the 90-second test window.

Artifact paths:

```text
experiments/voice_first_room_acceptance_20260702_s1_v1/logs/wakeword_attempts_s1_round1/wakeword_status_samples.jsonl
experiments/voice_first_room_acceptance_20260702_s1_v1/logs/wakeword_attempts_s1_round1/wakeword_detected_events.jsonl
experiments/voice_first_room_acceptance_20260702_s1_v1/logs/wakeword_attempts_s1_round1/wakeword_monitor_summary.json
```

## S1 Quiet False-Trigger Check

The first quiet check exposed a monitor accounting bug: the summary counted the
pre-monitor baseline `last_event` even though no new event file was written.
`scripts/voice-room/monitor_wakeword_attempts.py` was corrected to exclude
baseline events from `detected_events`.

Corrected command:

```bash
python3 scripts/voice-room/monitor_wakeword_attempts.py \
  --run-id voice_first_room_acceptance_20260702_s1_v1 \
  --output experiments/voice_first_room_acceptance_20260702_s1_v1/logs/wakeword_false_trigger_quiet_s1_round2 \
  --expected-attempts 0 \
  --duration-sec 30 \
  --interval-sec 0.5
```

Corrected result:

```text
started_at_utc=2026-07-02T03:33:55.956+00:00
ended_at_utc=2026-07-02T03:34:26.071+00:00
expected_attempts=0
detected_events=0
sample_count=60
```

Interpretation:

```text
Wakeword is usable for the S1 pilot at threshold 0.65 and mic index 11.
The current evidence supports continuing to ASR option mapping. The formal
full-room gate still needs repeated speakers and background-noise rows.
```

## Next Test Step

Checklist item 5 has started and produced partial live evidence. Continue with
the corrected ASR option-mapping retest before starting the full PHQ-9 session.

## S1 ASR Option Mapping Round 1

Command:

```bash
node scripts/voice-room/monitor_agent_turns.mjs \
  --run-id voice_first_room_acceptance_20260702_s1_v1 \
  --output experiments/voice_first_room_acceptance_20260702_s1_v1/logs/agent_turn_monitor_asr_options_s1_round1 \
  --duration-sec 240 \
  --interval-ms 500
```

Observed rows:

```text
started_at_utc=2026-07-02T03:36:32.405+00:00
ended_at_utc=2026-07-02T03:40:32.613+00:00
total_rows=38
respond=8
tts_stream=12
asr=9
map_answer=9
```

Mapping evidence:

| Phrase / transcript | Question | Result | Interpretation |
| --- | --- | --- | --- |
| `有幾天` | `phq9_01` | mapped to `幾天`, value `1`, `answer_committed_candidate` | Valid live ASR + mapping evidence. |
| `一半以上的天數` | `phq9_02` | incorrectly selected `幾天`, value `1`, `ambiguous_multiple_candidates`, `confirmation_required` | ASR heard the phrase, but safety mapping favored the wrong candidate through evidence text `一`; this needs mapping repair before full PHQ-9. |
| `一半以上` | `phq9_02` | incorrectly selected `幾天`, value `1`, `ambiguous_multiple_candidates`, `confirmation_required` | Same mapping issue. |
| `對 是一半以上的天作賣` | `phq9_02` | incorrectly selected `幾天`, value `1`, `ambiguous_multiple_candidates`, `confirmation_required` | ASR produced a noisy but understandable phrase; mapping still needs stronger option-2 handling. |
| `幾乎每天` | `phq9_03` | mapped to `幾乎每天`, value `3`, `answer_committed_candidate` | Valid live ASR + mapping evidence. |
| `對` | `phq9_04` | no candidate, `low_confidence_retry`, `no_write_retry` | Correct recovery behavior. |
| empty ASR transcript | `phq9_02`, `phq9_04`, `phq9_05` | frontend sent `完全沒有` into `map_answer` | Invalid as ASR evidence. This exposed a kiosk fallback bug, not a valid voice result. |

The empty-transcript case was traced to the kiosk live-recording path using the
debug text input as an ASR fallback. The input default was `完全沒有`, so an
empty ASR response could still become a mapped answer. The live recording path
was corrected in `apps/kiosk-web/src/features/avatar/AvatarPanel.tsx`:

```text
real microphone ASR no longer sends the text input as fallback transcript
empty ASR transcript now routes to retry / touch fallback instead of map_answer
the text debug field starts empty
```

Verification after the fix:

```bash
corepack pnpm --filter @shc/kiosk-web typecheck
corepack pnpm test -- --run \
  apps/kiosk-web/src/features/avatar/voiceQuestionnaireController.test.ts \
  apps/kiosk-web/src/features/avatar/voiceConversationMode.test.ts
```

Result:

```text
kiosk typecheck passed
20 voice questionnaire / voice conversation tests passed
Vite HMR applied AvatarPanel.tsx at 2026-07-02 11:42:19 Asia/Taipei
```

The `一半以上的天數` mapping issue was traced to
`packages/voice-safety-core/src/semantic-frame.ts`: single-character answer
aliases used substring matching, so the value-1 alias `一` could match inside
`一半以上`. The answer-evidence matcher now requires exact text for
single-character aliases while preserving substring matching for full answer
phrases such as `一半以上` and `有幾天`.

Verification after the mapping fix:

```bash
corepack pnpm test -- --run \
  packages/voice-safety-core/src/voice-safety-core.test.ts \
  apps/kiosk-web/src/features/avatar/voiceQuestionnaireController.test.ts \
  apps/kiosk-web/src/features/avatar/voiceConversationMode.test.ts
corepack pnpm --filter @shc/kiosk-web typecheck
corepack pnpm --filter @shc/voice-safety-core typecheck
```

Result:

```text
32 voice safety / questionnaire / conversation tests passed
kiosk typecheck passed
voice-safety-core typecheck passed
```

The API server was restarted with the same live provider environment so the
new mapping logic is active at `http://localhost:3000`.

Direct `map-answer` endpoint verification:

| Transcript | Endpoint result |
| --- | --- |
| `完全沒有` | value `0`, `high_confidence_clear_answer` |
| `有幾天` | value `1`, `high_confidence_clear_answer` |
| `一半以上的天數` | value `2`, `high_confidence_clear_answer` |
| `一半以上` | value `2`, `high_confidence_clear_answer` |
| `幾乎每天` | value `3`, `high_confidence_clear_answer` |
| empty string | no candidate, `no_speech_retry` |

## S1 ASR Option Mapping Round 2

Command:

```bash
node scripts/voice-room/monitor_agent_turns.mjs \
  --run-id voice_first_room_acceptance_20260702_s1_v1 \
  --output experiments/voice_first_room_acceptance_20260702_s1_v1/logs/agent_turn_monitor_asr_options_s1_round2 \
  --duration-sec 240 \
  --interval-ms 500
```

Observed rows:

```text
started_at_utc=2026-07-02T03:45:21.386+00:00
ended_at_utc=2026-07-02T03:49:21.595+00:00
total_rows=15
respond=4
tts_stream=5
asr=3
map_answer=3
```

Mapping evidence after the fix:

| Transcript | Question | Result | Interpretation |
| --- | --- | --- | --- |
| `完全沒有` | `phq9_07` | value `0`, `answer_committed_candidate` | Valid live ASR + mapping evidence after removing the text-input fallback. |
| `有幾天` | `phq9_08` | value `1`, `answer_committed_candidate` | Valid live ASR + mapping evidence. |
| `一半以上的電力是嗎` | `phq9_09` | value `2`, `safety_sensitive_staff_review`, `staff_review` | The ASR transcript was noisy but retained `一半以上`; deterministic mapping selected value `2`. Because the active item was PHQ-9 item 9, staff-review routing correctly prevented ordinary write flow. |

Round 2 interpretation:

```text
The two code fixes worked for the observed cases:
- empty ASR transcript did not produce a false `完全沒有` write
- `一半以上...` no longer mapped to `幾天`

This round is still not the clean four-option S1 gate because the browser
session continued from `phq9_07` through `phq9_09`, and item 9 intentionally
routes through staff-review support. A clean retest should start from a fresh
questionnaire state and repeat all four option phrases before the full PHQ-9
session.
```

## S1 ASR Option Mapping Round 3

Command:

```bash
node scripts/voice-room/monitor_agent_turns.mjs \
  --run-id voice_first_room_acceptance_20260702_s1_v1 \
  --output experiments/voice_first_room_acceptance_20260702_s1_v1/logs/agent_turn_monitor_asr_options_s1_round3 \
  --duration-sec 180 \
  --interval-ms 500
```

Observed rows:

```text
started_at_utc=2026-07-02T03:49:49.959+00:00
ended_at_utc=2026-07-02T03:52:49.997+00:00
total_rows=12
respond=5
tts_stream=5
asr=1
map_answer=1
```

Mapping evidence:

| Transcript | Question | Result | Interpretation |
| --- | --- | --- | --- |
| `幾乎每天...` | `phq9_01` | value `3`, `answer_committed_candidate` | Valid live ASR + mapping evidence. |

Runtime blocker:

```text
After the next user utterance, the kiosk surfaced:
http://localhost:8001/asr returned 500: Internal Server Error

API request timing:
2026-07-02T03:53:55.229+00:00 POST /api/v1/agent-turns/asr
response=500
response_time_ms=67.35

ASR sidecar error:
RuntimeError: parallel_for failed: cudaErrorInvalidDevice: invalid device ordinal

Earlier ASR sidecar error during this same S1 run:
RuntimeError: CUDA failed with error out of memory
```

GPU context at the blocker:

```text
GPU used: about 13.9 GiB / 16.4 GiB
project_aura unrelated process: about 2.1 GiB
Ollama gemma4:e4b: about 4.5 GiB
CosyVoice3: about 4.9 GiB
ASR: about 2.2 GiB
```

Action taken:

```text
ASR process 40669 was stopped.
GPU usage dropped from about 13.9 GiB to 11.6 GiB.
ASR was restarted at 2026-07-02T11:53:37+08:00 with CUDA_VISIBLE_DEVICES=0.
```

Recovery probe:

```text
probe_time_local=2026-07-02T11:54:52+08:00
probe_target=http://localhost:8001/asr
probe_audio=0.8s generated WAV tone
result=200 OK
elapsed_ms=2371.135
transcript=""
segments=[]
asr_health_after_probe.loaded=true
gpu_after_probe=about 13.8 GiB / 16.4 GiB
```

Current interpretation:

```text
The ASR HTTP health check is insufficient by itself because the restarted
sidecar reports /health ok before the Breeze-ASR model is loaded on GPU. The
direct /asr recovery probe passed after restart, so the next gate can return to
front-end microphone testing. GPU headroom remains narrow because the combined
ASR + LLM + TTS runtime and an unrelated project_aura process use most VRAM.
If another ASR 500 appears, the next stabilization action is to free unrelated
GPU memory before continuing.
```

## User-Reported Real UX Degradation After VRAM OOM

Source: live S1 user observation during the same test session.

Direct user quote:

```text
我發現VRAM out of memory 之後，tts  real time 回饋就會亂講話，並且語無倫次，請記錄下來使用者的經驗，這是真實的。
```

Interpretation:

```text
This is real user-experience evidence, not a synthetic failure mode. After GPU
memory pressure and ASR CUDA errors, the voice loop can degrade beyond a single
ASR 500. The user observed that real-time TTS feedback became incoherent and
semantically unstable. This makes VRAM pressure a full voice-loop stability
blocker, not only an ASR-side operational issue.
```

Impact on current S1 gate:

```text
The one-speaker real-time UX gate cannot be marked LIVE_MINIMUM_COMPLETED while
VRAM pressure can trigger ASR failure and incoherent real-time spoken feedback.
The next valid test pass needs a stable GPU-memory envelope, a clean ASR
recovery path, and a repeated front-end run where TTS feedback remains coherent
after each ASR/LLM turn.
```

Stabilization candidates:

```text
1. Free unrelated GPU memory before the next voice-loop run.
2. Add a provider health gate that treats ASR CUDA errors or OOM as a voice-loop
   degraded state, not as healthy because /health still returns ok.
3. Stop or reset the spoken feedback loop after ASR 500/OOM instead of allowing
   continued real-time TTS output from unstable state.
4. Record a TTS coherence observation for every post-OOM recovery attempt.
```

## S1 ASR Option Mapping Round 4

Command:

```bash
node scripts/voice-room/monitor_agent_turns.mjs \
  --run-id voice_first_room_acceptance_20260702_s1_v1 \
  --output experiments/voice_first_room_acceptance_20260702_s1_v1/logs/agent_turn_monitor_asr_options_s1_round4 \
  --duration-sec 240 \
  --interval-ms 500
```

Observed rows:

```text
started_at_utc=2026-07-02T03:55:08.785+00:00
ended_at_utc=2026-07-02T03:59:08.987+00:00
total_rows=26
respond=3
tts_stream=12
asr=10
map_answer=1
```

Validated behavior:

```text
phq9_01 ASR transcript: 完全沒有
mapped candidate: value 0, text 完全沒有
write_decision: answer_committed_candidate
ASR 500 during round 4: none observed
```

Observed blocker:

```text
After the first successful answer, phq9_02 produced repeated empty ASR
transcripts. The system did not write an answer from the empty transcript,
which confirms the earlier empty-transcript guard. However, the loop repeatedly
played the retry TTS phrase, creating poor UX and increasing the risk of
incoherent spoken feedback after runtime instability.
```

Action taken after Round 4:

```text
apps/kiosk-web/src/features/avatar/AvatarPanel.tsx now tracks consecutive
empty ASR transcripts. The first empty transcript gives one retry prompt. The
second consecutive empty transcript stops the continuous voice loop and routes
the user to touch fallback / staff confirmation.
```

Verification:

```bash
corepack pnpm --filter @shc/kiosk-web typecheck
corepack pnpm test -- --run \
  apps/kiosk-web/src/features/avatar/avatarStateMachine.test.ts \
  apps/kiosk-web/src/features/avatar/voiceQuestionnaireController.test.ts \
  apps/kiosk-web/src/features/avatar/voiceConversationMode.test.ts
```

Result:

```text
kiosk typecheck passed
29 voice UI tests passed
Vite HMR applied AvatarPanel.tsx at 2026-07-02 11:59:54 Asia/Taipei
```

ASR runtime note:

```text
One ASR /asr request returned 500 during the round.
Underlying sidecar error: RuntimeError: parallel_for failed:
cudaErrorInvalidDevice: invalid device ordinal.
```

Provider health recovered and remains ready, but this is live runtime evidence
that ASR can fail during a real turn. The next ASR mapping retest should watch
both `agent_turn_rows.jsonl` and `logs/asr-8001.log`.

## Corrected Next Test Step

Repeat checklist item 5 after the empty-transcript guard:

```text
S1 says the four PHQ-9 option phrases:
- 完全沒有
- 有幾天
- 一半以上的天數
- 幾乎每天
```

Record each attempt in
`experiments/voice_first_room_acceptance_20260702_s1_v1/raw_runs_template.csv`
or a derived filled CSV, including ASR transcript, mapped candidate,
confirmation requirement, fallback reason, latency, and operator notes.

The retest passes when:

```text
完全沒有 -> value 0 from non-empty ASR transcript
有幾天 -> value 1 from non-empty ASR transcript
一半以上的天數 -> value 2, or confirmation fallback without wrong committed write
幾乎每天 -> value 3 from non-empty ASR transcript
empty ASR transcript -> retry/touch fallback, no map_answer write
ASR 500 count -> 0 during the retest window
```

## Current Final Response Contract

```text
Status: BLOCKED_UNRESOLVED

Runtime validity:
- ASR: blocked_runtime for continuous room loop; valid single-turn evidence exists
- LLM: valid_target_runtime
- CosyVoice3 TTS: valid_target_runtime for streaming transport; spoken feedback coherence is blocked after OOM evidence
- Full voice-first room loop: blocked_runtime

Live counts:
- speaker: 0 completed
- PHQ-9 full sessions: 0
- real microphone wakeword detections: 15 in-window detections during S1 wake round 1
- real microphone ASR turns: 23 captured across option-mapping rounds 1-4
- generated audio files: 0

Decision:
- Production default: none for field-ready voice UX yet
- Operational fallback: touch fallback + deterministic mapping / staff assist; stop continuous voice loop after repeated empty ASR
- Research candidate: none in this S1 pilot
- Next optimization candidate: stable GPU-memory envelope, ASR CUDA/OOM health gate,
  post-OOM spoken-feedback reset, and clean four-option S1 retest
```
