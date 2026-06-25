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

Endpoints:

- `GET /healthz`
- `GET /status`
- `POST /simulate-wake`
- `WS /events`

Run:

```bash
WAKE_WORD_ENABLED=true \
WAKE_WORD_PROVIDER=openwakeword \
WAKE_WORD_SERVICE_URL=http://localhost:8013 \
WAKE_WORD_THRESHOLD=0.65 \
WAKE_WORD_COOLDOWN_MS=2000 \
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
