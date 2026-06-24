# Smart Health Cabin Workstream

This workstream turns Smart Health Cabin discovery into source-backed module
architecture, feasibility scope, and handoff material.

## Active Principle

The product should support four independently adoptable modules:

- hearing;
- vision;
- questionnaire;
- Avatar interaction.

Each module should produce structured outputs that can feed a shared report and
future HIS-ready data path without requiring the customer to buy or deploy every
module at once.

## Current Files

| File | Purpose |
| --- | --- |
| `2026-06-24-open-source-module-research-plan.md` | Today's task plan for open-source GitHub repo evaluation and adaptation fit |
| `../../research-packets/2026-06-24-smart-health-cabin-module-research/README.md` | Complete research packet set split by module and shared event layer |
| `2026-06-23-onsite-discovery-plan.md` | Onsite discovery plan copied from the AI Triage bridge folder |
| `meeting-question-bank.md` | Discovery question bank copied from the AI Triage bridge folder |
| `post-meeting-decision-log.md` | Confirmed facts, owners, open questions, and next decisions |
| `email-requirements-brief.md` | Requirements brief placeholder until source import is complete |
| `external-authority-verification.md` | External authority verification placeholder until source-backed checks are complete |
| `hpa-adult-preventive-health-questionnaire-mvp-design-note.md` | Questionnaire MVP note placeholder until HPA/WHO source review is complete |

## Research Intake Rule

When Jason posts today's research findings, append them to
`2026-06-24-open-source-module-research-plan.md` under `Research Findings`.

Each candidate open-source repo should be evaluated by:

- module fit;
- license;
- maintenance activity;
- data model / API surface;
- adaptation cost;
- privacy and safety boundary;
- whether it can run as an optional module behind the shared event/report layer.
