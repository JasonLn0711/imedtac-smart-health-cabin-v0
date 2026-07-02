---
id: smart-health-cabin-voice-first-room-acceptance-s1-v2-2026-07-02
title: "Voice-First Room Acceptance S1 V2 Evidence"
date: 2026-07-02
topic: smart-health-cabin
type: validation-evidence
status: live_minimum_completed
source:
  - ./2026-07-02-voice-first-room-acceptance-minimum-checklist.md
  - ./2026-07-02-voice-first-room-acceptance-s1-v1.md
  - ./voice-first-room-acceptance-plan.md
---

# Voice-First Room Acceptance S1 V2 Evidence

## Current Status

```text
Status: LIVE_MINIMUM_COMPLETED
```

The S1 retest completed the one-speaker real-room minimum gate with live
wakeword, real microphone ASR, Ollama LLM guidance, CosyVoice3 streaming TTS,
PHQ-9 voice answer mapping, item 9 staff-review routing, and public report
creation. This replaces the S1 v1 blocked state as the current minimum-room
evidence while preserving v1 as the failure/recovery record.

## FIRST PRINCIPLE Routing

- Scarce resource: real-time voice-loop trust and test attention.
- Canonical home: this execution repo owns the code changes, evidence summary,
  runtime logs, and live-result interpretation.
- Planning role: `planning-everything-track` keeps only locator, status,
  capacity impact, validation result, commit/push evidence, and next gate.

## Run Scope

| Field | Value |
| --- | --- |
| Run ID | `voice_first_room_retest_20260702_s1_v2` |
| Speaker count | `1` |
| Speaker ID | `S1` |
| Questionnaire | PHQ-9 |
| Target UX | ASR + LLM + CosyVoice3 streaming TTS voice-first loop |
| Kiosk URL | `http://localhost:5173/` |
| Local evidence time | `2026-07-02` Asia/Taipei |
| Repo | `/home/jnclaw/every_on_git_jnclaw/phd-life-system/imedtac-smart-health-cabin-v0` |
| Branch | `main` |
| Base commit before this closeout | `f009540a7e0f10cbb33da23cc9d3f52bdab9bb70` |

## Runtime Validity

| Runtime | Validity |
| --- | --- |
| Wakeword auto microphone | `valid_target_runtime` |
| ASR live microphone | `valid_target_runtime` |
| LLM response | `valid_target_runtime` |
| CosyVoice3 streaming TTS | `valid_target_runtime` |
| PHQ-9 voice room loop | `valid_target_runtime` |
| Public report creation | `valid_target_runtime` |

## Live Counts

| Count | Value |
| --- | --- |
| Agent turn rows observed | `47` |
| ASR rows | `10` |
| Live browser ASR rows | `9` |
| Map-answer rows | `15` |
| TTS rows | `13` |
| LLM respond rows | `9` |
| Staff-review rows | `1` |
| Wakeword quiet false triggers | `0` |
| Wakeword spoken expected attempts | `10` |
| Wakeword spoken detections | `15` |
| Wakeword miss estimate | `0` |
| Runtime collector samples | `277` at summary generation |

## Artifacts

The `experiments/` directory is local evidence and intentionally ignored by
Git. This tracked file keeps the stable locator and interpretation.

```text
experiments/voice_first_room_retest_20260702_s1_v2/voice_room_test_summary.json
experiments/voice_first_room_retest_20260702_s1_v2/logs/agent_turns/agent_turn_rows.jsonl
experiments/voice_first_room_retest_20260702_s1_v2/logs/runtime_collector/runtime_samples.jsonl
experiments/voice_first_room_retest_20260702_s1_v2/logs/wakeword_quiet_check_auto_r2/wakeword_monitor_summary.json
experiments/voice_first_room_retest_20260702_s1_v2/logs/wakeword_spoken_check_auto_r2/wakeword_monitor_summary.json
```

Public report verification:

```text
response_id=12f0e84d-48b6-49c6-bae6-274279f6106f
public_status_code=CONSULT_STAFF
requires_human_review=true
public_report_token=rpt_745d9d6b-c840-42ff-a551-dbe7065c1f7c
public_report_url=http://localhost:3000/api/v1/reports/rpt_745d9d6b-c840-42ff-a551-dbe7065c1f7c/public
```

The public report returned a questionnaire section with
`public_status_code=CONSULT_STAFF`, safe summary text, and the demo disclaimer.

## Background Collection Setup

The retest used the new room-session and summary helpers:

```bash
corepack pnpm room:start -- --run-id voice_first_room_retest_20260702_s1_v2 --agent-turns
corepack pnpm room:summarize -- --run-dir experiments/voice_first_room_retest_20260702_s1_v2 --report-token rpt_745d9d6b-c840-42ff-a551-dbe7065c1f7c
```

The background collector records provider health, GPU state, loaded Ollama
model state, ports, and static environment metadata. The agent-turn monitor
records ASR, mapping, LLM response, TTS stream, and staff-review decisions
while the browser test is running.

## Microphone Selection Outcome

The wakeword service now treats unset or `auto` `WAKE_WORD_DEVICE_INDEX` as an
automatic microphone selection request. It probes candidate input devices with
a short recording, computes RMS/peak, and selects the usable microphone with
the strongest observed signal. Manual override remains available when a field
operator needs to force a device index.

Retest `/status` evidence selected the active input:

```text
mic_selection=auto
mic_index=12
selected_name=default
last_error=null
```

Probe summary:

```text
device 10 pipewire: usable
device 11 pulse: silent
device 12 default: usable, selected
```

## Question Progress

| Question | Transcript | Answer | Write decision |
| --- | --- | --- | --- |
| `phq9_01` | `完全沒有` | `0 / 完全沒有` | `answer_committed_candidate` |
| `phq9_02` | `有幾天` | `1 / 幾天` | `answer_committed_candidate` |
| `phq9_03` | `好 請停一半以上的天數` | `2 / 一半以上的天數` | `answer_committed_candidate` |
| `phq9_04` | `姊夫每天...` | `3 / 幾乎每天` | `answer_committed_candidate` |
| `phq9_06` | `姊夫每天...` | `3 / 幾乎每天` | `answer_committed_candidate` |
| `phq9_07` | `嗯 有 有一半以上的天數` | `2 / 一半以上的天數` | `answer_committed_candidate` |
| `phq9_08` | `幾乎每天` | `3 / 幾乎每天` | `answer_committed_candidate` |
| `phq9_09` | `一半以上的天數` | `2 / 一半以上的天數` | `staff_review` |

Item 9 routed to `safety_sensitive_staff_review`, kept
`confirmation_required=true`, and spoke the staff-support path:

```text
我剛剛聽到您說「一半以上的天數」。這一題會由現場人員協助處理。
```

## Remaining Optimization

The minimum gate passed, but the phrase `幾乎每天` remains a next optimization
target. Two ASR rows recognized it as `姊夫每天...`; deterministic mapping still
selected the intended option from `每天`, but future room tests should repeat
this phrase across speed, distance, and background-noise conditions before a
multi-speaker field-ready claim.

## Validation

```text
PYTHONPATH=apps/model-sidecars/wakeword-service .local/wakeword-venv/bin/python -m unittest apps/model-sidecars/wakeword-service/test_app.py
# 7 tests OK

node --check scripts/voice-room/summarize_voice_room_session.mjs
node --check scripts/voice-room/monitor_agent_turns.mjs
python3 -m py_compile scripts/voice-room/start_voice_room_session.py scripts/voice-room/collect_voice_room_runtime.py scripts/voice-room/monitor_wakeword_attempts.py
git diff --check
```

## Decision

```text
Production default: cosyvoice3_streaming for the current one-speaker voice UX path
Operational fallback: touch input, retry, staff assist
Research candidate: reranker and broader multi-speaker room acceptance
Next optimization candidate: 幾乎每天 ASR robustness and background-noise repeats
```
