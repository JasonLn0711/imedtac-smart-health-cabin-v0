import asyncio
import importlib.util
import json
import os
import threading
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


app = FastAPI(title="Smart Health Cabin Wake Word Sidecar")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("WAKE_WORD_CORS_ORIGINS", "*").split(","),
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["content-type"],
)
clients: set[WebSocket] = set()
last_event: Optional[dict] = None
last_error: Optional[str] = None
last_detection_ms: Optional[int] = None
listening = False
detector_stop = threading.Event()
detector_thread: Optional[threading.Thread] = None
repo_root = Path(__file__).resolve().parents[3]


class SimulateWakeRequest(BaseModel):
    score: Optional[float] = None
    model: Optional[str] = None


def bool_env(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.lower() in {"1", "true", "yes", "on"}


def provider() -> str:
    return os.getenv("WAKE_WORD_PROVIDER", "sherpa-onnx")


def model_name() -> str:
    return os.getenv("WAKE_WORD_MODEL") or "sherpa-onnx-kws-zipformer-zh-en-3M-2025-12-20"


def model_path() -> Optional[str]:
    return os.getenv("WAKE_WORD_MODEL_PATH") or None


def wake_phrase() -> str:
    return os.getenv("WAKE_WORD_PHRASE", "你好小慧")


def resolved_path(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    path = Path(value)
    if path.is_absolute() or path.exists():
        return str(path)
    return str(repo_root / path)


def inference_framework() -> str:
    return os.getenv("WAKE_WORD_INFERENCE_FRAMEWORK", "sherpa-onnx")


def sample_rate() -> int:
    return int(os.getenv("WAKE_WORD_SAMPLE_RATE", "16000"))


def chunk_size() -> int:
    return int(os.getenv("WAKE_WORD_CHUNK_SIZE", "1280"))


def mic_index() -> Optional[int]:
    value = os.getenv("WAKE_WORD_DEVICE_INDEX")
    return int(value) if value not in {None, ""} else None


def threshold() -> float:
    return float(os.getenv("WAKE_WORD_THRESHOLD", "0.65"))


def cooldown_ms() -> int:
    return int(os.getenv("WAKE_WORD_COOLDOWN_MS", "2000"))


def sherpa_onnx_available() -> bool:
    return importlib.util.find_spec("sherpa_onnx") is not None


def sherpa_model_dir() -> str:
    return os.getenv("SHERPA_ONNX_KWS_MODEL_DIR", ".local/models/sherpa-onnx-kws-zipformer-zh-en-3M-2025-12-20")


def sherpa_default_path(filename: str) -> str:
    return str(Path(sherpa_model_dir()) / filename)


def sherpa_encoder_path() -> str:
    return os.getenv("SHERPA_ONNX_KWS_ENCODER", sherpa_default_path("encoder-epoch-13-avg-2-chunk-16-left-64.onnx"))


def sherpa_decoder_path() -> str:
    return os.getenv("SHERPA_ONNX_KWS_DECODER", sherpa_default_path("decoder-epoch-13-avg-2-chunk-16-left-64.onnx"))


def sherpa_joiner_path() -> str:
    return os.getenv("SHERPA_ONNX_KWS_JOINER", sherpa_default_path("joiner-epoch-13-avg-2-chunk-16-left-64.onnx"))


def sherpa_tokens_path() -> str:
    return os.getenv("SHERPA_ONNX_KWS_TOKENS", sherpa_default_path("tokens.txt"))


def sherpa_keywords_path() -> str:
    return os.getenv("SHERPA_ONNX_KWS_KEYWORDS", ".local/models/wakeword/ni-hao-xiao-hui.keywords.txt")


def sherpa_num_threads() -> int:
    return int(os.getenv("SHERPA_ONNX_KWS_NUM_THREADS", "2"))


def sherpa_execution_provider() -> str:
    return os.getenv("SHERPA_ONNX_KWS_PROVIDER", "cpu")


def missing_sherpa_config() -> list[str]:
    missing = []
    paths = {
        "SHERPA_ONNX_KWS_ENCODER": sherpa_encoder_path(),
        "SHERPA_ONNX_KWS_DECODER": sherpa_decoder_path(),
        "SHERPA_ONNX_KWS_JOINER": sherpa_joiner_path(),
        "SHERPA_ONNX_KWS_TOKENS": sherpa_tokens_path(),
        "SHERPA_ONNX_KWS_KEYWORDS": sherpa_keywords_path(),
    }
    for name, path in paths.items():
        if not os.path.exists(resolved_path(path) or ""):
            missing.append(f"{name}_NOT_FOUND")
    return missing


def should_emit_wake(score: float, threshold_value: float, now_ms: int, previous_ms: Optional[int], cooldown_value_ms: int) -> bool:
    return score >= threshold_value and (previous_ms is None or now_ms - previous_ms >= cooldown_value_ms)


def detected_keyword(result: str) -> str:
    try:
        payload = json.loads(result)
        return str(payload.get("keyword") or result) if isinstance(payload, dict) else str(payload)
    except json.JSONDecodeError:
        return result


def provider_status() -> dict:
    enabled = bool_env("WAKE_WORD_ENABLED", True)
    requested_mode = os.getenv("WAKE_WORD_MODE", os.getenv("VOICE_PROVIDER_MODE", "mock"))
    active_provider = provider()
    package_available = sherpa_onnx_available()
    missing_config = missing_sherpa_config() if active_provider == "sherpa-onnx" and requested_mode == "live" else []
    mode = "unavailable"
    error_code = None

    if not enabled:
        error_code = "WAKE_WORD_DISABLED"
    elif active_provider != "sherpa-onnx":
        error_code = "WAKE_WORD_PROVIDER_UNSUPPORTED"
    elif requested_mode == "live" and not package_available:
        error_code = "SHERPA_ONNX_UNAVAILABLE"
    elif missing_config:
        error_code = missing_config[0]
    elif requested_mode == "live":
        mode = "live"
        if last_error:
            error_code = "WAKE_WORD_LISTENER_ERROR"
    else:
        mode = "mock"

    ready = mode == "mock" or (mode == "live" and listening and last_error is None)

    return {
        "provider": active_provider,
        "phrase": wake_phrase(),
        "model": model_name(),
        "mode": mode,
        "ready": ready,
        "healthy": True,
        "local_only": bool_env("WAKE_WORD_LOCAL_ONLY", True),
        "threshold": threshold(),
        "cooldown_ms": cooldown_ms(),
        "listening": listening,
        "mic_index": mic_index(),
        "sample_rate": sample_rate(),
        "chunk_size": chunk_size(),
        "inference_framework": inference_framework(),
        "sherpa_onnx_available": sherpa_onnx_available(),
        "sherpa_onnx_model_dir": sherpa_model_dir(),
        "sherpa_onnx_model_resolved_dir": resolved_path(sherpa_model_dir()),
        "sherpa_onnx_encoder": sherpa_encoder_path(),
        "sherpa_onnx_decoder": sherpa_decoder_path(),
        "sherpa_onnx_joiner": sherpa_joiner_path(),
        "sherpa_onnx_tokens": sherpa_tokens_path(),
        "sherpa_onnx_keywords": sherpa_keywords_path(),
        "sherpa_onnx_keywords_resolved_path": resolved_path(sherpa_keywords_path()),
        "sherpa_onnx_num_threads": sherpa_num_threads(),
        "sherpa_onnx_execution_provider": sherpa_execution_provider(),
        "missing_config": missing_config,
        "last_event": last_event,
        "last_error": last_error,
        "error_code": error_code,
    }


def wake_event(score: Optional[float], model: Optional[str]) -> dict:
    return {
        "type": "wake.detected",
        "provider": provider(),
        "phrase": wake_phrase(),
        "model": model or model_name(),
        "score": score if score is not None else threshold() + 0.17,
        "threshold": threshold(),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


async def broadcast(event: dict) -> None:
    stale: list[WebSocket] = []
    for websocket in clients:
        try:
            await websocket.send_json(event)
        except RuntimeError:
            stale.append(websocket)
    for websocket in stale:
        clients.discard(websocket)


def broadcast_from_thread(event: dict) -> None:
    loop = getattr(app.state, "loop", None)
    if loop and loop.is_running():
        asyncio.run_coroutine_threadsafe(broadcast(event), loop)


def run_live_detector() -> None:
    global last_detection_ms, last_error, last_event, listening
    try:
        import numpy as np
        import sherpa_onnx
        import sounddevice as sd

        missing = missing_sherpa_config()
        if missing:
            raise RuntimeError(f"Missing sherpa-onnx KWS configuration: {', '.join(missing)}")

        spotter = sherpa_onnx.KeywordSpotter(
            tokens=resolved_path(sherpa_tokens_path()),
            encoder=resolved_path(sherpa_encoder_path()),
            decoder=resolved_path(sherpa_decoder_path()),
            joiner=resolved_path(sherpa_joiner_path()),
            num_threads=sherpa_num_threads(),
            keywords_file=resolved_path(sherpa_keywords_path()),
            provider=sherpa_execution_provider(),
        )
        keyword_stream = spotter.create_stream()
        stream_kwargs = {
            "samplerate": sample_rate(),
            "channels": 1,
            "dtype": "int16",
            "blocksize": chunk_size(),
        }
        if mic_index() is not None:
            stream_kwargs["device"] = mic_index()

        with sd.RawInputStream(**stream_kwargs) as audio_stream:
            listening = True
            while not detector_stop.is_set():
                audio, _overflowed = audio_stream.read(chunk_size())
                samples = np.frombuffer(audio, dtype=np.int16).astype(np.float32) / 32768.0
                keyword_stream.accept_waveform(sample_rate(), samples)
                while spotter.is_ready(keyword_stream):
                    spotter.decode_stream(keyword_stream)
                result = spotter.get_result(keyword_stream)
                if result:
                    spotter.reset_stream(keyword_stream)
                    now_ms = int(time.time() * 1000)
                    if should_emit_wake(1.0, threshold(), now_ms, last_detection_ms, cooldown_ms()):
                        last_detection_ms = now_ms
                        event = wake_event(1.0, detected_keyword(result))
                        last_event = event
                        broadcast_from_thread(event)
    except Exception as exc:
        last_error = str(exc)
    finally:
        listening = False


def start_live_detector() -> None:
    global detector_thread, last_error
    requested_mode = os.getenv("WAKE_WORD_MODE", os.getenv("VOICE_PROVIDER_MODE", "mock"))
    if not bool_env("WAKE_WORD_ENABLED", True) or requested_mode != "live":
        return
    if detector_thread and detector_thread.is_alive():
        return
    if provider() != "sherpa-onnx":
        last_error = "unsupported wake word provider"
        return
    if not sherpa_onnx_available():
        last_error = "sherpa-onnx is not installed"
        return
    last_error = None
    detector_stop.clear()
    detector_thread = threading.Thread(target=run_live_detector, name="wakeword-live-detector", daemon=True)
    detector_thread.start()


@app.on_event("startup")
async def startup() -> None:
    app.state.loop = asyncio.get_running_loop()
    start_live_detector()


@app.on_event("shutdown")
async def shutdown() -> None:
    detector_stop.set()
    if detector_thread and detector_thread.is_alive():
        detector_thread.join(timeout=2)


@app.get("/healthz")
def healthz():
    return {"status": "ok", "service": "wakeword-service", "provider": provider()}


@app.get("/status")
def status():
    return provider_status()


@app.post("/simulate-wake")
async def simulate_wake(request: SimulateWakeRequest):
    if not bool_env("WAKE_WORD_SIMULATE_ENABLED", True):
        raise HTTPException(status_code=403, detail="simulate wake is disabled")

    global last_event
    event = wake_event(request.score, request.model)
    last_event = event
    await broadcast(event)
    return event


@app.websocket("/events")
async def events(websocket: WebSocket):
    await websocket.accept()
    clients.add(websocket)
    await websocket.send_json({"type": "wake.status", **provider_status()})
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        clients.discard(websocket)
