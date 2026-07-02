---
id: open-llm-vtuber-live2d-character-background-spec
title: "Open-LLM-VTuber Live2D Character And Background Spec"
date: 2026-07-02
topic: smart-health-cabin
type: live2d-spec
status: active-mainline-design
---

# Open-LLM-VTuber Live2D Character And Background Spec

## Goal

Create a license-cleared Live2D character and background set for a Taiwan Smart
Health Cabin assistant.

## Upstream Placement Contract

Model files:

```text
live2d-models/<model_name>/<model_name>.model3.json
```

Model dictionary:

```text
model_dict.json
```

Character config:

```text
conf.yaml
characters/<character>.yaml
```

Background files:

```text
backgrounds/
```

Static routes:

```text
/live2d-models/...
/bg/...
/avatars/...
```

## Model Version

Use Cubism 3, Cubism 4, or Cubism 5. Do not select Cubism 2 models for this
stack.

## Licensing Rules

Allowed for external/company-facing demo:

- commissioned original model with written usage permission;
- purchased model with commercial/demo usage permission;
- official sample model only if its license terms allow the intended demo use;
- internal placeholder explicitly marked internal-only.

Not allowed as default external/company-facing asset:

- extracted game model without license clearance;
- Eikanya collection model without separate commercial/demo permission;
- model with unclear redistribution terms.

## Required `model_dict.json`

Minimum:

```json
{
  "name": "smart-cabin-avatar",
  "description": "Taiwan health-measurement station assistant.",
  "url": "/live2d-models/smart-cabin-avatar/smart-cabin-avatar.model3.json",
  "kScale": 0.42
}
```

Recommended:

```json
{
  "name": "smart-cabin-avatar",
  "description": "Taiwan health-measurement station assistant.",
  "url": "/live2d-models/smart-cabin-avatar/smart-cabin-avatar.model3.json",
  "kScale": 0.42,
  "initialXshift": 0,
  "initialYshift": 0,
  "idleMotionGroupName": "idle",
  "defaultEmotion": "neutral",
  "emotionMap": {
    "neutral": "neutral",
    "joy": "confirm",
    "surprise": "attention",
    "sadness": "staff_review",
    "fear": "retry",
    "anger": "retry",
    "disgust": "retry",
    "smirk": "confirm"
  },
  "tapMotions": {
    "body": {
      "tap_body": 40,
      "confirm": 30,
      "idle": 30
    },
    "head": {
      "flick_head": 40,
      "listen": 30,
      "idle": 30
    }
  }
}
```

The exact expression and motion names must match the selected model's
`model3.json`.

## Character Config

```yaml
character_config:
  conf_name: "smart-cabin-avatar"
  conf_uid: "smart-cabin-avatar-001"
  live2d_model_name: "smart-cabin-avatar"
  character_name: "小慧"
  avatar: "smart-cabin-avatar.png"
  human_name: "現場使用者"
  persona_prompt: |
    你是慧誠智醫健康量測站的語音互動 Avatar 小慧。
    請一律使用臺灣繁體中文，語氣正向、主動、可信任、邊界清楚。
    你協助健康檢測、問卷填答、檢測結果說明、觸控填答銜接與現場人員覆核。
    你不做診斷，不提供治療建議，不取代現場人員或醫療專業判斷。
```

## Required Expressions

| Product state | Expression target |
| --- | --- |
| idle | neutral, calm, available |
| listening | attentive, eyes focused |
| speaking | warm explanation |
| confirming | supportive confirmation |
| staff review | calm handoff, not alarmed |
| retry | friendly recovery |
| completed | positive completion |

## Required Motions

| Motion | Use |
| --- | --- |
| idle loop | Waiting state. |
| listen | User speaking. |
| explain | Avatar speaking. |
| confirm | Candidate answer confirmation. |
| staff_review | Human-review routing. |
| retry | Rerecord or touch fallback. |

## Background Design

Background should communicate:

- Taiwan health-measurement station;
- clean service counter or kiosk;
- enough contrast for subtitles and workflow panel;
- no diagnosis, treatment, or hospital-equipment overclaim;
- no distracting streamer-room visuals.

Suggested background set:

| File | Purpose |
| --- | --- |
| `smart-cabin-default.png` | Normal health-check interaction. |
| `smart-cabin-staff-review.png` | Staff-review handoff state. |
| `smart-cabin-quiet-mode.png` | Touch fallback or low-noise recording state. |

## UI Fit Rules

- Avatar must not cover the current question, confirmation buttons, or QR Code.
- Avatar stage must stay stable on kiosk, desktop, tablet, and mobile.
- Subtitle area must have a fixed readable region.
- Long Traditional Chinese terms must wrap cleanly.

## Acceptance Gate

Live2D work is accepted when:

- model loads from `/live2d-models/...`;
- `model_dict.json` name matches `live2d_model_name`;
- expression mapping works for the required states;
- motion names match the model file;
- background loads from `/bg/...`;
- license status is recorded;
- UI screenshot verifies no overlap with question/confirmation/QR content.

