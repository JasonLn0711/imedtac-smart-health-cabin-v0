---
id: 2026-06-23-wu-line-hpa-adult-preventive-health-form
title: "2026-06-23 Prof. Wu LINE - HPA Adult Preventive Health Service Form"
date: 2026-06-23
topic: ai-triage
type: source
status: preserved
source_owner: user-provided
sender: Prof. Wu / 吳育德老師
channel: LINE
raw_files:
  - 2026-06-23-hpa-adult-preventive-health-service-check-record-result-form-agent-readable.md
derived_analysis:
  - ../../workstreams/smart-health-cabin/hpa-adult-preventive-health-questionnaire-mvp-design-note.md
related:
  - ../../workstreams/smart-health-cabin/module-b-questionnaire-triage-discovery.md
  - ../../workstreams/smart-health-cabin/post-meeting-decision-log.md
  - ../../source/2026-06-23-imedtac-onsite-visit-smart-health-cabin/source.md
---

# 2026-06-23 Prof. Wu LINE - HPA Adult Preventive Health Service Form

## Source Boundary

This source bundle preserves the user-provided LINE file from Prof. Wu:
`健康署成人預防保健服務檢查紀錄結果表單_ai_agent_readable.md`.

The file is copied as a source artifact for internal analysis and future agent
reading. It is not a Smart Health Cabin implementation schema, final
questionnaire configuration, HIS integration contract, diagnosis workflow,
treatment recommendation, or clinical validation plan.

## Preserved File

| Local file | Original source path | SHA-256 |
| --- | --- | --- |
| `2026-06-23-hpa-adult-preventive-health-service-check-record-result-form-agent-readable.md` | `/Users/iKev/Downloads/健康署成人預防保健服務檢查紀錄結果表單_ai_agent_readable.md` | `97141cd7c34b38c378307cd80ce6a99fedeb6b9b3e47b6ef7323cbe2072e6fbf` |

## Agent Reading Notes

- Treat the copied Markdown as an agent-readable conversion of a two-page
  Health Promotion Administration adult preventive health service examination
  record / result form.
- The file states that the original PDF did not provide copyable text and that
  the Markdown was transcribed from rendered page images.
- The red-box scope is especially relevant to Smart Health Cabin questionnaire
  discovery: it marks the first-page pre-exam table from basic demographics
  through body examination.
- Separate patient/service-user fillable fields from clinician, laboratory,
  institution, result, advice, and signature fields before deriving any
  questionnaire or CMS requirements.
- Use this as a form-analysis source, not as approval to collect real patient
  data or connect to production HIS.

## Smart Health Cabin Relevance

This source helps clarify why the questionnaire module cannot treat every
official form as a simple patient questionnaire. The form includes several
different field classes:

- demographics and consent;
- disease history, medication, family history, and health behavior;
- depression screening;
- body measurement and exam fields;
- vision and ENT/oral exam fields;
- laboratory fields;
- health counseling;
- result interpretation, advice, follow-up, referral, and physician /
  institution signatures.

For first-release Smart Health Cabin planning, the working use is to identify
which parts are suitable for user-facing structured intake, which parts require
staff or clinician entry, and which result/advice fields require clinical
ownership before appearing in reports.

## Expert MVP Design Note

The expert analysis supplied after this form was archived is preserved in:

```text
../../workstreams/smart-health-cabin/hpa-adult-preventive-health-questionnaire-mvp-design-note.md
```

Its core recommendation is to avoid inventing a new questionnaire. Use the HPA
adult preventive health service form as the Taiwan public-sector backbone,
WHO STEPS as the international public-health backbone, and add standardized
modules by age and service context.
