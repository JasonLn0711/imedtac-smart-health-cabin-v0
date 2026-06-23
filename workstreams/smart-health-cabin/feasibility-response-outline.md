---
id: smart-health-cabin-feasibility-response-outline
title: "Smart Health Cabin Feasibility Response Outline"
date: 2026-06-17
topic: ai-triage
type: handoff-outline
status: draft
source:
  - ../../source/2026-06-17-imedtac-smart-health-cabin-requirements/source.md
  - ../../source/2026-06-17-smart-health-cabin-expert-tutorial-note/source.md
  - ./external-authority-verification.md
---

# Smart Health Cabin Feasibility Response Outline

## Purpose

Use this outline after the `2026-06-23` onsite visit to prepare a
source-backed response to 慧誠智醫（imedtac Co., Ltd.）on feasibility, initial
schedule, and preliminary budget basis.

## Recommended Structure

### 1. Recommendation

State the positive first decision:

```text
We recommend a staged Smart Health Cabin software delivery path that begins
with equipment-confirmed MVP scope, reviewed questionnaire content, structured
report design, and HIS-ready data modeling.
```

### 2. Confirmed Source Facts

Include only facts confirmed by:

- Johnny's email and requirements PDF;
- `2026-06-23` equipment visit;
- imedtac engineering answers;
- clinical/content owner answers.

### 3. Proposed MVP

Split the MVP into:

- Module A minimum viable vision/hearing screening workflow;
- Module B minimum viable questionnaire/branching/report workflow;
- report + QR Code minimum;
- API/JSON/ERD minimum;
- CMS minimum or CMS interface boundary.

Use a three-tier response rather than a single all-inclusive promise:

| Tier | Recommended positioning |
| --- | --- |
| Narrow MVP | Most credible for September: screening-support wording, reviewed fixed questionnaire, simple rule-based branching, basic report, expiring QR report, custom JSON export, ERD, deployment note, and clear scope controls. |
| Expanded MVP | Consider only after owners and facts are confirmed: CMS draft/review/publish, richer audit log, device context capture, FHIR mapping draft, report-template versioning, and stronger validation plan. |
| Not recommended for September | Formal medical-grade hearing diagnosis, full live HIS integration, autonomous AI medical recommendation, complex multi-site CMS workflow, unvalidated device-measurement claims, or production regulatory package. |

### 4. Work Breakdown

Use clear phases:

| Phase | Target | Deliverable |
| --- | --- | --- |
| Discovery closeout | late June | source facts, RACI, MVP boundary |
| Design spec | early July | UI flow, schema, ERD draft, question flow |
| Prototype | July | clickable frontstage and data model prototype |
| Build/integration | August | narrowed module implementation and CMS/API boundary |
| Site integration | early September | integration test and acceptance fixes |
| Handoff | mid-September | deployment guide, source package, acceptance record |

### 5. RACI

Include owners for:

- UI/UX;
- vision/hearing method;
- questionnaire content;
- clinical review;
- CMS;
- API/JSON;
- ERD;
- deployment;
- acceptance testing;
- maintenance.

The response should not estimate schedule or budget until RACI is explicit.
At minimum, distinguish:

- Responsible: who builds the item;
- Accountable: who signs off and owns final correctness;
- Consulted: who supplies clinical, device, or integration facts;
- Informed: who receives status and change notices.

### 6. Budget Basis

Provide ranges only after assumptions are explicit. Tie each estimate to:

- number of modules included;
- whether CMS is built or integrated;
- whether hearing calibration is exploratory or validated;
- whether HIS is schema-only or live integration;
- whether source-code delivery includes reusable engine components;
- post-launch support period.

### 7. Scope Controls

Use affirmative operating-scope language:

- screening support;
- reviewed questionnaire guidance;
- human-review workflow;
- HIS-ready data model;
- future validation path;
- separate production governance path.

Avoid phrasing that turns discovery into a stronger medical, diagnostic,
clinical-decision, or live-HIS claim. If an external document mentions SaMD,
FDA CDS, ISO, IMDRF, FHIR, TW Core, or privacy/legal interpretations, first
verify the current official source text and ask imedtac / hospital whether that
standard is actually in scope.

### 8. Verified Fact Corrections For Internal Use

Use `external-authority-verification.md` as the fact baseline before drafting
the outward-facing response. The current internal corrections are:

- FDA CDS: cite the `January 2026` final FDA guidance page as current, not
  older 2022-era wording.
- IMDRF SaMD: cite `IMDRF/SaMD WG/N10FINAL:2013` for key definitions.
- IEC 62304: cite `IEC 62304:2006` with `Amd 1:2015` when precision matters.
- ISO 8596: use as visual-acuity optotype/distance context, not clinical
  validation for Smart Health Cabin vision measurement.
- ISO 8253-1 / ISO 389-1: fixed-speaker no-headphone hearing should not be
  described as pure-tone threshold audiometry or `dB HL` output without a
  calibrated method and validation route.
- FHIR / TW Core: Taiwan HIS-ready discussion should ask about custom JSON,
  TW Core / FHIR R4 mapping, or live HIS integration. Do not default to FHIR
  R5 for Taiwan hospital exchange.
- Browser audio: Web Audio API supports interaction; it is not calibration or
  clinical validity.

Keep these corrections internal unless imedtac / hospital explicitly asks for
a standards-backed appendix. In external material, lead with operating scope,
ownership, evidence, and next validation layer.

### 9. Open Decisions

End with a table:

| Decision | Owner | Needed by | Impact |
| --- | --- | --- | --- |
| First-release target | imedtac / hospital | TBD | schedule and cost |
| Clinical content owner | imedtac / hospital / 多寶 | TBD | questionnaire readiness |
| CMS ownership | imedtac / NYCU | TBD | build scope |
| HIS standard | imedtac / hospital IT | TBD | API and ERD |
| Source-code/license terms | imedtac / NYCU | TBD | delivery and IP boundary |

## Material To Exclude From External Version

- raw Teams screenshots;
- private token details;
- unreviewed internal speculation;
- patent-sensitive AI Triage method details;
- any statement implying diagnosis, treatment, final triage level, or live HIS
  integration unless explicitly confirmed.
- unverified regulatory or standards interpretation;
- implementation-stack commitments such as Next.js, FastAPI, NestJS,
  PostgreSQL, Strapi, Directus, Prisma, XState, Zod, or Web Audio API unless
  the project has entered a design-spec phase.
