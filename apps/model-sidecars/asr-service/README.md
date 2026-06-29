# ASR Sidecar

FastAPI sidecar for Sprint 4.5 ASR selection:

```text
faster-whisper + Breeze-ASR-26 CTranslate2 int8
```

Endpoints:

- `GET /healthz`
- `GET /readyz`
- `POST /v1/asr/transcribe`

Run after installing `requirements.txt` in a local Python environment:

```bash
ASR_MODEL_PATH=/models/breeze-asr-26-ct2-int8 \
ASR_DEVICE=auto \
ASR_COMPUTE_TYPE=int8 \
uvicorn app:app --host 0.0.0.0 --port 8011
```

`/v1/asr/transcribe` returns `503` until the CT2 model path and Python
dependencies are available. The API server mock mode remains the fallback.
