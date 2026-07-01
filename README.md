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

The MVP architecture direction is modular monolith first with
microservice-ready boundaries. Each user-facing module should be selectable,
testable, replaceable, and reportable through a shared module contract, while
the first implementation can share one backend, one database, and one
deployment path.

The `2026-06-25` 多寶 / Jason LINE follow-up narrows Phase 1 MVP delivery to:

```text
open questionnaire platform + ASR/LLM/TTS Avatar Agent
```

Vision and hearing remain planned modules, but move to Phase 2 after the
questionnaire + Avatar demo path works.

The current quotation decision draft is:

```text
handoff/2026-07-01_smart-health-station_149w-service-quotation.md
```

It supersedes the earlier two-station boss-level draft and the `2026-06-30`
first-build-fee v2 path, plus the `2026-07-01` lease-first v3 path, as the
active internal quotation path. The current quotation is `NTD 1,490,000`
tax-included for `智慧健康量測站軟硬體租用暨導入維運服務案`, with work-package
calculations, TISSA person-month basis, Taiwan procurement-market references,
and a 12-month service / use-rights structure. It keeps IP / know-how with our
side, treats hardware rental as one sub-item, and prices the real value as
導入、整合、維運、軟體使用權與成效資料服務.
The afternoon call transcript has been corrected and is now the source of
truth for the lease-first correction; the lease-advice source name is confirmed
as `余總`. The later expert recommendation is preserved as a full source and
Jason adopted its first structure and converted it into the 149 萬報價單.

## 2026-06-24 Module Research Packet

The active research packet asks whether open-source GitHub projects can be
adapted into the four modules while preserving customer-selectable activation.
It also frames the shared data layer as a lightweight module event/report layer
first, with Kafka-like infrastructure reserved for replay, multiple consumers,
durable ordering, or cross-service scale.

The `2026-06-24` monorepo / Redpanda architecture note is the canonical record
of the repo-splitting question, engineering answer, and future service-split
activation gates. The MVP system spec expands that note into an implementation
reference. The `2026-06-25` questionnaire + Avatar sprint plan is the active
Phase 1 delivery route.

Packet root:

```text
research-packets/2026-06-24-smart-health-cabin-module-research/
```

## Current MVP Direction

The active MVP direction is no longer the full four-module thin slice. The
current MVP should first prove that a hospital/admin can publish a questionnaire
and that the kiosk can collect answers with voice Avatar guidance.

The questionnaire MVP should not invent a new medical questionnaire.

Use:

- HPA adult preventive health service red-box fields as the Taiwan public-sector
  backbone;
- WHO STEPS core simplified public-health risk-factor fields as the
  international backbone;
- PHQ-9 as the first implemented demo seed;
- vision and hearing as Phase 2 planned modules;
- source-backed, non-diagnostic report wording.

First implemented seed:

```text
modules/questionnaire/seed/phq9.zh-TW.surveyjs.json
```

Canonical revised sprint plan:

```text
docs/specs/MVP-QUESTIONNAIRE-AVATAR-SPRINT-PLAN.md
```

The MVP report should provide health measurement summary, self-assessment
summary, health behavior reminders, and staff / healthcare-professional follow
up prompts. It should not output diagnosis, treatment advice, formal triage
level, or live HIS writeback claims.

## Local Development

Sprint 0-4 now uses the minimum pnpm workspace:

```text
apps/kiosk-web
apps/admin-web
apps/api-server
apps/outbox-worker
packages/contracts
packages/questionnaire-core
packages/report-core
infra/docker-compose.yml
infra/migrations/0001_sprint0_schema.sql
infra/migrations/0002_sprint2_3_4_cms_voice_outbox.sql
```

Run locally:

```bash
pnpm install
docker compose -f infra/docker-compose.yml up -d postgres
pnpm --filter @shc/api-server migrate
pnpm --filter @shc/api-server dev
pnpm --filter @shc/kiosk-web dev
pnpm --filter @shc/admin-web dev
docker compose -f infra/docker-compose.yml up -d redpanda redpanda-console
pnpm --filter @shc/outbox-worker start
```

Verify:

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test
pnpm validate:json
docker compose -f infra/docker-compose.yml config
```

Full local details live in:

```text
docs/dev/LOCAL_DEV.md
```

## Key Files

| File | Purpose |
| --- | --- |
| `docs/source-index.md` | Project-level source map. |
| `workstreams/smart-health-cabin/README.md` | Workstream index and current post-meeting scope. |
| `workstreams/smart-health-cabin/post-meeting-decision-log.md` | Confirmed facts, decisions, open questions, and next actions. |
| `workstreams/smart-health-cabin/hpa-adult-preventive-health-questionnaire-mvp-design-note.md` | Expert note and MVP design rules for the questionnaire path. |
| `workstreams/smart-health-cabin/mvp-questionnaire-system-architecture.md` | MVP questionnaire system architecture, complete field registry, options, report rules, and data tables. |
| `workstreams/smart-health-cabin/four-module-mvp-sdd-prep-spec.md` | Four-module MVP and SDD-prep specification for modular delivery and future service extraction. |
| `docs/specs/MVP-SYSTEM-SPEC.md` | Full-system MVP reference spec for monorepo structure, four modules, API, PostgreSQL, Redpanda, deployment, versioning, tests, and acceptance gates. |
| `docs/specs/MVP-FAST-MARCH-SPRINT-PLAN.md` | Superseded historical ten-working-day four-module plan. |
| `docs/specs/MVP-QUESTIONNAIRE-AVATAR-SPRINT-PLAN.md` | Active revised sprint plan for questionnaire platform plus ASR/LLM/TTS Avatar Agent. |
| `docs/devlog/README.md` | Daily sprint closeout convention for actual results, validation, blockers, and handoff. |
| `docs/devlog/2026-06-25.md` | Pivot/source devlog for the questionnaire + Avatar MVP route, PHQ-9 seed, and planning mirror. |
| `docs/dev/LOCAL_DEV.md` | Sprint 0-4 local development and verification commands. |
| `.github/workflows/ci.yml` | CI skeleton for install, JSON validation, lint, typecheck, tests, and build. |
| `apps/api-server/src/routes/questionnaireRoutes.ts` | Questionnaire, admin CMS, public report, and voice Agent API routes. |
| `apps/kiosk-web/src/features/avatar/` | Avatar state UI and voice-confirmed questionnaire helpers. |
| `apps/outbox-worker/src/` | Redpanda outbox worker, topic mapping, and mockable publisher seam. |
| `workstreams/smart-health-cabin/2026-06-25-questionnaire-avatar-mvp-pivot.md` | Decision record for moving vision/hearing to Phase 2 and making questionnaire + Avatar the MVP spine. |
| `handoff/2026-07-01_smart-health-station_149w-service-quotation.md` | Current internal quotation draft: `NTD 1,490,000` tax-included 智慧健康量測站軟硬體租用暨導入維運服務案, with TISSA-based work-package calculations, Taiwan market references, 12-month維運, and use-rights / IP-retention structure. |
| `handoff/2026-07-01_smart-health-station_mixed-service_quote-decision-v4.md` | Historical internal quote-decision draft: single mixed service case at `NTD 1,490,000`, with導入、軟硬體租用、維運、API / 資料架構、報告、教育訓練、SLA, IP retention, and Tomi review path. Superseded by the 149 萬報價單. |
| `handoff/2026-07-01_smart-health-station_lease-first_quote-decision-v3.md` | Historical internal quote-decision draft: lease-first pricing, IP retention, annual/monthly software lease anchor, small-procurement-friendly bundled lease ceiling, and Tomi review path. Superseded by v4. |
| `handoff/2026-06-30_smart-health-station_quote-decision-v2.md` | Historical internal quote-decision draft: one-station first-build package, build/license split, company-subject gate, backend/frontend responsibility split, and Tomi review path. Superseded by v3 and v4. |
| `modules/questionnaire/seed/phq9.zh-TW.surveyjs.json` | First SurveyJS questionnaire seed. |
| `modules/questionnaire/scoring/phq9.public-scoring-config.json` | PHQ-9 public report and safety-flag scoring configuration. |
| `workstreams/smart-health-cabin/module-a-vision-hearing-discovery.md` | Hearing and vision discovery constraints. |
| `workstreams/smart-health-cabin/module-b-questionnaire-triage-discovery.md` | Questionnaire/CMS/source-governance discovery. |
| `workstreams/smart-health-cabin/module-c-avatar-interaction-discovery.md` | Avatar voice interaction discovery. |
| `workstreams/smart-health-cabin/2026-06-24-open-source-module-research-plan.md` | Open-source module adaptation research plan. |
| `workstreams/smart-health-cabin/2026-06-24-mvp-monorepo-redpanda-architecture-note.md` | Reference architecture note for MVP monorepo, modular monolith, PostgreSQL, Redpanda, and event contracts. |
| `research-packets/2026-06-24-smart-health-cabin-module-research/README.md` | Packetized research set for hearing, vision, questionnaire, live Avatar, and the small module event layer. |
| `source/2026-06-23-imedtac-onsite-visit-smart-health-cabin/` | 2026-06-23 onsite meeting source package. |
| `source/2026-06-23-wu-line-hpa-adult-preventive-health-form/` | Prof. Wu LINE HPA adult preventive health form source package. |
| `source/2026-06-23-expert-questionnaire-authority-note/` | Full preserved expert opinion on authoritative questionnaire sources and non-diagnostic Smart Health Cabin positioning. |
| `source/2026-06-23-expert-mvp-questionnaire-narrowdown-note/` | Full preserved expert narrowdown for the anonymous MVP questionnaire system. |
| `source/2026-06-23-expert-four-module-sdd-prep-note/` | Full preserved planning direction for four selectable modules and SDD preparation. |

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
