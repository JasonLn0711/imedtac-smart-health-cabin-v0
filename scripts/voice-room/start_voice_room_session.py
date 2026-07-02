#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path


def local_now() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def write_json(path: Path, payload: object) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def run_checked(command: list[str]) -> None:
    subprocess.run(command, check=True)


def start_process(command: list[str], log_path: Path) -> subprocess.Popen[bytes]:
    log_path.parent.mkdir(parents=True, exist_ok=True)
    handle = log_path.open("ab")
    return subprocess.Popen(command, stdout=handle, stderr=subprocess.STDOUT, start_new_session=True)


def main() -> int:
    argv = sys.argv[1:]
    if argv[:1] == ["--"]:
        argv = argv[1:]
    parser = argparse.ArgumentParser()
    parser.add_argument("--run-id", default=f"voice_first_room_retest_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
    parser.add_argument("--speakers", type=int, default=1)
    parser.add_argument("--output-root", default="experiments")
    parser.add_argument("--collector-interval-sec", type=float, default=5.0)
    parser.add_argument("--agent-turns", action="store_true")
    parser.add_argument("--agent-turn-duration-sec", type=int, default=1800)
    args = parser.parse_args(argv)

    run_dir = Path(args.output_root) / args.run_id
    logs_dir = run_dir / "logs"
    run_dir.mkdir(parents=True, exist_ok=True)

    run_checked(
        [
            "python3",
            "scripts/voice-room/run_voice_first_phq9_room_test.py",
            "--output",
            str(run_dir),
            "--speakers",
            str(args.speakers),
        ]
    )

    collector_output = logs_dir / "runtime_collector"
    collector_log = logs_dir / "runtime_collector.log"
    collector = start_process(
        [
            "python3",
            "scripts/voice-room/collect_voice_room_runtime.py",
            "--run-id",
            args.run_id,
            "--output",
            str(collector_output),
            "--interval-sec",
            str(args.collector_interval_sec),
        ],
        collector_log,
    )

    processes: list[dict[str, object]] = [
        {
            "name": "runtime_collector",
            "pid": collector.pid,
            "log": str(collector_log),
            "output": str(collector_output),
            "stop": f"kill {collector.pid}",
        }
    ]

    if args.agent_turns:
        agent_output = logs_dir / "agent_turns"
        agent_log = logs_dir / "agent_turn_monitor.log"
        agent = start_process(
            [
                "node",
                "scripts/voice-room/monitor_agent_turns.mjs",
                "--run-id",
                args.run_id,
                "--output",
                str(agent_output),
                "--duration-sec",
                str(args.agent_turn_duration_sec),
            ],
            agent_log,
        )
        processes.append(
            {
                "name": "agent_turn_monitor",
                "pid": agent.pid,
                "log": str(agent_log),
                "output": str(agent_output),
                "stop": f"kill {agent.pid}",
            }
        )

    manifest = {
        "run_id": args.run_id,
        "status": "RUNTIME_COLLECTION_STARTED",
        "created_at_local": local_now(),
        "created_at_utc": utc_now(),
        "run_dir": str(run_dir),
        "manual_template": str(run_dir / "raw_runs_template.csv"),
        "processes": processes,
        "next_commands": {
            "validate_filled_csv": f"python3 scripts/voice-room/run_voice_first_phq9_room_test.py --validate {run_dir / 'raw_runs_template.csv'}",
            "quiet_wakeword_monitor": f"python3 scripts/voice-room/monitor_wakeword_attempts.py --run-id {args.run_id} --output {logs_dir / 'wakeword_quiet_check'} --expected-attempts 0 --duration-sec 30",
            "spoken_wakeword_monitor": f"python3 scripts/voice-room/monitor_wakeword_attempts.py --run-id {args.run_id} --output {logs_dir / 'wakeword_spoken_check'} --expected-attempts 10 --duration-sec 90",
        },
    }
    write_json(run_dir / "session_manifest.json", manifest)
    print(json.dumps(manifest, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
