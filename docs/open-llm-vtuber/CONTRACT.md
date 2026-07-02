---
id: open-llm-vtuber-second-stack-contract
title: "Open-LLM-VTuber Second Stack Contract"
date: 2026-07-02
topic: smart-health-cabin
type: runtime-contract
status: active-mainline-design
---

# Open-LLM-VTuber Second Stack Contract

## Contract Status

The second stack is the active voice-avatar design target. The first Smart
Health Cabin voice stack remains an evidence baseline and fallback, not the
daily mainline.

## Ownership

| Layer | Owner | Contract |
| --- | --- | --- |
| Planning | `../planning-everything-track/` | Locator, status, calendar, capacity, next gate. |
| Canonical docs | this repo, `docs/open-llm-vtuber/` | Source notes, SDD, contracts, UI, ASR/TTS, Live2D specs. |
| Upstream lab checkout | `.local/Open-LLM-VTuber/` | Ignored pinned upstream runtime. Do not treat as durable product source. |
| Bridge | `apps/model-sidecars/open-llm-vtuber-bridge/` | HTTP compatibility wrapper for Smart Health Cabin callers. |
| Future product frontend | tracked app in this repo | Own the health-station UI and call upstream-compatible backend APIs. |

## Language Contract

| Surface | Required language |
| --- | --- |
| Kiosk UI | Taiwan Traditional Chinese only. |
| Avatar displayed text/subtitles | Taiwan Traditional Chinese only. |
| Staff/operator docs | Taiwan Traditional Chinese unless the file is explicitly engineering-only English. |
| Logs | May store both `display_text_zh_tw` and `tts_text_internal`, clearly labeled. |
| TTS internal input | May be Simplified Chinese only when the selected TTS engine demonstrably needs it for better normalization. |

Simplified Chinese must not leak into user-facing UI, subtitles, reports,
handoff docs, or planning notes.

## Frontend Contract

The product route is a custom Smart Health Cabin frontend that speaks the
Open-LLM-VTuber backend contract. It should not depend on editing ignored files
inside `.local/Open-LLM-VTuber/frontend`.

Required frontend responsibilities:

- connect to `ws://<host>:<port>/client-ws`;
- render the current Live2D model from `set-model-and-conf.model_info`;
- show WebSocket connection status and reconnect control;
- send text turns with:

```json
{"type":"text-input","text":"請協助確認這次健康檢測流程。"}
```

- capture microphone audio and send either:
  - `mic-audio-data` float chunks plus `mic-audio-end`, or
  - `raw-audio-data` chunks when using upstream VAD path;
- support interruption with:

```json
{"type":"interrupt-signal","text":"<heard partial response>"}
```

- acknowledge audio playback completion:

```json
{"type":"frontend-playback-complete"}
```

- keep questionnaire writes behind explicit user confirmation or staff review.

## Upstream WebSocket Contract

Endpoint:

```text
ws://127.0.0.1:12393/client-ws
```

Expected initial server events:

| Type | Meaning |
| --- | --- |
| `full-text` | Connection or conversational text event. |
| `set-model-and-conf` | Live2D model metadata, config name, config UID, and `client_uid`. |
| `group-update` | Group-chat state. Can be ignored in kiosk single-user mode. |
| `control` with `text=start-mic` | Frontend may start microphone capture. |

Core inbound event types:

| Type | Required fields | Use |
| --- | --- | --- |
| `text-input` | `text` | Text turn from kiosk/operator/test harness. |
| `mic-audio-data` | `audio: number[]` | Float PCM chunk accumulation for ASR. |
| `mic-audio-end` | none | End of buffered audio turn. |
| `raw-audio-data` | `audio` | VAD-driven raw audio path. |
| `interrupt-signal` | `text` | Interrupt active AI speech and preserve heard text. |
| `audio-play-start` | `display_text` | Group display relay. Optional for kiosk. |
| `frontend-playback-complete` | none | Playback completion acknowledgement. |
| `fetch-configs` | none | Fetch config alternatives. |
| `switch-config` | `file` | Switch character/config. |
| `fetch-backgrounds` | none | Fetch background image names. |
| `request-init-config` | none | Request `set-model-and-conf` again. |
| `heartbeat` | none | Health ping. |

Core outbound event types:

| Type | Required handling |
| --- | --- |
| `control` | Start/stop microphone, conversation chain end, interruption control. |
| `audio` | Play base64 WAV if `audio` is present; render `display_text`; apply `actions`. |
| `backend-synth-complete` | Mark backend TTS segment generation done. |
| `error` | Show recovery state and keep touch fallback available. |
| `tool_call_status` | Optional status display. |
| `history-*` | Optional for product kiosk unless chat history is activated. |

## Audio Payload Contract

Current upstream audio payload shape:

```json
{
  "type": "audio",
  "audio": "<base64 wav or null>",
  "volumes": [0.0, 0.5, 1.0],
  "slice_length": 20,
  "display_text": {
    "text": "請確認最接近的選項。",
    "name": "小慧",
    "avatar": "avatar.png"
  },
  "actions": {
    "expressions": ["neutral"]
  },
  "forwarded": false
}
```

Implementation controls:

- Treat `audio` as a completed segment payload unless a future TTS provider
  proves true chunk streaming.
- Use `volumes` for mouth movement and simple waveform state.
- Strip bracketed emotion markers from visible text before showing subtitles or
  storing Smart Health Cabin display text.
- Use `actions.expressions` for Live2D expression control when the model maps
  the expression.

## Bridge Contract

Current bridge endpoint:

```text
POST http://127.0.0.1:8022/v1/turn
```

Request:

```json
{"text":"請用一句話介紹健康量測站。"}
```

Response:

```json
{
  "provider": "open_llm_vtuber_bridge",
  "text": "健康量測站可以協助整理檢測結果，並由現場人員接續確認。",
  "audio_segments_base64": ["..."],
  "audio_segment_count": 1,
  "events": ["full-text","set-model-and-conf","control","audio","control"]
}
```

Bridge controls:

- It is a lab compatibility adapter, not the product frontend.
- It removes known emotion tokens from display text.
- It must preserve Traditional Chinese display text.
- It must report upstream timeout and upstream connection failures honestly.

## ASR Contract

ASR engines must satisfy:

- input sample rate normalized to `16000 Hz`, mono, float32 or 16-bit PCM as
  required by upstream;
- Taiwan Mandarin room speech acceptance tests;
- per-turn transcript evidence with input device, VAD/endpointer state, latency,
  and confidence when available;
- no direct questionnaire write without confirmation or staff-review routing.

Provider candidates:

- `sherpa_onnx_asr` with SenseVoiceSmall as low-friction baseline;
- `sherpa_onnx_asr` with Fire Red ASR for Chinese-English mixed accuracy tests;
- `faster_whisper` for GPU accuracy/latency comparison;
- cloud ASR only when privacy, network, and credential controls are accepted.

## TTS Contract

TTS engines must satisfy:

- Taiwan Traditional Chinese display text remains canonical;
- Taiwan Mandarin voice acceptance, with no China-accent production default;
- real-time latency measurement on the actual runtime path;
- generated audio artifact and timing log for every acceptance run;
- exact `prompt_text` and reference audio matching for voice cloning.

Provider candidates:

- Edge TTS `zh-TW-HsiaoChenNeural` as low-friction lab baseline;
- Azure Taiwan Mandarin voice as a cloud production candidate if credential and
  privacy controls are accepted;
- local fast ONNX/Piper/sherpa path only if a Taiwan Mandarin voice is available
  and passes listener gates;
- GPT-SoVITS / CosyVoice / SparkTTS style voice-cloning only after
  prompt-audio transcript matching and real-time tests pass.

## Live2D Contract

Required files:

```text
live2d-models/<model_name>/<model_name>.model3.json
model_dict.json
conf.yaml or characters/<character>.yaml
```

Required `model_dict.json` fields:

```json
{
  "name": "smart-cabin-avatar",
  "url": "/live2d-models/smart-cabin-avatar/smart-cabin-avatar.model3.json",
  "kScale": 0.42
}
```

Required character config link:

```yaml
character_config:
  live2d_model_name: "smart-cabin-avatar"
```

Product controls:

- Use Cubism 3 to Cubism 5 models.
- Do not use uncleared extracted game assets for company-facing demos.
- Map health-service expressions before relying on emotion tokens.
- Keep background assets under `backgrounds/` and served by `/bg`.

## Safety And Scope Contract

The second stack supports health-check workflow guidance, questionnaire
assistance, result explanation, and staff-review routing.

It does not own diagnosis, treatment advice, medical-device validation,
production HIS access, real patient-data storage, or autonomous clinical
decision-making.

