---
id: 2026-06-25-questionnaire-avatar-mvp-pivot
title: "2026-06-25 Questionnaire + Avatar MVP Pivot"
date: 2026-06-25
topic: smart-health-cabin
type: decision-record
status: active
source:
  - ../../source/2026-06-25-duobao-line-questionnaire-avatar-mvp/source.md
  - ../../source/2026-06-25-duobao-line-questionnaire-avatar-mvp/extracted/2026-06-25-phq9-zh-TW-agent-readable.md
  - ../../modules/questionnaire/seed/phq9.zh-TW.surveyjs.json
  - ../../docs/specs/MVP-QUESTIONNAIRE-AVATAR-SPRINT-PLAN.md
---

# 2026-06-25 Questionnaire + Avatar MVP Pivot

## Decision

Smart Health Cabin Phase 1 now prioritizes:

```text
open questionnaire platform + ASR/LLM/TTS Avatar Agent
```

Vision and hearing move to Phase 2. They remain planned modules in the module
registry, but they no longer drive the July MVP schedule.

## Why This Pivot Holds

The LINE discussion with 多寶 established a better first delivery shape:

- the upstream requirement is still unstable;
- no one has yet fixed the exact clinical or city-government use case;
- hearing and vision add hardware, calibration, and wording risk too early;
- a questionnaire system is the likely hospital-owned extensibility point;
- Avatar voice interaction is the visible demo capability for September;
- a narrow first questionnaire can prove the full data path without waiting for
  hearing/vision validation.

The new MVP is narrower and stronger:

```text
hospital/admin creates questionnaire -> SurveyJS renders it -> kiosk collects
answers -> PHQ-9 scoring/safety flag runs -> Avatar guides by voice -> report
and QR Code are generated -> PostgreSQL stores the result -> outbox events are
published later.
```

## Phase 1 Scope

Phase 1 owns:

- questionnaire template/version storage;
- SurveyJS JSON rendering;
- PHQ-9 seed questionnaire;
- questionnaire response persistence;
- scoring and safety flags;
- public report and QR Code;
- Avatar Agent voice loop: ASR, LLM flow guidance, TTS, Avatar UI state;
- outbox events for questionnaire, agent, report, and audit events.

Phase 1 does not own:

- formal vision measurement;
- formal hearing measurement;
- speaker calibration;
- MMSE or AD-8 clinical deployment;
- diagnosis, treatment advice, or autonomous medical judgment;
- live HIS writeback;
- full FHIR mapping;
- production governance package.

## First Questionnaire

Use PHQ-9 as the first demo questionnaire because it is:

- public-health adjacent;
- easy to render as single-choice options;
- scoreable from 9 integer answers;
- suitable for proving database persistence, scoring, report, and safety-route
  behavior.

Canonical source copies:

```text
source/2026-06-25-duobao-line-questionnaire-avatar-mvp/assets/2026-06-25-phq9-zh-TW-source.pdf
source/2026-06-25-duobao-line-questionnaire-avatar-mvp/extracted/2026-06-25-phq9-zh-TW-agent-readable.md
modules/questionnaire/source/phq9.zh-TW.source.pdf
modules/questionnaire/source/phq9.zh-TW.agent-readable.md
```

Seed files:

```text
modules/questionnaire/seed/phq9.zh-TW.surveyjs.json
modules/questionnaire/scoring/phq9.public-scoring-config.json
```

## Safety Scope

PHQ-9 item 9 requires a human-review route. If `phq9_09 > 0`, the public report
should prioritize staff/healthcare-professional consultation language.

Public report should not say:

```text
你有憂鬱症
中度憂鬱
重度憂鬱
```

Public report should say:

```text
您有填答到需要進一步關心的項目，建議洽詢現場人員或醫護人員協助。
```

Internal staff review can preserve source labels and total score, but public UI
uses non-diagnostic self-check language.

## Phase 2 Position

Vision and hearing are not cancelled. They are deferred until Phase 1 proves:

- session flow;
- configurable questionnaire;
- shared report section;
- public report token / QR Code;
- Avatar-guided interaction;
- PostgreSQL persistence;
- outbox events.

After that, Phase 2 can add:

- `vision`: Landolt C / Tumbling E thin slice;
- `hearing`: fixed-speaker tone response with calibration profile and quality
  flags.

## Immediate Next Action

Update the July sprint plan, planning weekly/daily notes, project locator, and
devlog route so all work now points to the questionnaire + Avatar MVP.
