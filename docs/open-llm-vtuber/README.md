---
id: open-llm-vtuber-doc-index
title: "Open-LLM-VTuber Second Stack Agent Index"
date: 2026-07-02
topic: smart-health-cabin
type: agent-index
status: active-mainline-design
---

# Open-LLM-VTuber Second Stack Agent Index

This folder is the canonical agent-readable design home for the second Smart
Health Cabin ASR + LLM + TTS + Live2D stack based on Open-LLM-VTuber.

## Operating Decision

The second stack is now the active design and implementation focus for the
voice-avatar lane. The earlier Smart Health Cabin voice stack remains preserved
as evidence, baseline, and fallback history. Daily planning should no longer
treat the earlier stack as the main work target unless a later decision
reactivates it.

## File Map

| File | Purpose |
| --- | --- |
| `UPSTREAM_SOURCE_NOTES.md` | Source-controlled notes from the official docs, upstream repo, and Live2D model reference repo. |
| `SDD.md` | System design document for the second stack, including architecture, ownership, data flow, gates, and rollout path. |
| `CONTRACT.md` | Runtime, WebSocket, ASR, TTS, Live2D, UI-language, and safety contracts for implementation agents. |
| `FRONTEND_UI_SPEC.md` | Product UI redesign spec for a Taiwan health-measurement station experience. |
| `ASR_TTS_TAIWAN_SPEC.md` | ASR and TTS provider-selection rules, Taiwan Mandarin acceptance gates, and text-normalization controls. |
| `LIVE2D_CHARACTER_BACKGROUND_SPEC.md` | Live2D model, expression, motion, licensing, character, and background design rules. |

## Agent Rule

Before editing the second stack, read:

1. `UPSTREAM_SOURCE_NOTES.md`
2. `CONTRACT.md`
3. the task-specific spec file

If the task changes runtime behavior, update `SDD.md` and the runbook:

```text
docs/ops/OPEN_LLM_VTUBER_STACK_RUNBOOK.md
```

