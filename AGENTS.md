# AGENTS.md

This folder is the execution and source workspace for the 慧誠智醫（imedtac
Co., Ltd.）Smart Health Cabin collaboration lane.

## Mission

Preserve and develop the materials needed to evaluate, scope, and eventually
implement the Smart Health Cabin collaboration project: hearing, vision,
questionnaire, Avatar interaction, integrated report, QR report access,
structured export, and future HIS-ready interface planning.

## Ownership

- This folder owns Smart Health Cabin source copies, meeting records,
  feasibility notes, module discovery notes, questionnaire-source analysis,
  MVP scope, and future handoff material.
- `../imedtac-ai-triage-kiosk-v0` owns the separate AI Triage demo lane and its stable
  imedtac-facing demo API history.
- `../planning-everything-track` owns capacity, priority, status, project
  locators, and day-note mirrors.

## Scope Controls

- Treat Smart Health Cabin as a distinct cooperation project, not as a feature
  inside `imedtac-ai-triage-kiosk-v0`.
- Keep the first release in screening support, health measurement summary,
  public-health risk self-assessment, and human-review workflow language.
- Do not present this folder as a production clinical product, diagnosis
  system, treatment system, medical-device validation package, or live HIS
  integration.
- Do not store real patient data, credentials, private API tokens, production
  HIS details, or unredacted private links in tracked files.
- Keep patent-sensitive method details internal unless Prof. Wu / Tomi clear a
  sharing path.
- Keep customer module choice visible: hearing, vision, questionnaire, and
  Avatar interaction should each state what they produce, what they consume,
  and how they can be enabled without forcing the other modules.
- Treat Kafka or Kafka-like infrastructure as an activation gate, not a default.
  Start from a small module event/report envelope and add heavier streaming only
  when replay, multiple consumers, ordering, or deployment scale requires it.

## Writing Method

Use affirmative, product-minded writing:

```text
capability -> workflow value -> evidence/source control -> human-review or
screening-support boundary -> next decision
```

For company-facing material, lead with what the project can own and what the
next decision is. State safety and validation boundaries as design controls,
not apologies.

## File Routing

- `source/`: copied evidence, meeting transcripts, LINE/Gmail/Teams records,
  requirement packages, and agent-readable source files.
- `workstreams/`: interpreted discovery notes, MVP scope, feasibility logic,
  module plans, decision logs, and reusable internal analysis.
- `handoff/`: future cleared company-facing or Prof. Wu-facing drafts.
- `docs/`: repo-level indexes, source maps, and operating policies.
- `decisions/`: dated decisions once project scope, repo strategy, or delivery
  commitments are fixed.

## Git Rules

- Keep this project separate from `../imedtac-ai-triage-kiosk-v0` commits.
- Do not push to GitHub without explicit confirmation.
- If planning is updated in the same work session, commit this folder and
  `../planning-everything-track` separately.
