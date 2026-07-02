---
id: open-llm-vtuber-baseline-log-2026-07-02
title: "Open-LLM-VTuber Baseline Log"
date: 2026-07-02
timezone: Asia/Taipei
topic: smart-health-cabin
type: evidence-log
status: lab-baseline-completed
---

# Open-LLM-VTuber Baseline Log

## Pin

- upstream repo: `https://github.com/Open-LLM-VTuber/Open-LLM-VTuber`
- upstream commit: `992309c0aa19845960228f880013d4685fde93b5`
- frontend submodule: `06a659b114fff788cf0daaa86e484576db4975bf`
- checkout path: `.local/Open-LLM-VTuber`

## Environment

- date: `2026-07-02`
- local timezone: `Asia/Taipei`
- upstream server: `127.0.0.1:12393`
- bridge server: `127.0.0.1:8022`
- LLM backend: Ollama HTTP API at `127.0.0.1:11434`
- LLM model: `gemma4:e4b`
- ASR: `sherpa_onnx_asr`, SenseVoice, CPU provider
- TTS: `edge_tts`, `zh-TW-HsiaoChenNeural`

## Setup Evidence

```bash
git -C .local/Open-LLM-VTuber rev-parse HEAD
# 992309c0aa19845960228f880013d4685fde93b5

git -C .local/Open-LLM-VTuber submodule status --recursive
# 06a659b114fff788cf0daaa86e484576db4975bf frontend

cd .local/Open-LLM-VTuber
uv sync
# Installed upstream Python environment with torch, sherpa-onnx, edge-tts, FastAPI, websockets.
```

## Upstream Startup Evidence

```text
Open-LLM-VTuber, version v1.2.1
Initializing ASR: sherpa_onnx_asr
Sherpa-Onnx-ASR: Using cpu for inference
Initializing TTS: edge_tts
Initializing LLM: ollama_llm
Initialized AsyncLLM with the parameters: http://localhost:11434/v1, gemma4:e4b
Preloading model for Ollama
<Response [200]>
Starting server on 127.0.0.1:12393
```

Port check:

```text
LISTEN 127.0.0.1:12393 users:(("python3",pid=88522,fd=15))
```

## ASR Baseline

Command path: generate Taiwan Mandarin audio through Open-LLM-VTuber Edge TTS,
convert it to 16 kHz mono WAV, then transcribe with Open-LLM-VTuber Sherpa
SenseVoice ASR.

Result:

```text
mp3: cache/asr_baseline_probe.mp3
wav: cache/asr_baseline_probe_16k.wav
sample_rate: 16000
transcript: 请确认检测结果。
```

ASR inference ran successfully. The ASR transcript is simplified Chinese; this
is provider-internal evidence only. Smart Health Cabin UI-facing text remains
Traditional Chinese.

## Open-LLM-VTuber WebSocket Baseline

Input:

```json
{"type":"text-input","text":"請用一句話介紹健康量測站。"}
```

Observed events:

```text
group-update
full-text
set-model-and-conf
group-update
control start-mic
control conversation-chain-start
full-text Thinking...
audio
audio
backend-synth-complete
backend-synth-complete
force-new-message
control conversation-chain-end
```

Output included two `audio` payloads with base64 lengths `98364` and `668220`.

## Bridge Baseline

Bridge health:

```json
{
  "status": "ok",
  "provider": "open_llm_vtuber_bridge",
  "upstream_ws": "ws://127.0.0.1:12393/client-ws",
  "timeout_sec": 90.0
}
```

Minimal bridge turn:

```json
{
  "provider": "open_llm_vtuber_bridge",
  "text": "簡單來說，我們健康量測站就是一個能透過科學化的儀器和測試，為您描繪一張客觀、完整的「身體現況報告」的場所！",
  "audio_segment_count": 2,
  "audio_lengths": [124476, 617532]
}
```

## Decision

Open-LLM-VTuber is ready as an isolated lab stack with ASR, LLM, TTS, upstream
WebSocket, and Smart Health Cabin bridge baseline completed. It is not yet the
kiosk production path. The next gate is repeated room testing and an explicit
decision before enabling `VOICE_STACK=open_llm_vtuber_v1`.
