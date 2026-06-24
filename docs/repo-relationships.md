# Repo Relationships

## Smart Health Cabin Workspace

Path:

```text
../imedtac-smart-health-cabin-v0
```

Role:

- owns Smart Health Cabin source packages, module discovery, feasibility notes,
  architecture decisions, and handoff drafts;
- keeps the four-module design principle visible;
- stores open-source adaptation research for hearing, vision, questionnaire, and
  Avatar interaction modules;
- owns the MVP monorepo / Redpanda reference architecture note and the full MVP
  system spec for future implementation planning.

Key architecture links:

```text
workstreams/smart-health-cabin/2026-06-24-mvp-monorepo-redpanda-architecture-note.md
docs/specs/MVP-SYSTEM-SPEC.md
research-packets/2026-06-24-smart-health-cabin-module-research/module-event-layer/
```

## AI Triage Kiosk Repo

Path:

```text
../imedtac-ai-triage-kiosk-v0
```

Role:

- owns the separate English AI Triage kiosk demo API and Render/FastAPI runtime;
- remains the externally stable two-endpoint AI Triage lane;
- may be referenced for API consistency, report display ideas, CORS/auth
  experience, and IP-safe reuse boundaries.

## Planning Repo

Path:

```text
../planning-everything-track
```

Key locator:

```text
../planning-everything-track/data/projects/2026-06-imedtac-smart-health-cabin.md
```

Role:

- owns priority, capacity, status, weekly/day scheduling, and cross-repo routing;
- should link here for canonical Smart Health Cabin work;
- should not copy full source records, research tables, or implementation detail.

## Urology / Deep-Cultivation Thinking Spec

Path:

```text
../urology-ai-previsit-thinking-spec
```

Role:

- owns Health Taiwan / deep-cultivation clinical proposal reasoning;
- may reference Smart Health Cabin measurement and report capabilities when the
  proposal needs sarcopenia, urology, Huashan, Xinyi, or Songde alignment;
- does not own imedtac product module implementation.

## Source Rule

Raw screenshots, transcripts, copied external messages, and exported files go in
dated `source/` packages here. Derived interpretation goes in `workstreams/`.
Cleared outward-facing material goes in `handoff/`.
