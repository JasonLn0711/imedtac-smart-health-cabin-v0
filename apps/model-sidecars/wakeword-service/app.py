import asyncio
import importlib.util
import os
import threading
import time
from datetime import datetime, timezone
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


class SimulateWakeRequest(BaseModel):
    score: Optional[float] = None
    model: Optional[str] = None


def bool_env(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.lower() in {"1", "true", "yes", "on"}


def provider() -> str:
    return os.getenv("WAKE_WORD_PROVIDER", "openwakeword")


def model_name() -> str:
    return os.getenv("WAKE_WORD_MODEL") or os.getenv("WAKE_WORD_MODEL_PATH") or "custom_or_builtin"


def model_path() -> Optional[str]:
    return os.getenv("WAKE_WORD_MODEL_PATH") or None


def inference_framework() -> str:
    return os.getenv("WAKE_WORD_INFERENCE_FRAMEWORK", "tflite")


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


def openwakeword_available() -> bool:
    return importlib.util.find_spec("openwakeword") is not None


def should_emit_wake(score: float, threshold_value: float, now_ms: int, previous_ms: Optional[int], cooldown_value_ms: int) -> bool:
    return score >= threshold_value and (previous_ms is None or now_ms - previous_ms >= cooldown_value_ms)


def best_prediction(prediction: dict) -> tuple[str, float]:
    if not prediction:
        return model_name(), 0.0
    model, score = max(prediction.items(), key=lambda item: float(item[1]))
    return str(model), float(score)


def provider_status() -> dict:
    enabled = bool_env("WAKE_WORD_ENABLED", True)
    requested_mode = os.getenv("WAKE_WORD_MODE", os.getenv("VOICE_PROVIDER_MODE", "mock"))
    available = openwakeword_available()
    mode = "unavailable"
    error_code = None

    if not enabled:
        error_code = "WAKE_WORD_DISABLED"
    elif provider() != "openwakeword":
        error_code = "WAKE_WORD_PROVIDER_UNSUPPORTED"
    elif requested_mode == "live" and not available:
        error_code = "OPENWAKEWORD_UNAVAILABLE"
    elif requested_mode == "live":
        mode = "live"
        if last_error:
            error_code = "WAKE_WORD_LISTENER_ERROR"
    else:
        mode = "mock"

    ready = mode == "mock" or (mode == "live" and listening and last_error is None)

    return {
        "provider": provider(),
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
        "openwakeword_available": available,
        "last_event": last_event,
        "last_error": last_error,
        "error_code": error_code,
    }


def wake_event(score: Optional[float], model: Optional[str]) -> dict:
    return {
        "type": "wake.detected",
        "provider": provider(),
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
        import sounddevice as sd
        from openwakeword.model import Model

        kwargs = {"inference_framework": inference_framework()}
        if model_path():
            kwargs["wakeword_models"] = [model_path()]
        model = Model(**kwargs)
        stream_kwargs = {
            "samplerate": sample_rate(),
            "channels": 1,
            "dtype": "int16",
            "blocksize": chunk_size(),
        }
        if mic_index() is not None:
            stream_kwargs["device"] = mic_index()

        with sd.RawInputStream(**stream_kwargs) as stream:
            listening = True
            while not detector_stop.is_set():
                audio, _overflowed = stream.read(chunk_size())
                prediction = model.predict(np.frombuffer(audio, dtype=np.int16))
                detected_model, score = best_prediction(prediction)
                now_ms = int(time.time() * 1000)
                if should_emit_wake(score, threshold(), now_ms, last_detection_ms, cooldown_ms()):
                    last_detection_ms = now_ms
                    event = wake_event(score, detected_model)
                    last_event = event
                    broadcast_from_thread(event)
    except Exception as exc:
        last_error = str(exc)
    finally:
        listening = False


def start_live_detector() -> None:
    global detector_thread, last_error
    requested_mode = os.getenv("WAKE_WORD_MODE", os.getenv("VOICE_PROVIDER_MODE", "mock"))
    if not bool_env("WAKE_WORD_ENABLED", True) or provider() != "openwakeword" or requested_mode != "live":
        return
    if detector_thread and detector_thread.is_alive():
        return
    if not openwakeword_available():
        last_error = "openwakeword is not installed"
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
