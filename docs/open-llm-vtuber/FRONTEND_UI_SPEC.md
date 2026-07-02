---
id: open-llm-vtuber-frontend-ui-spec
title: "Open-LLM-VTuber Smart Health Cabin Frontend UI Spec"
date: 2026-07-02
topic: smart-health-cabin
type: frontend-spec
status: active-mainline-design
---

# Open-LLM-VTuber Smart Health Cabin Frontend UI Spec

## Objective

Replace the upstream companion/chat UI with a Taiwan Smart Health Cabin kiosk
UI. The first screen must be the usable health-measurement interaction surface,
not a landing page.

## Audience

- 現場使用者: completes health measurement, questionnaire, and result review.
- 現場人員: assists confirmation, recovery, and staff-review steps.
- Demo reviewer: checks whether the voice-avatar workflow is credible for a
  health measurement station.

## Design Direction

Use an operational healthcare-service interface:

- calm, high-contrast, readable;
- dense enough for kiosk workflow, not decorative marketing;
- clear current step, microphone state, and next action;
- Live2D character as an assistant, not the only content;
- Traditional Chinese UI terms familiar in Taiwan.

Preferred terms:

```text
健康檢測
問卷填答
檢測結果
現場人員
人員覆核
協助確認
重新錄音
觸控填答
QR Code
```

## Required Layout

Desktop/kiosk:

```text
┌──────────────────────────────────────────────────────────┐
│ top status: connection, station step, staff-review state  │
├─────────────────────────────┬────────────────────────────┤
│ Live2D stage and background │ current workflow panel      │
│ microphone / speaking state │ question / result / confirm │
│ subtitles                   │ touch fallback controls     │
├─────────────────────────────┴────────────────────────────┤
│ bottom controls: mic, interrupt, retry, staff assist      │
└──────────────────────────────────────────────────────────┘
```

Mobile/tablet:

```text
Live2D stage
current workflow panel
bottom controls
```

## Required States

| State | UI signal | Available actions |
| --- | --- | --- |
| `connecting` | WebSocket status and retry | reconnect |
| `ready` | assistant idle, mic available | start speaking, touch input |
| `listening` | mic active, waveform/VAD | stop, retry |
| `thinking` | answer being prepared | interrupt |
| `speaking` | subtitle and playback progress | interrupt, lower volume |
| `confirming` | candidate answer visible | confirm, choose different option, rerecord |
| `staff_review` | staff path active | call/notify現場人員, continue touch flow |
| `fallback_touch` | voice path paused | touch answer, retry voice |
| `completed` | next step visible | report/QR Code, next station step |
| `error_recoverable` | cause and recovery action | retry, reconnect, touch fallback |

## Core Components

| Component | Requirements |
| --- | --- |
| `ConnectionStatus` | Shows `/client-ws` status, last error, reconnect button. |
| `Live2DStage` | Loads model from `set-model-and-conf.model_info`, supports scale and safe framing. |
| `HealthWorkflowPanel` | Shows current question/result/confirmation in Traditional Chinese. |
| `MicControl` | Icon button with listening/paused/error states and tooltip. |
| `InterruptControl` | Stops current AI speech and sends `interrupt-signal`. |
| `TouchFallbackControls` | Allows answer selection without voice. |
| `StaffReviewBanner` | Shows when人員覆核 is active. |
| `SubtitlePanel` | Displays sanitized Traditional Chinese text only. |
| `AudioPlaybackController` | Plays base64 WAV payloads, sends `frontend-playback-complete`. |

## UI Copy Rules

- User-facing text is Traditional Chinese only.
- Do not display emotion tokens such as `[joy]`.
- Do not display internal prompt, provider names, model names, or debug details
  unless a developer mode is explicitly enabled.
- Use direct service-continuity phrasing:

```text
請確認最接近的選項
系統已整理成候選答案
觸控填答可接續完成
現場人員會協助確認
重新錄音
```

## WebSocket UI Contract

On connect:

1. wait for `set-model-and-conf`;
2. render Live2D model from `model_info`;
3. wait for `control/start-mic`;
4. enable microphone controls.

On `audio` event:

1. sanitize `display_text.text`;
2. update subtitles and workflow state;
3. apply `actions.expressions` if mapped;
4. play base64 WAV when present;
5. send `frontend-playback-complete` after playback.

On `error` event:

1. keep the current workflow state;
2. show recoverable error copy;
3. keep touch fallback available;
4. log provider event for evidence.

## Visual Asset Rules

- Background should look like a Taiwan health-measurement station or calm
  service counter.
- Do not use unrelated streamer-room or fantasy backgrounds for product demos.
- Avatar and background must not block question text, confirmation buttons, QR
  Code, or staff-review banner.
- Live2D character should fit the first viewport with room for the current
  workflow panel.

## Implementation Notes

The product UI should live in a tracked app path, for example:

```text
apps/open-llm-vtuber-kiosk-web/
```

The ignored upstream checkout remains a runtime source and contract reference:

```text
.local/Open-LLM-VTuber/
```

Do not place product UI source only inside `.local/Open-LLM-VTuber/frontend`.

## First Implementation Slice

Build the smallest useful frontend slice:

1. connect to `/client-ws`;
2. show connection and model metadata;
3. send one text turn;
4. render sanitized Traditional Chinese subtitle;
5. play returned audio payload;
6. show Live2D model or a clear placeholder if the licensed model is not ready;
7. keep touch fallback and interrupt controls visible.

