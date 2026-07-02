# Wake Word Sidecar

FastAPI sidecar for the Sprint 5.6 Voice Entry Activation Gate.

Scope:

- wake word is a local activation gate only;
- wake word never writes questionnaire answers;
- tap-to-start remains the required fallback path;
- `/simulate-wake` is for e2e tests and local pipeline checks, not production UI.

Provider:

```text
sherpa-onnx KWS Zipformer zh-en 3M
```

Formal wake phrase:

```text
你好小慧
```

Model:

```text
sherpa-onnx-kws-zipformer-zh-en-3M-2025-12-20
```

Provider requirements:

- `sherpa-onnx` Python package.
- Model folder:
  `.local/models/sherpa-onnx-kws-zipformer-zh-en-3M-2025-12-20/`.
- Keyword file:
  `.local/models/wakeword/ni-hao-xiao-hui.keywords.txt`.
- The keyword file is generated from `你好小慧 @你好小慧` with
  `sherpa-onnx-cli text2token`.

Modes:

- `WAKE_WORD_MODE=mock`: exposes status/events and supports `/simulate-wake`
  for local e2e checks.
- `WAKE_WORD_MODE=live`: starts a local microphone loop, feeds mono 16-bit PCM
  frames into `sherpa_onnx.KeywordSpotter`, and emits `wake.detected` after
  `你好小慧` fires and cooldown passes.

Endpoints:

- `GET /healthz`
- `GET /status`
- `POST /simulate-wake`
- `WS /events`

Run mock mode:

```bash
cd /home/jnclaw/every_on_git_jnclaw/phd-life-system/imedtac-smart-health-cabin-v0/apps/model-sidecars/wakeword-service
WAKE_WORD_ENABLED=true \
WAKE_WORD_MODE=mock \
WAKE_WORD_PROVIDER=sherpa-onnx \
WAKE_WORD_PHRASE=你好小慧 \
WAKE_WORD_SERVICE_URL=http://localhost:8013 \
WAKE_WORD_THRESHOLD=0.65 \
WAKE_WORD_COOLDOWN_MS=2000 \
WAKE_WORD_LOCAL_ONLY=true \
../../../.local/wakeword-venv/bin/python -m uvicorn app:app --host 0.0.0.0 --port 8013
```

Install the local model:

```bash
cd /home/jnclaw/every_on_git_jnclaw/phd-life-system/imedtac-smart-health-cabin-v0
mkdir -p .local/models .local/models/wakeword .local/tmp
cd .local/tmp
wget https://github.com/k2-fsa/sherpa-onnx/releases/download/kws-models/sherpa-onnx-kws-zipformer-zh-en-3M-2025-12-20.tar.bz2
tar xf sherpa-onnx-kws-zipformer-zh-en-3M-2025-12-20.tar.bz2
rm sherpa-onnx-kws-zipformer-zh-en-3M-2025-12-20.tar.bz2
mv sherpa-onnx-kws-zipformer-zh-en-3M-2025-12-20 ../models/
cd ../..
python3 -m venv .local/wakeword-venv
.local/wakeword-venv/bin/python -m pip install -r apps/model-sidecars/wakeword-service/requirements.txt
printf '你好小慧 @你好小慧\n' > .local/models/wakeword/ni-hao-xiao-hui.raw.txt
.local/wakeword-venv/bin/sherpa-onnx-cli text2token \
  --tokens .local/models/sherpa-onnx-kws-zipformer-zh-en-3M-2025-12-20/tokens.txt \
  --tokens-type phone+ppinyin \
  --lexicon .local/models/sherpa-onnx-kws-zipformer-zh-en-3M-2025-12-20/en.phone \
  .local/models/wakeword/ni-hao-xiao-hui.raw.txt \
  .local/models/wakeword/ni-hao-xiao-hui.keywords.txt
```

Expected keyword token line:

```text
n ǐ h ǎo x iǎo h uì @你好小慧
```

Live microphone run:

```bash
cd /home/jnclaw/every_on_git_jnclaw/phd-life-system/imedtac-smart-health-cabin-v0/apps/model-sidecars/wakeword-service
WAKE_WORD_ENABLED=true \
WAKE_WORD_MODE=live \
WAKE_WORD_PROVIDER=sherpa-onnx \
WAKE_WORD_PHRASE=你好小慧 \
WAKE_WORD_SERVICE_URL=http://localhost:8013 \
SHERPA_ONNX_KWS_MODEL_DIR=.local/models/sherpa-onnx-kws-zipformer-zh-en-3M-2025-12-20 \
SHERPA_ONNX_KWS_KEYWORDS=.local/models/wakeword/ni-hao-xiao-hui.keywords.txt \
SHERPA_ONNX_KWS_NUM_THREADS=2 \
SHERPA_ONNX_KWS_PROVIDER=cpu \
WAKE_WORD_THRESHOLD=0.65 \
WAKE_WORD_COOLDOWN_MS=2000 \
WAKE_WORD_LOCAL_ONLY=true \
../../../.local/wakeword-venv/bin/python -m uvicorn app:app --host 0.0.0.0 --port 8013
```

By default, live mode auto-selects the input device with a real signal level and
reports the selected device plus probe RMS / peak in `/status`. Set
`WAKE_WORD_DEVICE_INDEX=12` only when the field setup needs a fixed override.

Live acceptance check:

```bash
WAKE_WORD_LIVE_WAIT_MS=15000 corepack pnpm smoke:wakeword:live
```

This check does not call `/simulate-wake`. It requires `/status` to report
`provider=sherpa-onnx`, `phrase=你好小慧`, `mode=live`, `ready=true`,
`listening=true`, and `last_error=null`, then waits for a real `wake.detected`
event while the selected wake phrase is spoken.

Event shape:

```json
{
  "type": "wake.detected",
  "provider": "sherpa-onnx",
  "phrase": "你好小慧",
  "model": "你好小慧",
  "score": 1.0,
  "threshold": 0.65,
  "timestamp": "2026-06-25T00:00:00+00:00"
}
```

Live mode reports `unavailable` until the Python environment can import
`sherpa_onnx` and the encoder, decoder, joiner, tokens, and keyword files are
present. Mock mode keeps the activation pipeline testable before the local KWS
model is installed.

If the selected live microphone device cannot be opened, `/status` reports
`ready=false`, `listening=false`, and `last_error` with the local audio runtime
error. Keep tap-to-start active while tuning microphone index and threshold.
