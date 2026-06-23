---
id: smart-health-cabin-reuse-from-ai-triage
title: "Reuse From AI Triage"
date: 2026-06-17
topic: smart-health-cabin
type: architecture-note
status: active
source:
  - ../../../imedtac-ai-triage-kiosk-v0/docs/architecture-insertion-and-clinical-grounding.md
  - ../../../imedtac-ai-triage-kiosk-v0/decisions/2026-05-22-api-contract-freeze-and-change-control.md
  - ../../source/2026-06-17-imedtac-smart-health-cabin-requirements/source.md
---

# Reuse From AI Triage

## Reusable Patterns

The Smart Health Cabin workstream can reuse these AI Triage patterns:

- measured-context-first product thinking;
- choice-only patient-facing questionnaire flow;
- stable question IDs and option IDs;
- explicit `not_sure` answer state;
- branch path recording;
- question set and wording versioning;
- staff-review / report summary structure;
- API contract discipline;
- source provenance and clinical-review boundary;
- change-control habit for externally communicated behavior.

## What Should Stay Separate

Do not treat the Smart Health Cabin as a drop-in extension of the current AI
Triage implementation.

Keep separate:

- current June two-endpoint AI Triage rehearsal API;
- demo bearer-token behavior;
- tachycardia question set;
- internal routing / summary implementation details;
- patent-sensitive method details;
- future production HIS integration claims;
- vision and hearing implementation scope.

## Likely Reuse Shape

The best reuse is architectural and documentary first:

```text
AI Triage lessons
-> questionnaire schema discipline
-> versioned branching model
-> report data structure
-> source-backed content workflow
-> Smart Health Cabin-specific implementation design
```

Reuse should happen through a designed Smart Health Cabin schema inside this
workspace, not by quietly mutating the current AI Triage contract.

## Implementation Trigger

Create implementation folders or a downstream delivery repo when any of the
following starts:

- formal Smart Health Cabin API design;
- CMS implementation;
- vision/hearing prototype code;
- ERD/data model implementation;
- source-code package planning;
- quotation or delivery schedule management;
- hospital-facing acceptance material.
