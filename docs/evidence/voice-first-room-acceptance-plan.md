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
- Voice-first collapsed-touch mode:
  - start with `voice_first_touch_collapsed`
  - confirm touch answers are visually collapsed at the start of the run
  - confirm `改用觸控`, low-confidence mapping, ambiguous mapping, or voice
    capture failure restores the touch answer stage
- No-speech and background-noise trials.
- PHQ-9 item 9 positive path.

## Required Record Fields

```json
{
  "run_id": "voice_first_room_acceptance_YYYYMMDD",
  "speaker_id": "S1",
  "mic_permission_granted": true,
  "distance_m": 1.0,
  "noise_condition": "normal_room",
  "question_id": "phq9_01",
  "expected_phrase": "完全沒有",
  "wake_detected": true,
  "false_trigger": false,
  "asr_text": "完全沒有",
  "mapped_candidate": "not_at_all",
  "asr_confidence_available": false,
  "confirmation_required": true,
  "write_decision": "answer_committed",
  "fallback_reason": null,
  "turn_latency_ms": 1800,
  "user_visible_mode": "voice_first_touch_visible",
  "touch_initially_collapsed": false,
  "touch_restored_by": null,
  "critical_unsafe_auto_write": false,
  "touch_fallback_success": true
}
```

## Hard Gates

- critical unsafe auto-write = 0
- unavailable ASR confidence does not write without confirmation
- item 9 positive route uses staff-support language
- touch fallback success = 100%
- `voice_first_touch_collapsed` restores touch on fallback, ambiguity, or voice
  capture failure
- full 9-question voice-first completion rate is measured
- wake miss and false-trigger rates are measured
- at least 3 speakers are recorded
- every speaker has all 9 PHQ-9 question trials recorded
- every template row has microphone, write-decision, latency, and visible-mode
  evidence
- at least one background-noise condition is recorded

## Manual Template Command

```bash
python3 scripts/voice-room/run_voice_first_phq9_room_test.py \
  --output experiments/voice_first_room_acceptance_manual \
  --speakers 3
```

Validate a filled CSV:

```bash
python3 scripts/voice-room/run_voice_first_phq9_room_test.py \
  --validate experiments/voice_first_room_acceptance_manual/raw_runs_template.csv
```

The generated CSV is a field collection template. The validator exits non-zero
until real-room rows are filled and the hard gates pass.

The validator also has a local self-check:

```bash
python3 scripts/voice-room/run_voice_first_phq9_room_test.py --self-test
```
