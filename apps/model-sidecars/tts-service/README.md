# TTS Sidecar

FastAPI sidecar for Sprint 4.5 TTS selection:

```text
BreezyVoice default voice only
```

Endpoints:

- `GET /healthz`
- `GET /readyz`
- `POST /v1/tts/synthesize`
- `POST /v1/tts/synthesize-batch`

Run after installing `requirements.txt` in a local Python environment:

```bash
BREEZYVOICE_BASE_URL=http://localhost:9003/v1 \
uvicorn app:app --host 0.0.0.0 --port 8012
```

The endpoint rejects reference audio, speaker embeddings, custom voice IDs, and
voice-cloning fields. It proxies only the default voice to BreezyVoice.

`/v1/tts/synthesize-batch` is an experiment endpoint for true parallel worker
probes. It accepts ordered text segments, dispatches live BreezyVoice requests
with a worker pool, and returns per-segment audio plus a reconstructed WAV. It
is not the production questionnaire TTS contract.
