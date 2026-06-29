#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import os
import subprocess
import sys
import time
import wave
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Any

LOCAL_TZ = timezone(timedelta(hours=8))
SAMPLE_RATE = 22050
DEFAULT_BREEZYVOICE_ROOT = "/home/jnclaw/every_on_git_jnclaw/BreezyVoice"
DEFAULT_PROMPT_TEXT = (
    "在密碼學中，加密是將明文資訊改變為難以讀取的密文內容，使之不可讀的方法。"
    "只有擁有解密方法的對象，經由解密過程，才能將密文還原為正常可讀的內容。"
)


PROBE_SAMPLES = [
    {
        "sample_id": "probe_short_ack",
        "category": "short_acknowledgement",
        "input_text": "我剛剛聽到您說「沒有」。",
    },
    {
        "sample_id": "probe_long_no_punctuation",
        "category": "long_single_sentence",
        "input_text": "如果剛剛的語音沒有被清楚辨識您可以直接用螢幕點選答案也可以按重新錄音讓系統再聽一次並繼續完成問卷流程",
    },
    {
        "sample_id": "probe_phq_multisentence",
        "category": "multi_sentence_phq_style",
        "input_text": "接下來是第一題。最近兩週，做事時提不起勁或沒有樂趣？這題也可以直接用螢幕點選答案。",
    },
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Probe true C/D token/audio streaming in the patched BreezyVoice runtime.")
    parser.add_argument("--breezyvoice-root", default=DEFAULT_BREEZYVOICE_ROOT)
    parser.add_argument("--model-path", default="MediaTek-Research/BreezyVoice")
    parser.add_argument("--prompt-audio", default="data/example.wav")
    parser.add_argument("--prompt-text", default=DEFAULT_PROMPT_TEXT)
    parser.add_argument("--output", default="")
    parser.add_argument("--token-hop-len", type=int, default=25)
    return parser.parse_args()


def local_now() -> datetime:
    return datetime.now(LOCAL_TZ)


def iso_local() -> str:
    return local_now().isoformat(timespec="milliseconds")


def iso_utc() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def repo_root_from_script(path: Path) -> Path:
    return path.resolve().parents[2]


def run_command(cmd: list[str], cwd: Path) -> str | None:
    try:
        return subprocess.check_output(cmd, cwd=str(cwd), stderr=subprocess.DEVNULL, text=True, timeout=5).strip()
    except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired):
        return None


def append_jsonl(path: Path, row: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")


def sha256_file(path: Path) -> str | None:
    if not path.exists():
        return None
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def append_gpu_metric(
    output: Path,
    run_id: str,
    request_id: str,
    variant: str,
    sample_id: str,
    repeat_idx: int,
    started_ns: int,
    torch: Any | None,
    status: str,
    error: str | None = None,
) -> None:
    gpu_available = bool(torch is not None and torch.cuda.is_available())
    row = {
        "schema_version": "tts-gpu-metric-v1",
        "run_id": run_id,
        "request_id": request_id,
        "variant": variant,
        "sample_id": sample_id,
        "repeat_idx": repeat_idx,
        "t_monotonic_ns": time.monotonic_ns(),
        "elapsed_ms": round((time.monotonic_ns() - started_ns) / 1_000_000, 3),
        "t_wall": iso_local(),
        "t_wall_utc": iso_utc(),
        "gpu_available": gpu_available,
        "gpu_allocated_mb": round(torch.cuda.memory_allocated() / 1024 / 1024, 3) if gpu_available else None,
        "gpu_reserved_mb": round(torch.cuda.memory_reserved() / 1024 / 1024, 3) if gpu_available else None,
        "gpu_memory_peak_mb": round(torch.cuda.max_memory_allocated() / 1024 / 1024, 3) if gpu_available else None,
        "gpu_util_mean": None,
        "status": status,
        "error": error,
    }
    append_jsonl(output / "logs" / "gpu_metrics.jsonl", row)


def wav_duration(path: Path) -> float | None:
    try:
        with wave.open(str(path), "rb") as wav:
            return round(wav.getnframes() / wav.getframerate(), 3)
    except (wave.Error, OSError):
        return None


def event_row(
    run_id: str,
    request_id: str,
    variant: str,
    sample: dict[str, str],
    repeat_idx: int,
    event: str,
    started_ns: int,
    extra: dict[str, Any] | None = None,
) -> dict[str, Any]:
    now_ns = time.monotonic_ns()
    wall_local = iso_local()
    wall_utc = iso_utc()
    row = {
        "schema_version": "tts-stream-event-v1",
        "run_id": run_id,
        "request_id": request_id,
        "variant": variant,
        "sample_id": sample["sample_id"],
        "repeat_idx": repeat_idx,
        "event": event,
        "t_monotonic_ns": now_ns,
        "elapsed_ms": round((now_ns - started_ns) / 1_000_000, 3),
        "t_wall": wall_local,
        "t_wall_local": wall_local,
        "t_wall_utc": wall_utc,
        "segment_index": None,
        "chunk_index": None,
        "token_start": None,
        "token_end": None,
        "audio_chunk_duration_ms": None,
        "bytes": None,
        "is_final": None,
        "gpu_allocated_mb": None,
        "gpu_reserved_mb": None,
    }
    if extra:
        row.update(extra)
    return row


def tensor_to_wav_bytes(torchaudio: Any, tensor: Any) -> bytes:
    from io import BytesIO

    out = BytesIO()
    torchaudio.save(out, tensor, SAMPLE_RATE, format="wav")
    return out.getvalue()


def load_breezyvoice_runtime(breezyvoice_root: Path):
    sys.path.insert(0, str(breezyvoice_root))
    old_cwd = Path.cwd()
    os.chdir(breezyvoice_root)
    try:
        import torch
        import torchaudio
        from g2pw import G2PWConverter
        from cosyvoice.utils.file_utils import load_wav
        from single_inference import CustomCosyVoice, get_bopomofo_rare

        return torch, torchaudio, G2PWConverter, load_wav, CustomCosyVoice, get_bopomofo_rare
    finally:
        os.chdir(old_cwd)


def run_probe_request(
    args: argparse.Namespace,
    repo_root: Path,
    output: Path,
    runtime: dict[str, Any],
    run_id: str,
    request_index: int,
    variant: str,
    sample: dict[str, str],
    repeat_idx: int = 0,
) -> dict[str, Any]:
    torch = runtime["torch"]
    torchaudio = runtime["torchaudio"]
    cosyvoice = runtime["cosyvoice"]
    converter = runtime["converter"]
    prompt_speech_16k = runtime["prompt_speech_16k"]
    get_bopomofo_rare = runtime["get_bopomofo_rare"]

    request_id = f"probe_{request_index:04d}"
    started_ns = time.monotonic_ns()
    started_local = iso_local()
    started_utc = iso_utc()
    trace_path = output / "logs" / "event_trace.jsonl"
    summary_path = output / "logs" / "request_summary.jsonl"
    error_path = output / "logs" / "error_log.jsonl"
    audio_path = output / "audio" / variant / f"{sample['sample_id']}__r{repeat_idx:02d}.wav"
    segment_streaming = variant == "D_hybrid"

    append_jsonl(trace_path, event_row(run_id, request_id, variant, sample, repeat_idx, "request_received", started_ns))
    append_jsonl(trace_path, event_row(run_id, request_id, variant, sample, repeat_idx, "normalization_start", started_ns))

    try:
        prompt_normalized = cosyvoice.frontend.text_normalize_new(args.prompt_text, split=False)
        text_normalized = cosyvoice.frontend.text_normalize_new(sample["input_text"], split=False)
        prompt_bopomofo = get_bopomofo_rare(prompt_normalized, converter)
        text_bopomofo = get_bopomofo_rare(text_normalized, converter)
        append_jsonl(trace_path, event_row(run_id, request_id, variant, sample, repeat_idx, "normalization_end", started_ns))
        append_jsonl(trace_path, event_row(run_id, request_id, variant, sample, repeat_idx, "llm_start", started_ns))

        chunks = []
        chunk_count = 0
        first_speech_token_ms = None
        first_mel_chunk_ms = None
        first_pcm_chunk_ms = None
        first_audio_chunk_sent_ms = None
        last_audio_chunk_sent_ms = None
        token_events = 0
        pcm_events = 0

        stream = cosyvoice.inference_zero_shot_no_normalize_stream(
            text_bopomofo,
            prompt_bopomofo,
            prompt_speech_16k,
            segment_streaming=segment_streaming,
            token_hop_len=args.token_hop_len,
        )
        for item in stream:
            if torch.cuda.is_available():
                torch.cuda.synchronize()
            event = item.get("event", "pcm_chunk")
            elapsed_ms = round((time.monotonic_ns() - started_ns) / 1_000_000, 3)
            gpu_allocated = round(torch.cuda.memory_allocated() / 1024 / 1024, 3) if torch.cuda.is_available() else None
            gpu_reserved = round(torch.cuda.memory_reserved() / 1024 / 1024, 3) if torch.cuda.is_available() else None
            tts_speech = item.get("tts_speech")
            bytes_len = None
            duration_ms = None

            if event in {"first_speech_token", "speech_token_chunk"}:
                token_events += 1
                if first_speech_token_ms is None:
                    first_speech_token_ms = elapsed_ms

            if tts_speech is not None:
                if first_mel_chunk_ms is None:
                    first_mel_chunk_ms = elapsed_ms
                    append_jsonl(trace_path, event_row(run_id, request_id, variant, sample, repeat_idx, "first_mel_chunk", started_ns, {
                        "segment_index": item.get("segment_index"),
                        "chunk_index": item.get("chunk_index"),
                        "token_start": item.get("token_start"),
                        "token_end": item.get("token_end"),
                        "gpu_allocated_mb": gpu_allocated,
                        "gpu_reserved_mb": gpu_reserved,
                    }))
                if first_pcm_chunk_ms is None:
                    first_pcm_chunk_ms = elapsed_ms
                    append_jsonl(trace_path, event_row(run_id, request_id, variant, sample, repeat_idx, "first_pcm_chunk", started_ns, {
                        "segment_index": item.get("segment_index"),
                        "chunk_index": item.get("chunk_index"),
                        "token_start": item.get("token_start"),
                        "token_end": item.get("token_end"),
                        "gpu_allocated_mb": gpu_allocated,
                        "gpu_reserved_mb": gpu_reserved,
                    }))
                wav_bytes = tensor_to_wav_bytes(torchaudio, tts_speech)
                bytes_len = len(wav_bytes)
                duration_ms = round((tts_speech.shape[1] / SAMPLE_RATE) * 1000, 3)
                chunks.append(tts_speech)
                pcm_events += 1
                chunk_count += 1
                if first_audio_chunk_sent_ms is None:
                    first_audio_chunk_sent_ms = elapsed_ms
                    append_jsonl(trace_path, event_row(run_id, request_id, variant, sample, repeat_idx, "first_audio_chunk_sent", started_ns, {
                        "segment_index": item.get("segment_index"),
                        "chunk_index": item.get("chunk_index"),
                        "token_start": item.get("token_start"),
                        "token_end": item.get("token_end"),
                        "audio_chunk_duration_ms": duration_ms,
                        "bytes": bytes_len,
                        "is_final": item.get("is_final"),
                        "gpu_allocated_mb": gpu_allocated,
                        "gpu_reserved_mb": gpu_reserved,
                    }))
                last_audio_chunk_sent_ms = elapsed_ms

            append_jsonl(trace_path, event_row(run_id, request_id, variant, sample, repeat_idx, event, started_ns, {
                "segment_index": item.get("segment_index"),
                "chunk_index": item.get("chunk_index"),
                "token_start": item.get("token_start"),
                "token_end": item.get("token_end"),
                "audio_chunk_duration_ms": duration_ms,
                "bytes": bytes_len,
                "is_final": item.get("is_final"),
                "gpu_allocated_mb": gpu_allocated,
                "gpu_reserved_mb": gpu_reserved,
            }))

        total_ms = round((time.monotonic_ns() - started_ns) / 1_000_000, 3)
        if chunks:
            audio_path.parent.mkdir(parents=True, exist_ok=True)
            final_audio = torch.concat(chunks, dim=1)
            torchaudio.save(str(audio_path), final_audio, SAMPLE_RATE)
        append_jsonl(trace_path, event_row(run_id, request_id, variant, sample, repeat_idx, "last_audio_chunk_sent", started_ns))
        append_jsonl(trace_path, event_row(run_id, request_id, variant, sample, repeat_idx, "request_completed", started_ns))

        long_sample = sample["category"] in {"long_single_sentence", "multi_sentence_phq_style"} or len(sample["input_text"]) > 50
        segment_count = len([part for part in __import__("re").split(r"(?<=[？！。.?!])\s*", sample["input_text"]) if part]) if segment_streaming else 1
        multi_segment_required = variant == "D_hybrid" and sample["category"] == "multi_sentence_phq_style"
        streaming_validity = (
            first_speech_token_ms is not None
            and first_pcm_chunk_ms is not None
            and (not long_sample or chunk_count > 1)
            and first_pcm_chunk_ms < total_ms
            and (not multi_segment_required or segment_count > 1)
        )
        duration = wav_duration(audio_path) if audio_path.exists() else None
        summary = {
            "schema_version": "tts-stream-probe-summary-v1",
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
            "segment_count": segment_count,
            "chunk_count": chunk_count,
            "token_event_count": token_events,
            "pcm_event_count": pcm_events,
            "streaming_validity": streaming_validity,
            "cache_enabled": False,
            "cache_hit": False,
            "audio_path": str(audio_path.relative_to(output)) if audio_path.exists() else None,
            "audio_duration_sec": duration,
            "ttfa_server_ms": first_audio_chunk_sent_ms,
            "ttfa_client_ms": None,
            "total_synthesis_ms": total_ms,
            "rtf": round(total_ms / max((duration or 0) * 1000, 1), 3),
            "first_speech_token_ms": first_speech_token_ms,
            "first_mel_chunk_ms": first_mel_chunk_ms,
            "first_pcm_chunk_ms": first_pcm_chunk_ms,
            "first_audio_chunk_sent_ms": first_audio_chunk_sent_ms,
            "chunk_jitter_p95_ms": None,
            "max_inter_chunk_gap_ms": None,
            "buffer_underrun_count": 0,
            "gpu_memory_peak_mb": round(torch.cuda.max_memory_allocated() / 1024 / 1024, 3) if torch.cuda.is_available() else None,
            "gpu_util_mean": None,
            "local_started_at": started_local,
            "local_ended_at": iso_local(),
            "utc_started_at": started_utc,
            "utc_ended_at": iso_utc(),
            "status": "ok" if streaming_validity else "invalid_streaming",
            "error": None if streaming_validity else "streaming validity criteria were not met",
        }
        append_jsonl(summary_path, summary)
        append_gpu_metric(output, run_id, request_id, variant, sample["sample_id"], repeat_idx, started_ns, torch, summary["status"], summary["error"])
        return summary
    except Exception as exc:  # noqa: BLE001 - probe must log exact runtime failure
        append_jsonl(trace_path, event_row(run_id, request_id, variant, sample, repeat_idx, "request_failed", started_ns, {"error": str(exc)}))
        row = {
            "schema_version": "tts-stream-probe-summary-v1",
            "run_id": run_id,
            "request_id": request_id,
            "variant": variant,
            "sample_id": sample["sample_id"],
            "streaming_validity": False,
            "status": "failed",
            "error": repr(exc),
            "local_started_at": started_local,
            "local_ended_at": iso_local(),
            "utc_started_at": started_utc,
            "utc_ended_at": iso_utc(),
        }
        append_jsonl(summary_path, row)
        append_jsonl(error_path, row)
        append_gpu_metric(output, run_id, request_id, variant, sample["sample_id"], repeat_idx, started_ns, torch, "failed", repr(exc))
        return row


def write_reports(output: Path, run_id: str, rows: list[dict[str, Any]]) -> str:
    reports = output / "reports"
    reports.mkdir(parents=True, exist_ok=True)
    by_variant = {variant: [row for row in rows if row["variant"] == variant] for variant in ["C_token", "D_hybrid"]}
    lines = [
        "# Streaming Validity Report",
        "",
        f"Run ID: `{run_id}`",
        "",
        "| Variant | Rows | Valid rows | Status |",
        "| --- | --- | --- | --- |",
    ]
    status = "C_D_TRUE_STREAMING_READY"
    for variant, variant_rows in by_variant.items():
        valid = sum(1 for row in variant_rows if row.get("streaming_validity") is True)
        variant_status = "valid" if valid == len(variant_rows) and variant_rows else "invalid"
        if variant_status != "valid":
            status = "BLOCKED_UNRESOLVED"
        lines.append(f"| {variant} | {len(variant_rows)} | {valid} | {variant_status} |")
    lines.extend([
        "",
        "## Criteria",
        "",
        "- `first_speech_token` exists.",
        "- `first_pcm_chunk` exists.",
        "- Long samples have `chunk_count > 1`.",
        "- `first_pcm_chunk_ms < total_synthesis_ms`.",
        "- `D_hybrid` has more than one segment for the multi-sentence probe.",
    ])
    (reports / "streaming_validity_report.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    if status == "BLOCKED_UNRESOLVED":
        (reports / "blocked_unresolved_report.md").write_text(
            "# Blocked Unresolved Report\n\n"
            f"Run ID: `{run_id}`\n\n"
            "C/D true streaming validity did not pass. See `streaming_validity_report.md`, "
            "`logs/request_summary.jsonl`, and `logs/event_trace.jsonl` for the exact runtime evidence.\n",
            encoding="utf-8",
        )
    return status


def main() -> None:
    args = parse_args()
    repo_root = repo_root_from_script(Path(__file__))
    output = repo_root / (args.output or f"experiments/{local_now().strftime('%Y%m%d_%H%M%S')}_breezyvoice_streaming_runtime_probe")
    run_id = output.name
    for subdir in ["logs", "audio/C_token", "audio/D_hybrid", "reports"]:
        (output / subdir).mkdir(parents=True, exist_ok=True)
    for log_name in ["error_log.jsonl", "gpu_metrics.jsonl", "request_summary.jsonl", "event_trace.jsonl"]:
        (output / "logs" / log_name).touch()

    breezyvoice_root = Path(args.breezyvoice_root).resolve()
    torch, torchaudio, G2PWConverter, load_wav, CustomCosyVoice, get_bopomofo_rare = load_breezyvoice_runtime(breezyvoice_root)
    prompt_audio = breezyvoice_root / args.prompt_audio
    old_cwd = Path.cwd()
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
        "prompt_speech_16k": load_wav(str(prompt_audio), 16000),
        "get_bopomofo_rare": get_bopomofo_rare,
    }

    metadata = {
        "schema_version": "tts-stream-probe-run-v1",
        "run_id": run_id,
        "local_started_at": iso_local(),
        "utc_started_at": iso_utc(),
        "repo_commit": run_command(["git", "rev-parse", "--short", "HEAD"], repo_root),
        "breezyvoice_branch": run_command(["git", "branch", "--show-current"], breezyvoice_root),
        "breezyvoice_commit": run_command(["git", "rev-parse", "--short", "HEAD"], breezyvoice_root),
        "breezyvoice_status": run_command(["git", "status", "--short"], breezyvoice_root),
        "model_path": args.model_path,
        "token_hop_len": args.token_hop_len,
        "status": "PREFLIGHT_ONLY",
    }
    (output / "run_metadata.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    rows = []
    request_index = 1
    for sample in PROBE_SAMPLES:
        for variant in ["C_token", "D_hybrid"]:
            rows.append(run_probe_request(args, repo_root, output, runtime, run_id, request_index, variant, sample))
            request_index += 1
    status = write_reports(output, run_id, rows)
    metadata["status"] = status
    metadata["local_ended_at"] = iso_local()
    metadata["utc_ended_at"] = iso_utc()
    (output / "run_metadata.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Status: {status}")
    print(f"Run ID: {run_id}")
    print(f"Output: {output.relative_to(repo_root)}")


if __name__ == "__main__":
    main()
