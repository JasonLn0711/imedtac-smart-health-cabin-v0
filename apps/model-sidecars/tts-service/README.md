# TTS Sidecar

FastAPI sidecar for Sprint 4.5 TTS selection:

```text
BreezyVoice default voice only
```

Endpoints:

- `GET /healthz`
- `GET /readyz`
- `POST /v1/tts/synthesize`

Run after installing `requirements.txt` in a local Python environment:

```bash
BREEZYVOICE_BASE_URL=http://localhost:9003/v1 \
uvicorn app:app --host 0.0.0.0 --port 8012
```

The endpoint rejects reference audio, speaker embeddings, custom voice IDs, and
voice-cloning fields. It proxies only the default voice to BreezyVoice.
