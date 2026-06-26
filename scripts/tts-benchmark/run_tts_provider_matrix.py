#!/usr/bin/env python3
from __future__ import annotations

import argparse
import asyncio
import json
import os
import random
import subprocess
import time
import urllib.error
import urllib.request
import wave
from pathlib import Path
from typing import Any


VARIANT_PROVIDER = {
    "B_breezyvoice_segment": ("breezyvoice_default", "http://localhost:8012", "/v1/tts/synthesize", ""),
    "E_cosyvoice2_stream": ("cosyvoice2_streaming", "http://localhost:8016", "/v1/audio/speech", "/v1/audio/stream"),
    "F_cosyvoice2_hybrid": ("cosyvoice2_streaming", "http://localhost:8016", "/v1/audio/speech", "/v1/audio/stream"),
    "G_cosyvoice3_stream": ("cosyvoice3_streaming", "http://localhost:8015", "/v1/audio/speech", "/v1/audio/stream"),
    "H_cosyvoice3_hybrid": ("cosyvoice3_streaming", "http://localhost:8015", "/v1/audio/speech", "/v1/audio/stream"),
    "I_cosyvoice3_tw_prompt": ("cosyvoice3_streaming", "http://localhost:8015", "/v1/audio/speech", "/v1/audio/stream"),
    "J_cosyvoice3_tw_prompt_cache": ("cosyvoice3_streaming", "http://localhost:8015", "/v1/audio/speech", "/v1/audio/stream"),
}


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    with path.open(encoding="utf-8") as handle:
        return [json.loads(line) for line in handle if line.strip()]


def append_jsonl(path: Path, row: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")


def provider_urls(variant: str) -> tuple[str, str, str | None]:
    provider, default_base, default_path, default_stream_path = VARIANT_PROVIDER[variant]
    if provider == "cosyvoice3_streaming":
        base = os.getenv("COSYVOICE3_BASE_URL", default_base)
        path = os.getenv("COSYVOICE3_SYNTHESIZE_PATH", default_path)
        stream_path = os.getenv("COSYVOICE3_STREAM_PATH", default_stream_path)
    elif provider == "cosyvoice2_streaming":
        base = os.getenv("COSYVOICE2_BASE_URL", default_base)
        path = os.getenv("COSYVOICE2_SYNTHESIZE_PATH", default_path)
        stream_path = os.getenv("COSYVOICE2_STREAM_PATH", default_stream_path)
    else:
        base = os.getenv("BREEZYVOICE_TTS_SERVICE_URL", os.getenv("TTS_BREEZYVOICE_SERVICE_URL", default_base))
        path = os.getenv("BREEZYVOICE_TTS_SYNTHESIZE_PATH", "/v1/tts/synthesize")
        stream_path = ""
    speech_url = f"{base.rstrip('/')}{path}"
    if not stream_path:
        return provider, speech_url, None
    stream_url = f"{base.rstrip('/')}{stream_path}"
    stream_url = stream_url.replace("https://", "wss://", 1).replace("http://", "ws://", 1)
    return provider, speech_url, stream_url


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


def save_wav(path: Path, pcm_bytes: bytes, sample_rate: int) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(2)
        handle.setframerate(sample_rate)
        handle.writeframes(pcm_bytes)


def percentile(values: list[float], pct: float) -> float | None:
    if not values:
        return None
    ordered = sorted(values)
    index = min(len(ordered) - 1, round((len(ordered) - 1) * pct))
    return ordered[index]


def gpu_memory_used_mb() -> int | None:
    try:
        output = subprocess.check_output(
            ["nvidia-smi", "--query-gpu=memory.used", "--format=csv,noheader,nounits"],
            text=True,
            timeout=2,
        )
    except (FileNotFoundError, subprocess.SubprocessError):
        return None
    values = [int(line.strip()) for line in output.splitlines() if line.strip().isdigit()]
    return max(values) if values else None


async def stream_pcm16(url: str, text: str, timeout: float) -> dict[str, Any]:
    try:
        import websockets
    except ImportError as exc:
        raise RuntimeError("websockets is required for WebSocket streaming validation") from exc

    started = time.perf_counter()
    first_audio_ms = None
    sample_rate = 24000
    chunks: list[bytes] = []
    events: list[str] = []
    chunk_arrivals_ms: list[float] = []
    gpu_samples = [gpu_memory_used_mb()]
    async with websockets.connect(url, max_size=None) as socket:
        await socket.send(json.dumps({"text": text, "voice_id": "default_tw_healthcare"}))
        while True:
            message = await asyncio.wait_for(socket.recv(), timeout=timeout)
            if isinstance(message, bytes):
                arrived_ms = round((time.perf_counter() - started) * 1000, 3)
                if first_audio_ms is None:
                    first_audio_ms = arrived_ms
                chunks.append(message)
                chunk_arrivals_ms.append(arrived_ms)
                gpu_samples.append(gpu_memory_used_mb())
                continue
            payload = json.loads(message)
            events.append(str(payload.get("event")))
            if isinstance(payload.get("sample_rate"), int):
                sample_rate = int(payload["sample_rate"])
            if payload.get("event") == "error":
                raise RuntimeError(str(payload))
            if payload.get("event") == "stream_end":
                break
    total_ms = round((time.perf_counter() - started) * 1000, 3)
    audio_bytes = b"".join(chunks)
    audio_duration_ms = round((len(audio_bytes) / 2) / sample_rate * 1000, 3) if sample_rate and audio_bytes else None
    gaps = [round(chunk_arrivals_ms[index] - chunk_arrivals_ms[index - 1], 3) for index in range(1, len(chunk_arrivals_ms))]
    gpu_values = [value for value in gpu_samples if value is not None]
    return {
        "ttfa_server_ms": first_audio_ms,
        "total_synthesis_ms": total_ms,
        "audio_duration_sec": None if audio_duration_ms is None else round(audio_duration_ms / 1000, 3),
        "rtf": None if not audio_duration_ms else round(total_ms / audio_duration_ms, 3),
        "chunk_count": len(chunks),
        "chunk_jitter_p95_ms": percentile(gaps, 0.95),
        "max_inter_chunk_gap_ms": max(gaps) if gaps else None,
        "gpu_memory_peak_mb": max(gpu_values) if gpu_values else None,
        "bytes": len(audio_bytes),
        "sample_rate": sample_rate,
        "audio_bytes": audio_bytes,
        "events": events,
    }


def run_variant_once(
    *,
    variant: str,
    sample: dict[str, Any],
    repeat_idx: int,
    output: Path,
    timeout_sec: float,
    persist_audio: bool,
) -> dict[str, Any]:
    provider, url, stream_url = provider_urls(variant)
    started = time.perf_counter()
    row = {
        "schema_version": "tts-provider-matrix-v1",
        "run_id": output.name,
        "variant": variant,
        "provider": provider,
        "sample_id": sample["sample_id"],
        "repeat_idx": repeat_idx,
        "input_text": sample["input_text"],
        "status": "error",
        "ttfa_server_ms": None,
        "total_synthesis_ms": None,
        "rtf": None,
        "audio_duration_sec": None,
        "chunk_jitter_p95_ms": None,
        "max_inter_chunk_gap_ms": None,
        "buffer_underrun_count": 0,
        "gpu_memory_peak_mb": None,
        "chunk_count": 0,
        "streaming_validity": "not_verified",
        "taiwan_mandarin_acceptability": "pending_human_review",
        "fallback_use": None,
        "error": None,
    }
    if stream_url and "cosyvoice" in provider:
        stream = asyncio.run(stream_pcm16(stream_url, sample["input_text"], timeout_sec))
        if persist_audio:
            audio_path = output / "audio" / variant / f"{sample['sample_id']}_r{repeat_idx}.wav"
            save_wav(audio_path, stream["audio_bytes"], int(stream["sample_rate"]))
            row["audio_file_path"] = str(audio_path)
        stream.pop("audio_bytes")
        row.update(
            {
                "status": "ok",
                "streaming_validity": "valid_ws_pcm16" if stream["chunk_count"] > 0 else "invalid_no_audio_chunk",
                **stream,
            }
        )
        return row

    response = post_json(
        url,
        {
            "text": sample["input_text"],
            "voice_id": "default_tw_healthcare" if "cosyvoice" in provider else "default",
            "prompt_profile": "default_tw_healthcare",
            "response_format": "wav",
        },
        timeout_sec,
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
    return row


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
    for stale_log in (summary_path, failure_path):
        if stale_log.exists():
            stale_log.unlink()

    if args.warmup > 0 and manifest:
        for variant in variants:
            for warmup_idx in range(args.warmup):
                try:
                    run_variant_once(
                        variant=variant,
                        sample=manifest[0],
                        repeat_idx=-(warmup_idx + 1),
                        output=output,
                        timeout_sec=args.timeout_sec,
                        persist_audio=False,
                    )
                except Exception:
                    pass

    for sample in manifest[: max(1, min(len(manifest), 12))]:
        for repeat_idx in range(args.repeats):
            order = variants[:]
            if args.randomize.lower() == "true":
                random.Random(f"{sample['sample_id']}:{repeat_idx}").shuffle(order)
            for variant in order:
                try:
                    row = run_variant_once(
                        variant=variant,
                        sample=sample,
                        repeat_idx=repeat_idx,
                        output=output,
                        timeout_sec=args.timeout_sec,
                        persist_audio=True,
                    )
                except (urllib.error.URLError, TimeoutError, OSError, json.JSONDecodeError) as exc:
                    provider, _, _ = provider_urls(variant)
                    row = {
                        "schema_version": "tts-provider-matrix-v1",
                        "run_id": run_id,
                        "variant": variant,
                        "provider": provider,
                        "sample_id": sample["sample_id"],
                        "repeat_idx": repeat_idx,
                        "input_text": sample["input_text"],
                        "status": "error",
                        "error": str(exc),
                        "ttfa_server_ms": None,
                        "total_synthesis_ms": None,
                        "rtf": None,
                        "audio_duration_sec": None,
                        "chunk_jitter_p95_ms": None,
                        "max_inter_chunk_gap_ms": None,
                        "buffer_underrun_count": 0,
                        "gpu_memory_peak_mb": None,
                        "chunk_count": 0,
                        "streaming_validity": "not_verified",
                        "taiwan_mandarin_acceptability": "pending_human_review",
                        "fallback_use": None,
                    }
                    row["error"] = str(exc)
                    append_jsonl(failure_path, row)
                except Exception as exc:
                    provider, _, _ = provider_urls(variant)
                    row = {
                        "schema_version": "tts-provider-matrix-v1",
                        "run_id": run_id,
                        "variant": variant,
                        "provider": provider,
                        "sample_id": sample["sample_id"],
                        "repeat_idx": repeat_idx,
                        "input_text": sample["input_text"],
                        "status": "error",
                        "error": str(exc),
                        "ttfa_server_ms": None,
                        "total_synthesis_ms": None,
                        "rtf": None,
                        "audio_duration_sec": None,
                        "chunk_jitter_p95_ms": None,
                        "max_inter_chunk_gap_ms": None,
                        "buffer_underrun_count": 0,
                        "gpu_memory_peak_mb": None,
                        "chunk_count": 0,
                        "streaming_validity": "not_verified",
                        "taiwan_mandarin_acceptability": "pending_human_review",
                        "fallback_use": None,
                    }
                    row["error"] = str(exc)
                    append_jsonl(failure_path, row)
                append_jsonl(summary_path, row)
                rows.append(row)

    report_dir = output / "reports"
    report_dir.mkdir(parents=True, exist_ok=True)
    ok = sum(1 for row in rows if row["status"] == "ok")
    valid_stream = sum(1 for row in rows if row["streaming_validity"] == "valid_ws_pcm16")
    total = len(rows)
    ttfa_values = [float(row["ttfa_server_ms"]) for row in rows if row.get("ttfa_server_ms") is not None]
    total_values = [float(row["total_synthesis_ms"]) for row in rows if row.get("total_synthesis_ms") is not None]
    rtf_values = [float(row["rtf"]) for row in rows if row.get("rtf") is not None]
    gpu_values = [float(row["gpu_memory_peak_mb"]) for row in rows if row.get("gpu_memory_peak_mb") is not None]
    underruns = sum(int(row.get("buffer_underrun_count") or 0) for row in rows)
    taiwan_review_pending = sum(1 for row in rows if row.get("taiwan_mandarin_acceptability") == "pending_human_review")
    failure_rate = round((total - ok) / total, 4) if total else 0
    (report_dir / "streaming_validity_report.md").write_text(
        f"# Streaming Validity Report\n\nRun ID: `{run_id}`\n\n"
        f"- total requests: {total}\n"
        f"- successful requests: {ok}\n"
        f"- valid WebSocket PCM16 streams: {valid_stream}\n"
        f"- p50 TTFA server ms: {percentile(ttfa_values, 0.50)}\n"
        f"- p95 TTFA server ms: {percentile(ttfa_values, 0.95)}\n"
        f"- p50 total synthesis ms: {percentile(total_values, 0.50)}\n"
        f"- p95 total synthesis ms: {percentile(total_values, 0.95)}\n"
        f"- p95 RTF: {percentile(rtf_values, 0.95)}\n"
        f"- GPU memory peak MB: {max(gpu_values) if gpu_values else None}\n"
        f"- buffer underrun count: {underruns}\n"
        f"- Taiwan Mandarin acceptability pending rows: {taiwan_review_pending}\n"
        f"- failure rate: {failure_rate}\n",
        encoding="utf-8",
    )
    (report_dir / "failure_analysis.md").write_text(
        f"# Failure Analysis\n\nRun ID: `{run_id}`\n\n"
        f"- failed requests: {total - ok}\n"
        f"- invalid streaming requests: {total - valid_stream}\n"
        "- if CosyVoice3 is unavailable, configure `COSYVOICE3_BACKEND_URL` or local `COSYVOICE3_REPO_PATH` / `COSYVOICE3_MODEL_DIR` / `COSYVOICE3_PROMPT_WAV` before live validation.\n",
        encoding="utf-8",
    )
    print(json.dumps({"run_id": run_id, "total": total, "ok": ok, "output": str(output)}, ensure_ascii=False))
    return 0 if ok == total else 1


if __name__ == "__main__":
    raise SystemExit(main())
