#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import random
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any


VARIANT_PROVIDER = {
    "B_breezyvoice_segment": ("breezyvoice_default", "http://localhost:8012", "/v1/tts/synthesize"),
    "E_cosyvoice2_stream": ("cosyvoice2_streaming", "http://localhost:8016", "/v1/audio/speech"),
    "F_cosyvoice2_hybrid": ("cosyvoice2_streaming", "http://localhost:8016", "/v1/audio/speech"),
    "G_cosyvoice3_stream": ("cosyvoice3_streaming", "http://localhost:8015", "/v1/audio/speech"),
    "H_cosyvoice3_hybrid": ("cosyvoice3_streaming", "http://localhost:8015", "/v1/audio/speech"),
    "I_cosyvoice3_tw_prompt": ("cosyvoice3_streaming", "http://localhost:8015", "/v1/audio/speech"),
    "J_cosyvoice3_tw_prompt_cache": ("cosyvoice3_streaming", "http://localhost:8015", "/v1/audio/speech"),
}


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    with path.open(encoding="utf-8") as handle:
        return [json.loads(line) for line in handle if line.strip()]


def append_jsonl(path: Path, row: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")


def provider_url(variant: str) -> tuple[str, str]:
    provider, default_base, default_path = VARIANT_PROVIDER[variant]
    if provider == "cosyvoice3_streaming":
        base = os.getenv("COSYVOICE3_BASE_URL", default_base)
        path = os.getenv("COSYVOICE3_SYNTHESIZE_PATH", default_path)
    elif provider == "cosyvoice2_streaming":
        base = os.getenv("COSYVOICE2_BASE_URL", default_base)
        path = os.getenv("COSYVOICE2_SYNTHESIZE_PATH", default_path)
    else:
        base = os.getenv("BREEZYVOICE_TTS_SERVICE_URL", os.getenv("TTS_BREEZYVOICE_SERVICE_URL", default_base))
        path = os.getenv("BREEZYVOICE_TTS_SYNTHESIZE_PATH", "/v1/tts/synthesize")
    return provider, f"{base.rstrip('/')}{path}"


def post_json(url: str, payload: dict[str, Any], timeout: float) -> dict[str, Any]:
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"content-type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        body = response.read().decode("utf-8")
    return json.loads(body) if body else {}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--variants", required=True)
    parser.add_argument("--repeats", type=int, default=3)
    parser.add_argument("--warmup", type=int, default=1)
    parser.add_argument("--randomize", default="true")
    parser.add_argument("--output", required=True)
    parser.add_argument("--timeout-sec", type=float, default=60)
    args = parser.parse_args()

    manifest = read_jsonl(Path(args.manifest))
    variants = [item.strip() for item in args.variants.split(",") if item.strip()]
    output = Path(args.output)
    summary_path = output / "logs" / "request_summary.jsonl"
    failure_path = output / "logs" / "error_log.jsonl"
    rows: list[dict[str, Any]] = []

    run_id = output.name
    output.mkdir(parents=True, exist_ok=True)

    for sample in manifest[: max(1, min(len(manifest), 12))]:
        for repeat_idx in range(args.repeats):
            order = variants[:]
            if args.randomize.lower() == "true":
                random.Random(f"{sample['sample_id']}:{repeat_idx}").shuffle(order)
            for variant in order:
                provider, url = provider_url(variant)
                started = time.perf_counter()
                row = {
                    "schema_version": "tts-provider-matrix-v1",
                    "run_id": run_id,
                    "variant": variant,
                    "provider": provider,
                    "sample_id": sample["sample_id"],
                    "repeat_idx": repeat_idx,
                    "input_text": sample["input_text"],
                    "status": "error",
                    "ttfa_server_ms": None,
                    "total_synthesis_ms": None,
                    "rtf": None,
                    "chunk_count": 0,
                    "streaming_validity": "not_verified",
                    "fallback_use": None,
                    "error": None,
                }
                try:
                    response = post_json(
                        url,
                        {
                            "text": sample["input_text"],
                            "voice_id": "default_tw_healthcare" if "cosyvoice" in provider else "default",
                            "prompt_profile": "default_tw_healthcare",
                            "response_format": "wav",
                        },
                        args.timeout_sec,
                    )
                    elapsed_ms = round((time.perf_counter() - started) * 1000, 3)
                    row.update(
                        {
                            "status": "ok",
                            "ttfa_server_ms": elapsed_ms,
                            "total_synthesis_ms": elapsed_ms,
                            "chunk_count": 1,
                            "audio_file_path": response.get("audio_path"),
                            "streaming_validity": "invalid_completed_speech_endpoint",
                        }
                    )
                except (urllib.error.URLError, TimeoutError, OSError, json.JSONDecodeError) as exc:
                    row["error"] = str(exc)
                    append_jsonl(failure_path, row)
                append_jsonl(summary_path, row)
                rows.append(row)

    report_dir = output / "reports"
    report_dir.mkdir(parents=True, exist_ok=True)
    ok = sum(1 for row in rows if row["status"] == "ok")
    total = len(rows)
    (report_dir / "streaming_validity_report.md").write_text(
        f"# Streaming Validity Report\n\nRun ID: `{run_id}`\n\n"
        f"- total requests: {total}\n"
        f"- successful completed-speech requests: {ok}\n"
        "- live streaming validity: not proven by this runner unless a separate WebSocket PCM trace is recorded.\n",
        encoding="utf-8",
    )
    (report_dir / "failure_analysis.md").write_text(
        f"# Failure Analysis\n\nRun ID: `{run_id}`\n\n"
        f"- failed requests: {total - ok}\n"
        "- if CosyVoice3 is unavailable, configure `COSYVOICE3_BACKEND_URL` and `COSYVOICE3_STREAMING_BACKEND_WS` before live validation.\n",
        encoding="utf-8",
    )
    print(json.dumps({"run_id": run_id, "total": total, "ok": ok, "output": str(output)}, ensure_ascii=False))
    return 0 if ok == total else 1


if __name__ == "__main__":
    raise SystemExit(main())
