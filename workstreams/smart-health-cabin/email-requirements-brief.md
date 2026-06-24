---
id: smart-health-cabin-email-requirements-brief
title: "Smart Health Cabin Email Requirements Brief"
date: 2026-06-17
topic: ai-triage
type: meeting-prep
status: active
source:
  - ../../source/2026-06-17-imedtac-smart-health-cabin-requirements/source.md
---

# Smart Health Cabin Email Requirements Brief

## One-Line Reading

Johnny Fang's `2026-06-17` email asks NYCU / 多寶 / Jason to review the Smart
Health Cabin planning package and prepare a feasibility, initial schedule, and
preliminary budget response for selected software modules before or after the
`2026-06-23` equipment visit.

## Source-Explicit Requirements

### Module A: Vision And Hearing Self-Measurement

The requirements ask for software and UI/UX planning for self-guided vision and
hearing measurement inside an existing touch-screen Smart Health Cabin.

The source explicitly names:

- visual acuity;
- contrast vision;
- color vision;
- astigmatism;
- visual field;
- fixed-speaker hearing flow without headphones;
- left/right audio output;
- frequency and dB control;
- text and voice guidance;
- touch-screen interaction;
- preliminary result computation;
- report inclusion.

### Module B: Questionnaire-Guided Triage

The requirements ask for a first-phase standardized questionnaire from a
family-medicine / comprehensive-care perspective.

The source explicitly names:

- initial triage;
- department guidance;
- health education guidance;
- elderly-friendly front-end UI;
- AI virtual character / avatar throughout the flow;
- CMS or third-party CMS integration;
- add/edit/delete/sort questionnaire items;
- conditional jump logic.

### Shared Data And Delivery Requirements

The requirements also ask for:

- integrated structured and charted health report;
- QR Code report access;
- standard API and JSON data format;
- HIS-ready future handoff structure;
- UI/UX specification;
- complete triage flow and branching specification;
- API field dictionary;
- ERD;
- source code for front-end measurement, questionnaire, and CMS;
- deployment guide;
- early September integration and mid-September acceptance / pilot timing.

## What This Means For 6/23

The meeting should clarify enough facts to support an estimate. It should not
force a final commitment before the team understands:

- hardware and cabin constraints;
- calibration and validation expectations;
- clinical content ownership;
- CMS and source-code responsibility;
- QR Code privacy model;
- HIS-ready versus HIS-live scope;
- first-release MVP boundary.

## Recommended Response Position

Use positive-scope wording:

```text
NYCU can evaluate a staged Smart Health Cabin software path that starts from
equipment facts, reviewed questionnaire content, structured report design, and
HIS-ready data modeling. The first response should define feasible scope,
assumptions, owners, schedule, and budget range before either side commits to
full implementation.
```

## Initial Scope Split

| Area | Likely first-release scope | Needs confirmation |
| --- | --- | --- |
| Vision | Guided touch-screen screening flow and preliminary result display | Screen calibration, distance, claim boundary |
| Hearing | Guided fixed-speaker screening exploration | dB calibration, left/right feasibility, noise |
| Questionnaire | Versioned fixed questionnaire with branching | Clinical owner, review workflow, department logic |
| CMS | Content management boundary | imedtac vs NYCU vs third-party ownership |
| Report | Integrated report and QR Code concept | privacy, expiry, access, retention |
| HIS-ready | JSON schema and ERD | target standard and live integration timing |

## Estimate Blockers

Do not provide a fixed schedule or cost until these are answered:

- exact hardware and browser environment;
- whether vision/hearing needs validated medical measurement or screening
  support;
- content owner and review path for department guidance and health education;
- who builds CMS and UI/UX;
- whether source code delivery includes reusable engine know-how;
- whether September means demo, pilot, acceptance, or production launch.
