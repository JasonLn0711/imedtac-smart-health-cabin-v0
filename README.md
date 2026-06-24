---
id: imedtac-smart-health-cabin-v0
title: "imedtac Smart Health Cabin Collaboration Workspace"
date: 2026-06-23
type: project-index
status: active
---

# imedtac Smart Health Cabin Collaboration Workspace

This folder is the standalone workspace for the 慧誠智醫（imedtac Co., Ltd.）
Smart Health Cabin collaboration project.

The project is distinct from `../imedtac-ai-triage-kiosk-v0`. The AI Triage
repo remains the execution home for the English vital-aware triage demo and its
stable API history. This folder owns the Smart Health Cabin cooperation lane.

## Current Product Scope

The `2026-06-23` onsite meeting reframed the user-facing software scope as four
modules:

1. hearing module;
2. vision module;
3. questionnaire module;
4. Avatar interaction module.

Data integration is a cross-module layer: integrated report, QR Code report
access, structured JSON export, database/CMS connection, and future HIS-ready
planning.

## 2026-06-24 Module Research Packet

The active research packet asks whether open-source GitHub projects can be
adapted into the four modules while preserving customer-selectable activation.
It also frames the shared data layer as a lightweight module event/report layer
first, with Kafka-like infrastructure reserved for replay, multiple consumers,
durable ordering, or cross-service scale.

Packet root:

```text
research-packets/2026-06-24-smart-health-cabin-module-research/
```

## Current MVP Direction

The questionnaire MVP should not invent a new medical questionnaire.

Use:

- HPA adult preventive health service red-box fields as the Taiwan public-sector
  backbone;
- WHO STEPS core simplified public-health risk-factor fields as the
  international backbone;
- PHQ-2 as the first mental-health screen;
- basic measurement summaries for height, weight, waist, blood pressure,
  vision, and hearing;
- source-backed, non-diagnostic report wording.

The MVP report should provide health measurement summary, self-assessment
summary, health behavior reminders, and staff / healthcare-professional follow
up prompts. It should not output diagnosis, treatment advice, formal triage
level, or live HIS writeback claims.

## Key Files

| File | Purpose |
| --- | --- |
| `docs/source-index.md` | Project-level source map. |
| `workstreams/smart-health-cabin/README.md` | Workstream index and current post-meeting scope. |
| `workstreams/smart-health-cabin/post-meeting-decision-log.md` | Confirmed facts, decisions, open questions, and next actions. |
| `workstreams/smart-health-cabin/hpa-adult-preventive-health-questionnaire-mvp-design-note.md` | Expert note and MVP design rules for the questionnaire path. |
| `workstreams/smart-health-cabin/module-a-vision-hearing-discovery.md` | Hearing and vision discovery constraints. |
| `workstreams/smart-health-cabin/module-b-questionnaire-triage-discovery.md` | Questionnaire/CMS/source-governance discovery. |
| `workstreams/smart-health-cabin/module-c-avatar-interaction-discovery.md` | Avatar voice interaction discovery. |
| `workstreams/smart-health-cabin/2026-06-24-open-source-module-research-plan.md` | Open-source module adaptation research plan. |
| `workstreams/smart-health-cabin/2026-06-24-mvp-monorepo-redpanda-architecture-note.md` | Reference architecture note for MVP monorepo, modular monolith, PostgreSQL, Redpanda, and event contracts. |
| `research-packets/2026-06-24-smart-health-cabin-module-research/README.md` | Packetized research set for hearing, vision, questionnaire, live Avatar, and the small module event layer. |
| `source/2026-06-23-imedtac-onsite-visit-smart-health-cabin/` | 2026-06-23 onsite meeting source package. |
| `source/2026-06-23-wu-line-hpa-adult-preventive-health-form/` | Prof. Wu LINE HPA adult preventive health form source package. |

## Next Gate

Create the first Smart Health Cabin feasibility response only after these are
clear:

- which MVP modules are in the September show path;
- which questionnaire forms are first-release scope;
- which fields are user-filled, staff-assisted, measured, lab-derived,
  clinician-interpreted, or report-only;
- whether Avatar is fixed-script, fixed-question voice I/O, or real-time
  ASR/TTS;
- whether the deliverable is feasibility memo, quotation input, prototype,
  implementation plan, or hospital-facing material.
