---
id: 2026-06-24-open-source-module-research-plan
title: "2026-06-24 Open-Source Module Research Plan"
date: 2026-06-24
type: research-plan
status: active
source:
  - ../../docs/repo-relationships.md
  - ../../docs/source-index.md
  - ./2026-06-23-onsite-discovery-plan.md
  - ./meeting-question-bank.md
---

# 2026-06-24 Open-Source Module Research Plan

## Today's Decision Target

Today's task is to investigate whether existing open-source GitHub repositories
can be adapted into the four Smart Health Cabin modules while preserving the
imedtac product principle: customers can freely choose which modules they need.

The research should produce an evidence-backed adaptation map for:

- hearing module;
- vision module;
- questionnaire module;
- Avatar interaction module.

The result should also decide whether the modules need a shared lightweight
event/data layer, and whether a Kafka-like structure is useful now or should
remain a future activation gate.

## Product Principle

The Smart Health Cabin should be designed as selectable modules, not one bundled
system. Each module should have:

- its own input contract;
- its own output contract;
- a clear report contribution;
- a module version;
- a review / quality state;
- an activation state per customer.

## Open-Source Candidate Evaluation Table

| Module | Candidate repo | License | What it can provide | Adaptation needed | Fit | Decision |
| --- | --- | --- | --- | --- | --- | --- |
| Hearing | pending | pending | pending | pending | pending | pending |
| Vision | pending | pending | pending | pending | pending | pending |
| Questionnaire | pending | pending | pending | pending | pending | pending |
| Avatar interaction | pending | pending | pending | pending | pending | pending |

## Fit Criteria

Use these criteria before recommending reuse:

| Criterion | Question |
| --- | --- |
| Module independence | Can this module run without forcing the other three modules? |
| Customer configurability | Can the customer enable, disable, or replace this module cleanly? |
| Data contract | Does the repo expose structured results that can become report/API fields? |
| License | Is commercial adaptation allowed, and are attribution / disclosure duties clear? |
| Maintenance | Is the repo maintained enough to reduce delivery risk? |
| Stack fit | Can imedtac / NYCU reasonably deploy or adapt the stack? |
| Safety scope | Can output wording stay in screening-support / self-assessment / staff-review scope? |
| Privacy | Can the module avoid storing real patient identifiers or sensitive data by default? |
| Versioning | Can questions, prompts, tests, or result rules be versioned per release? |
| Validation path | Can the module produce a clear validation plan or test evidence? |

## Shared Event / Report Layer Question

The four modules need a shared structure for generated information. The default
design should be a small module event layer, not full Kafka.

Minimum event envelope:

| Field | Purpose |
| --- | --- |
| `session_id` | Connect events from one cabin use session |
| `module_id` | Identify hearing, vision, questionnaire, or Avatar module |
| `event_type` | Record started, completed, result_generated, report_added, review_changed |
| `payload_version` | Keep result schema version explicit |
| `payload` | Store module-specific structured result |
| `source_module_version` | Preserve module release / model / question version |
| `quality_flag` | Record usable, noisy, incomplete, skipped, or needs_review |
| `reviewer_state` | Record draft, staff_reviewed, published, or rejected |
| `created_at` | Support ordering and audit |

Kafka-like infrastructure becomes useful only when the project needs multiple
independent consumers, replay, durable ordering, cross-service scale, or
real-time event fan-out. Until then, a database table, append-only JSONL log, or
simple queue is the lower-friction design.

## Today's Tasks

- [ ] Identify open-source GitHub candidates for the hearing module.
- [ ] Identify open-source GitHub candidates for the vision module.
- [ ] Identify open-source GitHub candidates for the questionnaire module.
- [ ] Identify open-source GitHub candidates for the Avatar interaction module.
- [ ] For each candidate, record license, maintenance activity, stack, API/data
  output, adaptation cost, and fit with customer-selectable modules.
- [ ] Decide whether each module should be adapted, used only as reference, or
  rejected.
- [ ] Draft the shared event/report-layer recommendation.
- [ ] Record the next gate: feasibility memo, prototype spike, or stakeholder
  scope confirmation.

## Research Findings

Append Jason's research findings here.

### Hearing Module

- Pending.

### Vision Module

- Pending.

### Questionnaire Module

- Pending.

### Avatar Interaction Module

- Pending.

### Shared Event / Report Layer

- Pending.

## Output Shape For Closeout

When today's research is ready, close with:

- recommended open-source candidate per module;
- rejected candidates and reason;
- module activation contract;
- shared event/report-layer recommendation;
- implementation gate;
- source links;
- owner / next decision.

## Research Packet

The full packetized research workspace is:

```text
../../research-packets/2026-06-24-smart-health-cabin-module-research/
```

It contains independent module packets for hearing, vision, questionnaire, live
Avatar interaction, and the small Kafka-like module event/report layer. Each
packet records its project role and its relationship to the other packets.
