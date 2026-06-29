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
