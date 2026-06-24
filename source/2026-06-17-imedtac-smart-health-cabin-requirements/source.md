---
id: 2026-06-17-imedtac-smart-health-cabin-requirements
title: "imedtac Smart Health Cabin Requirements Package"
date: 2026-06-17
topic: ai-triage
type: source
status: active
channel: Gmail / PDF requirements package / Microsoft Teams follow-up
confidentiality: project-requirements-local-only
source_note: user-provided Gmail PDF export, requirements PDF, agent-readable Markdown conversions, and Teams screenshot context on 2026-06-17
related:
  - ../2026-06-16-imedtac-teams-question-option-adjustment/source.md
  - ../../docs/architecture-insertion-and-clinical-grounding.md
  - ../../docs/source-index.md
  - ../../workstreams/smart-health-cabin/README.md
  - ../../workstreams/smart-health-cabin/2026-06-23-onsite-discovery-plan.md
---

# imedtac Smart Health Cabin Requirements Package

## Source Boundary

This source bundle preserves the `2026-06-17` requirements package from
慧誠智醫（imedtac Co., Ltd.）about the Smart Health Cabin / Taipei City Hospital
project discussion. It links directly to the same-day Teams follow-up where
Johnny Fang said the 北市聯醫 project had started moving, sent the planning
document to 多寶 and Jason Lin, and asked whether the team could continue
discussion after the `2026-06-23` equipment visit.

This is a requirements and feasibility-planning source. It is not an accepted
statement of work, final estimate, clinical validation record, regulatory
claim, production HIS integration commitment, or change to the current AI
Triage rehearsal API contract.

The source PDF includes email addresses, a SharePoint planning-document link,
and a confidentiality disclaimer. Preserve the materials locally and do not
publish them without explicit approval. The external SharePoint document link
is preserved in the converted email record, but this repo did not fetch private
SharePoint content directly in this session.

## Source Assets

- `assets/2026-06-17-gmail-smart-health-cabin-software-module-requirements.pdf`
- `assets/2026-06-15-smart-health-cabin-software-module-requirements.pdf`
- `extracted/2026-06-17-gmail-smart-health-cabin-software-module-requirements-agent-readable.md`
- `extracted/2026-06-15-smart-health-cabin-software-module-requirements-spec-agent-readable.md`

## Email Record

```text
Subject: 智慧健康倉軟體功能模組開發需求
From: Johnny Fang 方偉翰, imedtac Corp.
Date: 2026-06-17 18:18 +08:00
To: max870121@gmail.com; Jason Lin
Cc: Jason Miao 苗中聖, imedtac Corp.; Ken Yu 余金樹, imedtac Corp.; Prof. Wu
Purpose: ask NYCU / 多寶 / Jason to evaluate feasibility, initial schedule,
and initial budget for selected Smart Health Cabin software modules.
Follow-up context: next Tuesday's company visit, inferred as 2026-06-23,
can be used to inspect measurement equipment and discuss the new project.
```

Johnny's email asks the receiving team to review the planning document and
evaluate the possible collaboration scope. The email-level request is narrower
than a full implementation commitment: feasibility, initial schedule planning,
and preliminary cost assessment should come first.

## Requirements Extracted From The Package

### Module A: Vision And Hearing Self-Measurement

Source-explicit scope:

- build the vision and hearing self-measurement flow inside an existing
  touch-screen Smart Health Cabin;
- support self-guided use without professional staff assistance;
- include vision checks such as visual acuity, contrast vision, color vision,
  astigmatism, and visual field;
- use large touch-screen interactions and voice guidance;
- support hearing test guidance through text or voice;
- control left/right audio output, different frequencies, and dB levels;
- design attention prompts and mistake-prevention UI;
- use fixed cabin speakers rather than headphones;
- compute preliminary results, show them visually, temporarily store them, and
  include them in the final report.

Main engineering controls:

- screen size, resolution, viewing distance, and calibration method must be
  verified before vision accuracy is promised;
- speaker placement, sound insulation, ambient noise, dB calibration, and
  left/right-ear isolation must be verified before hearing-screening claims are
  framed;
- the operating scope should be expressed as screening / preliminary
  self-measurement unless a separate validation path supports stronger claims.

### Module B: Questionnaire-Guided Triage / Department Guidance

Source-explicit scope:

- design a first-phase standardized questionnaire from a family-medicine /
  comprehensive-care perspective;
- allow users to answer fixed questionnaires;
- support initial triage, department guidance, and health education guidance;
- provide elderly-friendly front-end UI with suitable font size, large touch
  targets, and clear contrast;
- use AI virtual characters / avatars across measurement and questionnaire
  flow after imedtac design alignment;
- support a web-based CMS or third-party CMS integration so the operator can
  add, edit, delete, sort, and branch questionnaire items.

Main engineering controls:

- "initial triage", "department guidance", and "health education guidance" need
  a clinical content owner, version control, reviewer workflow, and claim
  boundary before cost or delivery can be responsibly committed;
- the current AI Triage engine can inform the questionnaire graph, choice
  question format, versioning, answer capture, and report-generation approach,
  but the Smart Health Cabin scope is broader than the current two-endpoint
  June rehearsal API.

### Module C: Data Integration, Report, QR Code, And HIS-Ready Structure

Source-explicit scope:

- after vision, hearing, and triage questionnaire completion, show a structured
  and charted integrated health report on screen;
- generate a QR Code so the user can access or retain the report through a
  mobile device;
- reserve standard API and JSON data structures for future HIS integration;
- structure all measurement and questionnaire data so the operator can later
  hand off or integrate data with hospital HIS.

Main engineering controls:

- "reserve HIS structure" should remain separate from "complete live HIS
  integration" until the target standard, authentication, privacy model, field
  dictionary, and hospital acceptance criteria are confirmed;
- QR report access requires token expiry, access control, retention policy,
  and data minimization decisions before pilot use.

## Schedule And Deliverables In The Package

Source-explicit schedule:

- latest integration target: early September `2026`;
- expected acceptance and delivery: mid-September `2026`;
- clinic / outpatient pilot signal: mid-September `2026`.

Source-explicit deliverables:

- UI/UX design specification, such as a Figma link;
- complete triage question flow and branching specification;
- API specification with field definitions for HIS-oriented structure;
- database ERD;
- front-end source code for vision and hearing measurement;
- front-end source code for questionnaire flow;
- CMS source code or integration package;
- deployment guide with environment setup requirements.

## High-Priority Questions Before Feasibility, Schedule, Or Budget

1. What exact hardware will be available in the Smart Health Cabin: touch-screen
   size, resolution, operating system, browser, audio device, network,
   kiosk-mode constraints, and sensor interfaces?
2. What is the verified cabin sound-insulation dB level, and what acoustic
   method can support a no-headphone hearing-screening flow?
3. What viewing distance, screen geometry, and calibration method are available
   for vision checks?
4. Who owns clinical content for questionnaire triage, department guidance, and
   health education: imedtac, hospital clinicians, NYCU, 多寶, or a joint review
   board?
5. Is CMS implementation owned by imedtac, NYCU, or split by API / content /
   admin UI responsibility?
6. Is UI/UX design owned by imedtac, NYCU, or jointly produced with imedtac
   brand and kiosk constraints?
7. Is the September target a demo, pilot, hospital acceptance, or production
   handoff?
8. Does the first phase require anonymous sessions, identifiable users, phone
   number, hospital number, or login?
9. What are the QR Code report access rules: expiration, authentication,
   download, sharing, deletion, and audit?
10. Which HIS data standard is expected later: custom JSON, HL7, FHIR, or a
    hospital-specific interface?
11. What are the source-code ownership, license, maintenance, and reuse terms
    if NYCU delivers complete source code and a CMS?
12. What parts of the existing AI Triage know-how are appropriate to expose
    through API contracts versus preserved inside a NYCU-hosted service?

## Working Interpretation

The immediate recommendation is to accept the `2026-06-23` onsite discussion as
a structured discovery and scoping meeting. The team should not respond with a
fixed cost or delivery commitment before inspecting the equipment, confirming
clinical content ownership, and separating the September Smart Health Cabin
scope from the existing June AI Triage rehearsal API.

The best near-term posture is:

```text
review package
-> inspect equipment on 2026-06-23
-> confirm module boundaries and RACI
-> produce phased feasibility / schedule / budget assumptions
-> decide whether Smart Health Cabin becomes a separate execution repo or
   remains a bounded workstream inside this AI Triage archive
```

## Relationship To Current AI Triage Work

Reusable assets from the current AI Triage lane:

- choice-only question rendering discipline;
- versioned question and option identifiers;
- branch-path / decision-tree thinking;
- staff-review summary and report structure;
- API contract and change-control habits;
- source provenance and clinical-review boundary.

Non-reusable or newly required scope:

- vision measurement implementation;
- no-headphone hearing-screening design;
- acoustic and display calibration;
- kiosk avatar / voice-guidance design;
- CMS ownership, publishing, and audit flow;
- QR Code report access and privacy model;
- HIS-oriented ERD and data export package;
- full source-code delivery and maintenance terms.

The Smart Health Cabin package creates a broader product-development lane. It
can learn from AI Triage, but it should not silently alter the current June
two-endpoint API, bearer-token behavior, CORS behavior, tachycardia question
set, or staff-review summary contract.
