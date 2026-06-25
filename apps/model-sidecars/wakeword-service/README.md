# Wake Word Sidecar

FastAPI sidecar for the Sprint 5.6 Voice Entry Activation Gate.

Scope:

- wake word is a local activation gate only;
- wake word never writes questionnaire answers;
- tap-to-start remains the required fallback path;
- `/simulate-wake` is for e2e tests and local pipeline checks, not production UI.

Provider:

```text
Picovoice Porcupine local wake word provider
```

Formal wake phrase:

```text
小慧你好
```

Provider requirements:

- `PICOVOICE_ACCESS_KEY`: secret AccessKey from Picovoice Console.
- `PORCUPINE_KEYWORD_PATH`: Linux `.ppn` custom keyword file trained in
  Picovoice Console for `小慧你好`.
- `PORCUPINE_MODEL_PATH`: Mandarin `.pv` language model, usually
  `.local/models/picovoice/porcupine_params_zh.pv`.

Modes:

- `WAKE_WORD_MODE=mock`: exposes status/events and supports `/simulate-wake`
  for local e2e checks.
- `WAKE_WORD_MODE=live`: starts a local microphone loop, feeds Porcupine's
  required 16-bit mono PCM frames into `pvporcupine.process()`, and emits
  `wake.detected` after the `小慧你好` keyword fires and cooldown passes.

Endpoints:

- `GET /healthz`
- `GET /status`
- `POST /simulate-wake`
- `WS /events`

Run:

```bash
WAKE_WORD_ENABLED=true \
WAKE_WORD_MODE=mock \
WAKE_WORD_PROVIDER=porcupine \
WAKE_WORD_PHRASE=小慧你好 \
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
WAKE_WORD_PROVIDER=porcupine \
WAKE_WORD_PHRASE=小慧你好 \
WAKE_WORD_SERVICE_URL=http://localhost:8013 \
PICOVOICE_ACCESS_KEY="$PICOVOICE_ACCESS_KEY" \
PORCUPINE_KEYWORD_PATH=.local/models/wakeword/xiao-hui-ni-hao_linux.ppn \
PORCUPINE_MODEL_PATH=.local/models/picovoice/porcupine_params_zh.pv \
PORCUPINE_SENSITIVITY=0.65 \
WAKE_WORD_THRESHOLD=0.65 \
WAKE_WORD_COOLDOWN_MS=2000 \
WAKE_WORD_DEVICE_INDEX=0 \
WAKE_WORD_LOCAL_ONLY=true \
uvicorn app:app --host 0.0.0.0 --port 8013
```

Live acceptance check:

```bash
WAKE_WORD_LIVE_WAIT_MS=15000 corepack pnpm smoke:wakeword:live
```

This check does not call `/simulate-wake`. It requires `/status` to report
`mode=live`, `ready=true`, `listening=true`, and `last_error=null`, then waits
for a real `wake.detected` event while the selected wake phrase is spoken. It
also requires configured Porcupine keyword/model paths by default.

Event shape:

```json
{
  "type": "wake.detected",
  "provider": "porcupine",
  "phrase": "小慧你好",
  "model": ".local/models/wakeword/xiao-hui-ni-hao_linux.ppn",
  "score": 1.0,
  "threshold": 0.65,
  "timestamp": "2026-06-25T00:00:00+00:00"
}
```

Live mode reports `unavailable` until the Python environment can import
`pvporcupine` and the AccessKey, Mandarin `.pv`, and `小慧你好` `.ppn` files are
configured. Mock mode keeps the activation pipeline testable before the
Picovoice Console keyword package is installed locally.

If the selected live microphone device cannot be opened, `/status` reports
`ready=false`, `listening=false`, and `last_error` with the local audio runtime
error. Keep tap-to-start active while tuning microphone index, threshold, and
formal Mandarin wake phrase model.
