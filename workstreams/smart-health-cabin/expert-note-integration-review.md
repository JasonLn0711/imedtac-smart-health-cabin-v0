---
id: smart-health-cabin-expert-note-integration-review
title: "Expert Note Integration Review"
date: 2026-06-17
topic: smart-health-cabin
type: integration-review
status: active
source:
  - ../../source/2026-06-17-smart-health-cabin-expert-tutorial-note/source.md
  - ../../source/2026-06-17-imedtac-smart-health-cabin-requirements/source.md
  - ./external-authority-verification.md
---

# Expert Note Integration Review

## Recommendation

Preserve the expert tutorial note in full as a source artifact, then integrate
only the stable discovery and systems-engineering lessons into the active
Smart Health Cabin workspace files.

Do not merge the full tutorial directly into the meeting packet. The note is
valuable as internal training and engineering judgment, but the `2026-06-23`
meeting materials should stay short, source-backed, and decision-oriented.

## What Was Preserved

The complete user-provided expert tutorial note is archived at:

```text
source/2026-06-17-smart-health-cabin-expert-tutorial-note/source.md
```

That source record includes the original folder recommendation, Johnny
discussion interpretation, pre-meeting material list, detailed tutorial for a
second-year computer-science student, proposed architecture layers, MVP split,
RACI framing, sample ERD/API concepts, risk-register examples, and external
reference list.

## What Should Be Integrated

### 1. Discovery Boundary

Keep the strongest thesis in every derived file:

```text
The Smart Health Cabin folder is a discovery workspace and feasibility home.
Production implementation starts only after delivery scope and ownership are
recorded.
```

This belongs in `README.md`, `reuse-from-ai-triage.md`, and the implementation
decision gate.

### 2. 6/23 Meeting Control

Integrate the note's meeting-control structure:

- one-page requirement summary;
- onsite equipment checklist;
- medical/content design question list;
- technical and delivery responsibility question list;
- feasibility-response assumptions.

These belong in `2026-06-23-onsite-discovery-plan.md`,
`meeting-question-bank.md`, and `feasibility-response-outline.md`.

### 3. Module A Risk Framing

Use the expert note's device/system framing for vision and hearing:

- screen geometry, viewing distance, lighting, and user posture affect vision
  screening credibility;
- no-headphone hearing has left/right isolation and calibration limits;
- browser audio and Web Audio API capability are not equivalent to calibrated
  medical output;
- first release should use screening-support wording unless validation and
  clinical ownership are confirmed.

This belongs in `module-a-vision-hearing-discovery.md`.

### 4. Module B Content Lifecycle

Use the note's questionnaire/CMS lifecycle framing:

- question, option, rule, recommendation, education content, version, and
  review status are separate concerns;
- questionnaire logic should not be hard-coded into UI components;
- CMS needs draft/review/publish, versioning, rollback, and clinical sign-off
  decisions before it can become a delivery commitment.

This belongs in `module-b-questionnaire-triage-discovery.md`.

### 5. MVP Split

Use the note's three-tier scope control:

| Tier | Use |
| --- | --- |
| Narrow MVP | Most credible for September if scoped to screening-support flows, rule-based questionnaire, basic report, expiring QR, JSON export, ERD, deployment note, and clear wording controls. |
| Expanded MVP | Possible after facts are confirmed: simple CMS, draft/review/publish, stronger audit log, FHIR mapping draft, richer report, device context capture. |
| Not recommended for September | Formal medical-grade hearing diagnosis, full live HIS integration, autonomous AI medical recommendation, complex multi-site CMS, or unvalidated device-measurement claims. |

This belongs in `feasibility-response-outline.md`.

## What Should Not Be Integrated Yet

### 1. Formal Regulatory Or Standards Claims

The note's references to SaMD, FDA CDS, ISO 14971, IEC 62304, IEC 62366-1,
ISO 13485, FHIR, Taiwan privacy / data exchange context, browser media APIs,
and implementation stacks have now been checked against official or
authoritative sources in:

```text
workstreams/smart-health-cabin/external-authority-verification.md
```

Use that verification note as the current fact baseline. The main corrections
are:

- IMDRF SaMD key definitions should cite `IMDRF/SaMD WG/N10FINAL:2013`.
- FDA CDS should cite the `January 2026` final guidance page as the current
  official FDA source.
- IEC 62304 should be cited as `IEC 62304:2006` with `Amd 1:2015` when precise
  lifecycle-standard language is needed.
- ISO 8596 is not clinical validation for screen-based vision measurement.
- ISO 8253-1 does not specify loudspeaker-source hearing procedures.
- TW Core IG v1.0.0 is FHIR R4-based, so Taiwan HIS-ready discussion should
  not default to FHIR R5.
- Browser audio/media APIs support interaction, not calibrated medical
  measurement validity.

### 2. Technology Stack Commitment

The note's possible stack choices are useful but premature as commitments:

- Next.js / React / TypeScript;
- FastAPI or NestJS;
- PostgreSQL;
- Prisma / SQLAlchemy / Alembic;
- Strapi / Directus / Sanity / Payload CMS;
- Zod / XState / Playwright;
- Web Audio API.

These should remain option examples until the actual kiosk OS, browser,
hosting, CMS ownership, deployment constraints, and source-code handoff terms
are confirmed.

### 3. Formal API / ERD Design

The sample API and ERD are good teaching artifacts, but the active workspace
should not create formal Smart Health Cabin API endpoints or database schema
until scope is decided. After `2026-06-23`, formal API/ERD design should trigger
either:

- a dedicated design-spec phase inside this workspace; or
- a downstream implementation repo if delivery scope outgrows this workspace.

## Integration Actions

| Action | Target file | Status |
| --- | --- | --- |
| Add expert note source to workstream index | `README.md` | completed |
| Add source-index entry | `docs/source-index.md` | completed |
| Add risk / source-verification caution | `feasibility-response-outline.md` | completed |
| Strengthen vision/hearing device-risk checklist | `module-a-vision-hearing-discovery.md` | completed |
| Strengthen questionnaire/CMS lifecycle questions | `module-b-questionnaire-triage-discovery.md` | completed |
| Add RACI and MVP tier questions | `meeting-question-bank.md` | completed |
| Add decision templates for post-meeting closeout | `post-meeting-decision-log.md` | completed |
| Add official-source verification and factual corrections | `external-authority-verification.md` | completed |
| Leave full tutorial out of external packet | n/a | accepted |

## Decision

Record and partially integrate.

The full note is preserved as source. The active workstream absorbs the
engineering posture, risk framing, RACI/MVP structure, meeting-control
questions, and the official-source corrections recorded in
`external-authority-verification.md`. External standards, regulatory
interpretation, implementation stack, formal ERD, and production API design
remain future validation and design-spec work.
