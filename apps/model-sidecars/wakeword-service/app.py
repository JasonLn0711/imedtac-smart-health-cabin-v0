import asyncio
import importlib.util
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
    return os.getenv("WAKE_WORD_PROVIDER", "porcupine")


def model_name() -> str:
    return os.getenv("WAKE_WORD_MODEL") or porcupine_keyword_path() or model_path() or "custom_or_builtin"


def model_path() -> Optional[str]:
    return os.getenv("WAKE_WORD_MODEL_PATH") or None


def wake_phrase() -> str:
    return os.getenv("WAKE_WORD_PHRASE", "小慧你好")


def picovoice_access_key() -> Optional[str]:
    return os.getenv("PICOVOICE_ACCESS_KEY") or os.getenv("PORCUPINE_ACCESS_KEY") or None


def porcupine_keyword_path() -> Optional[str]:
    return os.getenv("PORCUPINE_KEYWORD_PATH") or None


def porcupine_model_path() -> Optional[str]:
    return os.getenv("PORCUPINE_MODEL_PATH") or None


def porcupine_sensitivity() -> float:
    return float(os.getenv("PORCUPINE_SENSITIVITY", os.getenv("WAKE_WORD_THRESHOLD", "0.65")))


def resolved_path(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    path = Path(value)
    if path.is_absolute() or path.exists():
        return str(path)
    return str(repo_root / path)


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


def porcupine_available() -> bool:
    return importlib.util.find_spec("pvporcupine") is not None


def missing_porcupine_config() -> list[str]:
    missing = []
    if not picovoice_access_key():
        missing.append("PICOVOICE_ACCESS_KEY")
    if not porcupine_keyword_path():
        missing.append("PORCUPINE_KEYWORD_PATH")
    elif not os.path.exists(resolved_path(porcupine_keyword_path()) or ""):
        missing.append("PORCUPINE_KEYWORD_PATH_NOT_FOUND")
    if not porcupine_model_path():
        missing.append("PORCUPINE_MODEL_PATH")
    elif not os.path.exists(resolved_path(porcupine_model_path()) or ""):
        missing.append("PORCUPINE_MODEL_PATH_NOT_FOUND")
    return missing


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
    active_provider = provider()
    package_available = porcupine_available() if active_provider == "porcupine" else openwakeword_available()
    missing_config = missing_porcupine_config() if active_provider == "porcupine" and requested_mode == "live" else []
    mode = "unavailable"
    error_code = None

    if not enabled:
        error_code = "WAKE_WORD_DISABLED"
    elif active_provider not in {"porcupine", "openwakeword"}:
        error_code = "WAKE_WORD_PROVIDER_UNSUPPORTED"
    elif requested_mode == "live" and not package_available:
        error_code = "PORCUPINE_UNAVAILABLE" if active_provider == "porcupine" else "OPENWAKEWORD_UNAVAILABLE"
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
        "openwakeword_available": openwakeword_available(),
        "porcupine_available": porcupine_available(),
        "porcupine_keyword_path": porcupine_keyword_path(),
        "porcupine_model_path": porcupine_model_path(),
        "porcupine_keyword_resolved_path": resolved_path(porcupine_keyword_path()),
        "porcupine_model_resolved_path": resolved_path(porcupine_model_path()),
        "porcupine_sensitivity": porcupine_sensitivity(),
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


def run_openwakeword_detector() -> None:
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


def run_porcupine_detector() -> None:
    global last_detection_ms, last_error, last_event, listening
    porcupine = None
    stream = None
    try:
        import numpy as np
        import pvporcupine
        import sounddevice as sd

        missing = missing_porcupine_config()
        if missing:
            raise RuntimeError(f"Missing Porcupine configuration: {', '.join(missing)}")

        porcupine = pvporcupine.create(
            access_key=picovoice_access_key(),
            keyword_paths=[resolved_path(porcupine_keyword_path())],
            model_path=resolved_path(porcupine_model_path()),
            sensitivities=[porcupine_sensitivity()],
        )
        stream_kwargs = {
            "samplerate": porcupine.sample_rate,
            "channels": 1,
            "dtype": "int16",
            "blocksize": porcupine.frame_length,
        }
        if mic_index() is not None:
            stream_kwargs["device"] = mic_index()

        with sd.RawInputStream(**stream_kwargs) as stream:
            listening = True
            while not detector_stop.is_set():
                audio, _overflowed = stream.read(porcupine.frame_length)
                keyword_index = porcupine.process(np.frombuffer(audio, dtype=np.int16))
                now_ms = int(time.time() * 1000)
                if keyword_index >= 0 and should_emit_wake(1.0, threshold(), now_ms, last_detection_ms, cooldown_ms()):
                    last_detection_ms = now_ms
                    event = wake_event(1.0, porcupine_keyword_path())
                    last_event = event
                    broadcast_from_thread(event)
    except Exception as exc:
        last_error = str(exc)
    finally:
        listening = False
        if stream:
            stream.close()
        if porcupine:
            porcupine.delete()


def run_live_detector() -> None:
    if provider() == "porcupine":
        run_porcupine_detector()
        return
    run_openwakeword_detector()


def start_live_detector() -> None:
    global detector_thread, last_error
    requested_mode = os.getenv("WAKE_WORD_MODE", os.getenv("VOICE_PROVIDER_MODE", "mock"))
    if not bool_env("WAKE_WORD_ENABLED", True) or requested_mode != "live":
        return
    if detector_thread and detector_thread.is_alive():
        return
    if provider() == "porcupine" and not porcupine_available():
        last_error = "pvporcupine is not installed"
        return
    if provider() == "openwakeword" and not openwakeword_available():
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
