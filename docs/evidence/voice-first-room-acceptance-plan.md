---
id: smart-health-cabin-voice-first-room-acceptance-plan
title: "Voice-First Room Acceptance Plan"
date: 2026-06-26
topic: smart-health-cabin
type: experiment-plan
status: active
source:
  - ./2026-06-26-expert-review-voice-first-cosyvoice3-update.md
  - ../decisions/2026-06-26-voice-first-cosyvoice3-product-path.md
---

# Voice-First Room Acceptance Plan

## Goal

Prove that a real user can complete PHQ-9 primarily by voice in a real room,
with safe writes, visible recovery, touch/staff fallback, and auditable events.

## Required Conditions

- Real microphone permission in the kiosk browser.
- Spoken wake phrase: `你好小慧`.
- Spoken PHQ-9 answers:
  - `完全沒有`
  - `有幾天`
  - `一半以上的天數`
  - `幾乎每天`
- Recovery commands:
  - `重新回答`
  - `改用觸控`
  - `找人協助`
- No-speech and background-noise trials.
- PHQ-9 item 9 positive path.

## Required Record Fields

```json
{
  "run_id": "voice_first_room_acceptance_YYYYMMDD",
  "speaker_id": "S1",
  "distance_m": 1.0,
  "noise_condition": "normal_room",
  "question_id": "phq9_01",
  "expected_phrase": "完全沒有",
  "wake_detected": true,
  "false_trigger": false,
  "asr_text": "完全沒有",
  "mapped_candidate": "not_at_all",
  "write_decision": "answer_committed",
  "fallback_reason": null,
  "turn_latency_ms": 1800,
  "user_visible_mode": "voice_first_touch_visible"
}
```

## Hard Gates

- critical unsafe auto-write = 0
- unavailable ASR confidence does not write without confirmation
- item 9 positive route uses staff-support language
- touch fallback success = 100%
- full 9-question voice-first completion rate is measured
- wake miss and false-trigger rates are measured

## Manual Template Command

```bash
python3 scripts/voice-room/run_voice_first_phq9_room_test.py \
  --output experiments/voice_first_room_acceptance_manual \
  --speakers 3
```

The generated CSV is a field collection template. It is not field-ready
evidence until filled from real-room runs.
