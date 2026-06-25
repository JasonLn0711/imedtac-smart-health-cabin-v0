---
id: smart-health-cabin-api-summary
title: "API Summary"
date: 2026-07-10
topic: smart-health-cabin
type: api-summary
status: active
---

# API Summary

The API server owns the Phase 1 questionnaire spine and voice-provider boundary.

| Route | Purpose |
| --- | --- |
| `GET /healthz` | API health. |
| `POST /api/v1/kiosk/sessions` | Create kiosk session. |
| `GET /api/v1/questionnaires/active` | Load active published PHQ-9 SurveyJS questionnaire. |
| `POST /api/v1/questionnaire-responses` | Submit answers, score server-side, create public report token, write outbox events. |
| `GET /api/v1/reports/:token/public` | Public report section without raw answers or diagnostic labels. |
| `GET /api/v1/admin/questionnaire-templates` | Admin template list. |
| `POST /api/v1/admin/questionnaire-templates` | Create supported questionnaire template. |
| `POST /api/v1/admin/questionnaire-versions` | Create validated SurveyJS version draft. |
| `POST /api/v1/admin/questionnaire-versions/:id/publish` | Publish a questionnaire version. |
| `GET /api/v1/admin/questionnaire-responses` | Admin response list with report links and review flags. |
| `POST /api/v1/agent-sessions` | Create voice-agent session. |
| `POST /api/v1/agent-turns/asr` | Live/mock ASR transcript capture. |
| `POST /api/v1/agent-turns/respond` | Live/mock question guidance. |
| `POST /api/v1/agent-turns/tts` | Live/mock TTS audio generation, default BreezyVoice only. |
| `POST /api/v1/agent-turns/map-answer` | Deterministic transcript-to-SurveyJS choice candidate. |
| `GET /api/v1/providers/status` | Provider runtime status and Sprint 5 acceptance eligibility. |

Provider status keeps legacy top-level `asr`, `llm`, and `tts` keys while also
returning nested `providers` and `sprint5Acceptance`.
