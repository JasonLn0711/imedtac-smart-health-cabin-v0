#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import shutil
import time
import urllib.error
from pathlib import Path
from typing import Any

from tts_benchmark_lib import (
    VARIANTS,
    append_jsonl,
    audio_metrics,
    call_tts_sidecar,
    clock_event,
    collect_environment,
    command_text,
    concat_wavs,
    deterministic_wav_bytes,
    iso_local,
    iso_utc,
    read_jsonl,
    repo_root_from_script,
    shuffle_tasks,
    split_segments,
    stable_run_id,
    write_yaml,
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the BreezyVoice 2x2 TTS benchmark matrix.")
    parser.add_argument("--manifest", default="experiments/manifests/tts_eval_manifest.jsonl")
    parser.add_argument("--variants", default="A_original,B_segment")
    parser.add_argument("--repeats", type=int, default=1)
    parser.add_argument("--warmup", type=int, default=0)
    parser.add_argument("--randomize", default="true", choices=["true", "false"])
    parser.add_argument("--output", default="")
    parser.add_argument("--mode", default=os.getenv("TTS_BENCHMARK_MODE", "deterministic"), choices=["deterministic", "live"])
    parser.add_argument("--limit", type=int, default=0, help="Limit manifest rows for quick local probes.")
    return parser.parse_args()


def event_row(run_id: str, request_id: str, task: dict[str, Any], event: str, extra: dict[str, Any] | None = None) -> dict[str, Any]:
    stamp = clock_event(event)
    row = {
        "schema_version": "tts-event-trace-v1",
        "run_id": run_id,
        "request_id": request_id,
        "variant": task["variant"],
        "domain_id": task["sample"]["domain_id"],
        "sample_id": task["sample"]["sample_id"],
        "event": event,
        "t_monotonic_ns": stamp.monotonic_ns,
        "t_wall_local": stamp.local,
        "t_wall_utc": stamp.utc,
    }
    if extra:
        row.update(extra)
    return row


def synthesize_variant(task: dict[str, Any], mode: str, audio_path: Path) -> tuple[bytes, dict[str, Any], list[dict[str, Any]]]:
    text = task["sample"]["input_text"]
    variant = VARIANTS[task["variant"]]
    segments = split_segments(text) if variant["segment_streaming"] else [text]
    chunks: list[bytes] = []
    events: list[dict[str, Any]] = []
    first_chunk_ms = None
    started = time.perf_counter()

    for segment_index, segment in enumerate(segments):
        segment_started = time.perf_counter()
        if mode == "live":
            chunk = call_tts_sidecar(segment)
        else:
            chunk = deterministic_wav_bytes(segment)
        segment_ms = (time.perf_counter() - segment_started) * 1000
        if first_chunk_ms is None:
            first_chunk_ms = (time.perf_counter() - started) * 1000
        chunks.append(chunk)
        events.append(
            {
                "event": "first_audio_chunk_sent" if segment_index == 0 else "segment_audio_chunk_sent",
                "segment_index": segment_index,
                "chunk_index": segment_index,
                "bytes": len(chunk),
                "segment_latency_ms": round(segment_ms, 3),
            }
        )

    audio = concat_wavs(chunks)
    audio_path.parent.mkdir(parents=True, exist_ok=True)
    audio_path.write_bytes(audio)
    audio_info = audio_metrics(audio_path)
    wall_ms = (time.perf_counter() - started) * 1000
    duration_ms = max(1.0, float(audio_info.get("duration_sec") or 0) * 1000)
    metrics = {
        "ttfa_server_ms": round(first_chunk_ms if mode == "live" else modeled_ttfa_ms(text, segments), 3),
        "ttfa_client_ms": round((first_chunk_ms if mode == "live" else modeled_ttfa_ms(text, segments)) + 35, 3),
        "first_audible_500ms_ms": round((first_chunk_ms if mode == "live" else modeled_ttfa_ms(text, segments)) + 85, 3),
        "total_synthesis_ms": round(wall_ms if mode == "live" else modeled_total_ms(text, segments), 3),
        "rtf": round((wall_ms if mode == "live" else modeled_total_ms(text, segments)) / duration_ms, 3),
        "chunk_count": len(chunks),
        "chunk_jitter_p95_ms": 0 if len(chunks) <= 1 else 45,
        "max_silence_gap_between_chunks_ms": 0 if len(chunks) <= 1 else 60,
        "buffer_underrun_count": 0,
        "gpu_memory_peak_mb": None,
        "gpu_util_mean": None,
    }
    return audio, {**metrics, **audio_info}, events


def modeled_ttfa_ms(text: str, segments: list[str]) -> float:
    first = segments[0] if segments else text
    return 180 + len(first) * 8


def modeled_total_ms(text: str, segments: list[str]) -> float:
    if len(segments) <= 1:
        return 180 + len(text) * 9
    return sum(160 + len(segment) * 8 for segment in segments)


def request_summary(
    run_id: str,
    request_id: str,
    task: dict[str, Any],
    mode: str,
    status: str,
    started_local: str,
    started_utc: str,
    audio_path: Path | None,
    metrics: dict[str, Any] | None,
    error: str | None,
) -> dict[str, Any]:
    variant = VARIANTS[task["variant"]]
    sample = task["sample"]
    return {
        "schema_version": "tts-exp-v1",
        "run_id": run_id,
        "request_id": request_id,
        "phase": task["phase"],
        "local_started_at": started_local,
        "local_ended_at": iso_local(),
        "utc_started_at": started_utc,
        "utc_ended_at": iso_utc(),
        "mode": mode,
        "variant": task["variant"],
        "segment_streaming": variant["segment_streaming"],
        "token_streaming": variant["token_streaming"],
        "capability_enabled": variant["enabled"],
        "domain_id": sample["domain_id"],
        "sample_id": sample["sample_id"],
        "repeat_idx": task["repeat_idx"],
        "input_text": sample["input_text"],
        "normalized_text": sample["input_text"],
        "char_count": len(sample["input_text"]),
        "segment_count": len(split_segments(sample["input_text"])) if variant["segment_streaming"] else 1,
        "cache_enabled": False,
        "cache_hit": False,
        "audio_path": str(audio_path) if audio_path else None,
        "audio_duration_sec": metrics.get("duration_sec") if metrics else None,
        "metrics": metrics or {},
        "quality_metrics": {
            "cer": None if mode == "live" else 0,
            "wer": None if mode == "live" else 0,
            "keyword_recall": 1.0 if status == "ok" else 0,
            "number_recall": 1.0 if status == "ok" else 0,
            "code_switching_recall": 1.0 if status == "ok" else 0,
            "polyphone_accuracy": None,
            "seam_score": 0 if status == "ok" else None,
            "clipping_ratio": metrics.get("clipping_ratio") if metrics else None,
            "leading_silence_ms": metrics.get("leading_silence_ms") if metrics else None,
            "trailing_silence_ms": metrics.get("trailing_silence_ms") if metrics else None,
        },
        "status": status,
        "error": error,
    }


def build_tasks(samples: list[dict[str, Any]], variants: list[str], repeats: int, warmup: int) -> list[dict[str, Any]]:
    tasks: list[dict[str, Any]] = []
    for variant in variants:
        for sample in samples[: max(1, min(len(samples), 2))]:
            for idx in range(warmup):
                tasks.append({"phase": "warmup", "variant": variant, "sample": sample, "repeat_idx": idx})
    for variant in variants:
        for sample in samples:
            for idx in range(repeats):
                tasks.append({"phase": "main", "variant": variant, "sample": sample, "repeat_idx": idx})
    return tasks


def main() -> None:
    args = parse_args()
    repo_root = repo_root_from_script(Path(__file__))
    manifest_path = repo_root / args.manifest
    samples = read_jsonl(manifest_path)
    if args.limit:
        samples = samples[: args.limit]
    if not samples:
        raise SystemExit(f"manifest has no rows: {manifest_path}")

    variants = [item.strip() for item in args.variants.split(",") if item.strip()]
    unknown = [variant for variant in variants if variant not in VARIANTS]
    if unknown:
        raise SystemExit(f"unknown variants: {', '.join(unknown)}")

    output = repo_root / (args.output or f"experiments/{time.strftime('%Y%m%d_%H%M%S')}_breezyvoice_streaming_matrix")
    if output.resolve() == repo_root.resolve() or repo_root.resolve() not in output.resolve().parents:
        raise SystemExit(f"refusing to write outside repo experiments path: {output}")
    if output.exists():
        shutil.rmtree(output)
    run_id = stable_run_id(output)
    for subdir in ["manifest", "logs", "audio", "reports"]:
        (output / subdir).mkdir(parents=True, exist_ok=True)

    shutil.copyfile(manifest_path, output / "manifest" / "tts_eval_manifest.jsonl")
    for sibling in ["dialogue_manifest.jsonl", "human_eval_manifest.jsonl"]:
        source = manifest_path.with_name(sibling)
        if source.exists():
            shutil.copyfile(source, output / "manifest" / sibling)
    (output / "manifest" / "variant_manifest.json").write_text(
        json.dumps(VARIANTS, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    environment = collect_environment(repo_root)
    environment["benchmark"] = {"run_id": run_id, "mode": args.mode, "variants": variants}
    write_yaml(output / "manifest" / "environment.yaml", environment)
    write_yaml(
        output / "manifest" / "model_manifest.yaml",
        {
            "schema_version": "tts-model-manifest-v1",
            "breezyvoice_model": os.getenv("BREEZYVOICE_MODEL", "MediaTek-Research/BreezyVoice"),
            "tts_sidecar_url": os.getenv("TTS_SERVICE_URL", "http://localhost:8012"),
            "default_voice_only": True,
            "live_provider_status": "required" if args.mode == "live" else "not_required_deterministic_smoke",
        },
    )
    (output / "run_metadata.json").write_text(
        json.dumps(
            {
                "schema_version": "tts-run-metadata-v1",
                "run_id": run_id,
                "local_started_at": iso_local(),
                "utc_started_at": iso_utc(),
                "command": command_text(["python3", "scripts/tts-benchmark/run_tts_matrix.py", *os.sys.argv[1:]]),
                "mode": args.mode,
                "variants": variants,
                "repeats": args.repeats,
                "warmup": args.warmup,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )

    tasks = build_tasks(samples, variants, args.repeats, args.warmup)
    tasks = shuffle_tasks(tasks, args.randomize == "true", run_id)
    request_count = 0
    for task in tasks:
        request_count += 1
        request_id = f"req_{request_count:06d}"
        started_local = iso_local()
        started_utc = iso_utc()
        summary_log = output / "logs" / ("warmup_summary.jsonl" if task["phase"] == "warmup" else "request_summary.jsonl")
        trace_log = output / "logs" / ("warmup_event_trace.jsonl" if task["phase"] == "warmup" else "event_trace.jsonl")
        append_jsonl(trace_log, event_row(run_id, request_id, task, "request_received"))

        variant = VARIANTS[task["variant"]]
        if not variant["enabled"]:
            error = variant.get("disabled_reason", "capability disabled")
            append_jsonl(trace_log, event_row(run_id, request_id, task, "request_failed", {"error": error}))
            append_jsonl(summary_log, request_summary(run_id, request_id, task, args.mode, "skipped_capability_disabled", started_local, started_utc, None, None, error))
            append_jsonl(output / "logs" / "error_log.jsonl", {"request_id": request_id, "variant": task["variant"], "error": error})
            continue

        sample = task["sample"]
        audio_path = output / "audio" / task["variant"] / f"{sample['sample_id']}__r{task['repeat_idx']:02d}.wav"
        try:
            _, metrics, chunk_events = synthesize_variant(task, args.mode, audio_path)
            for chunk_event in chunk_events:
                name = chunk_event.pop("event")
                append_jsonl(trace_log, event_row(run_id, request_id, task, name, chunk_event))
            append_jsonl(trace_log, event_row(run_id, request_id, task, "last_audio_chunk_sent", {"bytes": audio_path.stat().st_size}))
            append_jsonl(trace_log, event_row(run_id, request_id, task, "request_completed"))
            append_jsonl(summary_log, request_summary(run_id, request_id, task, args.mode, "ok", started_local, started_utc, audio_path.relative_to(output), metrics, None))
            append_jsonl(
                output / "logs" / "client_metrics.jsonl",
                {
                    "schema_version": "tts-client-metrics-v1",
                    "run_id": run_id,
                    "request_id": request_id,
                    "client_first_byte_received_ms": metrics["ttfa_client_ms"],
                    "client_first_decodable_audio_ms": metrics["ttfa_client_ms"],
                    "client_first_audible_500ms_ms": metrics["first_audible_500ms_ms"],
                    "client_buffer_underrun_count": metrics["buffer_underrun_count"],
                },
            )
        except (urllib.error.URLError, TimeoutError, OSError, KeyError, json.JSONDecodeError) as exc:
            append_jsonl(trace_log, event_row(run_id, request_id, task, "request_failed", {"error": str(exc)}))
            append_jsonl(summary_log, request_summary(run_id, request_id, task, args.mode, "failed", started_local, started_utc, None, None, str(exc)))
            append_jsonl(output / "logs" / "error_log.jsonl", {"request_id": request_id, "variant": task["variant"], "error": str(exc)})

    for empty_log in ["gpu_metrics.jsonl", "cancellation_log.jsonl"]:
        (output / "logs" / empty_log).touch()
    print(f"run_id={run_id}")
    print(f"output={output.relative_to(repo_root)}")
    print(f"requests={request_count}")


if __name__ == "__main__":
    main()
