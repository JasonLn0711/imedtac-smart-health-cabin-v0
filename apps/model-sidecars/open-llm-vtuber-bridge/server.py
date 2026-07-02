import asyncio
import json
import os
import re
from typing import Any

import websockets
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel


app = FastAPI(title="Smart Health Cabin Open-LLM-VTuber Bridge")


class TurnRequest(BaseModel):
    text: str


def bridge_config() -> dict[str, Any]:
    return {
        "provider": "open_llm_vtuber_bridge",
        "upstream_ws": os.getenv("OPEN_LLM_VTUBER_WS_URL", "ws://127.0.0.1:12393/client-ws"),
        "timeout_sec": float(os.getenv("OPEN_LLM_VTUBER_TIMEOUT_SEC", "90")),
    }


@app.get("/healthz")
async def healthz():
    config = bridge_config()
    return {"status": "ok", **config}


@app.post("/v1/turn")
async def turn(request: TurnRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="text is required")
    try:
        return await run_turn(request.text, bridge_config())
    except TimeoutError as exc:
        raise HTTPException(status_code=504, detail=str(exc)) from exc
    except OSError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


async def run_turn(text: str, config: dict[str, Any]) -> dict[str, Any]:
    display_text: list[str] = []
    audio_segments: list[str] = []
    event_types: list[str] = []
    timeout_sec = float(config["timeout_sec"])

    async with websockets.connect(config["upstream_ws"], max_size=20_000_000) as ws:
        await wait_until_ready(ws, timeout_sec, event_types)
        await ws.send(json.dumps({"type": "text-input", "text": text}, ensure_ascii=False))

        while True:
            message = await asyncio.wait_for(ws.recv(), timeout=timeout_sec)
            data = json.loads(message)
            event_types.append(str(data.get("type", "")))

            if data.get("type") == "audio":
                display = data.get("display_text") or {}
                if isinstance(display, dict) and display.get("text"):
                    display_text.append(strip_expression_tokens(str(display["text"])))
                audio = data.get("audio")
                if isinstance(audio, str) and audio:
                    audio_segments.append(audio)
                await ws.send(json.dumps({"type": "frontend-playback-complete"}))

            if data.get("type") == "error":
                raise OSError(str(data.get("message") or "Open-LLM-VTuber returned an error"))

            if data.get("type") == "control" and data.get("text") == "conversation-chain-end":
                break

    if not audio_segments:
        raise TimeoutError("Open-LLM-VTuber turn ended without audio")

    return {
        "provider": config["provider"],
        "text": "".join(display_text),
        "audio_segments_base64": audio_segments,
        "audio_segment_count": len(audio_segments),
        "events": event_types,
    }


def strip_expression_tokens(text: str) -> str:
    return re.sub(r"\[(?:neutral|anger|disgust|fear|joy|smirk|sadness|surprise)\]\s*", "", text).strip()


async def wait_until_ready(ws, timeout_sec: float, event_types: list[str]) -> None:
    while True:
        message = await asyncio.wait_for(ws.recv(), timeout=timeout_sec)
        data = json.loads(message)
        event_types.append(str(data.get("type", "")))
        if data.get("type") == "control" and data.get("text") == "start-mic":
            return
