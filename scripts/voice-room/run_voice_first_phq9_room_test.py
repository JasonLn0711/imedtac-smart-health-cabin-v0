#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
import json
from datetime import datetime
from pathlib import Path


PHRASES = ["你好小慧", "完全沒有", "有幾天", "一半以上的天數", "幾乎每天", "重新回答", "改用觸控", "找人協助"]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="experiments/voice_first_room_acceptance_manual")
    parser.add_argument("--speakers", type=int, default=3)
    args = parser.parse_args()

    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)
    rows = []
    for speaker_idx in range(1, args.speakers + 1):
        for phrase in PHRASES:
            rows.append(
                {
                    "run_id": output.name,
                    "created_at": datetime.now().isoformat(timespec="seconds"),
                    "speaker_id": f"S{speaker_idx}",
                    "distance_m": "",
                    "noise_condition": "",
                    "expected_phrase": phrase,
                    "wake_detected": "",
                    "asr_text": "",
                    "mapped_candidate": "",
                    "write_decision": "",
                    "fallback_reason": "",
                    "turn_latency_ms": "",
                    "operator_notes": "",
                }
            )
    with (output / "raw_runs_template.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    (output / "README.md").write_text(
        "# Voice-First PHQ-9 Room Acceptance\n\n"
        "Fill `raw_runs_template.csv` during the physical-room test. Do not mark field-ready until real microphone, wakeword, ASR mapping, write decisions, and fallback outcomes are recorded.\n",
        encoding="utf-8",
    )
    print(json.dumps({"output": str(output), "rows": len(rows)}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
