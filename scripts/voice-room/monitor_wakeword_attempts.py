#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds")


def read_status(url: str, timeout: float) -> dict[str, object]:
    try:
        with urllib.request.urlopen(url, timeout=timeout) as response:
            return json.loads(response.read().decode("utf-8"))
    except Exception as error:  # noqa: BLE001 - monitoring should keep going.
        return {"error": str(error)}


def append_jsonl(path: Path, payload: object) -> None:
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(payload, ensure_ascii=False) + "\n")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True)
    parser.add_argument("--run-id", required=True)
    parser.add_argument("--expected-attempts", type=int, default=10)
    parser.add_argument("--duration-sec", type=float, default=90)
    parser.add_argument("--interval-sec", type=float, default=0.5)
    parser.add_argument("--status-url", default="http://localhost:8013/status")
    parser.add_argument("--timeout-sec", type=float, default=2)
    args = parser.parse_args()

    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)
    samples_path = output / "wakeword_status_samples.jsonl"
    events_path = output / "wakeword_detected_events.jsonl"
    summary_path = output / "wakeword_monitor_summary.json"

    seen_event_keys: set[str] = set()
    detected_event_keys: set[str] = set()
    started_monotonic = time.monotonic()
    started_utc = utc_now()
    sample_count = 0

    initial_status = read_status(args.status_url, args.timeout_sec)
    initial_event = initial_status.get("last_event") if isinstance(initial_status, dict) else None
    if isinstance(initial_event, dict):
        initial_event_key = str(initial_event.get("timestamp") or initial_event)
        if initial_event_key:
            seen_event_keys.add(initial_event_key)
            append_jsonl(
                samples_path,
                {
                    "run_id": args.run_id,
                    "timestamp_utc": utc_now(),
                    "status": initial_status,
                    "sample_role": "initial_stale_event_baseline",
                },
            )

    while time.monotonic() - started_monotonic < args.duration_sec:
        status = read_status(args.status_url, args.timeout_sec)
        sample = {
            "run_id": args.run_id,
            "timestamp_utc": utc_now(),
            "status": status,
        }
        append_jsonl(samples_path, sample)
        sample_count += 1

        event = status.get("last_event") if isinstance(status, dict) else None
        if isinstance(event, dict):
            event_key = str(event.get("timestamp") or event)
            if event_key and event_key not in seen_event_keys:
                seen_event_keys.add(event_key)
                detected_event_keys.add(event_key)
                append_jsonl(
                    events_path,
                    {
                        "run_id": args.run_id,
                        "observed_at_utc": utc_now(),
                        "event": event,
                    },
                )

        time.sleep(args.interval_sec)

    summary = {
        "run_id": args.run_id,
        "started_at_utc": started_utc,
        "ended_at_utc": utc_now(),
        "duration_sec": args.duration_sec,
        "expected_attempts": args.expected_attempts,
        "detected_events": len(detected_event_keys),
        "wake_misses_estimate": max(0, args.expected_attempts - len(detected_event_keys)),
        "sample_count": sample_count,
        "samples_path": str(samples_path),
        "events_path": str(events_path),
    }
    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
