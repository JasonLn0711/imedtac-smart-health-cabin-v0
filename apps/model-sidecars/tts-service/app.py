import base64
import json
import logging
import os
import time
import urllib.error
import urllib.request
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


def upstream_base_url() -> str:
    return os.getenv("BREEZYVOICE_BASE_URL", "")


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

    start = time.perf_counter()
    payload = json.dumps(
        {
            "model": os.getenv("BREEZYVOICE_MODEL", "MediaTek-Research/BreezyVoice"),
            "voice": "default",
            "input": request.text,
            "response_format": request.response_format,
            "speed": 1,
        }
    ).encode("utf-8")
    http_request = urllib.request.Request(
        f"{upstream_base_url().rstrip('/')}/audio/speech",
        data=payload,
        headers={"content-type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(http_request, timeout=30) as response:
            audio = response.read()
    except urllib.error.URLError as exc:
        raise HTTPException(status_code=503, detail=f"BreezyVoice upstream unavailable: {exc}") from exc

    latency_ms = int((time.perf_counter() - start) * 1000)
    logger.info(json.dumps({"latency_ms": latency_ms, "error_code": None}))
    return {"audio_base64": base64.b64encode(audio).decode("ascii"), "mime_type": "audio/wav"}
