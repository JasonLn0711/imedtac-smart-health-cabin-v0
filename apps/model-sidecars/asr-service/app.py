import base64
import json
import logging
import os
import tempfile
import time
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        return json.dumps(
            {
                "level": record.levelname.lower(),
                "message": record.getMessage(),
                "provider": "faster_whisper_breeze_asr_26",
                "model_path": os.getenv("ASR_MODEL_PATH", "/models/breeze-asr-26-ct2-int8"),
                "mode": "live",
            },
            ensure_ascii=False,
        )


handler = logging.StreamHandler()
handler.setFormatter(JsonFormatter())
logger = logging.getLogger("asr-service")
logger.handlers = [handler]
logger.setLevel(logging.INFO)

app = FastAPI(title="Smart Health Cabin ASR Sidecar")
_model = None


class TranscribeRequest(BaseModel):
    audio_base64: str
    audio_format: str = "wav"
    language_hint: Optional[str] = "zh"
    turn_id: Optional[str] = None


def model_path() -> str:
    return os.getenv("ASR_MODEL_PATH", "/models/breeze-asr-26-ct2-int8")


def load_model():
    global _model
    if _model is not None:
        return _model
    path = model_path()
    if not Path(path).exists():
        raise HTTPException(status_code=503, detail=f"ASR_MODEL_PATH not found: {path}")
    try:
        from faster_whisper import WhisperModel
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"faster-whisper unavailable: {exc}") from exc
    _model = WhisperModel(
        path,
        device=os.getenv("ASR_DEVICE", "auto"),
        compute_type=os.getenv("ASR_COMPUTE_TYPE", "int8"),
    )
    return _model


@app.get("/healthz")
def healthz():
    return {
        "status": "ok",
        "provider": "faster_whisper_breeze_asr_26",
        "model_path": model_path(),
    }


@app.get("/readyz")
def readyz():
    ready = Path(model_path()).exists()
    return {"ready": ready, "model_path": model_path()}


@app.post("/v1/asr/transcribe")
def transcribe(request: TranscribeRequest):
    start = time.perf_counter()
    try:
        audio = base64.b64decode(request.audio_base64)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="audio_base64 is invalid") from exc

    suffix = f".{request.audio_format or 'wav'}"
    with tempfile.NamedTemporaryFile(suffix=suffix) as audio_file:
        audio_file.write(audio)
        audio_file.flush()
        segments, info = load_model().transcribe(audio_file.name, language=request.language_hint)
        text = "".join(segment.text for segment in segments).strip()

    latency_ms = int((time.perf_counter() - start) * 1000)
    logger.info(json.dumps({"latency_ms": latency_ms, "turn_id": request.turn_id, "error_code": None}))
    return {
        "transcript": text,
        "language": getattr(info, "language", request.language_hint),
        "confidence": 1.0,
        "duration_ms": latency_ms,
    }
