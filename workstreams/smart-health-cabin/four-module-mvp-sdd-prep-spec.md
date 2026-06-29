---
id: smart-health-cabin-four-module-mvp-sdd-prep-spec
title: "Four Module MVP And SDD Preparation Spec"
date: 2026-06-23
topic: smart-health-cabin
type: sdd-prep-spec
status: active
source:
  - ../../source/2026-06-23-expert-four-module-sdd-prep-note/source.md
  - ../../source/2026-06-23-imedtac-onsite-visit-smart-health-cabin/source.md
  - ../../source/2026-06-17-imedtac-smart-health-cabin-requirements/source.md
  - ./post-meeting-decision-log.md
  - ./module-a-vision-hearing-discovery.md
  - ./module-b-questionnaire-triage-discovery.md
  - ./module-c-avatar-interaction-discovery.md
  - ./mvp-questionnaire-system-architecture.md
audience:
  - NYCU internal planning
  - imedtac feasibility discussion
  - Smart Health Cabin MVP implementation planning
  - future SDD drafting
---

# Four Module MVP And SDD Preparation Spec

## 1. System Positioning

The Smart Health Cabin MVP is a selectable, source-backed, non-diagnostic
self-screening and questionnaire platform for public-sector health-promotion
or kiosk-style deployments.

The product owns four user-facing modules:

1. `hearing` - Hearing Self-Screening Module
2. `vision` - Vision Self-Screening Module
3. `questionnaire` - Structured Questionnaire Module
4. `avatar` - Avatar-Guided Interaction Module

The platform owns shared services: session, consent, module registry, site
config, report, QR Code, storage, audit log, admin CMS, JSON/API export,
future integration adapter, observability, deployment, and support tooling.
These are cross-module platform layers, not a fifth user-facing module.

## 2. Architecture Decision

Use:

```text
Modular Monolith First, Microservice-Ready Later
```

MVP implementation should use one backend, one database, one deployment path,
and explicit module packages. This lets the team move quickly while keeping
module boundaries ready for later extraction.

| Phase | Architecture | Decision |
| --- | --- | --- |
| MVP | Single repo, single backend, shared DB, module packages, shared contracts. | Build now. |
| Productization | Extract module APIs behind stable contracts where scale or customer needs justify it. | Prepare boundaries. |
| Multi-site / multi-customer | Module registry, site-level module selection, stronger admin roles, event/outbox integration. | Phase 2+. |
| Large-scale platform | API Gateway, independent module services, event bus, distributed observability. | Not MVP. |

True microservices are not an MVP requirement because they add service
discovery, distributed tracing, cross-service auth, network failure handling,
version compatibility, and data-consistency overhead before the product scope
is stable.

## 3. Module Independence Rules

Each user-facing module must:

1. be independently enabled or disabled by site config;
2. be independently tested and accepted;
3. produce a `StandardModuleResult`;
4. avoid direct dependency on another module's internal data model;
5. communicate through `SessionContext`, `ModuleManifest`, and
   `StandardModuleResult`;
6. preserve module version and result schema version;
7. support later replacement or extraction behind the same contract.

Avatar is the one intentional attachment module: it can attach to
`questionnaire`, `vision`, or `hearing`, but MVP should attach it to
`questionnaire` first.

## 4. Recommended Repo Structure

```text
smart-health-cabin/
  apps/
    kiosk-web/
    admin-cms/
  services/
    api/
    report-service/
  packages/
    module-contracts/
    ui-components/
    device-sdk/
    report-templates/
  modules/
    hearing/
    vision/
    questionnaire/
    avatar/
  docs/
    prd/
    spec/
    sdd/
    api/
    erd/
    test-plan/
    risk-governance/
  infra/
    docker/
    compose/
    nginx/
  tests/
    e2e/
    integration/
    module-contract/
```

This current repo remains the planning and source workspace until an
implementation decision is recorded.

## 5. Platform Services

| Service | Responsibility | MVP boundary |
| --- | --- | --- |
| `KioskShell` | Resident-facing start, consent, module routing, report preview, QR display, timeout, and restart. | Required. |
| `SessionService` | Create session, store site/device/module flow, track status. | Required. |
| `ConsentService` | Record service notice and consent version. | Required. |
| `ModuleRegistry` | Store available modules, versions, enabled status, runtime needs. | Required. |
| `ConfigService` | Load site module combination and default flow. | Required. |
| `ReportService` | Generate user report from module results. | Required. |
| `QRCodeService` | Create short-lived report token. | Required. |
| `StorageService` | Persist sessions, events, answers, measurements, results, reports. | Required. |
| `AuditLogService` | Record admin changes, report access, module errors, export events. | Required. |
| `AdminCMS` | Manage questionnaire versions and site/module configuration. | Minimal MVP. |
| `IntegrationAdapter` | Preserve future JSON/API export shape. | No live HIS writeback in MVP. |
| `Observability` | Log errors, latency, completion rate, device failures. | Required for field test. |

## 6. Module Contract

### 6.1 Module Manifest

Every module publishes a manifest.

```json
{
  "module_id": "vision",
  "module_name": "Vision Self-Screening Module",
  "module_version": "0.1.0",
  "module_type": "vision",
  "supported_locales": ["zh-TW"],
  "requires_audio_output": true,
  "requires_audio_input": false,
  "requires_touchscreen": true,
  "requires_camera": false,
  "requires_gpu": false,
  "can_run_standalone": true,
  "mvp_ready": true,
  "result_schema_version": "vision-result-v0.1"
}
```

Avatar example:

```json
{
  "module_id": "avatar",
  "module_name": "Avatar-Guided Interaction Module",
  "module_version": "0.1.0",
  "module_type": "avatar",
  "supported_locales": ["zh-TW"],
  "requires_audio_output": true,
  "requires_audio_input": true,
  "requires_touchscreen": true,
  "requires_camera": false,
  "requires_gpu": true,
  "can_run_standalone": false,
  "can_attach_to_modules": ["questionnaire", "vision", "hearing"],
  "mvp_ready": true,
  "result_schema_version": "avatar-turn-result-v0.1"
}
```

### 6.2 Runtime State

```text
idle
-> initialized
-> instruction
-> running
-> calculating
-> completed
-> result_attached_to_report
```

Failure and interruption states:

```text
aborted
failed
timeout
environment_invalid
device_unavailable
user_cancelled
```

### 6.3 Standard Module Result

```json
{
  "session_id": "sess_20260623_abc123",
  "module_run_id": "run_vision_001",
  "module_id": "vision",
  "module_version": "0.1.0",
  "status": "completed",
  "started_at": "2026-06-23T15:10:00+08:00",
  "completed_at": "2026-06-23T15:13:00+08:00",
  "result_level": "attention_suggested",
  "display_summary": {
    "title": "視力自我篩檢結果",
    "summary_text": "本次自我篩檢顯示右眼辨識表現需留意，建議進一步諮詢眼科或驗光專業人員。",
    "user_facing_level": "需留意"
  },
  "structured_result": {},
  "raw_events_ref": "storage://events/run_vision_001",
  "flags": [
    {
      "code": "professional_followup_suggested",
      "severity": "notice",
      "message": "建議進一步諮詢專業人員"
    }
  ],
  "disclaimer_code": "SELF_CHECK_NOT_DIAGNOSIS"
}
```

Allowed `result_level` values:

```text
reference_ok
attention_suggested
incomplete
environment_invalid
unable_to_determine
professional_followup_suggested
```

Avoid diagnosis-like values:

```text
diagnosed
disease_detected
normal
abnormal_disease
medical_grade
```

## 7. Module Specifications

### 7.1 Hearing Module

Purpose: fixed-speaker self-screening support. It is not formal audiometry,
does not output an audiogram, and does not assign hearing-loss grade.

MVP builds audio device check, quiet-environment instruction, left/right
channel prompts, one to three configured tones, touch response, one replay per
item, conservative result summary, and `StandardModuleResult`.

MVP excludes pure-tone threshold audiometry, `dB HL` threshold result,
hearing-loss diagnosis, hearing-aid fitting flow, and audiologist workflow.

Flow:

```text
enter hearing module
-> show self-screening notice
-> ask user to sit still and keep quiet
-> check speaker and volume profile
-> play left-channel test sound
-> user answers heard / not heard / not sure
-> play right-channel test sound
-> user answers heard / not heard / not sure
-> optional second configured frequency
-> calculate simple result
-> display summary
-> write StandardModuleResult
```

Acceptance criteria:

| ID | Criterion |
| --- | --- |
| H-001 | Left and right sounds can be played separately by configured channel. |
| H-002 | User can answer through touch. |
| H-003 | Missing answer triggers retry prompt. |
| H-004 | Each test item supports at least one replay. |
| H-005 | Completed run writes `StandardModuleResult`. |
| H-006 | Report includes hearing summary with non-diagnostic wording. |

Input contract:

```json
{
  "session_id": "sess_001",
  "device_profile_id": "cabin_audio_profile_001",
  "test_config": {
    "frequencies_hz": [1000, 2000],
    "channels": ["left", "right"],
    "replay_allowed": true,
    "max_replay_count": 1
  }
}
```

Output contract:

```json
{
  "module_id": "hearing",
  "structured_result": {
    "left_ear": {
      "heard_1000hz": true,
      "heard_2000hz": true,
      "status": "reference_ok"
    },
    "right_ear": {
      "heard_1000hz": true,
      "heard_2000hz": false,
      "status": "attention_suggested"
    },
    "environment": {
      "ambient_noise_check": "not_measured_mvp",
      "device_profile_id": "cabin_audio_profile_001"
    }
  },
  "display_summary": {
    "title": "聽力自我篩檢結果",
    "summary_text": "本次右耳部分聲音辨識需留意，建議進一步諮詢耳鼻喉科或聽力專業人員。",
    "user_facing_level": "需留意"
  }
}
```

### 7.2 Vision Module

Purpose: touch-based self-screening support. It does not replace eye
examination, refraction, diagnosis, or clinical visual-field testing.

MVP builds direction recognition, optional color-vision item, left/right/both
eye flow, large touch buttons, audio instruction support, result summary, and
`StandardModuleResult`.

MVP excludes precise medical-grade acuity claims, full contrast sensitivity,
complete astigmatism workflow, formal visual field, and ophthalmology
diagnosis.

Flow:

```text
enter vision module
-> show self-screening notice
-> prompt fixed position and distance
-> ask whether glasses or contacts are worn
-> follow configured eye sequence
-> show direction symbol
-> user taps up / down / left / right
-> record correct count
-> run simple color item if enabled
-> calculate screening summary
-> display summary
-> write StandardModuleResult
```

Acceptance criteria:

| ID | Criterion |
| --- | --- |
| V-001 | User can complete the flow with touch only. |
| V-002 | Left-eye and right-eye runs can be separated. |
| V-003 | Direction-answer correctness is recorded. |
| V-004 | Color-vision item can be completed when enabled. |
| V-005 | Completed run writes `StandardModuleResult`. |
| V-006 | Report includes non-diagnostic vision summary. |

Input contract:

```json
{
  "session_id": "sess_001",
  "device_profile_id": "screen_profile_001",
  "test_config": {
    "test_modes": ["acuity_direction", "color_vision"],
    "eyes": ["left", "right"],
    "max_attempts_per_level": 3,
    "distance_mode": "fixed_cabin_distance"
  }
}
```

Output contract:

```json
{
  "module_id": "vision",
  "structured_result": {
    "left_eye": {
      "acuity_screening_band": "reference_ok",
      "correct_count": 8,
      "total_count": 10
    },
    "right_eye": {
      "acuity_screening_band": "attention_suggested",
      "correct_count": 5,
      "total_count": 10
    },
    "color_vision": {
      "status": "reference_ok"
    },
    "device_context": {
      "distance_mode": "fixed_cabin_distance",
      "screen_profile_id": "screen_profile_001"
    }
  },
  "display_summary": {
    "title": "視力自我篩檢結果",
    "summary_text": "本次右眼方向辨識表現需留意，建議進一步諮詢眼科或驗光專業人員。",
    "user_facing_level": "需留意"
  }
}
```

### 7.3 Questionnaire Module

Purpose: structured questionnaire rendering, answer capture, scoring,
versioning, skip logic, provenance, and report output.

MVP builds one source-backed questionnaire set from
`mvp-questionnaire-system-architecture.md`, single choice, yes/no/not sure,
Likert scale, simple if-then skip logic, sum scoring or notice rules,
questionnaire version preservation, minimal admin enable / disable / preview /
version function, JSON/CSV export, and report integration.

MVP excludes full drag-and-drop builder, arbitrary rule graph, AI-generated
medical questions, clinician workstation, multi-hospital role model, and large
analytics platform.

The implementable field registry lives in
`mvp-questionnaire-system-architecture.md` and remains the source of truth for
MVP field IDs, options, source instruments, and report behavior.

Acceptance criteria:

| ID | Criterion |
| --- | --- |
| Q-001 | Frontend loads the configured questionnaire version. |
| Q-002 | User can complete single-choice and yes/no/not sure questions. |
| Q-003 | PHQ-2 and activity computed fields are calculated as configured. |
| Q-004 | Basic if-then skip logic works. |
| Q-005 | Old questionnaire versions remain traceable after edits. |
| Q-006 | Report includes questionnaire summary with source-backed wording. |
| Q-007 | Admin can enable, disable, preview, and version a questionnaire. |

Questionnaire definition contract:

```json
{
  "questionnaire_id": "public_health_self_check_mvp",
  "version": "1.0.0",
  "title": "自主健康量測與生活風險自評問卷",
  "locale": "zh-TW",
  "status": "active",
  "intended_use": "self_screening_reference",
  "source_registry": [
    "HPA_AdultPreventive_1140101",
    "WHO_STEPS_v3_2_adapted",
    "PHQ2"
  ],
  "items": []
}
```

Output contract:

```json
{
  "module_id": "questionnaire",
  "structured_result": {
    "questionnaire_id": "public_health_self_check_mvp",
    "questionnaire_version": "1.0.0",
    "completed": true,
    "score_summary": {
      "phq2_total_score": 2,
      "weekly_activity_minutes": 120
    },
    "result_band": "attention_suggested",
    "answers_ref": "storage://questionnaire_responses/run_q_001"
  },
  "display_summary": {
    "title": "問卷填答結果",
    "summary_text": "本次填答提供生活風險與健康促進參考，部分項目建議留意並可洽詢專業人員。",
    "user_facing_level": "需留意"
  }
}
```

### 7.4 Avatar Interaction Module

Purpose: voice and visual interaction layer over reviewed questions. In MVP it
is a controlled questionnaire host, not an open medical chatbot.

Avatar can read approved prompts, listen for short structured answers,
normalize speech to allowed option IDs, ask for repeat when confidence is low,
fall back to touch input, and return normalized answers to the questionnaire
module.

Avatar does not own questionnaire wording, scoring, branching, diagnosis,
medical advice, or report interpretation.

Runtime flow:

```text
QuestionnaireModule emits next_question
-> Avatar receives prompt and allowed answers
-> Avatar speaks prompt
-> user answers by voice
-> ASR converts speech to text
-> AnswerNormalizer maps text to option ID
-> if confidence is enough, return normalized answer
-> if confidence is low, ask user to repeat
-> if repeat fails, use touch fallback
-> QuestionnaireModule stores answer and decides next question
```

Acceptance criteria:

| ID | Criterion |
| --- | --- |
| A-001 | Avatar can present an approved questionnaire prompt. |
| A-002 | Avatar can read the prompt aloud or play approved audio. |
| A-003 | Voice input can map yes/no/not sure or numbered choices to option IDs. |
| A-004 | Low confidence triggers repeat or touch fallback. |
| A-005 | Single-turn interaction target is 1-3 seconds in the demo path. |
| A-006 | Avatar does not answer open-ended medical questions. |
| A-007 | Questionnaire module remains the owner of answer storage and scoring. |

Input contract:

```json
{
  "session_id": "sess_001",
  "questionnaire_run_id": "run_q_001",
  "question_id": "q1",
  "prompt": "最近是否常常忘記剛剛發生的事情？",
  "allowed_answers": [
    {
      "option_id": "yes",
      "label": "是",
      "voice_aliases": ["是", "有", "對", "會"]
    },
    {
      "option_id": "no",
      "label": "否",
      "voice_aliases": ["否", "沒有", "不會", "不是"]
    },
    {
      "option_id": "unknown",
      "label": "不知道",
      "voice_aliases": ["不知道", "不確定", "忘記了"]
    }
  ],
  "avatar_mode": "guided_questionnaire"
}
```

Output contract:

```json
{
  "module_id": "avatar",
  "turn_id": "turn_001",
  "question_id": "q1",
  "asr_text": "有，最近常常會忘記",
  "normalized_answer": {
    "option_id": "yes",
    "confidence": 0.91
  },
  "fallback_used": false,
  "latency_ms": {
    "asr": 800,
    "normalization": 120,
    "tts": 0,
    "total": 1100
  }
}
```

## 8. Site Config And Module Selection

```json
{
  "site_id": "taipei_city_hall_clinic",
  "site_name": "台北市政府員工診所智慧健康倉",
  "enabled_modules": ["vision", "hearing", "questionnaire", "avatar"],
  "default_flow": [
    "consent",
    "vision",
    "hearing",
    "questionnaire",
    "report"
  ],
  "avatar": {
    "enabled": true,
    "attach_to": ["questionnaire"],
    "fallback_to_touch": true
  },
  "report": {
    "template_id": "public_health_mvp",
    "qr_token_ttl_minutes": 60
  },
  "integration": {
    "his_export_enabled": false,
    "json_export_enabled": true
  }
}
```

Example package combinations:

| Scenario | Modules |
| --- | --- |
| City health cabin demo | Vision + Hearing + Questionnaire + Avatar + Report |
| Public-health questionnaire station | Questionnaire + Avatar + Report |
| Vision self-screening station | Vision + Report |
| Hearing self-screening station | Hearing + Report |
| Pre-visit questionnaire station | Questionnaire + Avatar + Report |
| Long-term-care outreach | Questionnaire + Avatar + optional Hearing + Report |

## 9. Report, QR, And Integration

The report service aggregates module results and does not diagnose. User report
includes date/time, site, completed modules, module summaries, professional
consultation suggestions where appropriate, non-diagnostic disclaimer, QR Code,
and expiration.

QR Code stores only a short-lived token:

```json
{
  "report_token": "rpt_xxxxx",
  "session_id": "sess_001",
  "expires_at": "2026-06-23T16:00:00+08:00",
  "access_count": 0,
  "max_access_count": 5
}
```

Do not embed questionnaire answers, health values, phone number, name, or raw
session data inside the QR Code payload.

The integration adapter preserves future JSON/API export shape. MVP does not
perform live HIS writeback.

## 10. API Draft

### 10.1 Session

```http
POST /api/sessions
```

```json
{
  "site_id": "taipei_city_hall_clinic",
  "device_id": "cabin_001",
  "locale": "zh-TW"
}
```

Response:

```json
{
  "session_id": "sess_001",
  "enabled_modules": ["vision", "hearing", "questionnaire", "avatar"],
  "status": "active"
}
```

### 10.2 Module Run

```http
POST /api/sessions/{session_id}/module-runs
```

```json
{
  "module_id": "vision",
  "module_version": "0.1.0",
  "config_id": "vision_basic_default"
}
```

Response:

```json
{
  "module_run_id": "run_vision_001",
  "status": "initialized"
}
```

### 10.3 Module Events

```http
POST /api/module-runs/{module_run_id}/events
```

```json
{
  "event_type": "user_answer",
  "payload": {
    "question_id": "vision_q1",
    "answer": "up"
  }
}
```

### 10.4 Complete Module

```http
POST /api/module-runs/{module_run_id}/complete
```

Response:

```json
{
  "module_result": {
    "module_id": "vision",
    "result_level": "attention_suggested"
  }
}
```

### 10.5 Report

```http
POST /api/sessions/{session_id}/report
```

Response:

```json
{
  "report_id": "report_001",
  "report_token": "rpt_xxxxx",
  "qr_code_url": "https://example.com/reports/rpt_xxxxx"
}
```

### 10.6 Questionnaire Admin

```http
GET  /api/admin/questionnaires
POST /api/admin/questionnaires
GET  /api/admin/questionnaires/{id}
POST /api/admin/questionnaires/{id}/versions
POST /api/admin/questionnaires/{id}/activate
POST /api/admin/questionnaires/{id}/deactivate
```

## 11. Data Model / ERD Seed

Minimum tables:

```text
sites
devices
device_profiles
sessions
consents
module_catalog
module_runs
module_events
module_results
questionnaires
questionnaire_versions
questionnaire_items
questionnaire_options
questionnaire_responses
avatar_turns
reports
report_tokens
integration_outbox
audit_logs
admin_users
```

Key design rules:

- preserve questionnaire versions;
- store module results independently;
- store structured results as versioned JSON where module schema can evolve;
- keep an `integration_outbox` for later JSON/API/FHIR/HIS mapping;
- do not make live HIS integration part of MVP.

## 12. Security, Privacy, And Governance

MVP defaults:

- anonymous session;
- optional contact only with explicit consent and retention rule;
- short-lived QR token;
- no raw voice retention by default;
- no full name, national ID, birthday, or full address by default;
- audit admin changes and report access;
- separate demo/test data from real field data.

Third-party Avatar vendor review must confirm whether audio leaves the device,
whether questionnaire text leaves the device, whether raw audio or transcript
is retained, whether data is used for training, deletion and retention
controls, commercial license, and data-processing terms.

## 13. Optional Product Packaging

The architecture supports module-level selection and quoting.

| SKU | Name | Scope |
| --- | --- | --- |
| `HC-VISION-BASIC` | 視力自我篩檢模組 | 基礎視力與色覺自我篩檢. |
| `HC-HEARING-BASIC` | 聽力自我篩檢模組 | 左右耳基礎聲音辨識. |
| `HC-QUESTIONNAIRE-BASIC` | 結構化問卷模組 | 固定問卷、分數、報告. |
| `HC-AVATAR-GUIDE` | Avatar 語音互動模組 | 語音問答、朗讀、回答辨識. |
| `HC-REPORT-LAYER` | 報告與 QR Code 整合層 | Required platform layer, not a user-facing module. |
| `HC-INTEGRATION-ADAPTER` | HIS/API 預留模組 | Future or phase-2 integration adapter. |

Package examples:

| Package | Modules |
| --- | --- |
| `Basic Health Cabin` | Vision + Hearing + Report |
| `Public Health Survey Station` | Questionnaire + Avatar + Report |
| `City Hall Demo Package` | Vision + Hearing + Questionnaire + Avatar + Report |
| `Clinic Pre-Visit Package` | Questionnaire + Avatar + Integration Adapter |
| `Long-Term Care Outreach Package` | Questionnaire + Avatar + Hearing |

## 14. MVP Timeline

| Window | Gate | Deliverables |
| --- | --- | --- |
| 2026-06-24 to 2026-06-30 | Scope Lock | Four-module scope table, non-scope list, RACI, module API contract v0.1, questionnaire candidate list, Avatar path, hardware table, risk matrix. |
| 2026-07-01 to 2026-07-15 | Platform Skeleton | Kiosk Shell, Session API, Module Registry, StandardModuleResult schema, report service, QR token, minimal admin, mock module. |
| 2026-07-16 to 2026-07-31 | Four Module Prototype | Operable vision, hearing, one questionnaire, Avatar prompt/answer demo, report integration, deployment draft. |
| 2026-08-01 to 2026-08-15 | Integration And UI Hardening | Four-module flow, report template, mobile report page, questionnaire admin, error handling, fallback flow, demo mode, UAT draft. |
| 2026-08-16 to 2026-08-31 | Field Test | Cabin device test, speaker/mic test, noise test, older-adult operation test, Avatar latency test, QR report test, privacy check. |
| 2026-09-01 to 2026-09-10 | Freeze And Acceptance | Release candidate, bug fix only, acceptance report, API docs, ERD, deployment guide, operator manual, risk/limitation statement, source package plan. |

## 15. SDD Outline

```text
1. Introduction
2. Scope and Non-Scope
3. Stakeholders and RACI
4. System Context
5. Architecture Overview
6. Module Architecture
   6.1 Hearing Module
   6.2 Vision Module
   6.3 Questionnaire Module
   6.4 Avatar Interaction Module
7. Platform Services
8. Data Model / ERD
9. API Design
10. UI/UX Flow
11. Security and Privacy
12. Deployment Architecture
13. Observability and Logging
14. Error Handling
15. Test Plan
16. Acceptance Criteria
17. Risk and Compliance Notes
18. Future Extensions
19. Architecture Decision Records
```

## 16. Requirement Traceability Seed

| Requirement | Module | API | Test Case | Owner |
| --- | --- | --- | --- | --- |
| User completes vision self-screening | Vision | `/module-runs` | TC-VISION-001 | NYCU |
| User completes hearing self-screening | Hearing | `/module-runs` | TC-HEARING-001 | NYCU + imedtac |
| Admin enables questionnaire | Questionnaire | `/admin/questionnaires` | TC-Q-001 | NYCU |
| Avatar reads questionnaire prompt | Avatar | `/avatar/turns` | TC-A-001 | NYCU + vendor |
| Report generates QR Code | Report Layer | `/reports` | TC-R-001 | NYCU |
| JSON export is preserved for later integration | Integration Adapter | `/exports` | TC-I-001 | NYCU + hospital IT |

## 17. Risk Matrix

| Risk | Severity | Reason | Control |
| --- | --- | --- | --- |
| Scope expansion | High | Four modules can attract HIS, triage, analytics, and long-term account asks. | Scope lock and phase split. |
| Hearing accuracy overclaim | High | Fixed speakers and ambient noise limit claims. | Self-screening language and device-profile evidence. |
| Vision accuracy overclaim | High | Screen geometry and distance affect result. | Fixed-distance profile and conservative report wording. |
| Avatar latency | High | ASR/TTS/avatar rendering can exceed demo tolerance. | Fixed prompts, pre-generated audio where useful, touch fallback. |
| Open medical chatbot risk | High | Uncontrolled medical advice creates validation and safety issues. | Avatar only handles reviewed question prompts. |
| HIS ambiguity | Medium-high | Hospital interface and fields are not locked. | Integration outbox only; no live writeback in MVP. |
| QR privacy exposure | High | Token misuse can expose sensitive summary. | Short-lived token, access count, no embedded health data. |
| Questionnaire version drift | Medium | Later reports need source traceability. | Mandatory version preservation. |
| Third-party Avatar privacy | Medium-high | Audio/transcript may leave device. | Vendor review, consent, minimization, no raw retention by default. |

## 18. Locked Scope Decisions

1. Four user-facing modules are hearing, vision, questionnaire, and Avatar.
2. Report, QR Code, Session, API, CMS, storage, audit, and integration adapters
   are platform layers.
3. MVP uses modular monolith architecture, not true microservices.
4. Every module outputs `StandardModuleResult`.
5. Avatar is controlled questionnaire interaction, not open medical chat.
6. Questionnaire MVP starts from source-backed fixed fields and limited CMS.
7. Vision MVP starts with direction recognition and color support.
8. Hearing MVP starts with left/right sound recognition and simple self-screen.
9. Result wording uses "需留意" and "建議諮詢專業人員"; it does not diagnose.
10. HIS remains future JSON/API mapping; no September live writeback.
11. QR Code stores a short-lived token only.
12. SDD expands from module contracts, API, ERD, test cases, and risk matrix.
