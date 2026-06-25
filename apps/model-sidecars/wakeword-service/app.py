import importlib.util
import os
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
    return os.getenv("WAKE_WORD_MODEL", "custom_or_builtin")


def threshold() -> float:
    return float(os.getenv("WAKE_WORD_THRESHOLD", "0.65"))


def cooldown_ms() -> int:
    return int(os.getenv("WAKE_WORD_COOLDOWN_MS", "2000"))


def openwakeword_available() -> bool:
    return importlib.util.find_spec("openwakeword") is not None


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
    else:
      mode = "mock"

    return {
        "provider": provider(),
        "model": model_name(),
        "mode": mode,
        "ready": mode in {"mock", "live"},
        "healthy": True,
        "local_only": bool_env("WAKE_WORD_LOCAL_ONLY", True),
        "threshold": threshold(),
        "cooldown_ms": cooldown_ms(),
        "openwakeword_available": available,
        "last_event": last_event,
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
