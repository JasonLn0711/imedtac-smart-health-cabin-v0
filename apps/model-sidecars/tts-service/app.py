import base64
import concurrent.futures
import json
import logging
import os
import time
import urllib.error
import urllib.request
import wave
from io import BytesIO
from typing import Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        return json.dumps(
            {
                "level": record.levelname.lower(),
                "message": record.getMessage(),
                "provider": "breezyvoice_default",
                "model_path": os.getenv("TTS_MODEL_PATH", "/models/breezyvoice"),
                "mode": "live",
            },
            ensure_ascii=False,
        )


handler = logging.StreamHandler()
handler.setFormatter(JsonFormatter())
logger = logging.getLogger("tts-service")
logger.handlers = [handler]
logger.setLevel(logging.INFO)

app = FastAPI(title="Smart Health Cabin TTS Sidecar")


class SynthesizeRequest(BaseModel):
    text: str
    voice_id: Optional[str] = "default"
    response_format: str = "wav"

    class Config:
        extra = "forbid"


class BatchSegmentRequest(BaseModel):
    segment_id: int
    text: str
    priority: Optional[str] = "normal"


class BatchSynthesizeRequest(BaseModel):
    request_id: str
    batch_runtime_mode: str = "true_parallel_workers"
    ordered_playback: bool = True
    segments: list[BatchSegmentRequest]
    speaker_profile_id: str = "default"
    variant: str = "P2_parallel_segment_batch2"
    response_format: str = "wav"

    class Config:
        extra = "forbid"


def upstream_base_url() -> str:
    return os.getenv("BREEZYVOICE_BASE_URL", "")


def synthesize_upstream(text: str, response_format: str = "wav") -> tuple[bytes, int]:
    start = time.perf_counter()
    payload = json.dumps(
        {
            "model": os.getenv("BREEZYVOICE_MODEL", "MediaTek-Research/BreezyVoice"),
            "voice": "default",
            "input": text,
            "response_format": response_format,
            "speed": 1,
        }
    ).encode("utf-8")
    http_request = urllib.request.Request(
        f"{upstream_base_url().rstrip('/')}/audio/speech",
        data=payload,
        headers={"content-type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(http_request, timeout=30) as response:
        audio = response.read()
    return audio, int((time.perf_counter() - start) * 1000)


def concat_wavs(chunks: list[bytes]) -> bytes:
    params = None
    frames = bytearray()
    for chunk in chunks:
        with wave.open(BytesIO(chunk), "rb") as wav:
            params = params or wav.getparams()
            frames.extend(wav.readframes(wav.getnframes()))
    out = BytesIO()
    with wave.open(out, "wb") as wav:
        wav.setparams(params)
        wav.writeframes(bytes(frames))
    return out.getvalue()


@app.get("/healthz")
def healthz():
    return {
        "status": "ok",
        "provider": "breezyvoice_default",
        "upstream_configured": bool(upstream_base_url()),
    }


@app.get("/readyz")
def readyz():
    return {"ready": bool(upstream_base_url())}


@app.post("/v1/tts/synthesize")
def synthesize(request: SynthesizeRequest):
    if request.voice_id != "default":
        raise HTTPException(status_code=400, detail="Only BreezyVoice default voice is accepted")
    if not upstream_base_url():
        raise HTTPException(status_code=503, detail="BREEZYVOICE_BASE_URL is not configured")

    try:
        audio, latency_ms = synthesize_upstream(request.text, request.response_format)
    except urllib.error.URLError as exc:
        raise HTTPException(status_code=503, detail=f"BreezyVoice upstream unavailable: {exc}") from exc

    logger.info(json.dumps({"latency_ms": latency_ms, "error_code": None}))
    return {"audio_base64": base64.b64encode(audio).decode("ascii"), "mime_type": "audio/wav"}


@app.post("/v1/tts/synthesize-batch")
def synthesize_batch(request: BatchSynthesizeRequest):
    if request.speaker_profile_id != "default":
        raise HTTPException(status_code=400, detail="Only BreezyVoice default voice is accepted")
    if not request.segments:
        raise HTTPException(status_code=400, detail="segments must not be empty")
    if not upstream_base_url():
        raise HTTPException(status_code=503, detail="BREEZYVOICE_BASE_URL is not configured")

    batch_start = time.perf_counter()

    def run_segment(segment: BatchSegmentRequest):
        started = time.perf_counter()
        audio, latency_ms = synthesize_upstream(segment.text, request.response_format)
        ended = time.perf_counter()
        return {
            "segment_id": segment.segment_id,
            "text": segment.text,
            "audio_base64": base64.b64encode(audio).decode("ascii"),
            "mime_type": "audio/wav",
            "started_ms": round((started - batch_start) * 1000, 3),
            "ended_ms": round((ended - batch_start) * 1000, 3),
            "latency_ms": latency_ms,
            "bytes": len(audio),
        }

    with concurrent.futures.ThreadPoolExecutor(max_workers=len(request.segments)) as pool:
        segment_rows = list(pool.map(run_segment, request.segments))

    ordered = sorted(segment_rows, key=lambda row: row["segment_id"])
    reconstructed = concat_wavs([base64.b64decode(row["audio_base64"]) for row in ordered])
    return {
        "request_id": request.request_id,
        "batch_runtime_mode": "true_parallel_workers",
        "ordered_playback": request.ordered_playback,
        "variant": request.variant,
        "total_wall_time_ms": round((time.perf_counter() - batch_start) * 1000, 3),
        "segments": ordered,
        "reconstructed_audio_base64": base64.b64encode(reconstructed).decode("ascii"),
        "mime_type": "audio/wav",
    }
