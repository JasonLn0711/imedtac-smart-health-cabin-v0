---
id: hpa-adult-preventive-health-questionnaire-mvp-design-note
title: "HPA Adult Preventive Health Questionnaire MVP Design Note"
date: 2026-06-23
topic: ai-triage
type: expert-analysis
status: active
source:
  - ../../source/2026-06-23-wu-line-hpa-adult-preventive-health-form/source.md
  - ./module-b-questionnaire-triage-discovery.md
  - ./post-meeting-decision-log.md
audience:
  - NYCU internal planning
  - imedtac feasibility discussion
  - Smart Health Cabin questionnaire module design
---

# HPA Adult Preventive Health Questionnaire MVP Design Note

## Source Status

This note records the expert view supplied on `2026-06-23` for using the
`健康署成人預防保健服務檢查紀錄結果表單` red-box fields inside the Smart
Health Cabin questionnaire system.

The source links below are preserved as expert-cited references. They should be
verified from official pages before company-facing quotation, formal proposal,
public-health publication, or implementation freeze.

## Core Expert Position

The questionnaire system can support this use case. The product should not
invent a new health questionnaire from scratch.

The recommended architecture is:

```text
Taiwan public-health backbone:
  HPA adult preventive health service form

International public-health backbone:
  WHO STEPS Instrument

Conditional standardized modules:
  PHQ-2 / PHQ-9, AUDIT-C / AUDIT, GPAQ or authorized IPAQ,
  ICOPE, STEADI, SARC-F, My Plate, PRAPARE or AHC-HRSN
```

This positioning gives the Smart Health Cabin a credible public-health basis
for city-government, hospital, vendor, and compliance discussion. It also keeps
the output in health measurement and public-health risk self-assessment
language, not medical diagnosis.

## Why The HPA Form Matters

The red-box section of the HPA adult preventive health service form already
contains the main pre-exam public-health intake and basic measurement fields:

- basic demographics;
- disease history;
- long-term medication;
- family history;
- smoking;
- alcohol use;
- betel nut use;
- physical activity;
- cough over two weeks;
- two depression screening questions;
- height, weight, pulse, blood pressure, waist, BMI;
- vision fields;
- ENT / oral exam fields;
- simple body examination fields.

This makes the HPA form a strong Taiwan public-sector backbone for a Smart
Health Cabin front-end questionnaire and measurement report. It should still be
classified before implementation because the full form also contains clinician,
laboratory, result/advice, and signature fields that are not ordinary
patient-facing questionnaire items.

## Recommended Source Stack

| Module | Recommended source | Design use |
| --- | --- | --- |
| Taiwan adult health check backbone | HPA adult preventive health service examination record / result form | Main Taiwan field structure for city health center deployment. |
| Chronic disease and health behavior risk | WHO STEPS Instrument | International NCD risk-factor backbone covering tobacco, alcohol, diet, physical activity, obesity, blood pressure, glucose, and lipids. |
| Taiwan population-health reference | Taiwan National Health Interview Survey / NHIS Taiwan | Reference for demographics, health status, service use, health behavior, and health-literacy wording. |
| International adult health behavior | CDC BRFSS | Reference for modular adult health behavior risk survey design. |
| Questionnaire + measurement + lab structure | CDC NHANES | Reference for combined questionnaire, physical examination, and laboratory-data architecture. |

The implementation rule is source-first: each questionnaire field should have a
source name, version/date, field purpose, response type, owner, review status,
and report behavior.

## Module Recommendations

### Health Behavior

Use the HPA adult preventive health form plus WHO STEPS as the first source
pair for smoking, alcohol, betel nut, physical activity, and diet-related
questions.

For alcohol, add AUDIT-C or AUDIT only when the first-release owner wants a
standard alcohol-risk module. AUDIT is a WHO 10-item alcohol-risk tool; AUDIT-C
is the faster pre-screen option.

For physical activity, use WHO GPAQ when a formal international physical
activity module is needed. If the Taiwan IPAQ version is selected, treat
authorization as a gate because the expert note states that HPA use may require
institutional application.

### Depression

Use PHQ-2 as the first-layer mental-health screen. If PHQ-2 is positive, route
to PHQ-9 or a human follow-up path only when clinical ownership and referral
workflow exist.

Report wording should be:

```text
This is a self-rated mood summary, not a diagnosis. If either item is positive,
please contact health-center staff or a healthcare professional for further
evaluation.
```

### Anxiety

GAD-2 / GAD-7 can be an optional module. GAD-2 is the lighter first screen for
general adult health-center use; GAD-7 can follow when screening indicates a
need and the owner confirms the referral workflow.

### Older-Adult Health

For older users, add standardized modules conditionally:

- WHO ICOPE for intrinsic capacity, including cognition, mobility, nutrition,
  vision, hearing, and depressive symptoms;
- CDC STEADI for fall risk;
- SARC-F for sarcopenia risk, especially if later phases include grip strength,
  gait speed, or body composition.

These should be age- and service-context-triggered rather than shown to every
adult by default.

### Diet

Do not start with complex 24-hour dietary recall. Use HPA `My Plate` concepts
for simple dietary education and self-rating. A research or public-health data
warehouse phase can later reference NAHSIT-style nutrition survey structure.

### Social Needs And Health Literacy

For a city-government public-health version, PRAPARE or CMS AHC-HRSN can be
added as social-needs modules. These are more useful for governance,
population-health dashboards, and resource routing than for the first cabin
MVP.

## MVP Version

The MVP should implement the smallest credible public-health questionnaire and
measurement flow:

```text
HPA adult preventive health red-box fields
-> WHO STEPS core simplified risk-factor fields
-> PHQ-2
-> height / weight / waist / blood pressure / vision / hearing basic measurement
-> simple health measurement report
```

### MVP Must Design

1. Field classification:
   classify each HPA form field as `user_intake`, `staff_assisted`,
   `measured_value`, `lab_result`, `clinician_interpretation`,
   `counseling_item`, `report_output`, `signature`, or `not_mvp`.
2. Source registry:
   record source name, source URL, version/date, field owner, review owner,
   response type, requiredness, and report display rule for every field.
3. User-facing questionnaire:
   keep first-release questions mostly choice-based, with stable question IDs
   and option IDs.
4. Measurement capture:
   include height, weight, waist, blood pressure, vision, and hearing as basic
   measurement values or self-screening outputs with measurement-quality notes.
5. PHQ-2 gate:
   show only the two depression screening questions in MVP; route positive
   response to a human follow-up message, not diagnosis.
6. Report:
   output `measurement summary`, `answer summary`, `health behavior reminders`,
   and `consult staff / healthcare professional` guidance.
7. Wording:
   keep report language in health measurement and public-health risk
   self-assessment terms.
8. Privacy:
   decide whether MVP is anonymous session, phone-number carry-home flow,
   QR-code report, or staff-assisted lookup before storing identifiers.
9. Avatar compatibility:
   if Avatar is used in MVP, it reads approved questions and accepts
   constrained answers; it does not generate new clinical questions.

### MVP Must Build

- HPA red-box questionnaire subset as the Taiwan public-sector backbone.
- WHO STEPS core mini-layer for chronic-disease and health-behavior risk.
- PHQ-2 with referral wording and no diagnostic output.
- Basic measurement summary for height, weight, BMI, waist, blood pressure,
  vision, and hearing.
- Structured report page with QR-code or session-based retrieval path.
- Admin/source table sufficient to show each field's provenance and review
  status.
- Export-ready JSON for report data, clearly marked as `HIS-ready draft` or
  `structured export`, not live HIS integration.

### MVP Should Not Do

- Do not invent questionnaire wording without a source.
- Do not treat the full HPA form as patient-fillable.
- Do not output diagnoses such as hypertension, depression, metabolic syndrome,
  or hearing loss.
- Do not run generic AI-generated questionnaire text in patient-facing mode.
- Do not build a full generic CMS before the first field classification and
  source registry are stable.
- Do not claim live HIS integration unless the target HIS interface, test
  environment, authentication, payload, and hospital owner are confirmed.
- Do not store raw voice, free-text transcript, or real identifiers without
  consent, retention, security, and ownership decisions.

## Product Versioning Recommendation

### MVP

Use:

- HPA adult preventive health red-box fields;
- WHO STEPS core simplified questions;
- PHQ-2;
- height, weight, waist, blood pressure, vision, and hearing basic measurement;
- simple measurement and explanation report.

This is the easiest version to deploy and defend because it is anchored in a
Taiwan public-sector form and WHO public-health structure.

### City Health Center Formal Version

Add:

- AUDIT-C;
- GPAQ or authorized Taiwan IPAQ;
- My Plate dietary self-assessment;
- older-adult conditional modules: ICOPE, STEADI, SARC-F.

This version supports broader city health-center work while keeping each module
source-backed.

### Research / Governance Version

Add:

- BRFSS / NHIS-style population-health question structure;
- PRAPARE or AHC-HRSN for social needs;
- health-literacy modules;
- public-health dashboard fields.

This version supports policy evaluation and population-health planning after
privacy, consent, governance, and data-quality rules are defined.

## Report Wording Control

Use:

```text
health measurement summary
self-assessment summary
health behavior reminder
public-health risk self-check
please consult health-center staff or a healthcare professional
```

Avoid:

```text
diagnosis
you have hypertension
you have depression
you have metabolic syndrome
you have hearing loss
treatment recommendation
medical order
```

The legal and workflow boundary is that this is a health measurement and
public-health risk self-assessment system, not an AI diagnosis system. The
report may provide simple measured values, source-backed explanations, and
staff/clinician follow-up prompts.

## Expert-Cited Reference List

The expert note cited these sources for later verification:

1. HPA adult preventive health service:
   <https://www.hpa.gov.tw/Pages/List.aspx?nodeid=189>
2. WHO STEPS:
   <https://www.who.int/teams/noncommunicable-diseases/surveillance/systems-tools/steps>
3. HPA / NHIS Taiwan:
   <https://www.hpa.gov.tw/Pages/List.aspx?nodeid=106>
4. CDC BRFSS questionnaires:
   <https://www.cdc.gov/brfss/questionnaires/index.htm>
5. CDC NHANES:
   <https://www.cdc.gov/nchs/nhanes/>
6. WHO AUDIT:
   <https://www.who.int/publications/i/item/WHO-MSD-MSB-01.6a>
7. WHO GPAQ:
   <https://www.who.int/publications/m/item/global-physical-activity-questionnaire>
8. HPA IPAQ Taiwan application note:
   <https://www.hpa.gov.tw/Pages/Detail.aspx?nodeid=876&pid=4900>
9. USPSTF adult depression screening:
   <https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/screening-depression-suicide-risk-adults>
10. Pfizer PHQ / GAD public-access note:
    <https://www.pfizer.com/news/press-release/press-release-detail/pfizer_to_offer_free_public_access_to_mental_health_assessment_tools_to_improve_diagnosis_and_patient_care>
11. USPSTF adult anxiety screening:
    <https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/anxiety-adults-screening>
12. WHO ICOPE generic care pathways:
    <https://cdn.who.int/media/docs/default-source/mca-documents/ageing/icope-training-programme/module-7/who-icope_m7_generic-care-pathways_fg.pdf>
13. CDC STEADI:
    <https://www.cdc.gov/steadi/index.html>
14. SARC-F reference cited by expert:
    <https://www.nature.com/articles/s41598-023-39002-y>
15. HPA My Plate:
    <https://www.hpa.gov.tw/Pages/EBook.aspx?nodeid=3821>
16. HPA NAHSIT:
    <https://www.hpa.gov.tw/Pages/List.aspx?nodeid=3998>
17. PRAPARE:
    <https://www.nachc.org/resource/prapare/>
18. CMS AHC-HRSN / NAM article:
    <https://nam.edu/perspectives/standardized-screening-for-health-related-social-needs-in-clinical-settings-the-accountable-health-communities-screening-tool/>
19. Legal concept reference supplied by expert:
    <https://www.legis-pedia.com/dictionary/75>
