# AGENTS.md

This workspace is the canonical execution home for the 慧誠智醫（imedtac
Co., Ltd.）Smart Health Cabin collaboration lane.

## Mission

Build and preserve source-backed discovery, module architecture, feasibility,
and handoff material for a customer-configurable Smart Health Cabin system.

The product direction is four independently adoptable modules:

- hearing module;
- vision module;
- questionnaire module;
- Avatar interaction module.

Each module should be usable alone or combined with other modules through a
shared report and event-data layer.

## Non-Goals

Do not turn this workspace into:

- the AI Triage kiosk demo repo;
- a production clinical diagnosis system;
- a live patient-data repository;
- a broad medical-device regulatory submission package;
- a speculative implementation playground before source facts and ownership are
  confirmed.

## Canonical Ownership

- This workspace owns Smart Health Cabin source packages, module discovery,
  module-fit research, feasibility-response drafts, report/QR/API/ERD notes, and
  customer-configurable module architecture.
- `../imedtac-ai-triage-kiosk-v0` owns the separate English AI Triage kiosk demo
  API lane.
- `../planning-everything-track` owns priority, capacity, status, deadlines, and
  project locator notes.
- Related clinical / proposal reasoning may live in
  `../urology-ai-previsit-thinking-spec` when the work belongs to the Health
  Taiwan / deep-cultivation proposal lane.

## Working Rules

1. Keep source evidence under `source/`.
2. Keep active interpretation under `workstreams/`.
3. Keep outward-facing drafts under `handoff/`.
4. Use positive-scope wording: capability, evidence, ownership, scope control,
   next validation layer.
5. Do not store credentials, private tokens, real patient data, or identifiable
   medical records in tracked files.
6. Keep customer module choice visible: each module must state what it produces,
   what it consumes, and how it can be enabled without forcing other modules.
7. Treat Kafka or Kafka-like infrastructure as an activation gate, not a default.
   Start from a simple module event envelope and add heavier streaming only when
   replay, multiple consumers, ordering, or deployment scale require it.

## Git Rules

- This workspace is local-first unless the user explicitly asks to publish it.
- Do not push to GitHub without explicit confirmation.
- If planning is updated in the same work session, commit this workspace and
  `../planning-everything-track` separately.
