# Source Index

This folder preserves source and derived analysis for the 慧誠智醫（imedtac
Co., Ltd.）Smart Health Cabin collaboration project.

## Sources

| Date | Source | Why it matters |
| --- | --- | --- |
| `2026-06-17` | `source/2026-06-17-imedtac-smart-health-cabin-requirements/` | Johnny Fang's Smart Health Cabin requirements package and the `2026-06-15` requirements PDF. Defines the initial cooperation ask around vision/hearing self-measurement, questionnaire-guided triage, report, QR Code, CMS, ERD, API/JSON, and HIS-ready planning. |
| `2026-06-17` | `source/2026-06-17-smart-health-cabin-expert-tutorial-note/` | Preserved expert tutorial note for workspace setup and discovery discipline. Use selectively as internal preparation, not as external commitment. |
| `2026-06-19` | `source/2026-06-19-wu-tomi-ai-triage-smart-health-cabin-ip-sync/` | Prof. Wu / Tomi / 多寶 / Jason internal source bundle about Smart Health Cabin, AI Triage adjacency, patent/IP, measured-context workflow, and cooperation boundaries. |
| `2026-06-23 14:59` | `source/2026-06-23-imedtac-onsite-visit-smart-health-cabin/` | Corrected onsite meeting transcript. Establishes four user-facing modules: hearing, vision, questionnaire, and Avatar interaction. Keeps report/QR/HIS/API/CMS as cross-module integration layer. |
| `2026-06-23` | `source/2026-06-23-wu-line-hpa-adult-preventive-health-form/` | Prof. Wu LINE source containing the HPA adult preventive health service examination record / result form. Supports questionnaire field classification and MVP source strategy. |
| `2026-06-23` | `source/2026-06-23-expert-questionnaire-authority-note/` | Full preserved expert opinion on authoritative questionnaire sources for Smart Health Cabin: HPA adult preventive health form, WHO STEPS, NHIS, BRFSS, NHANES, PHQ, AUDIT, GPAQ/IPAQ, ICOPE, STEADI, SARC-F, My Plate, PRAPARE/AHC-HRSN, and non-diagnostic report boundaries. |
| `2026-06-23` | `source/2026-06-23-expert-mvp-questionnaire-narrowdown-note/` | Full preserved expert narrowdown for the MVP questionnaire system: anonymous public-sector self-service positioning, HPA + WHO STEPS + PHQ-2 field stack, options, disabled clinical fields, report rules, and minimum data tables. |
| `2026-06-23` | `source/2026-06-23-expert-four-module-sdd-prep-note/` | Full preserved planning direction for the four selectable modules, modular-monolith MVP architecture, module contracts, platform services, API/ERD/test/risk seeds, and SDD preparation. |

## Derived Workstreams

| File | Purpose |
| --- | --- |
| `workstreams/smart-health-cabin/README.md` | Workstream overview, boundaries, source bundle, and project-separation rule. |
| `workstreams/smart-health-cabin/post-meeting-decision-log.md` | Confirmed facts, decisions, open questions, and next actions from the 2026-06-23 meeting and follow-up sources. |
| `workstreams/smart-health-cabin/hpa-adult-preventive-health-questionnaire-mvp-design-note.md` | Expert MVP note: HPA form + WHO STEPS + standardized modules, with non-diagnostic report boundaries. |
| `workstreams/smart-health-cabin/mvp-questionnaire-system-architecture.md` | Implementable MVP questionnaire architecture and field registry for anonymous public-sector self-service deployment. |
| `workstreams/smart-health-cabin/four-module-mvp-sdd-prep-spec.md` | Four-module MVP and SDD-prep specification: modular monolith, module contracts, hearing/vision/questionnaire/Avatar scope, platform services, APIs, ERD seed, test plan, and risk matrix. |
| `workstreams/smart-health-cabin/module-a-vision-hearing-discovery.md` | Vision/hearing device, calibration, and wording controls. |
| `workstreams/smart-health-cabin/module-b-questionnaire-triage-discovery.md` | Questionnaire, CMS, field classification, and source-governance design questions. |
| `workstreams/smart-health-cabin/module-c-avatar-interaction-discovery.md` | Avatar voice interaction scope and implementation gates. |
| `workstreams/smart-health-cabin/external-authority-verification.md` | Verification notes for standards, regulatory, measurement, interoperability, browser, and stack references. |

## Source Rules

- Treat `source/` files as copied evidence and meeting context.
- Keep raw source separate from feasibility conclusions and implementation
  scope.
- Do not treat adult preventive health forms, questionnaire sources, or expert
  notes as approval to collect real patient data or connect to production HIS.
- Use workstream notes for interpreted scope, MVP decisions, and next gates.
