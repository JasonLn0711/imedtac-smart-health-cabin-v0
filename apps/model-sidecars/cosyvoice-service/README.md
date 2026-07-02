# CosyVoice Streaming Sidecar

Smart Health Cabin TTS sidecar for the voice-first product path.

Default provider target:

```text
provider: cosyvoice3_streaming
model: FunAudioLLM/Fun-CosyVoice3-0.5B-2512
transport: WebSocket PCM16 chunks
fallback: breezyvoice_default
```

This sidecar is intentionally honest about readiness. It does not generate fake
audio and it does not wrap a completed WAV as streaming audio. Until a real
CosyVoice3 backend is configured, `/readyz` returns `ready=false`, synchronous
speech returns `503`, and the WebSocket stream emits an `error` event.

## Run

```bash
cd apps/model-sidecars/cosyvoice-service
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
COSYVOICE3_PROVIDER_MODE=live \
COSYVOICE3_BACKEND_URL=http://localhost:8017 \
COSYVOICE3_STREAMING_BACKEND_WS=ws://localhost:8017/v1/audio/stream \
python3 -m uvicorn server:app --host 0.0.0.0 --port 8015
```

## API

- `GET /healthz`
- `GET /readyz`
- `POST /v1/audio/prewarm`
- `POST /v1/audio/speech`
- `WS /v1/audio/stream`

WebSocket streams use JSON metadata plus binary PCM16 chunks. Each stream emits
`request_received`, `tts_input_prepared`, `stream_start`, chunk metadata, and
`stream_end`; failures emit `error`. Every audio chunk emits `audio_chunk`
metadata with `chunk_index`, `sample_rate`, `format`, `duration_ms`, `bytes`,
and `is_final`. The first chunk also emits `first_audio_chunk`.

## TTS Text Preprocessing

The sidecar normalizes text before it reaches CosyVoice:

```text
Traditional Chinese input
-> OpenCC `tw2s` when available
-> emoji / markdown / symbol cleanup
-> health-domain acronym and numeric normalization
-> short sentence splitting for local streaming
```

`opencc-python-reimplemented` is installed through this sidecar's
`requirements.txt`. If OpenCC is unavailable, a small built-in fallback keeps
common kiosk phrases readable, but OpenCC is the intended path.

The simplified Chinese text is internal TTS input only. Browser-facing metadata
keeps the original Traditional Chinese text and reports counts instead of the
simplified transcript.

## Required Backend Boundary

`COSYVOICE3_BACKEND_URL` must point to a real CosyVoice3 speech endpoint for
completed fallback speech. `COSYVOICE3_STREAMING_BACKEND_WS` must point to a
real audio-out streaming endpoint for live validation.

Alternatively, configure the official local CosyVoice repo and model paths:

```bash
uv python install 3.10
git clone --recursive https://github.com/FunAudioLLM/CosyVoice.git .local/CosyVoice
uv venv .local/cosyvoice-venv --python 3.10
uv pip install --python .local/cosyvoice-venv/bin/python --index-strategy unsafe-best-match -r .local/CosyVoice/requirements.txt
uv pip install --python .local/cosyvoice-venv/bin/python 'setuptools<81'
.local/cosyvoice-venv/bin/python - <<'PY'
from huggingface_hub import snapshot_download
snapshot_download(
    'FunAudioLLM/Fun-CosyVoice3-0.5B-2512',
    local_dir='.local/CosyVoice/pretrained_models/Fun-CosyVoice3-0.5B',
)
PY
.local/cosyvoice-venv/bin/python - <<'PY'
from huggingface_hub import snapshot_download
snapshot_download(
    'FunAudioLLM/CosyVoice-ttsfrd',
    local_dir='.local/CosyVoice/pretrained_models/CosyVoice-ttsfrd',
)
PY
cd .local/CosyVoice/pretrained_models/CosyVoice-ttsfrd
unzip resource.zip -d .
/absolute/path/to/.local/cosyvoice-venv/bin/python -m ensurepip --upgrade
/absolute/path/to/.local/cosyvoice-venv/bin/python -m pip install \
  ttsfrd_dependency-0.1-py3-none-any.whl \
  ttsfrd-0.4.2-cp310-cp310-linux_x86_64.whl
```

Then run the sidecar with absolute local paths:

```bash
COSYVOICE3_PROVIDER_MODE=live
COSYVOICE3_REPO_PATH=/absolute/path/to/.local/CosyVoice
COSYVOICE3_MODEL_DIR=/absolute/path/to/.local/CosyVoice/pretrained_models/Fun-CosyVoice3-0.5B
COSYVOICE3_PROMPT_WAV=/absolute/path/to/.local/CosyVoice/asset/zero_shot_prompt.wav
COSYVOICE3_PROMPT_TEXT='You are a helpful assistant.<|endofprompt|>希望你以后能够做的比我还好呦。'
/absolute/path/to/.local/cosyvoice-venv/bin/python -m uvicorn server:app --host 0.0.0.0 --port 8015
```

Zero-shot prompt text must exactly match the prompt audio transcript. The
official `asset/zero_shot_prompt.wav` is accepted only with the official
transcript above and is suitable for smoke testing only. Product acceptance
needs a Taiwan Mandarin healthcare prompt recording plus its exact transcript in
`COSYVOICE3_PROMPT_TEXT`, matching the real content, language, emotion, length,
and recording conditions of `COSYVOICE3_PROMPT_WAV`.

The Smart Health Cabin acceptance path requires real non-final audio chunks
before utterance completion.
