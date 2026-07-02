#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import subprocess
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path


DEFAULT_ENDPOINTS = {
    "api_provider_status": "http://localhost:3000/api/v1/providers/status",
    "voice_agent_readyz": "http://localhost:3004/readyz",
    "asr_health": "http://localhost:8001/health",
    "cosyvoice3_healthz": "http://localhost:8015/healthz",
    "cosyvoice3_readyz": "http://localhost:8015/readyz",
    "wakeword_status": "http://localhost:8013/status",
    "redpanda_ready": "http://localhost:9644/v1/status/ready",
    "ollama_version": "http://localhost:11434/api/version",
    "ollama_models": "http://localhost:11434/api/ps",
}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds")


def fetch_json(url: str, timeout: float) -> dict[str, object]:
    started = time.monotonic()
    try:
        with urllib.request.urlopen(url, timeout=timeout) as response:
            body = response.read(512_000)
            elapsed_ms = round((time.monotonic() - started) * 1000, 3)
            text = body.decode("utf-8", errors="replace")
            try:
                payload: object = json.loads(text) if text else None
            except json.JSONDecodeError:
                payload = {"text": text[:1000]}
            return {
                "ok": 200 <= response.status < 300,
                "status": response.status,
                "elapsed_ms": elapsed_ms,
                "payload": payload,
            }
    except urllib.error.HTTPError as error:
        elapsed_ms = round((time.monotonic() - started) * 1000, 3)
        body = error.read(10_000).decode("utf-8", errors="replace")
        return {
            "ok": False,
            "status": error.code,
            "elapsed_ms": elapsed_ms,
            "error": body,
        }
    except Exception as error:  # noqa: BLE001 - collector must keep running.
        elapsed_ms = round((time.monotonic() - started) * 1000, 3)
        return {
            "ok": False,
            "status": 0,
            "elapsed_ms": elapsed_ms,
            "error": str(error),
        }


def run_command(command: list[str], timeout: float) -> dict[str, object]:
    started = time.monotonic()
    try:
        completed = subprocess.run(
            command,
            check=False,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        return {
            "ok": completed.returncode == 0,
            "returncode": completed.returncode,
            "elapsed_ms": round((time.monotonic() - started) * 1000, 3),
            "stdout": completed.stdout[-20_000:],
            "stderr": completed.stderr[-5_000:],
        }
    except FileNotFoundError as error:
        return {"ok": False, "returncode": 127, "error": str(error)}
    except subprocess.TimeoutExpired as error:
        return {
            "ok": False,
            "returncode": None,
            "elapsed_ms": round((time.monotonic() - started) * 1000, 3),
            "error": f"timeout after {error.timeout}s",
        }


def write_json(path: Path, payload: object) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def append_jsonl(path: Path, payload: object) -> None:
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(payload, ensure_ascii=False) + "\n")


def collect_static_snapshot(output: Path, args: argparse.Namespace) -> None:
    commands = {
        "git_rev_parse_head": ["git", "rev-parse", "HEAD"],
        "git_branch": ["git", "branch", "--show-current"],
        "git_status_short": ["git", "status", "--short"],
        "uname": ["uname", "-a"],
        "lsb_release": ["lsb_release", "-a"],
        "node_version": ["node", "--version"],
        "pnpm_version": ["corepack", "pnpm", "--version"],
        "python_version": ["python3", "--version"],
        "docker_version": ["docker", "--version"],
        "docker_compose_version": ["docker", "compose", "version"],
    }
    snapshot = {
        "run_id": args.run_id,
        "created_at_utc": utc_now(),
        "interval_sec": args.interval_sec,
        "api_base_url": args.api_base_url,
        "voice_agent_url": args.voice_agent_url,
        "asr_url": args.asr_url,
        "cosyvoice3_url": args.cosyvoice3_url,
        "wakeword_url": args.wakeword_url,
        "redpanda_admin_url": args.redpanda_admin_url,
        "ollama_url": args.ollama_url,
        "commands": {
            name: run_command(command, timeout=5)
            for name, command in commands.items()
        },
    }
    write_json(output / "static_environment_snapshot.json", snapshot)


def build_endpoints(args: argparse.Namespace) -> dict[str, str]:
    return {
        "api_provider_status": f"{args.api_base_url}/api/v1/providers/status",
        "voice_agent_readyz": f"{args.voice_agent_url}/readyz",
        "asr_health": f"{args.asr_url}/health",
        "cosyvoice3_healthz": f"{args.cosyvoice3_url}/healthz",
        "cosyvoice3_readyz": f"{args.cosyvoice3_url}/readyz",
        "wakeword_status": f"{args.wakeword_url}/status",
        "redpanda_ready": f"{args.redpanda_admin_url}/v1/status/ready",
        "ollama_version": f"{args.ollama_url}/api/version",
        "ollama_models": f"{args.ollama_url}/api/ps",
    }


def collect_once(args: argparse.Namespace, output: Path) -> dict[str, object]:
    endpoints = build_endpoints(args)
    record = {
        "run_id": args.run_id,
        "timestamp_utc": utc_now(),
        "endpoints": {
            name: fetch_json(url, timeout=args.http_timeout_sec)
            for name, url in endpoints.items()
        },
        "gpu": run_command(
            [
                "nvidia-smi",
                "--query-gpu=timestamp,name,utilization.gpu,memory.used,memory.total,temperature.gpu,power.draw",
                "--format=csv,noheader,nounits",
            ],
            timeout=5,
        ),
        "gpu_processes": run_command(
            [
                "nvidia-smi",
                "--query-compute-apps=pid,process_name,used_memory",
                "--format=csv,noheader,nounits",
            ],
            timeout=5,
        ),
        "ports": run_command(["ss", "-ltnp"], timeout=5),
    }
    append_jsonl(output / "runtime_samples.jsonl", record)
    return record


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True)
    parser.add_argument("--run-id", required=True)
    parser.add_argument("--interval-sec", type=float, default=5.0)
    parser.add_argument("--samples", type=int, default=0, help="0 means run until interrupted")
    parser.add_argument("--http-timeout-sec", type=float, default=2.0)
    parser.add_argument("--api-base-url", default="http://localhost:3000")
    parser.add_argument("--voice-agent-url", default="http://localhost:3004")
    parser.add_argument("--asr-url", default="http://localhost:8001")
    parser.add_argument("--cosyvoice3-url", default="http://localhost:8015")
    parser.add_argument("--wakeword-url", default="http://localhost:8013")
    parser.add_argument("--redpanda-admin-url", default="http://localhost:9644")
    parser.add_argument("--ollama-url", default="http://localhost:11434")
    args = parser.parse_args()

    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)
    collect_static_snapshot(output, args)

    count = 0
    try:
        while args.samples <= 0 or count < args.samples:
            collect_once(args, output)
            count += 1
            if args.samples > 0 and count >= args.samples:
                break
            time.sleep(args.interval_sec)
    except KeyboardInterrupt:
        pass

    write_json(
        output / "collector_summary.json",
        {
            "run_id": args.run_id,
            "ended_at_utc": utc_now(),
            "samples_written": count,
            "runtime_samples": str(output / "runtime_samples.jsonl"),
            "static_environment_snapshot": str(output / "static_environment_snapshot.json"),
        },
    )
    print(json.dumps({"output": str(output), "samples_written": count}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
