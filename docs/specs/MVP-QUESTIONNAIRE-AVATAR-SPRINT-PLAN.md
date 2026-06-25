---
id: smart-health-cabin-questionnaire-avatar-sprint-plan
title: "Smart Health Cabin MVP v0.1 Questionnaire + Avatar Sprint Plan"
date: 2026-06-25
topic: smart-health-cabin
type: implementation-schedule-reference
status: active
source:
  - ../../source/2026-06-25-duobao-line-questionnaire-avatar-mvp/source.md
  - ../../workstreams/smart-health-cabin/2026-06-25-questionnaire-avatar-mvp-pivot.md
  - ../../modules/questionnaire/seed/phq9.zh-TW.surveyjs.json
  - ../../modules/questionnaire/scoring/phq9.public-scoring-config.json
  - ./MVP-SYSTEM-SPEC.md
---

# Smart Health Cabin MVP v0.1 Questionnaire + Avatar Sprint Plan

## Record Purpose

This plan supersedes the `2026-06-24` four-module fast-march plan for the
current MVP delivery path. The new MVP focuses on an open questionnaire system
and ASR/LLM/TTS Avatar Agent. Vision and hearing move to Phase 2.

## MVP Definition

```text
Smart Health Cabin MVP v0.1
Core: open questionnaire platform + voice Avatar Agent
Deferred: vision and hearing modules
```

The target path is:

```text
session -> active questionnaire -> SurveyJS render -> PHQ-9 answer collection
-> score + safety flag -> Avatar voice guidance -> report -> QR Code
-> PostgreSQL -> outbox -> Redpanda
```

## Sprint Calendar

| Sprint | Dates | Theme |
| --- | --- | --- |
| Sprint 0 | `2026-06-25` Thu to `2026-06-26` Fri | monorepo + questionnaire skeleton |
| Sprint 1 | `2026-06-29` Mon to `2026-06-30` Tue | SurveyJS + PHQ-9 seed + kiosk answer save |
| Sprint 2 | `2026-07-01` Wed to `2026-07-02` Thu | questionnaire CMS + versioning + report |
| Sprint 3 | `2026-07-03` Fri + `2026-07-06` Mon | ASR + LLM + TTS voice Agent MVP |
| Sprint 4 | `2026-07-07` Tue to `2026-07-08` Wed | Avatar UI + voice-guided questionnaire + Redpanda outbox |
| Sprint 5 | `2026-07-09` Thu to `2026-07-10` Fri | E2E hardening + roles + deployment docs |

Weekend boundaries:

- `2026-06-27` to `2026-06-28`;
- `2026-07-04` to `2026-07-05`.

No silent sprint overflow into weekend blocks.

## Sprint 0: Monorepo + Questionnaire Skeleton

Dates:

```text
2026-06-25 to 2026-06-26
```

Goal:

```text
Make questionnaire a configurable module and keep Avatar, vision, and hearing
as explicit module-registry entries.
```

Deliverables:

- monorepo structure;
- `kiosk-web` skeleton;
- `admin-web` skeleton;
- `api-server` skeleton;
- `voice-agent-server` placeholder;
- `outbox-worker` placeholder;
- PostgreSQL docker-compose / migration skeleton;
- questionnaire module manifest;
- avatar-agent module manifest;
- vision/hearing Phase 2 manifests;
- session, questionnaire, response, report, outbox, and audit table plan;
- local dev README;
- CI skeleton.

Acceptance:

- PostgreSQL starts;
- `/healthz` exists or exact API blocker is recorded;
- `questionnaire` is enabled in registry;
- `avatar_agent` is enabled in registry;
- `vision` and `hearing` are marked `phase_2_planned`;
- session creation path exists or exact blocker is recorded.

## Sprint 1: SurveyJS + PHQ-9 Seed + Kiosk Save

Dates:

```text
2026-06-29 to 2026-06-30
```

Goal:

```text
Render PHQ-9 from SurveyJS JSON and save completed answers to PostgreSQL.
```

Deliverables:

- SurveyJS Form Library wired into `kiosk-web`;
- PHQ-9 SurveyJS seed loaded from:
  `modules/questionnaire/seed/phq9.zh-TW.surveyjs.json`;
- `questionnaire_versions` stores SurveyJS JSON;
- `questionnaire_responses` stores raw answers;
- PHQ-9 scoring and `phq9_09` safety flag;
- public summary avoids diagnostic wording.

Acceptance:

- active questionnaire can be fetched from API;
- kiosk renders PHQ-9;
- user can complete PHQ-9 by touch;
- answers persist;
- total score is computed;
- `phq9_09 > 0` triggers `requires_human_review`;
- public report language remains non-diagnostic.

## Sprint 2: Questionnaire CMS + Versioning + Report

Dates:

```text
2026-07-01 to 2026-07-02
```

Goal:

```text
Make questionnaire open enough that hospital/admin users can manage forms
without hard-coding each questionnaire.
```

Deliverables:

- questionnaire template list;
- JSON editor + preview for SurveyJS model;
- draft / published / archived status;
- active version selection;
- response list;
- `report_section` creation;
- public report token / QR Code;
- audit events for create/edit/publish.

Acceptance:

- admin can create questionnaire template;
- admin can paste SurveyJS JSON and preview it;
- admin can publish a version;
- kiosk reads only active published version;
- completed response creates report section;
- QR public report shows safe summary;
- admin can see response list.

## Sprint 3: ASR + LLM + TTS Voice Agent MVP

Dates:

```text
2026-07-03 and 2026-07-06
```

Goal:

```text
Make the voice loop work before polishing Avatar visuals.
```

Deliverables:

- microphone capture;
- ASR endpoint;
- LLM flow-guidance endpoint;
- TTS endpoint;
- `agent_sessions`;
- `agent_turns`;
- fallback to touch UI;
- safety prompt.

Agent can:

- read or explain the current question;
- read answer options;
- map user speech to a candidate option;
- ask for confirmation;
- recommend staff/healthcare-professional support on safety flags.

Agent cannot:

- diagnose depression;
- give treatment advice;
- change PHQ-9 scoring;
- auto-answer without confirmation.

Acceptance:

- frontend records audio;
- ASR returns text;
- LLM returns short flow-guidance text;
- TTS returns playable audio;
- `agent_turns` logs the turn;
- touch fallback still completes the questionnaire;
- responses contain no diagnostic claims.

## Sprint 4: Avatar UI + Voice-Guided Questionnaire + Redpanda Outbox

Dates:

```text
2026-07-07 to 2026-07-08
```

Goal:

```text
Put Avatar state on screen and connect voice interaction to questionnaire
answer confirmation.
```

Deliverables:

- Avatar UI shell;
- idle / listening / transcribing / thinking / speaking / confirming / error
  states;
- Avatar reads PHQ-9 questions and options;
- spoken answer maps to SurveyJS option value;
- confirmation step before answer write;
- outbox-worker;
- Redpanda topics;
- Redpanda Console event visibility.

Acceptance:

- Avatar appears on screen;
- Avatar can play TTS;
- Avatar can read at least PHQ-9 questions;
- user can answer at least 3 questions by voice;
- system asks for confirmation;
- confirmed answer writes into questionnaire state;
- full questionnaire can still be completed;
- Redpanda failure does not block kiosk completion.

## Sprint 5: E2E Hardening + Roles + Deployment Docs

Dates:

```text
2026-07-09 to 2026-07-10
```

Goal:

```text
Turn a runnable prototype into a demo path that can be explained to imedtac,
NYCU, and hospital stakeholders.
```

Deliverables:

- E2E demo script;
- admin / staff / kiosk roles;
- public report token;
- PHQ-9 safety handling tests;
- voice failure fallback;
- deployment README;
- API spec;
- DB ERD;
- known limitations;
- Phase 2 vision/hearing expansion plan.

Acceptance:

- demo runs five consecutive times;
- voice failure falls back to touch;
- `phq9_09 > 0` triggers safety route;
- public report avoids diagnosis;
- admin can see internal score and response;
- public token exposes only public report;
- Redpanda events are visible;
- another machine can rebuild the environment from docs.

## Priority Order

```text
P0 questionnaire data model
P0 SurveyJS kiosk render
P0 PHQ-9 seed
P0 response persistence
P0 PHQ-9 scoring + safety flag
P0 public report + QR Code

P1 questionnaire CMS
P1 questionnaire versioning
P1 Avatar voice guidance
P1 ASR + TTS loop
P1 agent_turns log

P2 LLM conversation quality
P2 Redpanda outbox
P2 admin response dashboard
P2 deployment docs

P3 vision
P3 hearing
P3 HIS adapter
```

## Today’s Five Actions

For `2026-06-25`, the active finish line is:

```text
1. Record the pivot.
2. Confirm SurveyJS Form Library source/location.
3. Copy PHQ-9 source and agent-readable Markdown into the repo.
4. Create phq9.zh-TW.surveyjs.json.
5. Plan questionnaire_versions / questionnaire_responses migrations.
```

SurveyJS package location remains an implementation check. No local SurveyJS
download was found in Downloads or this repo during this planning update.
