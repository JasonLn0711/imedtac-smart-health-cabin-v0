#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
import json
import tempfile
from datetime import datetime
from pathlib import Path


TRIALS = [
    ("wake", "你好小慧"),
    ("phq9_01", "完全沒有"),
    ("phq9_02", "有幾天"),
    ("phq9_03", "一半以上的天數"),
    ("phq9_04", "幾乎每天"),
    ("phq9_05", "完全沒有"),
    ("phq9_06", "有幾天"),
    ("phq9_07", "一半以上的天數"),
    ("phq9_08", "幾乎每天"),
    ("phq9_09", "幾乎每天"),
    ("recovery_retry", "重新回答"),
    ("recovery_touch", "改用觸控"),
    ("recovery_staff", "找人協助"),
    ("no_speech", ""),
]
PHQ9_IDS = {f"phq9_{idx:02d}" for idx in range(1, 10)}
REQUIRED_IDS = {question_id for question_id, _ in TRIALS}
BACKGROUND_NOISE_HINTS = {"background", "noise", "noisy", "human_speech", "背景", "噪音", "人聲"}
COMMITTED_DECISIONS = {"answer_committed", "committed", "auto_write"}
STAFF_DECISIONS = {"staff_review", "staff_support"}

FIELDS = [
    "run_id",
    "created_at",
    "speaker_id",
    "mic_permission_granted",
    "distance_m",
    "noise_condition",
    "question_id",
    "expected_phrase",
    "wake_detected",
    "false_trigger",
    "asr_text",
    "mapped_candidate",
    "asr_confidence_available",
    "confirmation_required",
    "write_decision",
    "fallback_reason",
    "turn_latency_ms",
    "user_visible_mode",
    "touch_initially_collapsed",
    "touch_restored_by",
    "critical_unsafe_auto_write",
    "touch_fallback_success",
    "operator_notes",
]


def normalized(value: str | None) -> str:
    return str(value or "").strip().lower()


def truthy(value: str | None) -> bool:
    return normalized(value) in {"1", "true", "yes", "y", "是"}


def has_room_evidence(row: dict[str, str]) -> bool:
    evidence_fields = [
        "mic_permission_granted",
        "distance_m",
        "noise_condition",
        "wake_detected",
        "false_trigger",
        "asr_text",
        "mapped_candidate",
        "write_decision",
        "turn_latency_ms",
        "user_visible_mode",
        "touch_initially_collapsed",
        "touch_restored_by",
    ]
    return any(str(row.get(field, "")).strip() for field in evidence_fields)


def validate_csv(path: Path) -> dict[str, object]:
    with path.open(encoding="utf-8", newline="") as handle:
        rows = list(csv.DictReader(handle))
    total = len(rows)
    filled = [row for row in rows if has_room_evidence(row)]
    question_ids = {row.get("question_id", "") for row in filled}
    speakers = {row.get("speaker_id", "") for row in filled if row.get("speaker_id")}
    unsafe = [row for row in filled if truthy(row.get("critical_unsafe_auto_write"))]
    mic_denied = [row for row in filled if not truthy(row.get("mic_permission_granted"))]
    touch_trials = [row for row in filled if row.get("question_id") == "recovery_touch"]
    touch_success = [row for row in touch_trials if truthy(row.get("touch_fallback_success"))]
    collapsed_recovery_trials = [
        row
        for row in touch_trials
        if normalized(row.get("user_visible_mode")) == "voice_first_touch_collapsed"
        and truthy(row.get("touch_initially_collapsed"))
        and row.get("touch_restored_by")
    ]
    collapsed_recovery_success = [
        row for row in collapsed_recovery_trials if truthy(row.get("touch_fallback_success"))
    ]
    wake_trials = [row for row in filled if row.get("question_id") == "wake"]
    wake_misses = [row for row in wake_trials if not truthy(row.get("wake_detected"))]
    false_triggers = [row for row in filled if truthy(row.get("false_trigger"))]
    item9 = [row for row in filled if row.get("question_id") == "phq9_09"]
    item9_staff = [row for row in item9 if normalized(row.get("write_decision")) in STAFF_DECISIONS]
    no_speech_writes = [
        row for row in filled if row.get("question_id") == "no_speech" and normalized(row.get("write_decision")) in COMMITTED_DECISIONS
    ]
    confidence_unsafe = [
        row
        for row in filled
        if normalized(row.get("write_decision")) in COMMITTED_DECISIONS
        and not truthy(row.get("asr_confidence_available"))
        and not truthy(row.get("confirmation_required"))
    ]
    missing_required_fields = [
        row
        for row in filled
        if not row.get("distance_m")
        or not row.get("noise_condition")
        or not row.get("turn_latency_ms")
        or not row.get("user_visible_mode")
        or not row.get("write_decision")
    ]
    full_phq9_speakers = [
        speaker
        for speaker in sorted(speakers)
        if PHQ9_IDS.issubset({row.get("question_id", "") for row in filled if row.get("speaker_id") == speaker})
    ]
    background_noise_measured = any(
        any(hint in normalized(row.get("noise_condition")) for hint in BACKGROUND_NOISE_HINTS) for row in filled
    )
    missing_required_question_ids = sorted(REQUIRED_IDS - question_ids)
    field_ready = (
        bool(filled)
        and len(filled) == total
        and len(speakers) >= 3
        and not missing_required_question_ids
        and len(full_phq9_speakers) == len(speakers)
        and not unsafe
        and not mic_denied
        and not missing_required_fields
        and len(touch_success) == len(touch_trials)
        and bool(collapsed_recovery_trials)
        and len(collapsed_recovery_success) == len(collapsed_recovery_trials)
        and len(item9_staff) == len(item9)
        and not no_speech_writes
        and not confidence_unsafe
        and background_noise_measured
    )
    return {
        "csv": str(path),
        "total_template_rows": total,
        "filled_rows": len(filled),
        "all_template_rows_filled": len(filled) == total and total > 0,
        "speakers": sorted(speakers),
        "speaker_count": len(speakers),
        "full_phq9_speaker_count": len(full_phq9_speakers),
        "missing_required_question_ids": missing_required_question_ids,
        "missing_required_field_rows": len(missing_required_fields),
        "mic_permission_denied_or_missing": len(mic_denied),
        "critical_unsafe_auto_write": len(unsafe),
        "confidence_unsafe_writes": len(confidence_unsafe),
        "touch_fallback_trials": len(touch_trials),
        "touch_fallback_success": len(touch_success),
        "collapsed_touch_recovery_trials": len(collapsed_recovery_trials),
        "collapsed_touch_recovery_success": len(collapsed_recovery_success),
        "wake_trials": len(wake_trials),
        "wake_misses": len(wake_misses),
        "false_triggers": len(false_triggers),
        "item9_trials": len(item9),
        "item9_staff_support": len(item9_staff),
        "no_speech_unsafe_writes": len(no_speech_writes),
        "background_noise_measured": background_noise_measured,
        "field_ready": field_ready,
    }


def write_csv(path: Path, rows: list[dict[str, str]]) -> None:
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(rows)


def self_test() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / "room.csv"
        write_csv(path, [])
        assert validate_csv(path)["field_ready"] is False

        rows = []
        for speaker_idx in range(1, 4):
            for question_id, phrase in TRIALS:
                decision = "answer_committed" if question_id.startswith("phq9_") else "no_write"
                if question_id == "phq9_09" or question_id == "recovery_staff":
                    decision = "staff_support"
                user_visible_mode = "voice_first_touch_visible"
                touch_initially_collapsed = "false"
                touch_restored_by = ""
                if question_id == "recovery_touch":
                    user_visible_mode = "voice_first_touch_collapsed"
                    touch_initially_collapsed = "true"
                    touch_restored_by = "spoken_touch_fallback"
                rows.append(
                    {
                        "run_id": "self_test",
                        "created_at": "2026-06-26T00:00:00",
                        "speaker_id": f"S{speaker_idx}",
                        "mic_permission_granted": "true",
                        "distance_m": "1.0",
                        "noise_condition": "background_noise",
                        "question_id": question_id,
                        "expected_phrase": phrase,
                        "wake_detected": "true" if question_id == "wake" else "",
                        "false_trigger": "false",
                        "asr_text": phrase,
                        "mapped_candidate": "",
                        "asr_confidence_available": "true",
                        "confirmation_required": "false",
                        "write_decision": decision,
                        "fallback_reason": "",
                        "turn_latency_ms": "1200",
                        "user_visible_mode": user_visible_mode,
                        "touch_initially_collapsed": touch_initially_collapsed,
                        "touch_restored_by": touch_restored_by,
                        "critical_unsafe_auto_write": "false",
                        "touch_fallback_success": "true" if question_id == "recovery_touch" else "",
                        "operator_notes": "",
                    }
                )
        write_csv(path, rows)
        assert validate_csv(path)["field_ready"] is True


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="experiments/voice_first_room_acceptance_manual")
    parser.add_argument("--speakers", type=int, default=3)
    parser.add_argument("--validate")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    if args.self_test:
        self_test()
        print(json.dumps({"self_test": "passed"}))
        return 0

    if args.validate:
        summary = validate_csv(Path(args.validate))
        print(json.dumps(summary, ensure_ascii=False, indent=2))
        return 0 if summary["field_ready"] else 1

    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)
    rows = []
    for speaker_idx in range(1, args.speakers + 1):
        for question_id, phrase in TRIALS:
            rows.append(
                {
                    "run_id": output.name,
                    "created_at": datetime.now().isoformat(timespec="seconds"),
                    "speaker_id": f"S{speaker_idx}",
                    "mic_permission_granted": "",
                    "distance_m": "",
                    "noise_condition": "",
                    "question_id": question_id,
                    "expected_phrase": phrase,
                    "wake_detected": "",
                    "false_trigger": "",
                    "asr_text": "",
                    "mapped_candidate": "",
                    "asr_confidence_available": "",
                    "confirmation_required": "",
                    "write_decision": "",
                    "fallback_reason": "",
                    "turn_latency_ms": "",
                    "user_visible_mode": "",
                    "touch_initially_collapsed": "",
                    "touch_restored_by": "",
                    "critical_unsafe_auto_write": "",
                    "touch_fallback_success": "",
                    "operator_notes": "",
                }
            )
    write_csv(output / "raw_runs_template.csv", rows)
    (output / "README.md").write_text(
        "# Voice-First PHQ-9 Room Acceptance\n\n"
        "Fill `raw_runs_template.csv` during the physical-room test. Do not mark field-ready until every row has real microphone, wakeword, ASR mapping, write decision, latency, and fallback evidence.\n\n"
        "Use noise labels such as `quiet`, `normal_room`, and `background_noise`; the final validator requires at least one background-noise row.\n\n"
        "For `voice_first_touch_collapsed`, set `touch_initially_collapsed=true` and record `touch_restored_by` values such as `spoken_touch_fallback`, `low_confidence`, `ambiguous`, or `voice_capture_failure` when the touch stage is restored.\n",
        encoding="utf-8",
    )
    print(json.dumps({"output": str(output), "rows": len(rows)}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
