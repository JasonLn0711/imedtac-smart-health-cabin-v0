---
id: smart-health-cabin-module-b-questionnaire-triage-discovery
title: "Module B Questionnaire Triage Discovery"
date: 2026-06-17
topic: ai-triage
type: meeting-prep
status: active
source:
  - ../../source/2026-06-17-imedtac-smart-health-cabin-requirements/source.md
  - ../../source/2026-06-23-imedtac-onsite-visit-smart-health-cabin/source.md
  - ../../source/2026-06-23-expert-questionnaire-authority-note/source.md
  - ../../source/2026-06-23-expert-mvp-questionnaire-narrowdown-note/source.md
  - ../../source/2026-06-23-expert-four-module-sdd-prep-note/source.md
  - ../../source/2026-06-23-wu-line-hpa-adult-preventive-health-form/source.md
  - ./four-module-mvp-sdd-prep-spec.md
  - ./mvp-questionnaire-system-architecture.md
  - ./hpa-adult-preventive-health-questionnaire-mvp-design-note.md
  - ../../source/2026-06-17-smart-health-cabin-expert-tutorial-note/source.md
  - ../../../imedtac-ai-triage-kiosk-v0/decisions/2026-05-22-api-contract-freeze-and-change-control.md
  - ./external-authority-verification.md
---

# Module B Questionnaire Triage Discovery

## Scope Statement

Module B is a standardized questionnaire-guided triage and guidance workflow
for the Smart Health Cabin. It is the module most related to the current AI
Triage work, but its scope is broader because it includes CMS, department
guidance, health education, integrated reporting, and future HIS-ready data.

After the `2026-06-23` onsite meeting, questionnaire remains its own module.
Avatar interaction is a separate user-facing module layered on top of the
questionnaire flow for voice prompt, answer capture, and guided interaction.
The questionnaire module still owns reviewed content, answer structure,
scoring, branching, export, and report semantics.

The strongest first-release framing is:

```text
reviewed fixed questionnaire + versioned branching + structured guidance
content + integrated report output
```

The central engineering question is not whether a questionnaire UI can be
rendered. It is whether the team can define reviewed content, versioned rules,
safe department guidance, health-education ownership, and reportable outputs
that can be explained and audited.

## 2026-06-23 Prof. Wu Form Source

Prof. Wu sent an agent-readable Health Promotion Administration adult
preventive health service examination record / result form through LINE on
`2026-06-23`. The source is preserved at:

```text
../../source/2026-06-23-wu-line-hpa-adult-preventive-health-form/
```

This form is valuable because it separates the questionnaire discussion from a
generic "form upload" assumption. It contains user/service-recipient fields,
clinical or staff-assisted fields, laboratory fields, counseling items, result
interpretation, follow-up advice, and physician / institution signatures.

Meeting implication: the Smart Health Cabin questionnaire module should first
classify each official form field into user-facing intake, staff/clinician
entry, measured data, lab result, counseling, report output, and signature /
institutional attestation before building CMS or HIS-ready payloads.

The expert MVP note adds a concrete source strategy: do not invent a new
questionnaire. Use the HPA adult preventive health form as the Taiwan
public-sector backbone, WHO STEPS as the international public-health backbone,
and then add standardized modules by age and service context.

MVP scope should stay to HPA red-box fields, WHO STEPS core simplified
risk-factor questions, PHQ-2, and basic measurement outputs for height,
weight, waist, blood pressure, vision, and hearing.

The narrowed MVP architecture and complete implementable field registry are
preserved in:

```text
./mvp-questionnaire-system-architecture.md
```

The cross-module SDD-prep contract for how the questionnaire module plugs into
the selectable four-module platform is preserved in:

```text
./four-module-mvp-sdd-prep-spec.md
```

That specification fixes the first-release product as an anonymous or
semi-anonymous public-sector self-service flow, not a hospital health-check
system, and it excludes HIS connection, medical record writeback, physician
signature, formal diagnosis, and staff-only physical-exam fields.

## Verified Regulatory / Interoperability Implications

Use these verified facts as internal meeting preparation:

- FDA's current official CDS guidance page is the `January 2026` final guidance
  page. It is useful background for distinguishing non-device CDS, device
  software, patient/caregiver-facing functions, and human-review design
  controls, but it is not an automatic project requirement unless target market
  and intended use make it relevant.
- HL7 FHIR Observation is for measurements and simple assertions. HL7 notes
  that clinical diagnosis normally belongs in other resources such as
  Condition or ClinicalImpression, not in Observation.
- DiagnosticReport can provide clinical or workflow context for a set of
  Observations, but using a FHIR-shaped report does not mean the system is
  clinically validated or live-integrated with HIS.
- TW Core IG v1.0.0 is based on FHIR R4. If Taiwan hospital exchange is in
  scope, ask whether imedtac / hospital IT expects custom JSON, FHIR R4/TW
  Core mapping, or live HIS integration.

Meeting implication: first-release questionnaire guidance should stay
rule-based, reviewed, versioned, and explainable. Stronger CDS, autonomous AI
recommendation, or live-HIS claims require a separate intended-use and
validation path.

## Reusable AI Triage Patterns

Reuse these patterns from the current AI Triage lane:

- choice-only question rendering for predictable kiosk UX;
- stable question and option IDs;
- explicit `not_sure` option semantics;
- branch path recording;
- question set and wording versioning;
- staff-review summary/report structure;
- API contract and change-control discipline.

Do not silently reuse or expose:

- patent-sensitive routing logic;
- internal source-governance method;
- existing June two-endpoint API as if it were the Smart Health Cabin API;
- formal diagnosis, treatment, or autonomous triage claims.

## Questions For Clinical / Medical Content Ownership

1. Who owns the family-medicine questionnaire content?
2. Who approves department guidance and health education wording?
3. Does 北市聯醫 provide clinical rules, or does imedtac expect NYCU / 多寶 to
   draft them?
4. What is the review and release process for new or edited questions?
5. Should outputs be patient-facing, staff-facing, or both?
6. What should the system do when answers suggest urgent concern?
7. How should "not sure", incomplete answers, or contradictory answers appear
   in the report?

## Questions For CMS And Branching

1. Is CMS built by imedtac, NYCU, or a third-party platform?
2. Is NYCU responsible for only the data schema and branching specification, or
   also the admin UI source code?
3. Must CMS support draft/publish states?
4. Is audit log required for every content change?
5. Should old reports preserve old question wording and branch logic?
6. Who can edit health education content?
7. How are content versions approved before release?

## Content Lifecycle Questions

1. What are the allowed content states: draft, review, approved, published,
   archived, or rollback?
2. Who can move a questionnaire from draft to approved?
3. Should every report preserve the exact question wording and branching logic
   version used at the time of completion?
4. How are urgent wording fixes handled after content is published?
5. Are department recommendations table-driven, score-driven, rule-driven, or
   manually curated by clinical owners?
6. Is AI allowed to generate patient-facing text, or should AI be limited to
   internal drafting before human review?
7. Should a failed or incomplete questionnaire still generate a report, and if
   so, how should uncertainty appear?
8. For official forms such as the adult preventive health service form, which
   fields are user-facing, staff-assisted, measured, lab-derived,
   clinician-interpreted, or institution-signed?

## Candidate Data Concepts For Discussion

Use these as discussion objects, not as committed schema:

| Concept | Why it matters |
| --- | --- |
| `QuestionnaireVersion` | Preserves which reviewed questionnaire produced a report. |
| `Question` / `Option` | Keeps UI rendering separate from branching logic. |
| `Rule` / `Branch` | Makes routing explainable and reviewable. |
| `Recommendation` | Separates department guidance from raw answer capture. |
| `EducationContent` | Keeps health education text reviewable and versioned. |
| `ReviewStatus` | Supports draft/review/publish governance before CMS commitment. |
| `AuditLog` | Tracks who changed content, rules, and report templates. |

## Questions For API / Data / Report

1. What data must be returned to the kiosk frontend after each answer?
2. Does the first release need a live backend, static JSON bundle, or CMS-driven
   backend?
3. What should the integrated report include:
   - vision result;
   - hearing result;
   - questionnaire answers;
   - branch path;
   - department guidance;
   - health education;
   - measurement quality;
   - next-step instruction?
4. Does the QR Code point to a hosted report, local device page, PDF, or mobile
   web page?
5. What is the required HIS-ready payload: custom JSON, HL7, FHIR, or
   hospital-specific mapping?
6. If FHIR is requested, is the target TW Core / FHIR R4, another hospital
   profile, or a general mapping draft only?

## First-Release Recommendation

Recommend a first release that is deliberately narrow:

- HPA adult preventive health red-box fields as the Taiwan backbone;
- WHO STEPS core simplified public-health risk-factor fields;
- PHQ-2 as the only MVP mental-health screen;
- basic height, weight, waist, blood pressure, vision, and hearing measurement
  outputs;
- fixed reviewed questionnaire set;
- choice-only front-end answers;
- simple branch graph;
- explicit content version;
- structured report;
- QR Code report concept with access controls defined;
- HIS-ready JSON schema without live HIS integration unless the hospital
  interface is confirmed.

Prefer rule-based and reviewable guidance for September. Autonomous AI
recommendation, free-text clinical generation, full CMS approval workflow, and
live HIS integration should remain later-phase decisions unless the `2026-06-23`
meeting confirms owners, validation path, and acceptance criteria.

This keeps September delivery credible while preserving a clean path to richer
CMS and hospital integration later.

MVP should not include self-invented questionnaire wording, generic
AI-generated patient-facing questions, diagnosis language, full generic CMS
breadth, or live HIS integration before field classification and clinical /
public-health owner review.
