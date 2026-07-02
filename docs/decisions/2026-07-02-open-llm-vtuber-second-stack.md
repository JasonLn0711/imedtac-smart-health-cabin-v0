---
id: open-llm-vtuber-second-stack
title: "Open-LLM-VTuber Second Voice Stack"
date: 2026-07-02
topic: smart-health-cabin
type: architecture-decision
status: active-mainline-design
---

# Open-LLM-VTuber Second Voice Stack

Smart Health Cabin now treats Open-LLM-VTuber as the active second
voice-avatar design mainline. The earlier ASR / LLM / TTS stack remains
preserved as evidence, baseline, and fallback history.

## Decision

Use Open-LLM-VTuber as the second-stack design target while keeping the
current pinned runtime isolated until activation:

- upstream checkout: `.local/Open-LLM-VTuber`;
- pinned upstream commit: `992309c0aa19845960228f880013d4685fde93b5`;
- pinned frontend submodule: `06a659b114fff788cf0daaa86e484576db4975bf`;
- lab server: `127.0.0.1:12393`;
- Smart Health Cabin bridge: `apps/model-sidecars/open-llm-vtuber-bridge`;
- bridge server: `127.0.0.1:8022`.

The kiosk remains on the existing Smart Health Cabin voice flow until a later
decision explicitly activates `VOICE_STACK=open_llm_vtuber_v1`, but daily
planning and next implementation should focus on the Open-LLM-VTuber track.

## Operating Scope

The second stack owns lab evaluation for Open-LLM-VTuber's integrated Avatar
conversation path: WebSocket turn handling, ASR, LLM, TTS, Live2D metadata, and
audio payload generation.

The Smart Health Cabin bridge owns a small compatibility surface:

```text
HTTP /v1/turn
-> Open-LLM-VTuber /client-ws text-input
-> display text + audio segment payloads
```

UI-facing text remains Taiwan Traditional Chinese. Open-LLM-VTuber expression
tokens such as `[neutral]` are removed at the bridge boundary before the text is
returned to Smart Health Cabin callers.

## Canonical Design Files

```text
docs/open-llm-vtuber/README.md
docs/open-llm-vtuber/UPSTREAM_SOURCE_NOTES.md
docs/open-llm-vtuber/CONTRACT.md
docs/open-llm-vtuber/SDD.md
docs/open-llm-vtuber/FRONTEND_UI_SPEC.md
docs/open-llm-vtuber/ASR_TTS_TAIWAN_SPEC.md
docs/open-llm-vtuber/LIVE2D_CHARACTER_BACKGROUND_SPEC.md
```

Implementation agents should read the contract and task-specific spec before
changing the second stack.

## Activation Gate

`VOICE_STACK=open_llm_vtuber_v1` can be considered after:

- product-owned frontend connects to `/client-ws`, plays audio, and displays
  Taiwan Traditional Chinese without simplified text leakage;
- ASR accepts real microphone Taiwan Mandarin audio from the intended room
  setup;
- TTS output quality is accepted for Taiwan Mandarin service use, with no
  China-accent default voice;
- Live2D character and background assets are license-cleared for the intended
  demo scope;
- kiosk integration preserves touch fallback and staff-review paths;
- provider status reports this stack separately from the earlier baseline.
