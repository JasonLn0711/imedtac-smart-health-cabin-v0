# Source Index

This file tracks the Smart Health Cabin source packages and their active
interpretation routes.

## Current Source Status

| Source package | Status | Route |
| --- | --- | --- |
| `source/2026-06-17-imedtac-smart-health-cabin-requirements/` | pending source import | Requirements source for module scope, schedule, and ownership assumptions |
| `source/2026-06-23-imedtac-onsite-visit-smart-health-cabin/` | pending source import | Onsite transcript, screenshots, equipment facts, and confirmed owner facts |
| `source/2026-06-23-wu-line-hpa-adult-preventive-health-form/` | pending source import | HPA adult preventive health form source for questionnaire MVP grounding |
| `../imedtac-ai-triage-kiosk-v0/source/2026-06-16-imedtac-teams-question-option-adjustment/` | adjacent source available | AI Triage / Smart Health Cabin Teams follow-up context |

## Active Derived Notes

| File | Purpose |
| --- | --- |
| `workstreams/smart-health-cabin/2026-06-23-onsite-discovery-plan.md` | Onsite discovery prep and meeting control |
| `workstreams/smart-health-cabin/meeting-question-bank.md` | Question bank for equipment, module, report, ownership, and validation discovery |
| `workstreams/smart-health-cabin/post-meeting-decision-log.md` | Confirmed facts, owner map, open decisions, and next gate |
| `workstreams/smart-health-cabin/2026-06-24-open-source-module-research-plan.md` | Open-source GitHub adaptation research plan for the four modules |

## Source Rules

- Treat source packages as copied evidence.
- Do not rewrite transcripts as if they were canonical meeting minutes.
- Redact credentials, private links, tokens, and identifiable medical data before
  storing anything in Git.
- If a source is not yet imported, mark it as pending rather than inventing
  facts from memory.
