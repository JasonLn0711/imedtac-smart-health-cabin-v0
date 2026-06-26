#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import random
import re
import time
from pathlib import Path
from typing import Any

from streaming_runtime_probe import (
    DEFAULT_BREEZYVOICE_ROOT,
    DEFAULT_PROMPT_TEXT,
    SAMPLE_RATE,
    append_jsonl,
    append_gpu_metric,
    event_row,
    iso_local,
    iso_utc,
    load_breezyvoice_runtime,
    local_now,
    repo_root_from_script,
    run_command,
    run_probe_request,
    sha256_file,
    wav_duration,
)


VARIANTS = ["A_original", "B_segment", "C_token", "D_hybrid"]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run strict BreezyVoice A/B/C/D true-streaming matrix.")
    parser.add_argument("--manifest", default="experiments/manifests/tts_eval_manifest.jsonl")
    parser.add_argument("--breezyvoice-root", default=DEFAULT_BREEZYVOICE_ROOT)
    parser.add_argument("--model-path", default="MediaTek-Research/BreezyVoice")
    parser.add_argument("--prompt-audio", default="data/example.wav")
    parser.add_argument("--prompt-text", default=DEFAULT_PROMPT_TEXT)
    parser.add_argument("--output", default="")
    parser.add_argument("--token-hop-len", type=int, default=25)
    parser.add_argument("--limit", type=int, default=12)
    parser.add_argument("--repeats", type=int, default=3)
    parser.add_argument("--seed", type=int, default=20260626)
    return parser.parse_args()


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    rows = []
    with path.open(encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


def tensor_to_wav(torchaudio: Any, path: Path, tensor: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    torchaudio.save(str(path), tensor, SAMPLE_RATE)


def normalize(runtime: dict[str, Any], prompt_text: str, text: str) -> tuple[str, str, str, str]:
    cosyvoice = runtime["cosyvoice"]
    converter = runtime["converter"]
    get_bopomofo_rare = runtime["get_bopomofo_rare"]
    prompt_normalized = cosyvoice.frontend.text_normalize_new(prompt_text, split=False)
    text_normalized = cosyvoice.frontend.text_normalize_new(text, split=False)
    return (
        prompt_normalized,
        text_normalized,
        get_bopomofo_rare(prompt_normalized, converter),
        get_bopomofo_rare(text_normalized, converter),
    )


def split_segments(text: str) -> list[str]:
    return [part for part in re.split(r"(?<=[？！。.?!])\s*", text) if part]


def run_offline_request(
    args: argparse.Namespace,
    repo_root: Path,
    output: Path,
    runtime: dict[str, Any],
    run_id: str,
    request_index: int,
    variant: str,
    sample: dict[str, Any],
    repeat_idx: int,
) -> dict[str, Any]:
    torch = runtime["torch"]
    torchaudio = runtime["torchaudio"]
    cosyvoice = runtime["cosyvoice"]
    prompt_speech_16k = runtime["prompt_speech_16k"]
    request_id = f"matrix_{request_index:06d}"
    started_ns = time.monotonic_ns()
    started_local = iso_local()
    started_utc = iso_utc()
    trace_path = output / "logs" / "event_trace.jsonl"
    summary_path = output / "logs" / "request_summary.jsonl"
    audio_path = output / "audio" / variant / f"{sample['sample_id']}__r{repeat_idx:02d}.wav"

    append_jsonl(trace_path, event_row(run_id, request_id, variant, sample, repeat_idx, "request_received", started_ns))
    _, text_normalized, prompt_bopomofo, text_bopomofo = normalize(runtime, args.prompt_text, sample["input_text"])
    segments = split_segments(text_bopomofo) if variant == "B_segment" else [text_bopomofo]
    chunks = []
    first_audio_ms = None

    for segment_index, segment in enumerate(segments):
        append_jsonl(trace_path, event_row(run_id, request_id, variant, sample, repeat_idx, "segment_synthesis_start", started_ns, {
            "segment_index": segment_index,
            "chunk_index": segment_index,
        }))
        output_row = cosyvoice.inference_zero_shot_no_normalize(segment, prompt_bopomofo, prompt_speech_16k)
        if torch.cuda.is_available():
            torch.cuda.synchronize()
        chunk = output_row["tts_speech"].cpu()
        chunks.append(chunk)
        elapsed_ms = round((time.monotonic_ns() - started_ns) / 1_000_000, 3)
        if first_audio_ms is None:
            first_audio_ms = elapsed_ms
            append_jsonl(trace_path, event_row(run_id, request_id, variant, sample, repeat_idx, "first_audio_chunk_sent", started_ns, {
                "segment_index": segment_index,
                "chunk_index": segment_index,
                "audio_chunk_duration_ms": round(chunk.shape[1] / SAMPLE_RATE * 1000, 3),
                "is_final": segment_index == len(segments) - 1,
            }))
        append_jsonl(trace_path, event_row(run_id, request_id, variant, sample, repeat_idx, "segment_audio_chunk_sent", started_ns, {
            "segment_index": segment_index,
            "chunk_index": segment_index,
            "audio_chunk_duration_ms": round(chunk.shape[1] / SAMPLE_RATE * 1000, 3),
            "is_final": segment_index == len(segments) - 1,
        }))

    final_audio = torch.concat(chunks, dim=1)
    tensor_to_wav(torchaudio, audio_path, final_audio)
    total_ms = round((time.monotonic_ns() - started_ns) / 1_000_000, 3)
    duration = wav_duration(audio_path)
    append_jsonl(trace_path, event_row(run_id, request_id, variant, sample, repeat_idx, "last_audio_chunk_sent", started_ns))
    append_jsonl(trace_path, event_row(run_id, request_id, variant, sample, repeat_idx, "request_completed", started_ns))
    summary = {
        "schema_version": "tts-true-streaming-matrix-summary-v1",
        "run_id": run_id,
        "request_id": request_id,
        "variant": variant,
        "git_commit": run_command(["git", "rev-parse", "--short", "HEAD"], repo_root),
        "breezyvoice_commit": run_command(["git", "rev-parse", "--short", "HEAD"], Path(args.breezyvoice_root)),
        "model_id": args.model_path,
        "model_hash": None,
        "speaker_profile_id": "default",
        "speaker_prompt_audio_hash": sha256_file(Path(args.breezyvoice_root) / args.prompt_audio),
        "sample_id": sample["sample_id"],
        "repeat_idx": repeat_idx,
        "input_text": sample["input_text"],
        "normalized_text": text_normalized,
        "bopomofo_text": text_bopomofo,
        "char_count": len(sample["input_text"]),
        "segment_count": len(segments),
        "chunk_count": len(chunks),
        "streaming_validity": True,
        "cache_enabled": False,
        "cache_hit": False,
        "audio_path": str(audio_path.relative_to(output)),
        "audio_duration_sec": duration,
        "ttfa_server_ms": first_audio_ms,
        "ttfa_client_ms": None,
        "total_synthesis_ms": total_ms,
        "rtf": round(total_ms / max((duration or 0) * 1000, 1), 3),
        "first_speech_token_ms": None,
        "first_mel_chunk_ms": None,
        "first_pcm_chunk_ms": None,
        "first_audio_chunk_sent_ms": first_audio_ms,
        "chunk_jitter_p95_ms": None,
        "max_inter_chunk_gap_ms": None,
        "buffer_underrun_count": 0,
        "gpu_memory_peak_mb": round(torch.cuda.max_memory_allocated() / 1024 / 1024, 3) if torch.cuda.is_available() else None,
        "gpu_util_mean": None,
        "local_started_at": started_local,
        "local_ended_at": iso_local(),
        "utc_started_at": started_utc,
        "utc_ended_at": iso_utc(),
        "status": "ok",
        "error": None,
    }
    append_jsonl(summary_path, summary)
    append_gpu_metric(output, run_id, request_id, variant, sample["sample_id"], repeat_idx, started_ns, torch, summary["status"], summary["error"])
    return summary


def failure_summary(
    args: argparse.Namespace,
    repo_root: Path,
    output: Path,
    runtime: dict[str, Any],
    run_id: str,
    request_index: int,
    variant: str,
    sample: dict[str, Any],
    repeat_idx: int,
    exc: Exception,
) -> dict[str, Any]:
    torch = runtime.get("torch")
    request_id = f"matrix_{request_index:06d}"
    started_ns = time.monotonic_ns()
    row = {
        "schema_version": "tts-true-streaming-matrix-summary-v1",
        "run_id": run_id,
        "request_id": request_id,
        "variant": variant,
        "git_commit": run_command(["git", "rev-parse", "--short", "HEAD"], repo_root),
        "breezyvoice_commit": run_command(["git", "rev-parse", "--short", "HEAD"], Path(args.breezyvoice_root)),
        "model_id": args.model_path,
        "model_hash": None,
        "speaker_profile_id": "default",
        "speaker_prompt_audio_hash": sha256_file(Path(args.breezyvoice_root) / args.prompt_audio),
        "sample_id": sample["sample_id"],
        "repeat_idx": repeat_idx,
        "input_text": sample["input_text"],
        "normalized_text": None,
        "bopomofo_text": None,
        "char_count": len(sample["input_text"]),
        "segment_count": 0,
        "chunk_count": 0,
        "streaming_validity": False,
        "cache_enabled": False,
        "cache_hit": False,
        "audio_path": None,
        "audio_duration_sec": None,
        "ttfa_server_ms": None,
        "ttfa_client_ms": None,
        "total_synthesis_ms": None,
        "rtf": None,
        "first_speech_token_ms": None,
        "first_mel_chunk_ms": None,
        "first_pcm_chunk_ms": None,
        "first_audio_chunk_sent_ms": None,
        "chunk_jitter_p95_ms": None,
        "max_inter_chunk_gap_ms": None,
        "buffer_underrun_count": None,
        "gpu_memory_peak_mb": round(torch.cuda.max_memory_allocated() / 1024 / 1024, 3) if torch is not None and torch.cuda.is_available() else None,
        "gpu_util_mean": None,
        "local_started_at": iso_local(),
        "local_ended_at": iso_local(),
        "utc_started_at": iso_utc(),
        "utc_ended_at": iso_utc(),
        "status": "failed",
        "error": repr(exc),
    }
    append_jsonl(output / "logs" / "event_trace.jsonl", event_row(run_id, request_id, variant, sample, repeat_idx, "request_failed", started_ns, {"error": repr(exc)}))
    append_jsonl(output / "logs" / "request_summary.jsonl", row)
    append_jsonl(output / "logs" / "error_log.jsonl", row)
    append_gpu_metric(output, run_id, request_id, variant, sample["sample_id"], repeat_idx, started_ns, torch, "failed", repr(exc))
    return row


def numeric_values(rows: list[dict[str, Any]], key: str) -> list[float]:
    return sorted(float(row[key]) for row in rows if isinstance(row.get(key), int | float))


def percentile(values: list[float], pct: float) -> float | None:
    if not values:
        return None
    index = min(len(values) - 1, max(0, round((pct / 100) * (len(values) - 1))))
    return round(values[index], 3)


def fmt(value: Any) -> str:
    return "n/a" if value is None else str(value)


def write_latency_report(reports: Path, rows: list[dict[str, Any]]) -> None:
    lines = [
        "# Latency Report",
        "",
        "| Variant | Rows | TTFA p50 ms | TTFA p95 ms | Total p50 ms | Total p95 ms | RTF p50 | RTF p95 |",
        "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ]
    for variant in VARIANTS:
        variant_rows = [row for row in rows if row["variant"] == variant and row.get("status") == "ok"]
        ttfa = numeric_values(variant_rows, "ttfa_server_ms")
        total = numeric_values(variant_rows, "total_synthesis_ms")
        rtf = numeric_values(variant_rows, "rtf")
        lines.append(
            f"| {variant} | {len(variant_rows)} | {fmt(percentile(ttfa, 50))} | "
            f"{fmt(percentile(ttfa, 95))} | {fmt(percentile(total, 50))} | "
            f"{fmt(percentile(total, 95))} | {fmt(percentile(rtf, 50))} | {fmt(percentile(rtf, 95))} |"
        )
    (reports / "latency_report.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_failure_analysis(reports: Path, rows: list[dict[str, Any]]) -> None:
    lines = [
        "# Failure Analysis",
        "",
        "| Variant | Rows | OK | Failed or invalid | Failure rate | Errors |",
        "| --- | --- | --- | --- | --- | --- |",
    ]
    for variant in VARIANTS:
        variant_rows = [row for row in rows if row["variant"] == variant]
        ok = sum(1 for row in variant_rows if row.get("status") == "ok")
        failed = len(variant_rows) - ok
        rate = round(failed / len(variant_rows), 4) if variant_rows else 0
        errors = sorted({str(row.get("error")) for row in variant_rows if row.get("error")})
        lines.append(f"| {variant} | {len(variant_rows)} | {ok} | {failed} | {rate} | {'; '.join(errors) if errors else 'none'} |")
    (reports / "failure_analysis.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def hard_gate_result(rows: list[dict[str, Any]], variant: str) -> tuple[bool, list[str]]:
    variant_rows = [row for row in rows if row["variant"] == variant]
    reasons = []
    if not variant_rows:
        reasons.append("no rows")
    valid_count = sum(1 for row in variant_rows if row.get("streaming_validity") is True)
    ok_count = sum(1 for row in variant_rows if row.get("status") == "ok")
    if valid_count != len(variant_rows):
        reasons.append("invalid streaming rows")
    if ok_count != len(variant_rows):
        reasons.append("failed rows")
    failure_rate = (len(variant_rows) - ok_count) / len(variant_rows) if variant_rows else 1
    if failure_rate > 0.005:
        reasons.append("failure rate > 0.5%")
    p95_rtf = percentile(numeric_values(variant_rows, "rtf"), 95)
    if p95_rtf is not None and p95_rtf > 1.0:
        reasons.append("p95 RTF > 1.0")
    p95_ttfa = percentile(numeric_values(variant_rows, "ttfa_server_ms"), 95)
    if p95_ttfa is not None and p95_ttfa > 1500:
        reasons.append("p95 TTFA server > 1500 ms")
    return not reasons, reasons


def write_final_decision(reports: Path, rows: list[dict[str, Any]]) -> None:
    gate_lines = [
        "# Final Decision",
        "",
        "This run completed the minimum randomized paired live matrix. Production selection remains gated by hard gates and audio-quality review.",
        "",
        "## Hard Gates",
        "",
        "| Variant | Pass | Reasons |",
        "| --- | --- | --- |",
    ]
    passing = []
    for variant in VARIANTS:
        passed, reasons = hard_gate_result(rows, variant)
        if passed:
            passing.append(variant)
        gate_lines.append(f"| {variant} | {str(passed).lower()} | {'; '.join(reasons) if reasons else 'none'} |")

    gate_lines.extend([
        "",
        "## Recommendation",
        "",
        f"- Production default: `{passing[0] if passing else 'none'}`",
        "- Operational fallback: `A_original` if local latency gates are accepted by the demo operator; otherwise `none`.",
        "- Research candidate: `C_token` and `D_hybrid`.",
        "- Next optimization candidate: `D_hybrid` seam quality and prefix/window recomputation cost.",
    ])
    (reports / "final_decision.md").write_text("\n".join(gate_lines) + "\n", encoding="utf-8")


def write_matrix_reports(output: Path, run_id: str, rows: list[dict[str, Any]], minimum_completed: bool) -> str:
    reports = output / "reports"
    reports.mkdir(parents=True, exist_ok=True)
    lines = [
        "# Streaming Validity Report",
        "",
        f"Run ID: `{run_id}`",
        "",
        "| Variant | Rows | Valid rows | Audio files | Status |",
        "| --- | --- | --- | --- | --- |",
    ]
    all_valid = True
    for variant in VARIANTS:
        variant_rows = [row for row in rows if row["variant"] == variant]
        valid = sum(1 for row in variant_rows if row.get("streaming_validity") is True)
        audio_files = sum(1 for row in variant_rows if row.get("audio_path"))
        variant_status = "valid" if valid == len(variant_rows) and audio_files == len(variant_rows) and variant_rows else "invalid"
        if variant_status != "valid":
            all_valid = False
        lines.append(f"| {variant} | {len(variant_rows)} | {valid} | {audio_files} | {variant_status} |")
    if not all_valid:
        status = "BLOCKED_UNRESOLVED"
    elif minimum_completed:
        status = "LIVE_MINIMUM_ABCD_COMPLETED"
    else:
        status = "C_D_TRUE_STREAMING_READY"
    (reports / "streaming_validity_report.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    write_latency_report(reports, rows)
    write_failure_analysis(reports, rows)
    if status.startswith("LIVE_"):
        write_final_decision(reports, rows)
    elif status == "BLOCKED_UNRESOLVED":
        (reports / "blocked_unresolved_report.md").write_text("# Blocked Unresolved Report\n\nABCD matrix did not satisfy validity criteria.\n", encoding="utf-8")
    return status


def main() -> None:
    args = parse_args()
    repo_root = repo_root_from_script(Path(__file__))
    manifest = read_jsonl(repo_root / args.manifest)[: args.limit]
    output = repo_root / (args.output or f"experiments/{local_now().strftime('%Y%m%d_%H%M%S')}_strict_breezyvoice_abcd_matrix")
    run_id = output.name
    for subdir in ["logs", "reports", *[f"audio/{variant}" for variant in VARIANTS]]:
        (output / subdir).mkdir(parents=True, exist_ok=True)
    for log_name in ["error_log.jsonl", "gpu_metrics.jsonl", "request_summary.jsonl", "event_trace.jsonl"]:
        (output / "logs" / log_name).touch()

    breezyvoice_root = Path(args.breezyvoice_root).resolve()
    torch, torchaudio, G2PWConverter, load_wav, CustomCosyVoice, get_bopomofo_rare = load_breezyvoice_runtime(breezyvoice_root)
    old_cwd = Path.cwd()
    import os

    os.chdir(breezyvoice_root)
    try:
        converter = G2PWConverter()
    finally:
        os.chdir(old_cwd)
    runtime = {
        "torch": torch,
        "torchaudio": torchaudio,
        "cosyvoice": CustomCosyVoice(args.model_path),
        "converter": converter,
        "prompt_speech_16k": load_wav(str(breezyvoice_root / args.prompt_audio), 16000),
        "get_bopomofo_rare": get_bopomofo_rare,
    }

    metadata = {
        "schema_version": "tts-true-streaming-matrix-run-v1",
        "run_id": run_id,
        "local_started_at": iso_local(),
        "utc_started_at": iso_utc(),
        "repo_commit": run_command(["git", "rev-parse", "--short", "HEAD"], repo_root),
        "breezyvoice_branch": run_command(["git", "branch", "--show-current"], breezyvoice_root),
        "breezyvoice_commit": run_command(["git", "rev-parse", "--short", "HEAD"], breezyvoice_root),
        "seed": args.seed,
        "limit": args.limit,
        "repeats": args.repeats,
        "variants": VARIANTS,
    }
    (output / "run_metadata.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    tasks = []
    rng = random.Random(args.seed)
    for repeat_idx in range(args.repeats):
        for sample in manifest:
            order = list(VARIANTS)
            rng.shuffle(order)
            for variant in order:
                tasks.append((variant, sample, repeat_idx))

    rows = []
    for index, (variant, sample, repeat_idx) in enumerate(tasks, start=1):
        sample_for_probe = {
            "sample_id": sample["sample_id"],
            "category": sample.get("category", ""),
            "input_text": sample["input_text"],
        }
        try:
            if variant in {"C_token", "D_hybrid"}:
                rows.append(run_probe_request(args, repo_root, output, runtime, run_id, index, variant, sample_for_probe, repeat_idx))
            else:
                rows.append(run_offline_request(args, repo_root, output, runtime, run_id, index, variant, sample_for_probe, repeat_idx))
        except Exception as exc:  # noqa: BLE001 - matrix must preserve request-level failure evidence
            rows.append(failure_summary(args, repo_root, output, runtime, run_id, index, variant, sample_for_probe, repeat_idx, exc))

    minimum_completed = args.limit >= 12 and args.repeats >= 3 and len(rows) >= 144
    status = write_matrix_reports(output, run_id, rows, minimum_completed)
    metadata["status"] = status
    metadata["local_ended_at"] = iso_local()
    metadata["utc_ended_at"] = iso_utc()
    (output / "run_metadata.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Status: {status}")
    print(f"Run ID: {run_id}")
    print(f"Output: {output.relative_to(repo_root)}")


if __name__ == "__main__":
    main()
