---
id: smart-health-cabin-sprint-5-to-last-sprint-next-phase-handoff
title: "Sprint 5 To Last Sprint And Next Phase Handoff"
date: 2026-07-10
topic: smart-health-cabin
type: sprint-handoff
status: active
source:
  - ../prompts/sprint-5-codex-goal-prompt.md
  - ../prompts/sprint-6-last-sprint-codex-goal-prompt.md
  - ../prompts/phase-2-next-phase-codex-goal-prompt.md
  - ../phase2/activation-roadmap.md
---

# Sprint 5 To Last Sprint And Next Phase Handoff

## Purpose

Sprint 0-5 establish the Phase 1 Smart Health Cabin product spine. The next
step is a final evidence-freeze sprint followed by Phase 2 activation. This
handoff gives the next agent one route into the remaining work without
expanding Phase 1 scope.

## Current Phase 1 Spine

```text
admin publishes PHQ-9
-> kiosk loads active questionnaire
-> SurveyJS renders PHQ-9
-> static Avatar image shows voice state
-> voice Agent reads question/options
-> user answers by confirmed voice or touch
-> backend scores PHQ-9 server-side
-> item 9 safety route triggers staff / healthcare-professional support wording
-> report section is created
-> public report token / QR-ready URL is created
-> outbox rows are written
-> outbox-worker publishes to Redpanda
```

## Sprint 0-5 Result Map

| Sprint | Result | Next Use |
| --- | --- | --- |
| Sprint 0 | Monorepo, app/API/storage skeleton, module manifests, migration base, local dev docs. | Stable repo shape. |
| Sprint 1 | PHQ-9 SurveyJS render, touch capture, response persistence, scoring, item-9 flag, public summary. | Backend-owned questionnaire runtime. |
| Sprint 2 | Admin CMS, SurveyJS JSON validation/preview, version publish, report section, token/QR, audit. | Open questionnaire platform base. |
| Sprint 3 | Voice Agent seam, agent sessions/turns, ASR/respond/TTS path, SurveyJS-derived mapping, confirmation boundary. | Voice remains adapter over questionnaire. |
| Sprint 4 | Avatar state UI, voice-confirmed answers, outbox worker, Redpanda topics, failure isolation. | End-to-end demo spine. |
| Sprint 4.5 | Static Avatar, provider choices, model sidecar plan, provider status, mock/live fallback boundary. | Provider/runtime choices are fixed. |
| Sprint 5 | Live acceptance hardening, provider acceptance rule, repeatable demo, release evidence target. | Phase 1 can close after evidence freeze. |

## Last Sprint Work Order

The last sprint is a release-evidence sprint, not a new feature sprint.

Must finish:

- five-run demo evidence;
- provider live acceptance matrix;
- public report safety proof;
- PHQ-9 item 9 staff-review proof;
- outbox and Redpanda proof;
- fallback and rollback proof;
- stakeholder handoff summary;
- Phase 2 activation plan.

Suggested evidence files:

```text
docs/evidence/sprint-5-five-run-demo.md
docs/ops/LIVE_PROVIDER_RUNBOOK.md
docs/ops/ROLLBACK_AND_FALLBACK.md
docs/phase2/activation-roadmap.md
docs/devlog/2026-07-10.md
```

## Phase 1 Exit Claim

Phase 1 can be described as:

```text
A local-first Smart Health Cabin demo for configurable questionnaire intake,
static Avatar-guided voice interaction, PHQ-9 server-side scoring, safe public
reporting, and nonblocking event delivery through outbox/Redpanda.
```

This claim is bounded by its evidence. New modules belong in Phase 2.

## Next Phase Order

Default order:

1. Phase 2A provider validation.
2. Phase 2B questionnaire expansion.
3. Phase 2C vision/hearing activation.
4. Phase 3 integration and governance.

Phase 2A should start first unless a stakeholder explicitly selects
questionnaire expansion as the next demo priority.

## Phase 2 Entry Gate

Do not start Phase 2 until:

- Phase 1 release evidence is discoverable;
- Sprint 5 status is complete or the exact blocker is recorded;
- one Phase 2 lane has an owner-ready acceptance gate;
- public-facing wording remains non-diagnostic;
- Redpanda remains nonblocking to the questionnaire/report path.

