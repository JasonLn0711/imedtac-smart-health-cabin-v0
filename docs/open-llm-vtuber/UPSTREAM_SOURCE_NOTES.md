---
id: open-llm-vtuber-upstream-source-notes
title: "Open-LLM-VTuber Upstream Source Notes"
date: 2026-07-02
topic: smart-health-cabin
type: source-notes
status: source-preserved
accessed_at: 2026-07-02 17:05:31 Asia/Taipei
---

# Open-LLM-VTuber Upstream Source Notes

These notes preserve the source layer used for the second-stack design. They do
not replace the upstream documentation.

## Official Project And Architecture

Source:

```text
https://github.com/Open-LLM-VTuber/Open-LLM-VTuber
https://docs.llmvtuber.com/docs/development-guide/overview/
https://docs.llmvtuber.com/docs/user-guide/backend/structure/
```

Relevant source facts:

- Open-LLM-VTuber is a voice-interactive AI companion with Live2D avatar,
  voice interruption, web and desktop clients, and modular LLM / ASR / TTS
  support.
- The upstream project currently treats v2.0 as an early rewrite effort while
  v1 continues to receive bug fixes.
- The upstream architecture is frontend/backend separated. The official docs
  identify `/client-ws` as the main backend API for custom frontend work.
- The backend repo owns the server. The web/Electron frontend is a separate
  repo and appears in the backend checkout as the `frontend` submodule/build
  directory.
- The backend code structure includes `characters/`, `frontend/`,
  `live2d-models/`, `models/`, `prompts/`, and `src/open_llm_vtuber/`.
- The current local pinned checkout is:

```text
.local/Open-LLM-VTuber
upstream commit: 992309c0aa19845960228f880013d4685fde93b5
frontend submodule: 06a659b114fff788cf0daaa86e484576db4975bf
```

## Frontend Web Mode

Source:

```text
https://docs.llmvtuber.com/docs/user-guide/frontend/web/
```

Relevant source facts:

- Web mode includes a collapsible sidebar, settings drawer, chat history, main
  Live2D stage, background image or camera background, WebSocket connection
  status, subtitles, and a bottom control bar.
- Settings are organized around General, Live2D, ASR, TTS, Agent, and About.
- Personalization settings use browser `localStorage`.
- ASR settings include automatic microphone control and VAD thresholds.

Smart Health Cabin interpretation:

- The upstream UI is a companion/chat UI. Our product UI must become a health
  measurement station UI, not a generic VTuber chat panel.
- The upstream settings categories remain useful as implementation controls,
  but the first screen must prioritize health-check workflow, current station
  step, microphone state, answer confirmation, and staff-review path.

## Live2D

Source:

```text
https://docs.llmvtuber.com/docs/user-guide/live2d/
```

Relevant source facts:

- Adding a Live2D model follows this sequence: obtain model, optionally
  configure expressions/motions, place files in `live2d-models`, add
  `model_dict.json` entry, and set the character config `live2d_model_name`.
- The project uses `pixi-live2d-display-lipsyncpatch`; the docs state support
  for Cubism 3 through Cubism 5 models, not Cubism 2.
- `model_dict.json` requires `name`, `url`, and `kScale`. Optional fields such
  as `emotionMap`, `tapMotions`, `initialXshift`, `initialYshift`,
  `idleMotionGroupName`, and `defaultEmotion` control interaction quality.
- Local model URLs use `/live2d-models/...`, not `./live2d-models/...`.
- `emotionMap` maps model expressions to keywords such as `neutral`, `anger`,
  `disgust`, `fear`, `joy`, `smirk`, `sadness`, and `surprise`.
- AI text can trigger expression changes with bracketed emotion tokens. The
  bridge must remove those tokens from Smart Health Cabin display text.

Smart Health Cabin interpretation:

- Product acceptance requires a licensed model with health-service expression
  coverage: neutral, listening, explaining, confirming, staff-review, and
  recovery.
- Eikanya sample models can be used for local technical exploration only after
  license review. They are not default company-facing assets.

## Live2D Reference Model Repository

Source:

```text
https://github.com/Eikanya/Live2d-model
https://raw.githubusercontent.com/Eikanya/Live2d-model/master/README.md
```

Relevant source facts:

- The repo is a personal collection of Live2D models, many extracted from games.
- The README says model configuration correctness is not guaranteed.
- The README warns to pay attention to license and not use for commercial
  purposes.

Smart Health Cabin interpretation:

- This repo is a discovery and compatibility reference, not a production asset
  source.
- A company-facing or externally shown demo needs either a commissioned /
  licensed model, a cleared sample model, or a placeholder explicitly labeled
  as internal-only.

## ASR

Source:

```text
https://docs.llmvtuber.com/docs/user-guide/backend/asr/
```

Relevant source facts:

- ASR config lives under `asr_config` in `conf.yaml`.
- Upstream supports `sherpa_onnx_asr`, `fun_asr`, `faster_whisper`,
  `whisper_cpp`, `whisper`, `groq_whisper_asr`, and `azure_asr`.
- From upstream v1.0.0, the default ASR is `sherpa-onnx` running
  SenseVoiceSmall int8, with first-run model download into `models`.
- `sherpa-onnx` can use CPU or CUDA. The docs describe CUDA setup as a separate
  activation path.
- Fire Red ASR can be used through `sherpa_onnx_asr` and is positioned by the
  docs for higher quality Chinese-English mixed recognition.
- Faster Whisper can use `large-v3-turbo` and GPU for better speed/quality
  tradeoffs, while CPU is slower.

Smart Health Cabin interpretation:

- Current lab baseline can remain `sherpa_onnx_asr` because it is fast and
  friction-light.
- Field acceptance needs Taiwan Mandarin room audio tests, device
  auto-selection, VAD endpointing, and no unconfirmed questionnaire writes.

## TTS

Source:

```text
https://docs.llmvtuber.com/docs/user-guide/backend/tts/
https://docs.llmvtuber.com/docs/development-guide/backend/tts/
```

Relevant source facts:

- TTS config lives under `tts_config` in `conf.yaml`.
- Upstream supports multiple TTS paths including sherpa-onnx, Piper, MeloTTS,
  Coqui-TTS, GPT-SoVITS, CosyVoice, Edge TTS, Fish Audio, Azure TTS, OpenAI
  compatible TTS, SparkTTS, and SiliconFlowTTS.
- Adding a new TTS implementation requires changes in:
  `src/open_llm_vtuber/tts/`, `tts_factory.py`,
  `config_templates/conf.default.yaml`, `config_templates/conf.ZH.default.yaml`,
  and `src/open_llm_vtuber/config_manager/tts.py`.
- The TTS interface accepts text and returns a generated audio file path.
- The local pinned code's `TTSTaskManager` queues TTS work and sends ordered
  completed audio payloads to the frontend.

Smart Health Cabin interpretation:

- Edge TTS `zh-TW-HsiaoChenNeural` is a fast lab baseline, not a final
  customized Taiwan-accent production voice.
- Real-time acceptance must measure generated audio timing and perceived Taiwan
  Mandarin accent. A completed-WAV payload sent over WebSocket is not a proof of
  true TTS streaming.
- Any voice-cloning path must enforce exact reference-audio transcript matching.

## Local Code Contract Evidence

Source:

```text
.local/Open-LLM-VTuber/src/open_llm_vtuber/routes.py
.local/Open-LLM-VTuber/src/open_llm_vtuber/server.py
.local/Open-LLM-VTuber/src/open_llm_vtuber/websocket_handler.py
.local/Open-LLM-VTuber/src/open_llm_vtuber/conversations/tts_manager.py
.local/Open-LLM-VTuber/src/open_llm_vtuber/utils/stream_audio.py
.local/Open-LLM-VTuber/src/open_llm_vtuber/asr/asr_interface.py
.local/Open-LLM-VTuber/src/open_llm_vtuber/tts/tts_interface.py
```

Relevant local facts:

- `/client-ws` is the primary WebSocket endpoint.
- Static mounts include `/live2d-models`, `/bg`, `/avatars`, `/web-tool`, and
  the frontend root.
- `/live2d-models/info` scans model folders for matching `.model3.json`.
- `/asr` accepts a WAV upload and returns `{"text": ...}`.
- `/tts-ws` accepts text and returns TTS-generated audio messages.
- On WebSocket connection, the server sends `full-text`,
  `set-model-and-conf`, `group-update`, and `control/start-mic`.
- Core inbound messages include `text-input`, `mic-audio-data`,
  `raw-audio-data`, `mic-audio-end`, `interrupt-signal`,
  `frontend-playback-complete`, `fetch-configs`, `switch-config`,
  `fetch-backgrounds`, `request-init-config`, and `heartbeat`.
- Audio payloads include `type: audio`, base64 WAV `audio`, `volumes`,
  `slice_length`, `display_text`, `actions`, and `forwarded`.

