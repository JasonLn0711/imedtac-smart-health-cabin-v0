#!/usr/bin/env python3
from __future__ import annotations

import argparse
import base64
import concurrent.futures
import json
import os
import random
import re
import subprocess
import time
import urllib.error
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from streaming_runtime_probe import (
    DEFAULT_BREEZYVOICE_ROOT,
    DEFAULT_PROMPT_TEXT,
    SAMPLE_RATE,
    load_breezyvoice_runtime,
    sha256_file,
    tensor_to_wav_bytes,
)
from tts_benchmark_lib import append_jsonl, audio_metrics, collect_environment, concat_wavs, iso_local, iso_utc, read_jsonl, repo_root_from_script


VARIANTS = {
    "S_serial_segment_baseline": {"batch_size": 1, "parallel": False, "hybrid": False},
    "P2_parallel_segment_batch2": {"batch_size": 2, "parallel": True, "hybrid": False},
    "P3_parallel_segment_batch3": {"batch_size": 3, "parallel": True, "hybrid": False},
    "PD2_parallel_hybrid_batch2": {"batch_size": 2, "parallel": True, "hybrid": True},
    "PD3_parallel_hybrid_batch3": {"batch_size": 3, "parallel": True, "hybrid": True},
}

PROBE_SAMPLES = [
    {"sample_id": "probe_parallel_2_sentence", "category": "two_sentence", "input_text": "我剛剛聽到您說「沒有」。接下來請回答下一題。"},
    {"sample_id": "probe_parallel_3_sentence", "category": "three_sentence", "input_text": "接下來是第一題。最近兩週，做事時提不起勁或沒有樂趣？這題也可以直接用螢幕點選答案。"},
    {"sample_id": "probe_parallel_phq_long", "category": "long_phq", "input_text": "如果剛剛的語音沒有被清楚辨識，您可以直接用螢幕點選答案。也可以按重新錄音，讓系統再聽一次。接下來我們會繼續完成問卷流程。"},
]

REQUIRED_EVENTS = [
    "batch_received",
    "segment_dispatch_start",
    "segment_request_sent",
    "segment_synthesis_start",
    "segment_first_audio_ready",
    "segment_synthesis_end",
    "segment_audio_saved",
    "ordered_reconstruction_start",
    "ordered_reconstruction_end",
    "batch_end",
]


@dataclass
class SegmentResult:
    segment_id: int
    text: str
    audio: bytes
    start_ms: float
    end_ms: float
    duration_ms: float
    audio_path: str
    audio_duration_sec: float | None
    chunk_count: int = 1
    token_event_count: int = 0
    pcm_event_count: int = 0
    streaming_validity: bool | None = None
    first_speech_token_ms: float | None = None
    first_pcm_chunk_ms: float | None = None
    first_audio_chunk_sent_ms: float | None = None


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Probe and run true parallel segment BreezyVoice batch TTS.")
    parser.add_argument("--breezyvoice-base-url", default=os.getenv("BREEZYVOICE_BASE_URL", "http://localhost:9003/v1"))
    parser.add_argument("--manifest", default="experiments/manifests/parallel_segment_tts_eval_manifest.jsonl")
    parser.add_argument("--output", default="")
    parser.add_argument("--mode", choices=["probe", "minimum"], default="probe")
    parser.add_argument("--variants", default="")
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--repeats", type=int, default=1)
    parser.add_argument("--seed", type=int, default=20260626)
    parser.add_argument("--timeout-sec", type=int, default=90)
    parser.add_argument("--breezyvoice-root", default=os.getenv("BREEZYVOICE_ROOT", DEFAULT_BREEZYVOICE_ROOT))
    parser.add_argument("--model-path", default=os.getenv("BREEZYVOICE_MODEL", "MediaTek-Research/BreezyVoice"))
    parser.add_argument("--prompt-audio", default=os.getenv("BREEZYVOICE_PROMPT_AUDIO", "data/example.wav"))
    parser.add_argument("--prompt-text", default=os.getenv("BREEZYVOICE_PROMPT_TEXT", DEFAULT_PROMPT_TEXT))
    parser.add_argument("--token-hop-len", type=int, default=int(os.getenv("BREEZYVOICE_TOKEN_HOP_LEN", "25")))
    return parser.parse_args()


def run_command(cmd: list[str], cwd: Path) -> str | None:
    try:
        return subprocess.check_output(cmd, cwd=str(cwd), stderr=subprocess.DEVNULL, text=True, timeout=5).strip()
    except (FileNotFoundError, subprocess.CalledProcessError, subprocess.TimeoutExpired):
        return None


def split_segments(text: str) -> list[str]:
    parts = [part.strip() for part in re.split(r"(?<=[。！？；?!])\s*", text) if part.strip()]
    if not parts:
        parts = [text]
    segments: list[str] = []
    for part in parts:
        if len(part) <= 42:
            segments.append(part)
            continue
        for start in range(0, len(part), 42):
            chunk = part[start : start + 42].strip()
            if chunk:
                segments.append(chunk)
    return segments


def load_hybrid_runtime(args: argparse.Namespace) -> dict[str, Any]:
    breezyvoice_root = Path(args.breezyvoice_root).resolve()
    torch, torchaudio, G2PWConverter, load_wav, CustomCosyVoice, get_bopomofo_rare = load_breezyvoice_runtime(breezyvoice_root)
    old_cwd = Path.cwd()
    os.chdir(breezyvoice_root)
    try:
        converter = G2PWConverter()
    finally:
        os.chdir(old_cwd)
    cosyvoice = CustomCosyVoice(args.model_path)
    prompt_audio = breezyvoice_root / args.prompt_audio
    prompt_speech_16k = load_wav(str(prompt_audio), 16000)
    prompt_normalized = cosyvoice.frontend.text_normalize_new(args.prompt_text, split=False)
    prompt_bopomofo = get_bopomofo_rare(prompt_normalized, converter)
    return {
        "torch": torch,
        "torchaudio": torchaudio,
        "cosyvoice": cosyvoice,
        "converter": converter,
        "prompt_speech_16k": prompt_speech_16k,
        "prompt_bopomofo": prompt_bopomofo,
        "get_bopomofo_rare": get_bopomofo_rare,
        "breezyvoice_root": breezyvoice_root,
        "prompt_audio_hash": sha256_file(prompt_audio),
    }


def hybrid_text(runtime: dict[str, Any], text: str) -> tuple[str, str]:
    normalized = runtime["cosyvoice"].frontend.text_normalize_new(text, split=False)
    return normalized, runtime["get_bopomofo_rare"](normalized, runtime["converter"])


def wav_duration_sec(path: Path) -> float | None:
    return audio_metrics(path).get("duration_sec")


def synthesize_live(base_url: str, text: str, timeout_sec: int) -> bytes:
    payload = json.dumps(
        {
            "model": os.getenv("BREEZYVOICE_MODEL", "MediaTek-Research/BreezyVoice"),
            "voice": "default",
            "input": text,
            "response_format": "wav",
            "speed": 1,
        }
    ).encode("utf-8")
    request = urllib.request.Request(
        f"{base_url.rstrip('/')}/audio/speech",
        data=payload,
        headers={"content-type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=timeout_sec) as response:
        return response.read()


def trace_row(run_id: str, batch_id: str, variant: str, sample: dict[str, Any], repeat_idx: int, segment_id: int | None, event: str, started_ns: int, extra: dict[str, Any] | None = None) -> dict[str, Any]:
    row = {
        "schema_version": "tts-parallel-batch-event-v1",
        "run_id": run_id,
        "batch_id": batch_id,
        "variant": variant,
        "sample_id": sample["sample_id"],
        "repeat_idx": repeat_idx,
        "segment_id": segment_id,
        "event": event,
        "t_monotonic_ns": time.monotonic_ns(),
        "elapsed_ms": round((time.monotonic_ns() - started_ns) / 1_000_000, 3),
        "t_wall": iso_local(),
        "t_wall_utc": iso_utc(),
        "text": None,
        "char_count": None,
        "audio_duration_sec": None,
        "bytes": None,
        "gpu_allocated_mb": None,
        "gpu_reserved_mb": None,
    }
    if extra:
        row.update(extra)
    return row


def save_segment(output: Path, variant: str, sample_id: str, repeat_idx: int, segment_id: int, audio: bytes) -> Path:
    path = output / "audio" / "segments" / variant / sample_id / str(repeat_idx) / f"segment_{segment_id}.wav"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(audio)
    return path


def save_reconstructed(output: Path, variant: str, sample_id: str, repeat_idx: int, chunks: list[bytes]) -> Path:
    path = output / "audio" / "reconstructed" / variant / f"{sample_id}_{repeat_idx}.wav"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(concat_wavs(chunks))
    return path


def dispatch_window_ms(results: list[SegmentResult]) -> float | None:
    if len(results) < 2:
        return None
    starts = [result.start_ms for result in results]
    return round(max(starts) - min(starts), 3)


def has_overlap(results: list[SegmentResult], batch_size: int) -> bool:
    ordered = sorted(results, key=lambda result: result.segment_id)
    if len(ordered) < 2:
        return False
    if not (ordered[1].start_ms < ordered[0].end_ms):
        return False
    if batch_size >= 3 and len(ordered) >= 3:
        return ordered[2].start_ms < ordered[0].end_ms or ordered[2].start_ms < ordered[1].end_ms
    return True


def runtime_mode_for(variant: str, results: list[SegmentResult], total_wall_ms: float) -> tuple[str, float]:
    if not VARIANTS[variant]["parallel"]:
        return "serial_baseline", 0.0
    proof_results = sorted(results, key=lambda result: result.segment_id)[: VARIANTS[variant]["batch_size"]]
    sum_segment_ms = sum(result.duration_ms for result in results)
    overlap_ratio = round(1 - (total_wall_ms / max(sum_segment_ms, 1)), 3)
    window = dispatch_window_ms(proof_results)
    threshold = 250 if VARIANTS[variant]["batch_size"] == 2 else 500
    concurrent_dispatch = window is not None and window <= threshold and has_overlap(proof_results, VARIANTS[variant]["batch_size"])
    if concurrent_dispatch and overlap_ratio > 0.30:
        return "true_parallel_workers", overlap_ratio
    if concurrent_dispatch:
        return "true_parallel_dispatch_low_overlap", overlap_ratio
    return "serial_fallback", overlap_ratio


def run_segment(output: Path, args: argparse.Namespace, run_id: str, batch_id: str, variant: str, sample: dict[str, Any], repeat_idx: int, segment_id: int, text: str, started_ns: int) -> SegmentResult:
    trace = output / "logs" / "batch_event_trace.jsonl"
    append_jsonl(trace, trace_row(run_id, batch_id, variant, sample, repeat_idx, segment_id, "segment_request_sent", started_ns, {"text": text, "char_count": len(text)}))
    start_ms = round((time.monotonic_ns() - started_ns) / 1_000_000, 3)
    append_jsonl(trace, trace_row(run_id, batch_id, variant, sample, repeat_idx, segment_id, "segment_synthesis_start", started_ns, {"text": text, "char_count": len(text)}))
    audio = synthesize_live(args.breezyvoice_base_url, text, args.timeout_sec)
    end_ms = round((time.monotonic_ns() - started_ns) / 1_000_000, 3)
    append_jsonl(trace, trace_row(run_id, batch_id, variant, sample, repeat_idx, segment_id, "segment_first_audio_ready", started_ns, {"text": text, "char_count": len(text), "bytes": len(audio)}))
    append_jsonl(trace, trace_row(run_id, batch_id, variant, sample, repeat_idx, segment_id, "segment_synthesis_end", started_ns, {"text": text, "char_count": len(text), "bytes": len(audio)}))
    segment_path = save_segment(output, variant, sample["sample_id"], repeat_idx, segment_id, audio)
    duration = wav_duration_sec(segment_path)
    append_jsonl(trace, trace_row(run_id, batch_id, variant, sample, repeat_idx, segment_id, "segment_audio_saved", started_ns, {"text": text, "char_count": len(text), "audio_duration_sec": duration, "bytes": len(audio)}))
    return SegmentResult(segment_id, text, audio, start_ms, end_ms, round(end_ms - start_ms, 3), str(segment_path.relative_to(output)), duration)


def run_hybrid_segment(output: Path, args: argparse.Namespace, runtime: dict[str, Any], run_id: str, batch_id: str, variant: str, sample: dict[str, Any], repeat_idx: int, segment_id: int, text: str, bopomofo_text: str, started_ns: int) -> SegmentResult:
    torch = runtime["torch"]
    torchaudio = runtime["torchaudio"]
    trace = output / "logs" / "batch_event_trace.jsonl"
    append_jsonl(trace, trace_row(run_id, batch_id, variant, sample, repeat_idx, segment_id, "segment_request_sent", started_ns, {"text": text, "char_count": len(text), "segment_index": segment_id}))
    start_ms = round((time.monotonic_ns() - started_ns) / 1_000_000, 3)
    append_jsonl(trace, trace_row(run_id, batch_id, variant, sample, repeat_idx, segment_id, "segment_synthesis_start", started_ns, {"text": text, "char_count": len(text), "segment_index": segment_id}))
    append_jsonl(trace, trace_row(run_id, batch_id, variant, sample, repeat_idx, segment_id, "llm_start", started_ns, {"text": text, "segment_index": segment_id}))

    chunks = []
    chunk_count = 0
    token_events = 0
    pcm_events = 0
    first_speech_token_ms = None
    first_mel_chunk_ms = None
    first_pcm_chunk_ms = None
    first_audio_chunk_sent_ms = None

    stream = runtime["cosyvoice"].inference_zero_shot_no_normalize_stream(
        bopomofo_text,
        runtime["prompt_bopomofo"],
        runtime["prompt_speech_16k"],
        segment_streaming=False,
        token_hop_len=args.token_hop_len,
    )
    for item in stream:
        if torch.cuda.is_available():
            torch.cuda.synchronize()
        event = item.get("event", "pcm_chunk")
        elapsed_ms = round((time.monotonic_ns() - started_ns) / 1_000_000, 3)
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
                append_jsonl(trace, trace_row(run_id, batch_id, variant, sample, repeat_idx, segment_id, "first_mel_chunk", started_ns, {
                    "segment_index": segment_id,
                    "chunk_index": item.get("chunk_index"),
                    "token_start": item.get("token_start"),
                    "token_end": item.get("token_end"),
                }))
            if first_pcm_chunk_ms is None:
                first_pcm_chunk_ms = elapsed_ms
                append_jsonl(trace, trace_row(run_id, batch_id, variant, sample, repeat_idx, segment_id, "first_pcm_chunk", started_ns, {
                    "segment_index": segment_id,
                    "chunk_index": item.get("chunk_index"),
                    "token_start": item.get("token_start"),
                    "token_end": item.get("token_end"),
                }))
            wav_bytes = tensor_to_wav_bytes(torchaudio, tts_speech)
            bytes_len = len(wav_bytes)
            duration_ms = round((tts_speech.shape[1] / SAMPLE_RATE) * 1000, 3)
            chunks.append(tts_speech.cpu())
            pcm_events += 1
            chunk_count += 1
            if first_audio_chunk_sent_ms is None:
                first_audio_chunk_sent_ms = elapsed_ms
                append_jsonl(trace, trace_row(run_id, batch_id, variant, sample, repeat_idx, segment_id, "first_audio_chunk_sent", started_ns, {
                    "segment_index": segment_id,
                    "chunk_index": item.get("chunk_index"),
                    "token_start": item.get("token_start"),
                    "token_end": item.get("token_end"),
                    "audio_chunk_duration_ms": duration_ms,
                    "bytes": bytes_len,
                    "is_final": item.get("is_final"),
                }))

        append_jsonl(trace, trace_row(run_id, batch_id, variant, sample, repeat_idx, segment_id, event, started_ns, {
            "segment_index": segment_id,
            "chunk_index": item.get("chunk_index"),
            "token_start": item.get("token_start"),
            "token_end": item.get("token_end"),
            "audio_chunk_duration_ms": duration_ms,
            "bytes": bytes_len,
            "is_final": item.get("is_final"),
        }))

    if not chunks:
        raise ValueError(f"hybrid segment produced no audio chunks: {sample['sample_id']} segment {segment_id}")
    audio = tensor_to_wav_bytes(torchaudio, torch.concat(chunks, dim=1))
    end_ms = round((time.monotonic_ns() - started_ns) / 1_000_000, 3)
    append_jsonl(trace, trace_row(run_id, batch_id, variant, sample, repeat_idx, segment_id, "segment_synthesis_end", started_ns, {"text": text, "char_count": len(text), "bytes": len(audio), "segment_index": segment_id}))
    segment_path = save_segment(output, variant, sample["sample_id"], repeat_idx, segment_id, audio)
    duration = wav_duration_sec(segment_path)
    append_jsonl(trace, trace_row(run_id, batch_id, variant, sample, repeat_idx, segment_id, "segment_audio_saved", started_ns, {"text": text, "char_count": len(text), "audio_duration_sec": duration, "bytes": len(audio), "segment_index": segment_id}))
    streaming_validity = first_speech_token_ms is not None and first_pcm_chunk_ms is not None and first_pcm_chunk_ms < end_ms and chunk_count > 0
    return SegmentResult(
        segment_id,
        text,
        audio,
        start_ms,
        end_ms,
        round(end_ms - start_ms, 3),
        str(segment_path.relative_to(output)),
        duration,
        chunk_count,
        token_events,
        pcm_events,
        streaming_validity,
        first_speech_token_ms,
        first_pcm_chunk_ms,
        first_audio_chunk_sent_ms,
    )


def run_batch(output: Path, args: argparse.Namespace, stream_runtime: dict[str, Any] | None, run_id: str, batch_index: int, variant: str, sample: dict[str, Any], repeat_idx: int) -> dict[str, Any]:
    batch_id = f"batch_{batch_index:06d}"
    started_ns = time.monotonic_ns()
    local_started_at = iso_local()
    utc_started_at = iso_utc()
    trace = output / "logs" / "batch_event_trace.jsonl"
    segments = split_segments(sample["input_text"])
    hybrid = bool(VARIANTS[variant]["hybrid"])
    if hybrid and stream_runtime is None:
        raise ValueError(f"{variant} requires the BreezyVoice hybrid streaming runtime")
    hybrid_inputs = []
    if hybrid and stream_runtime is not None:
        hybrid_inputs = [hybrid_text(stream_runtime, text) for text in segments]
    append_jsonl(trace, trace_row(run_id, batch_id, variant, sample, repeat_idx, None, "batch_received", started_ns, {"char_count": len(sample["input_text"])}))
    results: list[SegmentResult] = []
    error = None
    status = "ok"
    try:
        if VARIANTS[variant]["parallel"]:
            max_workers = VARIANTS[variant]["batch_size"]
            with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as pool:
                futures = []
                for segment_id, text in enumerate(segments):
                    append_jsonl(trace, trace_row(run_id, batch_id, variant, sample, repeat_idx, segment_id, "segment_dispatch_start", started_ns, {"text": text, "char_count": len(text)}))
                    if hybrid and stream_runtime is not None:
                        _, bopomofo_text = hybrid_inputs[segment_id]
                        futures.append(pool.submit(run_hybrid_segment, output, args, stream_runtime, run_id, batch_id, variant, sample, repeat_idx, segment_id, text, bopomofo_text, started_ns))
                    else:
                        futures.append(pool.submit(run_segment, output, args, run_id, batch_id, variant, sample, repeat_idx, segment_id, text, started_ns))
                all_dispatched_ms = round((time.monotonic_ns() - started_ns) / 1_000_000, 3)
                for future in concurrent.futures.as_completed(futures):
                    results.append(future.result())
        else:
            all_dispatched_ms = None
            for segment_id, text in enumerate(segments):
                append_jsonl(trace, trace_row(run_id, batch_id, variant, sample, repeat_idx, segment_id, "segment_dispatch_start", started_ns, {"text": text, "char_count": len(text)}))
                all_dispatched_ms = round((time.monotonic_ns() - started_ns) / 1_000_000, 3)
                results.append(run_segment(output, args, run_id, batch_id, variant, sample, repeat_idx, segment_id, text, started_ns))
    except (urllib.error.URLError, TimeoutError, OSError, RuntimeError, ValueError) as exc:
        status = "failed"
        error = repr(exc)
        append_jsonl(output / "logs" / "error_log.jsonl", {"run_id": run_id, "batch_id": batch_id, "variant": variant, "sample_id": sample["sample_id"], "error": error})

    results = sorted(results, key=lambda result: result.segment_id)
    reconstruction_path = None
    reconstructed_audio_ready_ms = None
    if results and status == "ok":
        append_jsonl(trace, trace_row(run_id, batch_id, variant, sample, repeat_idx, None, "ordered_reconstruction_start", started_ns))
        reconstruction_path = save_reconstructed(output, variant, sample["sample_id"], repeat_idx, [result.audio for result in results])
        reconstructed_audio_ready_ms = round((time.monotonic_ns() - started_ns) / 1_000_000, 3)
        append_jsonl(trace, trace_row(run_id, batch_id, variant, sample, repeat_idx, None, "ordered_reconstruction_end", started_ns, {"audio_duration_sec": wav_duration_sec(reconstruction_path), "bytes": reconstruction_path.stat().st_size}))

    total_wall_ms = round((time.monotonic_ns() - started_ns) / 1_000_000, 3)
    batch_runtime_mode, overlap_ratio = runtime_mode_for(variant, results, total_wall_ms)
    proof_results = sorted(results, key=lambda result: result.segment_id)[: VARIANTS[variant]["batch_size"]]
    if status == "ok" and batch_runtime_mode == "serial_fallback" and VARIANTS[variant]["parallel"]:
        status = "invalid_parallel_runtime"
    streaming_validity = all(result.streaming_validity is True for result in results) if hybrid else None
    if status == "ok" and hybrid and not streaming_validity:
        status = "invalid_hybrid_streaming"
    append_jsonl(trace, trace_row(run_id, batch_id, variant, sample, repeat_idx, None, "batch_end", started_ns, {"bytes": reconstruction_path.stat().st_size if reconstruction_path else None}))
    sum_segment_ms = round(sum(result.duration_ms for result in results), 3)
    first_ready = min((result.end_ms for result in results), default=None)
    segment0 = next((result for result in results if result.segment_id == 0), None)
    return {
        "schema_version": "tts-parallel-batch-summary-v1",
        "run_id": run_id,
        "batch_id": batch_id,
        "local_started_at": local_started_at,
        "utc_started_at": utc_started_at,
        "local_ended_at": iso_local(),
        "utc_ended_at": iso_utc(),
        "variant": variant,
        "batch_size": VARIANTS[variant]["batch_size"],
        "batch_runtime_mode": batch_runtime_mode,
        "sample_id": sample["sample_id"],
        "repeat_idx": repeat_idx,
        "segment_count": len(segments),
        "hybrid_streaming": hybrid,
        "streaming_validity": streaming_validity,
        "token_event_count": sum(result.token_event_count for result in results),
        "pcm_event_count": sum(result.pcm_event_count for result in results),
        "chunk_count": sum(result.chunk_count for result in results),
        "first_speech_token_ms": min((result.first_speech_token_ms for result in results if result.first_speech_token_ms is not None), default=None),
        "first_pcm_chunk_ms": min((result.first_pcm_chunk_ms for result in results if result.first_pcm_chunk_ms is not None), default=None),
        "first_audio_chunk_sent_ms": min((result.first_audio_chunk_sent_ms for result in results if result.first_audio_chunk_sent_ms is not None), default=None),
        "segment_ids": [result.segment_id for result in results],
        "all_segments_dispatched_ms": all_dispatched_ms,
        "first_segment_audio_ready_ms": first_ready,
        "first_ordered_audio_ready_ms": segment0.end_ms if segment0 else None,
        "last_segment_audio_ready_ms": max((result.end_ms for result in results), default=None),
        "reconstructed_audio_ready_ms": reconstructed_audio_ready_ms,
        "total_wall_time_ms": total_wall_ms,
        "sum_segment_synthesis_ms": sum_segment_ms,
        "max_segment_synthesis_ms": max((result.duration_ms for result in results), default=None),
        "parallel_speedup_vs_serial": None,
        "overlap_ratio": overlap_ratio,
        "dispatch_window_ms": dispatch_window_ms(proof_results),
        "all_segment_start_window_ms": dispatch_window_ms(results),
        "segment_audio_paths": [result.audio_path for result in results],
        "reconstructed_audio_path": str(reconstruction_path.relative_to(output)) if reconstruction_path else None,
        "reconstructed_audio_duration_sec": wav_duration_sec(reconstruction_path) if reconstruction_path else None,
        "gpu_memory_peak_mb": None,
        "gpu_util_mean": None,
        "status": status,
        "error": error,
    }


def fill_speedups(rows: list[dict[str, Any]]) -> None:
    baselines = {
        (row["sample_id"], row["repeat_idx"]): row["total_wall_time_ms"]
        for row in rows
        if row["variant"] == "S_serial_segment_baseline" and row["status"] == "ok"
    }
    for row in rows:
        baseline = baselines.get((row["sample_id"], row["repeat_idx"]))
        if baseline and row["total_wall_time_ms"]:
            row["parallel_speedup_vs_serial"] = round(baseline / row["total_wall_time_ms"], 3)


def pct(values: list[float], p: int) -> float | None:
    if not values:
        return None
    ordered = sorted(values)
    index = min(len(ordered) - 1, max(0, round((p / 100) * (len(ordered) - 1))))
    return round(ordered[index], 3)


def table(headers: list[str], rows: list[list[Any]]) -> str:
    lines = ["| " + " | ".join(headers) + " |", "| " + " | ".join("---" for _ in headers) + " |"]
    lines.extend("| " + " | ".join("" if item is None else str(item) for item in row) + " |" for row in rows)
    return "\n".join(lines)


def write_reports(output: Path, run_id: str, rows: list[dict[str, Any]], mode: str, commands: list[str]) -> str:
    reports = output / "reports"
    reports.mkdir(parents=True, exist_ok=True)
    validity_rows = []
    latency_rows = []
    failure_rows = []
    has_parallel_runtime = False
    for variant in VARIANTS:
        selected = [row for row in rows if row["variant"] == variant]
        if not selected:
            continue
        modes = sorted({row["batch_runtime_mode"] for row in selected})
        ok = [row for row in selected if row["status"] == "ok"]
        reconstructed = sum(1 for row in selected if row.get("reconstructed_audio_path"))
        hybrid = bool(VARIANTS[variant]["hybrid"])
        valid = (
            bool(ok)
            and all(row["batch_runtime_mode"] in {"serial_baseline", "true_parallel_workers", "true_parallel_dispatch_low_overlap"} for row in selected)
            and (not hybrid or all(row.get("streaming_validity") is True and row.get("pcm_event_count", 0) > 0 for row in selected))
        )
        if any(row["batch_runtime_mode"] in {"true_parallel_workers", "true_parallel_dispatch_low_overlap"} for row in selected):
            has_parallel_runtime = True
        validity_rows.append([variant, len(selected), len(ok), reconstructed, ",".join(modes), valid])
        latency_rows.append([
            variant,
            pct([row["first_ordered_audio_ready_ms"] for row in ok if row["first_ordered_audio_ready_ms"] is not None], 50),
            pct([row["first_ordered_audio_ready_ms"] for row in ok if row["first_ordered_audio_ready_ms"] is not None], 95),
            pct([row["total_wall_time_ms"] for row in ok], 50),
            pct([row["total_wall_time_ms"] for row in ok], 95),
            pct([row["overlap_ratio"] for row in ok], 50),
            pct([row["parallel_speedup_vs_serial"] for row in ok if row["parallel_speedup_vs_serial"] is not None], 50),
        ])
        failure_rows.append([variant, len(selected), len(ok), len(selected) - len(ok), sorted({row["error"] for row in selected if row.get("error")})])

    (reports / "parallel_runtime_validity_report.md").write_text("# Parallel Runtime Validity Report\n\n" + table(["Variant", "Rows", "OK", "Reconstructed WAV", "Runtime modes", "Valid"], validity_rows) + "\n", encoding="utf-8")
    (reports / "batch_latency_report.md").write_text("# Batch Latency Report\n\n" + table(["Variant", "First ordered p50", "First ordered p95", "Total p50", "Total p95", "Overlap p50", "Speedup p50"], latency_rows) + "\n", encoding="utf-8")
    (reports / "batch_failure_analysis.md").write_text("# Batch Failure Analysis\n\n" + table(["Variant", "Rows", "OK", "Failed", "Errors"], failure_rows) + "\n", encoding="utf-8")

    all_valid = all(row[-1] is True for row in validity_rows)
    minimum_done = mode == "minimum" and len(rows) >= 108 and has_parallel_runtime and all_valid
    status = "LIVE_BATCH_MINIMUM_COMPLETED" if minimum_done else ("TRUE_PARALLEL_RUNTIME_READY" if has_parallel_runtime and all_valid else "BLOCKED_UNRESOLVED")
    decision_name = "batch_final_decision.md" if status != "BLOCKED_UNRESOLVED" else "blocked_unresolved_report.md"
    (reports / decision_name).write_text(
        "# Batch Final Decision\n\n"
        + f"Status: `{status}`\n\n"
        + "## Validity\n\n"
        + table(["Variant", "Rows", "OK", "Reconstructed WAV", "Runtime modes", "Valid"], validity_rows)
        + "\n\n## Latency\n\n"
        + table(["Variant", "First ordered p50", "First ordered p95", "Total p50", "Total p95", "Overlap p50", "Speedup p50"], latency_rows)
        + "\n\n## Decision\n\nProduction default: `none`\n\nOperational fallback: `S_serial_segment_baseline`\n\nResearch candidate: `"
        + "`, `".join(row[0] for row in validity_rows if row[0] != "S_serial_segment_baseline")
        + "`\n",
        encoding="utf-8",
    )
    return status


def write_evidence(repo_root: Path, output: Path, run_id: str, rows: list[dict[str, Any]], status: str, commands: list[str]) -> None:
    path = output / "reports" / "generated_evidence_snapshot.md"
    variants = [variant for variant in VARIANTS if any(row["variant"] == variant for row in rows)]
    research_candidates = [variant for variant in variants if variant != "S_serial_segment_baseline"]
    hybrid_variants = [variant for variant in variants if VARIANTS[variant]["hybrid"]]
    hybrid_note = ""
    if hybrid_variants:
        hybrid_note = (
            " Hybrid variants use the strict BreezyVoice `D_hybrid` token/audio"
            " streaming runtime inside each parallel segment worker and require"
            " `first_speech_token`, `first_pcm_chunk`, and `pcm_chunk` events."
        )
    validity = table(
        ["Variant", "Rows", "Runtime modes", "Reconstructed WAV"],
        [
            [
                variant,
                len([row for row in rows if row["variant"] == variant]),
                ",".join(sorted({row["batch_runtime_mode"] for row in rows if row["variant"] == variant})),
                sum(1 for row in rows if row["variant"] == variant and row.get("reconstructed_audio_path")),
            ]
            for variant in VARIANTS
            if any(row["variant"] == variant for row in rows)
        ],
    )
    command_text = "\n".join(f"- `{command}`" for command in commands)
    path.write_text(
        "# BreezyVoice True Parallel Segment Batch Experiment Log\n\n"
        + "## Previous Harness Boundary\n\nThe previous batch run proved grouping and batch/per-item logging, but stayed `serial_fallback`. This log records the true parallel segment runtime probe/benchmark.\n\n"
        + "## New Implementation Approach\n\nLive segment requests are dispatched concurrently to the BreezyVoice OpenAI-compatible endpoint, each segment WAV is saved, and ordered reconstructed WAV is produced from real generated audio."
        + hybrid_note
        + "\n\n"
        + "## Files Changed\n\n- `apps/model-sidecars/tts-service/app.py`\n- `scripts/tts-benchmark/probe_true_parallel_batch_runtime.py`\n- `experiments/manifests/parallel_segment_tts_eval_manifest.jsonl`\n- `scripts/tts-benchmark/README.md`\n- `docs/source-index.md`\n\n"
        + f"## Run ID\n\n`{run_id}`\n\n"
        + f"## Final Status\n\n`{status}`\n\n"
        + "## Commands\n\n"
        + command_text
        + "\n\n## Artifact Paths\n\n"
        + f"- `{output.relative_to(repo_root)}`\n- `{output.relative_to(repo_root)}/logs/batch_request_summary.jsonl`\n- `{output.relative_to(repo_root)}/logs/batch_event_trace.jsonl`\n- `{output.relative_to(repo_root)}/reports/parallel_runtime_validity_report.md`\n\n"
        + "## Validity Table\n\n"
        + validity
        + "\n\n## Decision\n\nProduction default remains `none`. Operational fallback remains `S_serial_segment_baseline`. Research candidates: `"
        + "`, `".join(research_candidates)
        + "`. Candidate promotion requires latency hard gates and human audio seam review.\n",
        encoding="utf-8",
    )


def main() -> None:
    args = parse_args()
    repo_root = repo_root_from_script(Path(__file__))
    if args.mode == "probe":
        samples = PROBE_SAMPLES
        variants = ["P2_parallel_segment_batch2", "P3_parallel_segment_batch3"]
        default_output = f"experiments/{time.strftime('%Y%m%d_%H%M%S')}_true_parallel_segment_batch_probe"
    else:
        samples = read_jsonl(repo_root / args.manifest)
        variants = ["S_serial_segment_baseline", "P2_parallel_segment_batch2", "P3_parallel_segment_batch3"]
        default_output = "experiments/true_parallel_segment_batch_minimum"
    if args.limit:
        samples = samples[: args.limit]
    if args.variants:
        variants = [item.strip() for item in args.variants.split(",") if item.strip()]
    unknown = [variant for variant in variants if variant not in VARIANTS]
    if unknown:
        raise SystemExit(f"unknown variants: {', '.join(unknown)}")
    stream_runtime = load_hybrid_runtime(args) if any(VARIANTS[variant]["hybrid"] for variant in variants) else None

    output = repo_root / (args.output or default_output)
    output.mkdir(parents=True, exist_ok=True)
    for subdir in ["logs", "reports", "audio/segments", "audio/reconstructed"]:
        (output / subdir).mkdir(parents=True, exist_ok=True)
    for log_name in ["batch_event_trace.jsonl", "batch_request_summary.jsonl", "gpu_metrics.jsonl", "error_log.jsonl"]:
        (output / "logs" / log_name).write_text("", encoding="utf-8")

    run_id = output.name
    metadata = {
        "schema_version": "tts-parallel-batch-run-v1",
        "run_id": run_id,
        "mode": args.mode,
        "breezyvoice_base_url": args.breezyvoice_base_url,
        "repo_commit": run_command(["git", "rev-parse", "--short", "HEAD"], repo_root),
        "environment": collect_environment(repo_root),
        "local_started_at": iso_local(),
        "utc_started_at": iso_utc(),
        "variants": variants,
        "repeats": args.repeats,
        "seed": args.seed,
        "breezyvoice_root": args.breezyvoice_root,
        "breezyvoice_commit": run_command(["git", "rev-parse", "--short", "HEAD"], Path(args.breezyvoice_root)) if stream_runtime else None,
        "breezyvoice_branch": run_command(["git", "branch", "--show-current"], Path(args.breezyvoice_root)) if stream_runtime else None,
        "model_path": args.model_path,
        "token_hop_len": args.token_hop_len,
        "prompt_audio_hash": stream_runtime.get("prompt_audio_hash") if stream_runtime else None,
    }
    (output / "run_metadata.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    tasks = [(variant, sample, repeat_idx) for repeat_idx in range(args.repeats) for sample in samples for variant in variants]
    random.Random(args.seed).shuffle(tasks)
    rows = [run_batch(output, args, stream_runtime, run_id, index, variant, sample, repeat_idx) for index, (variant, sample, repeat_idx) in enumerate(tasks, start=1)]
    fill_speedups(rows)
    for row in rows:
        append_jsonl(output / "logs" / "batch_request_summary.jsonl", row)
        append_jsonl(output / "logs" / "gpu_metrics.jsonl", {"run_id": run_id, "batch_id": row["batch_id"], "variant": row["variant"], "gpu_available": bool(run_command(["nvidia-smi", "-L"], repo_root)), "t_wall": iso_local(), "status": row["status"]})
    status = write_reports(output, run_id, rows, args.mode, [])
    metadata["status"] = status
    metadata["local_ended_at"] = iso_local()
    metadata["utc_ended_at"] = iso_utc()
    (output / "run_metadata.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    write_evidence(repo_root, output, run_id, rows, status, ["python3 scripts/tts-benchmark/probe_true_parallel_batch_runtime.py " + " ".join(os.sys.argv[1:])])
    print(f"Status: {status}")
    print(f"Run ID: {run_id}")
    print(f"Output: {output.relative_to(repo_root)}")


if __name__ == "__main__":
    main()
