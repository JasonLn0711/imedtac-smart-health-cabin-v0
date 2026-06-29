---
id: smart-health-cabin-erd-summary
title: "ERD Summary"
date: 2026-07-10
topic: smart-health-cabin
type: database-summary
status: active
---

# ERD Summary

Phase 1 stores questionnaire versions, submissions, public report sections,
voice-agent turns, audit events, and retryable outbox events in PostgreSQL.

```mermaid
erDiagram
  sessions ||--o{ questionnaire_responses : owns
  questionnaire_templates ||--o{ questionnaire_versions : versions
  questionnaire_versions ||--o{ questionnaire_responses : answered_with
  questionnaire_responses ||--o{ report_sections : creates
  questionnaire_responses ||--o{ report_access_tokens : exposes
  sessions ||--o{ agent_sessions : starts
  agent_sessions ||--o{ agent_turns : records
  questionnaire_responses ||--o{ outbox_events : emits
  audit_events }o--|| questionnaire_versions : records
```

Key controls:

- `questionnaire_versions` keeps SurveyJS JSON and scoring config as versioned
  source.
- `questionnaire_responses` stores raw answers internally and public-safe
  summaries separately.
- `report_sections` and `report_access_tokens` power QR-ready public access
  without exposing raw answers.
- `agent_turns` records ASR/respond/TTS/map-answer evidence for review.
- `outbox_events` keeps Redpanda publication retryable and non-blocking.
