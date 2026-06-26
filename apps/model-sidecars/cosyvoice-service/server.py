import json

from fastapi import FastAPI, HTTPException, WebSocket
from pydantic import BaseModel
import websockets

from provider import ProviderUnavailable, provider
from streaming import event


app = FastAPI(title="Smart Health Cabin CosyVoice Streaming Sidecar")


class SpeechRequest(BaseModel):
    text: str
    voice_id: str = "default_tw_healthcare"
    prompt_profile: str = "default_tw_healthcare"
    response_format: str = "wav"

    class Config:
        extra = "allow"


@app.get("/healthz")
def healthz():
    return {"status": "ok", **provider.status()}


@app.get("/readyz")
def readyz():
    status = provider.status()
    if not status["ready"]:
        raise HTTPException(status_code=503, detail=status["blocker_reason"])
    return {**status, "ready": status["ready"], "streaming_ready": status["streaming"]}


@app.post("/v1/audio/prewarm")
def prewarm():
    status = provider.status()
    if not status["ready"]:
        raise HTTPException(status_code=503, detail=status["blocker_reason"])
    return {"status": "ok", **status}


@app.post("/v1/audio/speech")
def speech(request: SpeechRequest):
    try:
        return provider.synthesize(request.text, request.voice_id, request.response_format)
    except ProviderUnavailable as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.websocket("/v1/audio/stream")
async def audio_stream(socket: WebSocket):
    await socket.accept()
    payload = await socket.receive_json()
    text = str(payload.get("text") or payload.get("input") or "")
    normalized_text = provider.normalize(text)
    await socket.send_json(event("request_received", provider="cosyvoice3_streaming"))
    await socket.send_json(event("text_normalized", text=normalized_text))

    status = provider.status()
    if not status["streaming"]:
        await socket.send_json(
            event(
                "error",
                code="COSYVOICE3_STREAMING_BACKEND_UNAVAILABLE",
                message="COSYVOICE3_STREAMING_BACKEND_WS is required for real audio-out streaming",
                is_final=True,
            )
        )
        await socket.close(code=1011)
        return

    if provider.config.local_ready:
        await socket.send_json(event("stream_start", sample_rate=24000, format="pcm16"))
        first_chunk = True
        chunk_index = 0
        try:
            for chunk, sample_rate in provider.stream_local_pcm_chunks(normalized_text):
                metadata_name = "first_audio_chunk" if first_chunk else "audio_chunk"
                await socket.send_json(
                    event(
                        metadata_name,
                        chunk_index=chunk_index,
                        sample_rate=sample_rate,
                        format="pcm16",
                        bytes=len(chunk),
                        is_final=False,
                    )
                )
                await socket.send_bytes(chunk)
                first_chunk = False
                chunk_index += 1
        except ProviderUnavailable as exc:
            await socket.send_json(event("error", code="COSYVOICE3_LOCAL_STREAM_FAILED", message=str(exc), is_final=True))
            await socket.close(code=1011)
            return
        await socket.send_json(event("stream_end", chunk_index=chunk_index, is_final=True))
        await socket.close()
        return

    if provider.config.stream_ws_url:
        await socket.send_json(event("stream_start", sample_rate=24000, format="pcm16", proxied=True))
        first_chunk = True
        chunk_index = 0
        try:
            async with websockets.connect(provider.config.stream_ws_url) as backend:
                await backend.send(
                    json.dumps(
                        {
                            "text": normalized_text,
                            "input": normalized_text,
                            "prompt_profile": provider.config.prompt_profile,
                            "format": "pcm16",
                        },
                        ensure_ascii=False,
                    )
                )
                async for message in backend:
                    if isinstance(message, str):
                        try:
                            await socket.send_json(json.loads(message))
                        except json.JSONDecodeError:
                            await socket.send_json(event("backend_message", message=message))
                        continue
                    metadata_name = "first_audio_chunk" if first_chunk else "audio_chunk"
                    await socket.send_json(
                        event(
                            metadata_name,
                            chunk_index=chunk_index,
                            sample_rate=24000,
                            format="pcm16",
                            bytes=len(message),
                            is_final=False,
                            proxied=True,
                        )
                    )
                    await socket.send_bytes(message)
                    first_chunk = False
                    chunk_index += 1
        except Exception as exc:
            await socket.send_json(event("error", code="COSYVOICE3_STREAM_PROXY_FAILED", message=str(exc), is_final=True))
            await socket.close(code=1011)
            return
        await socket.send_json(event("stream_end", chunk_index=chunk_index, is_final=True, proxied=True))
        await socket.close()
        return

    await socket.send_json(
        event(
            "error",
            code="COSYVOICE3_STREAMING_BACKEND_UNAVAILABLE",
            message="Configure COSYVOICE3_STREAMING_BACKEND_WS or local CosyVoice3 paths before live validation",
            is_final=True,
        )
    )
    await socket.close(code=1011)
