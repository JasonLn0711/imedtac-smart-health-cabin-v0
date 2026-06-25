# Wake Word Sidecar

FastAPI sidecar for the Sprint 5.6 Voice Entry Activation Gate.

Scope:

- wake word is a local activation gate only;
- wake word never writes questionnaire answers;
- tap-to-start remains the required fallback path;
- `/simulate-wake` is for e2e tests and local pipeline checks, not production UI.

Provider:

```text
openWakeWord local wake word provider
```

Dependency note: `requirements.txt` pins openWakeWord from the official GitHub
commit because the PyPI `0.6.0` package requires `tflite-runtime`, which does
not provide a Python 3.12 Linux wheel on the current workstation.

Modes:

- `WAKE_WORD_MODE=mock`: exposes status/events and supports `/simulate-wake`
  for local e2e checks.
- `WAKE_WORD_MODE=live`: starts a local microphone loop, feeds 16kHz mono
  int16 PCM frames into `openwakeword.Model.predict()`, and emits
  `wake.detected` after threshold + cooldown pass.

Endpoints:

- `GET /healthz`
- `GET /status`
- `POST /simulate-wake`
- `WS /events`

Run:

```bash
WAKE_WORD_ENABLED=true \
WAKE_WORD_MODE=mock \
WAKE_WORD_PROVIDER=openwakeword \
WAKE_WORD_SERVICE_URL=http://localhost:8013 \
WAKE_WORD_THRESHOLD=0.65 \
WAKE_WORD_COOLDOWN_MS=2000 \
WAKE_WORD_LOCAL_ONLY=true \
uvicorn app:app --host 0.0.0.0 --port 8013
```

Live microphone run:

```bash
WAKE_WORD_ENABLED=true \
WAKE_WORD_MODE=live \
WAKE_WORD_PROVIDER=openwakeword \
WAKE_WORD_SERVICE_URL=http://localhost:8013 \
WAKE_WORD_MODEL_PATH=/models/wakeword/smart-health-cabin.tflite \
WAKE_WORD_INFERENCE_FRAMEWORK=tflite \
WAKE_WORD_THRESHOLD=0.65 \
WAKE_WORD_COOLDOWN_MS=2000 \
WAKE_WORD_SAMPLE_RATE=16000 \
WAKE_WORD_CHUNK_SIZE=1280 \
WAKE_WORD_DEVICE_INDEX=0 \
WAKE_WORD_LOCAL_ONLY=true \
uvicorn app:app --host 0.0.0.0 --port 8013
```

Event shape:

```json
{
  "type": "wake.detected",
  "provider": "openwakeword",
  "model": "custom_or_builtin",
  "score": 0.82,
  "threshold": 0.65,
  "timestamp": "2026-06-25T00:00:00+00:00"
}
```

Live mode reports `unavailable` until the Python environment can import
`openwakeword`. Mock mode keeps the activation pipeline testable before a
formal Mandarin custom wake phrase is trained.

If the selected live microphone device cannot be opened, `/status` reports
`ready=false`, `listening=false`, and `last_error` with the local audio runtime
error. Keep tap-to-start active while tuning microphone index, threshold, and
formal Mandarin wake phrase model.
