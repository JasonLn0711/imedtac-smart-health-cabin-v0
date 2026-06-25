---
id: smart-health-cabin-sprint-0-4-5-to-sprint-5-plus-handoff
title: "Sprint 0-4.5 To Sprint 5+ Handoff"
date: 2026-07-09
topic: smart-health-cabin
type: sprint-handoff
status: active
source:
  - ../specs/MVP-QUESTIONNAIRE-AVATAR-SPRINT-PLAN.md
  - ../devlog/2026-06-26.md
  - ../devlog/2026-06-29.md
  - ../devlog/2026-06-30.md
  - ../devlog/2026-07-01.md
  - ../devlog/2026-07-02.md
  - ../devlog/2026-07-03.md
  - ../devlog/2026-07-06.md
  - ../devlog/2026-07-07.md
  - ../devlog/2026-07-08.md
  - ../prompts/sprint-4.5-codex-goal-prompt.md
---

# Sprint 0-4.5 To Sprint 5+ Handoff

## Purpose

This handoff lets Sprint 5 and later work continue from the actual Sprint 0-4
closeouts plus the Sprint 4.5 technology-selection gate instead of
rediscovering the system.

The current documented Phase 1 sprint plan ends at Sprint 5:

```text
Sprint 5: E2E hardening + roles + deployment docs
```

Sprint 4.5 freezes the local-first voice stack before Sprint 5:

```text
static image Avatar
faster-whisper + Breeze-ASR-26 int8
local Gemma 4 E4B through vLLM
BreezyVoice default voice only
Python FastAPI ASR/TTS sidecars
TypeScript voice-agent-server orchestrator
xstate Avatar state machine
kafkajs Redpanda client
```

After Sprint 5, new work should be planned as Phase 2 activation rather than
silently expanding Phase 1.

## Current Product Spine

Sprint 0-4.5 established this demo path:

```text
admin publishes PHQ-9
-> kiosk loads active questionnaire
-> SurveyJS renders questions
-> static Avatar image shows voice state
-> voice Agent reads questions and options
-> user confirms voice candidate answers
-> touch fallback remains available
-> questionnaire response is submitted
-> backend scores PHQ-9 and item 9 safety flag
-> report section and public report token are created
-> QR-ready public report URL is returned
-> outbox rows are written
-> outbox-worker publishes events to Redpanda
```

## Sprint 0-4.5 Capability Map

| Sprint | What Exists Now | Canonical Evidence |
| --- | --- | --- |
| Sprint 0 | Monorepo, app/API/storage skeleton, module manifests, local dev route, CI, PostgreSQL migration base. | `docs/devlog/2026-06-26.md` |
| Sprint 1 | PHQ-9 SurveyJS kiosk render, touch answer capture, response persistence, backend scoring, item-9 safety flag, non-diagnostic public summary, pending outbox rows. | `docs/devlog/2026-06-29.md`, `docs/devlog/2026-06-30.md` |
| Sprint 2 | Admin questionnaire CMS path, SurveyJS JSON validation/preview, draft/publish lifecycle, active questionnaire version, report section, public token / QR URL, admin response list, audit trail. | `docs/devlog/2026-07-01.md`, `docs/devlog/2026-07-02.md` |
| Sprint 3 | Deterministic mock ASR/respond/TTS endpoints, `agent_sessions`, `agent_turns`, SurveyJS-derived question reading, answer mapping, confirmation before write, touch fallback. | `docs/devlog/2026-07-03.md`, `docs/devlog/2026-07-06.md` |
| Sprint 4 | Avatar state UI, three voice-confirmed PHQ-9 answers in kiosk smoke, outbox-worker, Redpanda topics, event publishing, nonblocking Redpanda failure behavior. | `docs/devlog/2026-07-07.md`, `docs/devlog/2026-07-08.md` |
| Sprint 4.5 | Technology choices frozen for local-first providers: static image Avatar, `xstate`, `MediaRecorder`, `faster-whisper` + Breeze-ASR-26, local Gemma via vLLM, BreezyVoice default voice only, Python ASR/TTS sidecars, `pino` / JSON logging, provider-status route, mock/live fallback boundary. | `docs/prompts/sprint-4.5-codex-goal-prompt.md` |

## Do Not Rebuild

Sprint 5 should reuse these foundations:

- existing pnpm workspace and app/package boundaries;
- existing SurveyJS PHQ-9 seed and active questionnaire route;
- existing backend scoring and safety flag path;
- existing admin publish lifecycle;
- existing report/public-token route;
- existing mock voice provider seams;
- existing Avatar state UI;
- existing outbox event table and worker;
- existing Redpanda topic mapping;
- Sprint 4.5 selected provider boundaries and static Avatar decision.

Sprint 5 should not introduce:

- a second questionnaire engine;
- frontend-owned scoring;
- a new backend framework;
- a separate Avatar answer store;
- synchronous Redpanda dependency in the kiosk/API path;
- vision or hearing implementation inside Phase 1 hardening;
- Avatar animation, lip-sync, viseme mapping, Live2D, 3D, or Avatar SDK;
- customized TTS voice, reference audio, speaker embedding, or voice cloning.

## Sprint 5 Entry Gate

Before Sprint 5 starts, confirm the current spine still passes:

```bash
corepack pnpm validate:json
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm build
corepack pnpm test
git diff --check
```

Runtime checks should prove:

- active questionnaire loads;
- admin publish path still works;
- kiosk can complete PHQ-9 by touch;
- kiosk can confirm at least three answers by voice path;
- completed response creates report section and public report URL;
- item 9 positive routes to human review language;
- public output contains no diagnostic wording;
- outbox-worker can publish pending events or record an exact Redpanda blocker;
- provider-status route reports ASR / LLM / TTS as `live`, `mock`, or
  `unavailable` with exact blockers;
- static Avatar image path resolves or placeholder SVG exists;
- mock provider path still supports the Sprint 4 E2E path;
- BreezyVoice integration remains default-voice only.

## Sprint 5 Work Order

Sprint 5 should turn the working prototype into a repeatable stakeholder demo.
It should not perform model selection. Sprint 4.5 already owns that decision.

### Sprint 5 D1: E2E Demo Replay + Roles + Provider Mode Matrix

Finish line:

```text
One reviewer can run the same demo path repeatedly and understand each role,
provider mode, and fallback path.
```

Tasks:

- write a replayable E2E demo script;
- define demo roles: kiosk user, admin/staff reviewer, technical operator;
- add provider mode matrix: ASR / LLM / TTS `live`, `mock`, `unavailable`;
- verify static Avatar image path and state labels;
- confirm public token can only expose public report content;
- add or refresh PHQ-9 item-9 safety tests;
- verify voice failure falls back to touch;
- verify live-provider blockers do not block mock E2E;
- document the exact happy path, fallback path, and operator recovery path;
- record `docs/devlog/2026-07-09.md`.

Acceptance:

- demo script covers admin publish -> kiosk -> voice-confirmed answers ->
  submit -> report / QR -> outbox -> Redpanda;
- role boundary is explicit;
- provider mode matrix is explicit;
- static Avatar is present without animation/lip-sync scope creep;
- item 9 safety route is tested;
- public report hides raw answers and internal score payloads;
- voice failure does not block questionnaire completion;
- live provider failure leaves mock path usable and documented.

### Sprint 5 D2: Release Packet + Deployment Docs + Phase 2 Design

Finish line:

```text
Another engineer can rebuild the local demo, replay the evidence, and explain
the next activation path.
```

Tasks:

- update deployment README;
- update `.env.example` and provider setup notes;
- write API route summary;
- write DB ERD / table relationship summary;
- write known limitations;
- write Phase 2 provider validation and vision/hearing activation plan;
- freeze the demo evidence checklist;
- record `docs/devlog/2026-07-10.md`.

Acceptance:

- local setup path is reproducible;
- provider setup has live and mock modes;
- API and DB docs match current implementation;
- known limitations are written as scope controls and next validation layers;
- Phase 2 modules are planned without diluting Phase 1 demo completion.

## Phase 1 Exit Definition

Phase 1 can be called demo-ready when:

- demo runs five consecutive times;
- questionnaire completion works by touch and voice-confirmed path;
- public report remains non-diagnostic;
- item 9 positive routes to staff / healthcare-professional support language;
- static Avatar remains a presentation layer over the governed voice state;
- ASR / LLM / TTS provider mode is visible and fallback behavior is documented;
- BreezyVoice remains default-voice only;
- Redpanda event visibility is available or exact environment blocker is
  documented while kiosk/report path still works;
- deployment, API, DB, and known-limitation docs are current;
- Phase 2 activation plan is documented.

## Post-Sprint 5 Design

After Sprint 5, treat new work as explicit activation lanes. Do not mix them
back into Phase 1 hardening.

### Phase 2A: Provider Validation

Activation goal:

```text
Replace demo mocks with measured local AI providers where hardware and model
files support them.
```

Scope:

1. ASR validation:
   - Mandarin PHQ-9 answer phrases;
   - Taigi phrases;
   - Mandarin / Taigi mixed speech;
   - noisy or empty audio fallback.
2. LLM validation:
   - local Gemma through vLLM;
   - response latency;
   - no diagnosis / no treatment wording;
   - confirmation-before-write preserved.
3. TTS validation:
   - BreezyVoice default voice only;
   - no reference audio or speaker cloning;
   - fallback to mock playable audio when local TTS is unavailable.
4. Runtime validation:
   - healthz / readyz;
   - provider status route;
   - operator startup runbook.

Exit gate:

```text
The demo can state exactly which providers are live, which are mocked, and what
evidence supports each mode.
```

### Phase 2B: Questionnaire Expansion

Scope:

- HPA adult preventive health source fields;
- WHO STEPS-style public-health risk fields;
- AD-8 or other approved questionnaire sources after source review;
- admin CMS import/edit flow;
- scoring strategy per questionnaire.

Scope control:

```text
Each questionnaire must have source evidence, public wording control, and a
backend scoring strategy before it enters kiosk demo flow.
```

### Phase 2C: Vision / Hearing Activation

Scope:

1. Vision module:
   - Landolt C / Tumbling E demo module;
   - calibration and distance assumptions;
   - report section and quality flags.
2. Hearing module:
   - speaker-based tone response demo;
   - calibration notes;
   - report section and quality flags.

Activation gate:

```text
Vision and hearing start only after Phase 1 can replay the questionnaire +
voice + report + outbox demo without regression.
```

### Phase 3: Integration And Governance

Scope:

1. HIS / FHIR / integration:
   - export contract only after stakeholder confirms data ownership and privacy
     model;
   - no production HIS connection in Phase 1.
2. Production governance:
   - auth/RBAC hardening;
   - audit policy;
   - deployment security;
   - clinical validation path.

## Next Agent Instruction

If you are starting Sprint 5, do this first:

```text
1. Read this handoff.
2. Read docs/devlog/2026-07-08.md.
3. Read docs/prompts/sprint-4.5-codex-goal-prompt.md.
4. Run the baseline validation commands.
5. Replay the E2E path before adding features.
6. Record provider mode: ASR / LLM / TTS live, mock, or unavailable.
7. Document exact blocker if any part of Sprint 0-4.5 regressed.
```

Sprint 5 should harden and explain the existing path. It should not expand the
system until the demo path is replayable.
