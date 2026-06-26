from __future__ import annotations

import base64
import hashlib
import json
import math
import os
import platform
import random
import re
import shutil
import statistics
import struct
import subprocess
import time
import urllib.error
import urllib.request
import wave
from dataclasses import dataclass
from datetime import datetime, timezone, timedelta
from io import BytesIO
from pathlib import Path
from typing import Any

LOCAL_TZ = timezone(timedelta(hours=8))
SAMPLE_RATE = 22050

VARIANTS: dict[str, dict[str, Any]] = {
    "A_original": {
        "display_name": "Original offline BreezyVoice",
        "segment_streaming": False,
        "token_streaming": False,
        "transport": "full_wav_http",
        "adapter": "BreezyVoiceOriginalAdapter",
        "quality_gate_profile": "baseline",
        "enabled": True,
        "complexity": "Low",
        "expected_role": "Baseline and fallback",
    },
    "B_segment": {
        "display_name": "Segment streaming",
        "segment_streaming": True,
        "token_streaming": False,
        "transport": "sequential_wav_http",
        "adapter": "BreezyVoiceSegmentAdapter",
        "quality_gate_profile": "mvp",
        "enabled": True,
        "complexity": "Low-Med",
        "expected_role": "MVP candidate",
    },
    "C_token": {
        "display_name": "Token/audio streaming",
        "segment_streaming": False,
        "token_streaming": True,
        "transport": "pcm16_ws",
        "adapter": "BreezyVoiceTokenStreamingAdapter",
        "quality_gate_profile": "research",
        "enabled": False,
        "disabled_reason": "Source-level blocker: local BreezyVoice returns full tokens, full mel, and full waveform only. Evidence: api.py:95-103 streams a completed WAV buffer; single_inference.py:192-215 returns only {'tts_speech'} after llm, flow, and hift complete; cosyvoice/llm/llm.py:191-206 appends tokens internally then returns one tensor; cosyvoice/flow/flow.py:100-141 returns one mel tensor; cosyvoice/hifigan/generator.py:390-391 returns one waveform tensor.",
        "next_patch": "Add an upstream experimental inference_stream path: yield speech tokens from LLM decode, add stable token-window Flow inference, add mel-window HiFiGAN overlap/crossfade, then expose an experiment-only sidecar endpoint.",
        "complexity": "High",
        "expected_role": "Research candidate",
    },
    "D_hybrid": {
        "display_name": "Hybrid segment + token/audio streaming",
        "segment_streaming": True,
        "token_streaming": True,
        "transport": "pcm16_ws",
        "adapter": "BreezyVoiceHybridStreamingAdapter",
        "quality_gate_profile": "future_product",
        "enabled": False,
        "disabled_reason": "Source-level blocker: D_hybrid depends on C_token. Segment scheduling exists in this benchmark, but local BreezyVoice has no real token/mel/PCM chunk API to run inside each segment.",
        "next_patch": "After C_token inference_stream exists, run that stream per segment and add a small ordered segment scheduler with cancellation and buffer accounting.",
        "complexity": "High",
        "expected_role": "Product candidate after C passes quality gates",
    },
}

DOMAIN_PROFILE_TEXT: dict[str, list[tuple[str, str, str, list[str]]]] = {
    "smart_cabin_measurement": [
        ("measurement_instruction", "請站上量測區，系統會依序協助量測身高、體重與 BMI。", "docs/voice-asr-safety-six-layer-pipeline.md", ["身高", "體重", "BMI"]),
        ("measurement_instruction", "請保持手臂穩定，血壓量測完成後會顯示收縮壓與舒張壓。", "docs/voice-asr-safety-six-layer-pipeline.md", ["血壓", "收縮壓", "舒張壓"]),
        ("measurement_instruction", "血氧與心率量測完成後，請依螢幕提示查看結果。", "docs/voice-asr-safety-six-layer-pipeline.md", ["血氧", "心率", "螢幕"]),
        ("measurement_instruction", "若量測數值不完整，可以重新量測，或請現場人員協助。", "docs/voice-asr-safety-six-layer-pipeline.md", ["重新量測", "現場人員"]),
        ("report_guidance", "報告完成後，可以掃描 QR code 查看本次健康篩檢摘要。", "docs/voice-asr-safety-six-layer-pipeline.md", ["QR code", "健康篩檢"]),
        ("measurement_instruction", "糖化血色素 HbA1c 6.5% 這類數字會保留原始單位，交由現場流程確認。", "docs/voice-asr-safety-six-layer-pipeline.md", ["HbA1c", "6.5%", "單位"]),
        ("measurement_instruction", "腰圍量測時請保持自然站姿，完成後系統會顯示本次量測資料。", "docs/voice-asr-safety-six-layer-pipeline.md", ["腰圍", "量測資料"]),
        ("measurement_instruction", "如果血壓 128/76 需要重新確認，請依螢幕提示重新量測。", "docs/voice-asr-safety-six-layer-pipeline.md", ["血壓", "128/76", "重新量測"]),
        ("report_guidance", "本次報告是健康篩檢摘要，後續可交由現場人員協助說明。", "docs/voice-asr-safety-six-layer-pipeline.md", ["健康篩檢", "現場人員"]),
        ("measurement_instruction", "請確認手指已放穩，血氧數值穩定後再進入下一步。", "docs/voice-asr-safety-six-layer-pipeline.md", ["血氧", "下一步"]),
    ],
    "kiosk_faq": [
        ("kiosk_faq_answer", "您可以直接用螢幕點選答案，也可以重新錄音一次。", "packages/voice-safety-core/domain-packs/kiosk_faq.json", ["螢幕", "重新錄音"]),
        ("kiosk_faq_answer", "如果不想使用語音，可以全程用觸控完成問卷。", "packages/voice-safety-core/domain-packs/kiosk_faq.json", ["觸控", "問卷"]),
        ("kiosk_faq_answer", "需要協助時，請按找工作人員，現場人員會協助您完成流程。", "packages/voice-safety-core/domain-packs/kiosk_faq.json", ["工作人員"]),
        ("kiosk_faq_answer", "我可以再重複題目，也可以說明這一題的填答方式。", "packages/voice-safety-core/domain-packs/kiosk_faq.json", ["重複題目", "填答"]),
        ("privacy_guidance", "語音只用於本次互動判讀，預設不保留原始錄音。", "packages/voice-safety-core/domain-packs/kiosk_faq.json", ["語音", "錄音"]),
    ],
    "vision_screening_phase2": [
        ("vision_prompt", "接下來請遮住左眼，依螢幕指示回答右眼裸眼視力。", "packages/voice-safety-core/domain-packs/vision_screening_phase2.json", ["左眼", "右眼", "裸眼視力"]),
        ("vision_prompt", "如果看不清楚，可以重新測量，或請現場人員協助。", "packages/voice-safety-core/domain-packs/vision_screening_phase2.json", ["看不清楚", "重新測量"]),
    ],
    "hearing_screening_phase2": [
        ("hearing_prompt", "接下來會測試右耳，聽到聲音時請回答聽得到。", "packages/voice-safety-core/domain-packs/hearing_screening_phase2.json", ["右耳", "聽得到"]),
        ("hearing_prompt", "如果環境噪音太大，可以重新測量或請工作人員協助。", "packages/voice-safety-core/domain-packs/hearing_screening_phase2.json", ["環境噪音", "重新測量"]),
    ],
}

TAIWAN_STRESS_TEXTS: list[tuple[str, str, str, list[str]]] = [
    ("taiwan_terms", "螢幕上的資料與品質檢查都完成後，請看下一題。", "docs/prompts/breezyvoice-streaming-2x2-factorial-experiment-codex-goal-prompt.md", ["螢幕", "資料", "品質"]),
    ("numbers_units", "今天是 2026 年 6 月 26 日，血壓 128/76，心率 82，血氧 97%。", "docs/prompts/breezyvoice-streaming-2x2-factorial-experiment-codex-goal-prompt.md", ["2026", "128/76", "97%"]),
    ("code_switching", "ASR、LLM、TTS、API、GPU 與 Redpanda 都是本機服務。", "docs/prompts/breezyvoice-streaming-2x2-factorial-experiment-codex-goal-prompt.md", ["ASR", "LLM", "TTS", "API", "GPU"]),
    ("polyphone", "請重新錄音，這樣也可以；我會接著說明下一題。", "docs/prompts/breezyvoice-streaming-2x2-factorial-experiment-codex-goal-prompt.md", ["重新錄音", "這樣", "我會"]),
    ("long_no_period", "如果剛剛的語音沒有被清楚辨識您可以直接用螢幕點選答案也可以按重新錄音讓系統再聽一次", "docs/prompts/breezyvoice-streaming-2x2-factorial-experiment-codex-goal-prompt.md", ["螢幕", "重新錄音"]),
    ("punctuation", "身分證字號、健保卡、QR Code、Wi-Fi、HbA1c 6.5% 與尿蛋白陰性，請依現場流程確認。", "docs/prompts/breezyvoice-streaming-2x2-factorial-experiment-codex-goal-prompt.md", ["QR Code", "Wi-Fi", "HbA1c"]),
]


@dataclass
class ClockEvent:
    event: str
    monotonic_ns: int
    local: str
    utc: str


def repo_root_from_script(path: Path) -> Path:
    return path.resolve().parents[2]


def local_now() -> datetime:
    return datetime.now(LOCAL_TZ)


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def iso_local(dt: datetime | None = None) -> str:
    return (dt or local_now()).isoformat(timespec="milliseconds")


def iso_utc(dt: datetime | None = None) -> str:
    return (dt or utc_now()).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def clock_event(event: str) -> ClockEvent:
    return ClockEvent(event, time.monotonic_ns(), iso_local(), iso_utc())


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")


def append_jsonl(path: Path, row: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    if not path.exists():
        return rows
    with path.open(encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


def slug(value: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9_一-龥]+", "_", value).strip("_")
    return cleaned[:80] or hashlib.sha1(value.encode("utf-8")).hexdigest()[:12]


def length_bucket(text: str) -> str:
    count = len(text)
    if count <= 15:
        return "short_5_15_chars"
    if count <= 50:
        return "medium_16_50_chars"
    if count <= 120:
        return "long_51_120_chars"
    if count <= 300:
        return "multi_sentence_121_300_chars"
    return "extra_long_300_600_chars"


def numbers_in(text: str) -> list[str]:
    return re.findall(r"\d+(?:[./]\d+)?%?", text)


def code_terms_in(text: str) -> list[str]:
    terms = ["ASR", "LLM", "TTS", "PHQ-9", "API", "GPU", "Redpanda", "QR Code", "Wi-Fi", "HbA1c"]
    return [term for term in terms if term in text]


def load_phq9_rows(repo_root: Path) -> list[tuple[str, str, str, list[str]]]:
    survey_path = repo_root / "modules/questionnaire/seed/phq9.zh-TW.surveyjs.json"
    survey = json.loads(survey_path.read_text(encoding="utf-8"))
    rows: list[tuple[str, str, str, list[str]]] = [
        ("questionnaire_explanation", survey["description"], str(survey_path.relative_to(repo_root)), ["過去兩個星期", "健康自我檢測"]),
        ("touch_fallback_guidance", "這題也可以直接用螢幕點選答案。", str(survey_path.relative_to(repo_root)), ["螢幕", "答案"]),
        ("recording_retry_guidance", "我不太確定剛剛的回答，請重新說一次，或直接用螢幕選擇。", str(survey_path.relative_to(repo_root)), ["重新說一次", "螢幕"]),
    ]
    choices = survey["pages"][0]["elements"][0]["choices"]
    for index, question in enumerate(survey["pages"][0]["elements"], start=1):
        rows.append(
            (
                "question_text",
                f"接下來是第 {index} 題。最近兩週，{question['title']}？",
                str(survey_path.relative_to(repo_root)),
                ["最近兩週", question["title"]],
            )
        )
        answer = choices[(index - 1) % len(choices)]["text"]
        rows.append(
            (
                "answer_acknowledgement",
                f"我剛剛聽到您說「{answer}」。接下來請回答下一題。",
                str(survey_path.relative_to(repo_root)),
                [answer, "下一題"],
            )
        )
    rows.append(
        (
            "staff_review_workflow_guidance",
            "這一題的內容會交由現場人員協助確認，問卷可以先停在目前題目。",
            str(survey_path.relative_to(repo_root)),
            ["現場人員", "目前題目"],
        )
    )
    rows.append(
        (
            "next_question_guidance",
            "上一題已完成，接下來請用語音或螢幕回答下一題。",
            str(survey_path.relative_to(repo_root)),
            ["語音", "螢幕", "下一題"],
        )
    )
    return rows


def manifest_row(sample_id: str, domain_id: str, category: str, text: str, source_file: str, keywords: list[str]) -> dict[str, Any]:
    return {
        "schema_version": "tts-eval-manifest-v1",
        "sample_id": sample_id,
        "domain_id": domain_id,
        "category": category,
        "length_bucket": length_bucket(text),
        "input_text": text,
        "expected_keywords": keywords,
        "expected_numbers": numbers_in(text),
        "expected_code_switching_terms": code_terms_in(text),
        "expected_polyphones": [],
        "manual_bopomofo_text": None,
        "source_file": source_file,
        "synthetic": True,
        "phi_status": "synthetic_non_phi",
    }


def build_tts_manifest(repo_root: Path, domain_profiles: list[str]) -> list[dict[str, Any]]:
    requested = set(domain_profiles)
    rows: list[dict[str, Any]] = []
    if "phq9_zh_tw" in requested:
        for i, (category, text, source, keywords) in enumerate(load_phq9_rows(repo_root), start=1):
            rows.append(manifest_row(f"phq9_zh_tw_{i:03d}", "phq9_zh_tw", category, text, source, keywords))

    for domain_id in sorted(requested):
        for i, (category, text, source, keywords) in enumerate(DOMAIN_PROFILE_TEXT.get(domain_id, []), start=1):
            rows.append(manifest_row(f"{domain_id}_{i:03d}", domain_id, category, text, source, keywords))

    for i, (category, text, source, keywords) in enumerate(TAIWAN_STRESS_TEXTS, start=1):
        rows.append(manifest_row(f"taiwan_zh_tw_stress_{i:03d}", "taiwan_zh_tw_stress", category, text, source, keywords))
    return rows


def build_dialogue_manifest() -> list[dict[str, Any]]:
    turns = [
        ("phq9_001", 1, "phq9_zh_tw", "", "您好，我是慧誠智醫健康互動助理。接下來請回答第一題。", "PHQ9_Q1"),
        ("phq9_001", 2, "phq9_zh_tw", "有幾天", "我剛剛聽到您說「幾天」。接下來請回答第二題。", "PHQ9_Q2"),
        ("measurement_001", 1, "smart_cabin_measurement", "", "請站上量測區，系統會協助量測身高與體重。", "MEASUREMENT_START"),
        ("kiosk_faq_001", 1, "kiosk_faq", "請再說一次", "我可以再重複題目，也可以讓您改用螢幕點選。", "REPEAT_OR_TOUCH"),
    ]
    return [
        {
            "schema_version": "dialogue-manifest-v1",
            "dialogue_id": dialogue_id,
            "turn_id": turn_id,
            "domain_id": domain_id,
            "user_asr_text": asr_text,
            "llm_output_text": output_text,
            "expected_tts_text": output_text,
            "expected_state": state,
        }
        for dialogue_id, turn_id, domain_id, asr_text, output_text, state in turns
    ]


def build_human_eval_manifest(tts_rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    pairs = [("A_original", "B_segment"), ("A_original", "C_token"), ("A_original", "D_hybrid"), ("B_segment", "D_hybrid"), ("C_token", "D_hybrid")]
    sample_ids = [row["sample_id"] for row in tts_rows[:8]]
    rows = []
    for i, sample_id in enumerate(sample_ids, start=1):
        left, right = pairs[(i - 1) % len(pairs)]
        rows.append(
            {
                "schema_version": "human-eval-manifest-v1",
                "packet_id": f"human_eval_{i:03d}",
                "sample_id": sample_id,
                "variant_pair": [left, right],
                "ratings": [
                    "naturalness_mos_1_5",
                    "taiwan_mandarin_naturalness_1_5",
                    "pronunciation_clarity_1_5",
                    "code_switching_clarity_1_5",
                    "seam_artifact_yes_no",
                    "kiosk_acceptability_yes_no",
                ],
            }
        )
    return rows


def split_segments(text: str, max_chars: int = 40, min_chars: int = 8) -> list[str]:
    parts = [part.strip() for part in re.split(r"(?<=[。！？；?!])\s*", text) if part.strip()]
    segments: list[str] = []
    for part in parts or [text]:
        if len(part) <= max_chars:
            segments.append(part)
            continue
        current = ""
        for token in re.split(r"([，、,])", part):
            if not token:
                continue
            if len(current) >= min_chars and len(current) + len(token) > max_chars:
                segments.append(current)
                current = token if token not in "，、," else ""
            else:
                current += token
        if current.strip():
            segments.append(current.strip())
    return [segment for segment in segments if segment]


def deterministic_wav_bytes(text: str, duration_ms: int | None = None) -> bytes:
    duration_ms = duration_ms or max(320, min(12000, 220 + len(text) * 70))
    frames = int(SAMPLE_RATE * duration_ms / 1000)
    seed = int(hashlib.sha1(text.encode("utf-8")).hexdigest()[:8], 16)
    freq = 180 + seed % 220
    audio = BytesIO()
    with wave.open(audio, "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(SAMPLE_RATE)
        for i in range(frames):
            amp = int(1800 * math.sin(2 * math.pi * freq * (i / SAMPLE_RATE)))
            wav.writeframesraw(struct.pack("<h", amp))
    return audio.getvalue()


def concat_wavs(chunks: list[bytes]) -> bytes:
    frames = bytearray()
    params = None
    for chunk in chunks:
        with wave.open(BytesIO(chunk), "rb") as wav:
            if params is None:
                params = wav.getparams()
            frames.extend(wav.readframes(wav.getnframes()))
    if params is None:
        return deterministic_wav_bytes("")
    out = BytesIO()
    with wave.open(out, "wb") as wav:
        wav.setparams(params)
        wav.writeframes(bytes(frames))
    return out.getvalue()


def audio_metrics(audio_path: Path) -> dict[str, Any]:
    try:
        with wave.open(str(audio_path), "rb") as wav:
            frames = wav.readframes(wav.getnframes())
            width = wav.getsampwidth()
            rate = wav.getframerate()
            frame_count = wav.getnframes()
        if width != 2 or not frames:
            return {"sample_rate": rate, "duration_sec": frame_count / rate if rate else 0, "rms": 0, "peak": 0, "clipping_ratio": 0}
        samples = struct.unpack(f"<{len(frames) // 2}h", frames)
        peak = max(abs(sample) for sample in samples) if samples else 0
        rms = math.sqrt(sum(sample * sample for sample in samples) / len(samples)) if samples else 0
        clipping = sum(1 for sample in samples if abs(sample) >= 32760) / len(samples) if samples else 0
        silence = sum(1 for sample in samples if abs(sample) < 64) / len(samples) if samples else 0
        return {
            "sample_rate": rate,
            "duration_sec": round(frame_count / rate, 3) if rate else 0,
            "rms": round(rms, 3),
            "peak": peak,
            "clipping_ratio": round(clipping, 6),
            "silence_ratio": round(silence, 6),
            "leading_silence_ms": 0,
            "trailing_silence_ms": 0,
        }
    except (wave.Error, OSError):
        return {"sample_rate": None, "duration_sec": 0, "rms": 0, "peak": 0, "clipping_ratio": 0, "silence_ratio": 1}


def call_tts_sidecar(text: str, timeout_sec: int = 60) -> bytes:
    base_url = os.getenv("TTS_SERVICE_URL", "http://localhost:8012").rstrip("/")
    path = os.getenv("TTS_SYNTHESIZE_PATH", "/v1/tts/synthesize")
    payload = json.dumps({"text": text, "voice_id": "default", "response_format": "wav"}).encode("utf-8")
    request = urllib.request.Request(
        f"{base_url}{path}",
        data=payload,
        headers={"content-type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=timeout_sec) as response:
        body = json.loads(response.read().decode("utf-8"))
    return base64.b64decode(body["audio_base64"])


def command_text(args: list[str]) -> str:
    return " ".join(args)


def run_command(cmd: list[str], cwd: Path) -> str | None:
    try:
        return subprocess.check_output(cmd, cwd=str(cwd), stderr=subprocess.DEVNULL, text=True, timeout=5).strip()
    except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired):
        return None


def collect_environment(repo_root: Path) -> dict[str, Any]:
    branch = run_command(["git", "branch", "--show-current"], repo_root)
    commit = run_command(["git", "rev-parse", "--short", "HEAD"], repo_root)
    status = run_command(["git", "status", "--short"], repo_root)
    mem_gb = None
    try:
        meminfo = Path("/proc/meminfo").read_text(encoding="utf-8")
        match = re.search(r"MemTotal:\s+(\d+)", meminfo)
        if match:
            mem_gb = round(int(match.group(1)) / 1024 / 1024, 1)
    except OSError:
        pass
    gpu_query = run_command(
        [
            "nvidia-smi",
            "--query-gpu=name,driver_version,memory.total,temperature.gpu,power.draw,utilization.gpu",
            "--format=csv,noheader,nounits",
        ],
        repo_root,
    )
    gpu = {"available": bool(gpu_query)}
    if gpu_query:
        first = gpu_query.splitlines()[0].split(", ")
        if len(first) >= 6:
            gpu.update(
                {
                    "name": first[0],
                    "driver": first[1],
                    "memory_total_mb": first[2],
                    "temperature_start_c": first[3],
                    "power_draw_w": first[4],
                    "utilization_gpu_percent": first[5],
                }
            )
    return {
        "schema_version": "tts-environment-v1",
        "local_started_at": iso_local(),
        "utc_started_at": iso_utc(),
        "repo": {
            "path": str(repo_root),
            "branch": branch,
            "commit": commit,
            "worktree_status": "clean" if not status else "dirty_with_local_changes",
        },
        "machine": {
            "os": platform.platform(),
            "kernel": platform.release(),
            "cpu": platform.processor() or run_command(["sh", "-c", "lscpu | sed -n 's/^Model name:\\s*//p' | head -1"], repo_root),
            "ram_gb": mem_gb,
            "python": platform.python_version(),
        },
        "gpu": gpu,
        "models": {
            "breezyvoice_model": os.getenv("BREEZYVOICE_MODEL", "MediaTek-Research/BreezyVoice"),
            "breezyvoice_base_url": os.getenv("BREEZYVOICE_BASE_URL", "http://localhost:9003/v1"),
            "speaker_profile_id": "default",
        },
        "services": {
            "tts_sidecar_url": os.getenv("TTS_SERVICE_URL", "http://localhost:8012"),
            "tts_synthesize_path": os.getenv("TTS_SYNTHESIZE_PATH", "/v1/tts/synthesize"),
            "api_server_url": os.getenv("API_BASE_URL", "http://localhost:3000"),
            "ports_snapshot": run_command(
                [
                    "sh",
                    "-c",
                    "ss -ltnp 2>/dev/null | grep -E ':(3000|3010|3011|8012|9003|11434)\\b' || true",
                ],
                repo_root,
            ),
            "process_snapshot": run_command(
                [
                    "sh",
                    "-c",
                    "ps -eo pid,comm,args | grep -E 'BreezyVoice|tts-service|api-server|voice-agent|ollama' | grep -v grep | head -20 || true",
                ],
                repo_root,
            ),
            "log_paths": [],
        },
    }


def yaml_scalar(value: Any, indent: int = 0) -> str:
    prefix = " " * indent
    if isinstance(value, dict):
        lines: list[str] = []
        for key, child in value.items():
            if isinstance(child, dict):
                lines.append(f"{prefix}{key}:")
                lines.append(yaml_scalar(child, indent + 2))
            else:
                lines.append(f"{prefix}{key}: {json.dumps(child, ensure_ascii=False)}")
        return "\n".join(lines)
    return f"{prefix}{json.dumps(value, ensure_ascii=False)}"


def write_yaml(path: Path, data: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(yaml_scalar(data) + "\n", encoding="utf-8")


def percentile(values: list[float], pct: float) -> float | None:
    if not values:
        return None
    ordered = sorted(values)
    index = min(len(ordered) - 1, max(0, math.ceil((pct / 100) * len(ordered)) - 1))
    return ordered[index]


def summarize(values: list[float]) -> dict[str, float | None]:
    if not values:
        return {"mean": None, "median": None, "p50": None, "p90": None, "p95": None, "p99": None, "stdev": None}
    return {
        "mean": round(statistics.mean(values), 3),
        "median": round(statistics.median(values), 3),
        "p50": round(percentile(values, 50) or 0, 3),
        "p90": round(percentile(values, 90) or 0, 3),
        "p95": round(percentile(values, 95) or 0, 3),
        "p99": round(percentile(values, 99) or 0, 3),
        "stdev": round(statistics.stdev(values), 3) if len(values) > 1 else 0,
    }


def stable_run_id(output: Path) -> str:
    if output.name:
        return output.name
    return f"{local_now().strftime('%Y%m%d_%H%M%S')}_breezyvoice_streaming_matrix"


def shuffle_tasks(tasks: list[dict[str, Any]], enabled: bool, seed: str) -> list[dict[str, Any]]:
    if not enabled:
        return tasks
    copied = list(tasks)
    random.Random(seed).shuffle(copied)
    return copied
