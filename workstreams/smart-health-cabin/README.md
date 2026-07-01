---
id: smart-health-cabin-workstream
title: "Smart Health Cabin Workstream"
date: 2026-06-17
topic: smart-health-cabin
type: workstream-index
status: active
source:
  - ../../source/2026-06-17-imedtac-smart-health-cabin-requirements/source.md
  - ../../source/2026-06-23-imedtac-onsite-visit-smart-health-cabin/source.md
  - ../../source/2026-06-23-expert-questionnaire-authority-note/source.md
  - ../../source/2026-06-23-expert-mvp-questionnaire-narrowdown-note/source.md
  - ../../source/2026-06-23-expert-four-module-sdd-prep-note/source.md
  - ../../source/2026-06-29-johnny-line-open-measurement-station-budget-call/source.md
  - ../../../imedtac-ai-triage-kiosk-v0/source/2026-06-16-imedtac-teams-question-option-adjustment/source.md
  - ../../source/2026-06-17-smart-health-cabin-expert-tutorial-note/source.md
  - ./external-authority-verification.md
---

# Smart Health Cabin Workstream

## Purpose

This folder is the active workspace for the 北市聯醫 / Smart Health Cabin
collaboration requirements raised by 慧誠智醫（imedtac Co., Ltd.）on
`2026-06-17` and clarified during the `2026-06-23` onsite meeting.

It preserves source context, discovery notes, module boundaries, MVP design
logic, feasibility inputs, and future handoff material for the Smart Health
Cabin project.

## Current Post-Meeting Scope

The `2026-06-23 14:59` onsite meeting transcript reframes the Smart Health
Cabin software scope as four user-facing modules:

1. hearing module;
2. vision module;
3. questionnaire module;
4. Avatar interaction module.

The Avatar module belongs next to the questionnaire flow. The working concept
is voice interaction with an on-screen Avatar that can ask questionnaire items,
listen to the person's spoken answer, and help input the answer.

Data integration remains a cross-module layer: integrated report, QR Code,
HIS/API/JSON, database, and CMS connection. It is important for delivery, but
it is not counted as a fifth user-facing module in the current meeting record.

The current architecture direction is modular monolith first with
microservice-ready boundaries. Four modules can be selected, tested, quoted,
and later extracted independently, while the MVP can share one backend, one
database, and one deployment path.

## 2026-06-25 MVP Pivot

The 多寶 / Jason LINE follow-up narrows the Phase 1 MVP to:

```text
open questionnaire platform + ASR/LLM/TTS Avatar Agent
```

This pivot keeps the module architecture but changes delivery order. The active
show path now proves questionnaire publishing, PHQ-9 rendering, response
persistence, scoring/safety flags, public report/QR, and voice Avatar guidance.
Vision and hearing are Phase 2 planned modules.

Canonical pivot note:

```text
2026-06-25-questionnaire-avatar-mvp-pivot.md
```

Active sprint plan:

```text
../../docs/specs/MVP-QUESTIONNAIRE-AVATAR-SPRINT-PLAN.md
```

## 2026-06-29 Johnny Scope And Budget Call

Johnny's `2026-06-29` LINE call updates the delivery context: the hardware
presentation is now an open measurement station rather than a closed cabin
body, imedtac needs NYCU's plan and quote range for the module scope, and
Avatar is expected to integrate an existing related vendor service instead of
being built fully from zero by NYCU.

The active quote-prep record is:

```text
2026-06-29-johnny-call-budget-scope-note.md
```

The working response should prepare two to three scope/budget versions, a
minimum hardware specification, and a compact-computer option list for Johnny
and Prof. Wu to review.

## 2026-06-29 Prof. Wu Internal Quote Scenarios

The internal quote-prep file uses total-budget reverse calculation for the
`NTD 1,500,000 / one station` and `NTD 1,500,000 / two stations` scenarios. It
states that `NTD 1,500,000` is an internal budget envelope, not a verified
imedtac public hardware price, and keeps station hardware, Avatar vendor fees,
and compact AI compute outside NYCU's base software/integration quote unless
Prof. Wu explicitly chooses otherwise.

The internal quote-scenario record is:

```text
2026-06-29-prof-wu-internal-quote-scenarios.md
```

## 2026-07-01 Prof. Wu Quote Meeting Analysis

The corrected `2026-06-30 23:34` to `2026-07-01 00:20` Prof. Wu transcript
updates the quotation strategy. The main accepted direction is to lead with a
one-station / one-system first-build quote, keep hardware price provisional,
avoid NYCU as the external delivery subject, and split the first-build fee from
future license, maintenance, and small-customization fees.

Source and analysis:

```text
../../source/2026-06-30-expert-quote-method-update/transcript-corrected.md
../../source/2026-07-01-tomi-line-quote-alignment-scheduling/source.md
../../source/2026-07-01-expert-backend-integration-quote-revision/source.md
2026-07-01-prof-wu-quote-meeting-deep-analysis.md
../../handoff/2026-06-30_smart-health-station_quote-decision-v2.md
```

Immediate gate: align with Tomi on build fee, future per-set license logic,
company subject, 慧誠 frontend responsibility split, and IP / source-code wording
before replying to 慧誠智醫. The `2026-07-01` LINE scheduling source confirms
Jason, 多寶, and Tomi aimed for a `22:00` fast `30` minute alignment.

## 2026-06-24 Open-Source Module Research

The active research packet asks whether open-source GitHub projects can be
adapted into independent hearing, vision, questionnaire, and live Avatar
modules. The shared data path should begin as a small module event/report layer;
Kafka-like infrastructure remains an activation gate for replay, multiple
consumers, durable ordering, realtime fan-out, or cross-service scale.

The same date's MVP monorepo / Redpanda architecture note records Jason's
repo-splitting question, the modular-monolith answer, the event-contract
principle, and the conditions for future multi-repo extraction. The fast-march
Sprint 0-4 plan compresses the MVP path into `10` working days as a thin-slice
demo schedule, not as a full-product commitment.

Packet root:

```text
../../research-packets/2026-06-24-smart-health-cabin-module-research/
```

## Boundary

This project is separate from `../imedtac-ai-triage-kiosk-v0`. It can reuse AI Triage
architecture discipline, source provenance, versioned questionnaire thinking,
and staff-review reporting patterns, but it does not change the current AI
Triage API contract.

Implementation folders should be added only after a delivery decision is
recorded, such as:

- `app/`
- `cms/`
- `vision/`
- `hearing/`
- `smart-health-cabin-api/`

This folder is now the separate collaboration workspace that was previously
missing. Keep future Smart Health Cabin material here rather than inside
`../imedtac-ai-triage-kiosk-v0`.

## Working Files

| File | Use |
| --- | --- |
| `2026-06-23-onsite-discovery-plan.md` | Meeting agenda, likely imedtac discussion topics, visit objectives, and preparation checklist. |
| `email-requirements-brief.md` | One-page source-backed brief of Johnny's email and the requirements PDF. |
| `module-a-vision-hearing-discovery.md` | Discovery plan for the vision and hearing self-measurement module. |
| `module-b-questionnaire-triage-discovery.md` | Discovery plan for the questionnaire triage / department guidance module. |
| `module-c-avatar-interaction-discovery.md` | Discovery note for the Avatar voice interaction module added in the `2026-06-23` onsite meeting. |
| `2026-06-24-open-source-module-research-plan.md` | Open-source module adaptation research plan. |
| `2026-06-24-mvp-monorepo-redpanda-architecture-note.md` | Reference architecture note for MVP monorepo, modular monolith, PostgreSQL, Redpanda, event contracts, and future repo-splitting gates. |
| `../../docs/specs/MVP-SYSTEM-SPEC.md` | Full-system MVP reference spec for repo strategy, apps, modules, PostgreSQL, Redpanda, API, deployment, versioning, tests, and acceptance gates. |
| `../../docs/specs/MVP-FAST-MARCH-SPRINT-PLAN.md` | Superseded fast-march Sprint 0-4 reference plan for the earlier four-module path. |
| `../../docs/specs/MVP-QUESTIONNAIRE-AVATAR-SPRINT-PLAN.md` | Active revised sprint plan for questionnaire + Avatar MVP v0.1. |
| `2026-06-25-questionnaire-avatar-mvp-pivot.md` | Decision record for moving vision/hearing to Phase 2 and prioritizing questionnaire + Avatar. |
| `2026-06-29-johnny-call-budget-scope-note.md` | Johnny call note for open measurement-station scope, budget versions, Avatar vendor integration, and compact hardware questions. |
| `2026-06-29-prof-wu-internal-quote-scenarios.md` | Prof. Wu internal quote scenarios using total-budget reverse calculation for one-station/two-station assumptions, with recommended and floor NYCU four-module software/integration costs. |
| `2026-07-01-prof-wu-quote-meeting-deep-analysis.md` | Deep analysis of Prof. Wu's quote meeting: one-system first-build quote, build/license split, Tomi review gate, company-subject wording, staffing risks, and next actions. |
| `../../handoff/2026-06-30_smart-health-station_quote-decision-v2.md` | Active internal quote-decision draft after the Tuesday-night Prof. Wu discussion; supersedes the earlier two-station boss-level draft and now includes the 慧誠 frontend / 智德萬 backend-integration split option. |
| `../../research-packets/2026-06-24-smart-health-cabin-module-research/README.md` | Independent research packets for hearing, vision, questionnaire, live Avatar, and module event-layer architecture. |
| `hpa-adult-preventive-health-questionnaire-mvp-design-note.md` | Expert record and MVP design note for using HPA adult preventive health fields plus WHO STEPS and standardized modules. |
| `mvp-questionnaire-system-architecture.md` | Narrow MVP questionnaire architecture, complete field registry, source metadata, disabled clinical fields, report rules, and minimum data model. |
| `four-module-mvp-sdd-prep-spec.md` | Four-module MVP and SDD-prep specification covering architecture strategy, module contracts, APIs, ERD seed, acceptance tests, timeline, and risk matrix. |
| `meeting-question-bank.md` | Questions to bring to Johnny, Jason Miao, imedtac engineering, and clinical/content owners. |
| `feasibility-response-outline.md` | Draft structure for the post-visit feasibility, schedule, and budget response. |
| `reuse-from-ai-triage.md` | Reusable AI Triage assets and boundaries that should remain separate. |
| `post-meeting-decision-log.md` | Empty decision log template for the `2026-06-23` follow-up record. |
| `expert-note-integration-review.md` | Internal review of the preserved expert tutorial note and what should or should not be merged into active materials. |
| `external-authority-verification.md` | Official / authoritative verification of standards, regulatory, measurement, interoperability, browser, and stack references from the expert note. |

## 2026-06-23 Material Routing

Use this folder as the working home for the `2026-06-23` onsite meeting packet.
The FIRST PRINCIPLE boundary is:

- ownership: this repo owns the Smart Health Cabin discovery packet, source
  pointers, module questions, feasibility-response structure, and post-meeting
  execution evidence;
- planning boundary: `../planning-everything-track` records only status,
  capacity impact, locators, and the next gate;
- source boundary: raw meeting evidence, screenshots, transcripts, and copied
  external messages belong under a dated `source/2026-06-23-.../` package with
  credentials and private tokens redacted;
- workstream boundary: interpreted meeting facts, open questions, decisions,
  and feasibility assumptions belong in `post-meeting-decision-log.md` or a
  dated derived meeting record in this folder;
- handoff boundary: company-facing recap, feasibility memo, proposal input, or
  quotation material belongs under `handoff/` only after the cleared audience
  and scope are explicit.

The evidence gate after the visit is a short source-backed split:

1. archive any raw or copied source material under `source/`;
2. update `post-meeting-decision-log.md` with confirmed facts and owners;
3. decide whether the work remains feasibility/discovery or enters
   implementation scope;
4. mirror only the locator, status, and next decision in
   `../planning-everything-track`.

## Source Bundle

Canonical source package:

```text
source/2026-06-17-imedtac-smart-health-cabin-requirements/
```

Key preserved files:

- Gmail PDF:
  `assets/2026-06-17-gmail-smart-health-cabin-software-module-requirements.pdf`
- Requirements PDF:
  `assets/2026-06-15-smart-health-cabin-software-module-requirements.pdf`
- Gmail conversion:
  `extracted/2026-06-17-gmail-smart-health-cabin-software-module-requirements-agent-readable.md`
- Requirements conversion:
  `extracted/2026-06-15-smart-health-cabin-software-module-requirements-spec-agent-readable.md`
- Onsite meeting transcript source:
  `source/2026-06-23-imedtac-onsite-visit-smart-health-cabin/2026-06-23-imedtac-onsite-visit-smart-health-cabin-transcript-corrected-verified-agent-readable.md`
- Prof. Wu LINE adult preventive health form:
  `source/2026-06-23-wu-line-hpa-adult-preventive-health-form/2026-06-23-hpa-adult-preventive-health-service-check-record-result-form-agent-readable.md`
- Full expert opinion on authoritative questionnaire sources:
  `source/2026-06-23-expert-questionnaire-authority-note/source.md`
- Full expert narrowdown for the MVP questionnaire architecture:
  `source/2026-06-23-expert-mvp-questionnaire-narrowdown-note/source.md`
- Full expert planning direction for four selectable modules and SDD prep:
  `source/2026-06-23-expert-four-module-sdd-prep-note/source.md`
- Johnny LINE call on open measurement station, quote scope, Avatar vendor
  integration, and compact hardware:
  `source/2026-06-29-johnny-line-open-measurement-station-budget-call/source.md`
- Expert MVP design note for the adult preventive health questionnaire path:
  `workstreams/smart-health-cabin/hpa-adult-preventive-health-questionnaire-mvp-design-note.md`
- Implementable MVP questionnaire system architecture:
  `workstreams/smart-health-cabin/mvp-questionnaire-system-architecture.md`
- Four-module MVP and SDD-prep spec:
  `workstreams/smart-health-cabin/four-module-mvp-sdd-prep-spec.md`
- Expert tutorial note:
  `source/2026-06-17-smart-health-cabin-expert-tutorial-note/source.md`
- External authority verification:
  `workstreams/smart-health-cabin/external-authority-verification.md`

## Expert Note Integration Policy

The expert tutorial note is preserved in full as source context and internal
training material. Derived meeting documents may reuse its stable systems
engineering lessons:

- discovery before implementation;
- source-explicit requirements versus engineering-inferred questions;
- equipment facts before vision/hearing claims;
- clinical/content ownership before questionnaire guidance;
- RACI before schedule or budget commitment;
- narrow MVP before September delivery assumptions.

Do not copy the full tutorial into the external meeting packet. Do not convert
its regulatory, standards, technology-stack, ERD, or API examples into project
commitments until official source text, intended use, device facts, and imedtac
/ hospital ownership are confirmed.

Verified source corrections now live in `external-authority-verification.md`.
Use that file as the internal fact baseline before citing FDA CDS, IMDRF SaMD,
ISO/IEC standards, vision/hearing measurement standards, FHIR/TW Core,
privacy context, browser media APIs, or implementation-stack examples in any
meeting packet or feasibility response.

## Implementation Decision Gate

This folder is now the standalone Smart Health Cabin collaboration workspace.
The next decision is whether discovery becomes implementation. That threshold
is met if imedtac asks for any of the following:

- formal feasibility response;
- cost or schedule estimate;
- source-code deliverable planning;
- prototype or implementation;
- CMS / ERD / API design work;
- hospital-facing or pilot-facing delivery package.
