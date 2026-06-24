# imedtac Smart Health Cabin Workspace

This workspace owns the 慧誠智醫（imedtac Co., Ltd.）Smart Health Cabin
collaboration lane. The first product principle is modular adoption: customers
can choose hearing, vision, questionnaire, Avatar interaction, or any useful
combination without forcing a full system rollout.

## Current Decision

The `2026-06-24` work target is to research whether open-source GitHub projects
can be adapted into the four Smart Health Cabin modules while preserving the
repo design principle:

- four independent modules;
- shared structured outputs;
- customer-selectable activation;
- a lightweight event/report layer that can connect modules without overbuilding
  a production streaming platform too early.

Canonical task note:

```text
workstreams/smart-health-cabin/2026-06-24-open-source-module-research-plan.md
```

## Module Map

| Module | Customer value | Output to shared layer |
| --- | --- | --- |
| Hearing | Guided hearing self-check / screening-support workflow | test context, response result, quality flag, report text |
| Vision | Guided vision self-check / screening-support workflow | test context, response result, quality flag, report text |
| Questionnaire | Public-health questionnaire and risk-factor self-assessment | answer set, score/rule trace, follow-up prompt, version |
| Avatar interaction | Guided interaction, education, and navigation support | session prompts, user choices, completion state, handoff notes |

## Shared Layer

Use a small module event layer first. Kafka is a candidate only if the project
needs replay, multiple downstream consumers, ordering guarantees, or deployment
scale that a simple append-only event table / queue cannot handle.

Minimum event shape:

```text
module_id, session_id, event_type, payload_version, payload, created_at,
source_module_version, quality_flag, reviewer_state
```

## Important Files

| File | Purpose |
| --- | --- |
| `AGENTS.md` | Workspace operating rules |
| `docs/repo-relationships.md` | Ownership split across Smart Health Cabin, AI Triage, planning, and proposal repos |
| `docs/source-index.md` | Source package index and pending source routes |
| `workstreams/smart-health-cabin/README.md` | Active workstream index |
| `workstreams/smart-health-cabin/2026-06-24-open-source-module-research-plan.md` | Today's open-source adaptation research plan |
| `research-packets/2026-06-24-smart-health-cabin-module-research/README.md` | Complete module research packet set for hearing, vision, questionnaire, live Avatar, and module event layer |
| `workstreams/smart-health-cabin/2026-06-23-onsite-discovery-plan.md` | Copied onsite discovery prep packet |
| `workstreams/smart-health-cabin/meeting-question-bank.md` | Copied meeting question bank |
| `workstreams/smart-health-cabin/post-meeting-decision-log.md` | Decision log for confirmed facts and gates |

## Planning Bridge

Planning stays thin:

```text
../planning-everything-track/data/projects/2026-06-imedtac-smart-health-cabin.md
```

The AI Triage kiosk API lane stays separate:

```text
../imedtac-ai-triage-kiosk-v0/
```
