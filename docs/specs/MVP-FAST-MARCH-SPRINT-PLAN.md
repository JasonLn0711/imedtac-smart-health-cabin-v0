---
id: smart-health-cabin-mvp-fast-march-sprint-plan
title: "Smart Health Cabin MVP Fast-March Sprint Plan"
date: 2026-06-24
topic: smart-health-cabin
type: implementation-schedule-reference
status: reference
source:
  - ./MVP-SYSTEM-SPEC.md
  - ../../workstreams/smart-health-cabin/2026-06-24-mvp-monorepo-redpanda-architecture-note.md
  - ../../workstreams/smart-health-cabin/2026-06-24-open-source-module-research-plan.md
  - ../../workstreams/smart-health-cabin/post-meeting-decision-log.md
  - https://www.dgpa.gov.tw/information?pid=12573&uid=41
---

# Smart Health Cabin MVP Fast-March Sprint Plan

## Record Purpose

This note records the fast-march version of Sprint 0 through Sprint 4 for the
Smart Health Cabin MVP. It is a reference delivery plan, not an external
commitment to 慧誠智醫（imedtac Co., Ltd.）. It converts the broader MVP spec
into a `10` working-day thin-slice path.

The plan is useful only if the team accepts one design control:

```text
Sprint 0-4 delivers a thin-slice MVP, not the complete product.
```

The target path is:

```text
session -> enabled modules -> questionnaire -> vision -> hearing -> Avatar guide
-> report -> QR Code -> PostgreSQL save -> outbox -> Redpanda event
```

## Calendar Basis

Start date:

```text
2026-06-24
```

Workday source control:

- Official reference: 行政院人事行政總處 `115年政府行政機關辦公日曆表`.
- Verified on `2026-06-24` from:
  `https://www.dgpa.gov.tw/information?pid=12573&uid=41`.
- The planning window excludes the weekends `2026-06-27` to `2026-06-28`
  and `2026-07-04` to `2026-07-05`.
- The DGPA page lists `2026-06-26` as `原住民族抵抗日`, but the holiday
  rule does not include that memorial day in the one-day holiday list. This
  schedule therefore treats `2026-06-26` as a working day.

## Sprint Calendar

| Sprint | Dates | Working days | ISO week | Capability |
| --- | --- | ---: | --- | --- |
| Sprint 0 | `2026-06-24` Wed to `2026-06-25` Thu | 2 | W26 | system skeleton and monorepo |
| Sprint 1 | `2026-06-26` Fri + `2026-06-29` Mon | 2 | W26/W27 | session, module SDK, report skeleton |
| Sprint 2 | `2026-06-30` Tue to `2026-07-01` Wed | 2 | W27 | vision and hearing thin slice |
| Sprint 3 | `2026-07-02` Thu to `2026-07-03` Fri | 2 | W27 | questionnaire CMS and kiosk answering |
| Sprint 4 | `2026-07-06` Mon to `2026-07-07` Tue | 2 | W28 | Avatar guide and Redpanda event layer |

## Fast-March Rules

1. Use one monorepo.
2. Do not split into microservices during Sprint 0-4.
3. Every module delivers only the smallest demonstrable capability.
4. PostgreSQL is the source of truth.
5. Redpanda receives outbox events and stays outside the kiosk critical path.
6. Every module emits the same `report_section` shape.
7. Public output stays in screening-support and staff-review language.
8. UI prioritizes large text, large controls, clear flow, and retry/skip paths.
9. Every sprint ends with a runnable demo path, screenshots or recording, API
   docs update, and known issues.
10. Features that threaten the end-to-end path move to Sprint 5+.

## Sprint 0: System Skeleton And Monorepo

Dates:

```text
2026-06-24 Wed to 2026-06-25 Thu
```

Objective:

```text
Create a repo that can boot apps, migrate PostgreSQL, and run frontend/backend
skeletons.
```

Deliverables:

```text
1. monorepo
2. pnpm workspace / Turborepo
3. apps/kiosk-web
4. apps/admin-web
5. apps/api-server
6. apps/outbox-worker
7. packages/contracts
8. packages/ui
9. packages/module-sdk
10. PostgreSQL docker-compose
11. Redpanda docker-compose skeleton
12. DB migration skeleton
13. GitHub Actions lint / typecheck / test / build
14. README local-dev startup path
```

Day 1 AM:

```text
Create repo skeleton:
apps/kiosk-web
apps/admin-web
apps/api-server
apps/outbox-worker
modules/questionnaire
modules/vision
modules/hearing
modules/avatar
packages/contracts
packages/ui
packages/module-sdk
packages/report-core
packages/auth-core
infra/docker
infra/migrations
infra/redpanda
docs
```

Day 1 PM:

```text
Docker Compose boots:
postgres
redpanda
redpanda-console
api-server
kiosk-web
admin-web
outbox-worker
```

Minimum DB tables:

```text
tenants
users
tenant_memberships
kiosks
kiosk_devices
sessions
module_runs
report_sections
outbox_events
audit_events
```

Day 2 AM:

```http
GET /healthz
GET /api/v1/version
POST /api/v1/kiosk/sessions
GET /api/v1/kiosk/sessions/{session_id}
```

Day 2 PM:

```text
GitHub Actions:
install
lint
typecheck
unit test
build
```

Acceptance:

```text
1. A new developer can run the repo with one documented command.
2. kiosk-web opens.
3. admin-web opens.
4. api-server /healthz returns OK.
5. PostgreSQL migration runs.
6. Redpanda Console opens.
7. CI runs.
```

Scope control:

```text
No feature detail in Sprint 0. Only skeleton and boot path.
```

## Sprint 1: Session, Module SDK, Report Skeleton

Dates:

```text
2026-06-26 Fri + 2026-06-29 Mon
```

Objective:

```text
Let any enabled module start, finish, and produce a report section.
```

Deliverables:

```text
1. module registry
2. module manifest
3. module_run lifecycle
4. module-sdk
5. public report assembler
6. QR Code token skeleton
7. outbox_events table writes
8. demo session flow
```

Day 1 AM:

```text
Create module.manifest.json for:
questionnaire
vision
hearing
avatar
```

Manifest baseline:

```json
{
  "module_id": "vision",
  "module_version": "0.1.0",
  "display_name": "視力自我檢測",
  "enabled_by_default": true,
  "can_run_standalone": true,
  "required_devices": ["screen", "touchscreen"],
  "optional_devices": ["webcam"],
  "output_contract": "vision_result.v1"
}
```

Day 1 PM:

```http
GET /api/v1/kiosk/module-config
POST /api/v1/sessions/{session_id}/module-runs
POST /api/v1/module-runs/{module_run_id}/complete
POST /api/v1/module-runs/{module_run_id}/fail
```

Module states:

```text
pending
running
completed
failed
skipped
```

Day 2 AM:

All modules produce the same report-section shape:

```json
{
  "section_id": "section_001",
  "module_id": "vision",
  "title": "視覺檢測",
  "public_status_code": "NORMAL_REFERENCE",
  "public_message": "本次自我檢測結果落在正常參考範圍。",
  "internal_json": {},
  "public_visible": true
}
```

Day 2 PM:

```text
report_access_tokens:
token_hash
session_id
expires_at
```

Public report route:

```text
/reports/public/{token}
```

Acceptance:

```text
1. kiosk-web can create a session.
2. System returns enabled modules.
3. module_run can be created.
4. module_run can complete or fail.
5. report_section can be generated.
6. public report is visible.
7. QR Code opens the public report.
8. outbox_events writes events; publish can wait until Sprint 4.
```

## Sprint 2: Vision And Hearing Thin Slice

Dates:

```text
2026-06-30 Tue to 2026-07-01 Wed
```

Objective:

```text
Vision and hearing each complete one self-check and write result plus report.
```

Vision deliverables:

```text
1. Landolt C / Tumbling E display
2. up / down / left / right controls
3. three visual levels
4. simple accuracy calculation
5. public status mapping
6. vision_result.v1
```

Hearing deliverables:

```text
1. Web Audio tone generator
2. left/right speaker channel test
3. 500 / 1000 / 2000 / 4000 Hz
4. low / medium / high volume levels
5. heard / not heard controls
6. one catch trial
7. hearing_result.v1
```

Day 1 AM:

```text
Vision levels:
Level A: large optotype
Level B: medium optotype
Level C: small optotype

Public mapping:
Level A pass -> ATTENTION
Level B pass -> NORMAL_REFERENCE
Level C pass -> GOOD
unstable test -> RETEST
```

Vision result baseline:

```json
{
  "schema_version": "vision_result.v1",
  "module_run_id": "vision_run_001",
  "test_mode": "mvp_landolt_c",
  "levels": [
    {
      "level": "A",
      "trials": 3,
      "correct": 3
    }
  ],
  "internal_metrics": {
    "estimated_decimal_acuity": 0.8,
    "estimated_logmar": 0.1,
    "confidence": "medium"
  },
  "public_summary": {
    "status_code": "NORMAL_REFERENCE",
    "title": "視覺檢測結果落在正常參考範圍",
    "message": "本結果為自我檢測參考，若有不適請洽醫護人員。"
  }
}
```

Day 1 PM:

```text
Web Audio:
frequency: 500, 1000, 2000, 4000 Hz
duration: 800 ms
fade in/out: 50 ms
side: left / right
volume level: low / medium / high
```

Hearing result baseline:

```json
{
  "schema_version": "hearing_result.v1",
  "module_run_id": "hearing_run_001",
  "test_mode": "speaker_based_self_check_mvp",
  "stimulus_results": [
    {
      "side": "left_speaker",
      "frequency_hz": 1000,
      "volume_level": "medium",
      "heard": true,
      "reaction_time_ms": 820
    }
  ],
  "quality_flags": [
    "speaker_based_not_clinical_audiometry"
  ],
  "public_summary": {
    "status_code": "NORMAL_REFERENCE",
    "title": "聽覺反應落在正常參考範圍",
    "message": "本次為固定喇叭條件下的自我檢測參考。"
  }
}
```

Day 2 AM:

```http
POST /api/v1/module-runs/{module_run_id}/vision-result
POST /api/v1/module-runs/{module_run_id}/hearing-result
```

Each endpoint:

```text
1. saves result
2. creates report_section
3. creates outbox_event
```

Day 2 PM:

```text
session
-> vision module_run
-> vision_result
-> vision report_section
-> hearing module_run
-> hearing_result
-> hearing report_section
-> public report with two sections
```

Acceptance:

```text
1. Vision test completes.
2. Hearing test completes.
3. Each result has JSON.
4. Each result has a public report section.
5. Any module can skip/fail without crashing the session.
6. Public report avoids diagnostic wording.
7. outbox_events has vision/hearing result-created events.
```

## Sprint 3: Questionnaire CMS And Kiosk Answering

Dates:

```text
2026-07-02 Thu to 2026-07-03 Fri
```

Objective:

```text
Create the smallest usable questionnaire admin and kiosk answer flow.
```

Deliverables:

```text
1. questionnaire tables
2. admin-web question list
3. question create / edit / disable
4. question ordering
5. simple if/then branching
6. publish questionnaire version
7. kiosk-web answering
8. questionnaire_result.v1
9. report_section
```

Day 1 AM:

Fast path:

```text
Use questionnaire_versions.schema_json first if table-per-question CRUD is too
slow for this sprint.
```

Schema baseline:

```json
{
  "questionnaire_id": "basic_triage",
  "version": "0.1.0",
  "questions": [
    {
      "id": "q1",
      "type": "single_choice",
      "title": "今天是否有身體不適？",
      "options": [
        { "value": "yes", "label": "有" },
        { "value": "no", "label": "沒有" }
      ],
      "rules": [
        {
          "if": { "equals": "yes" },
          "then": { "go_to": "q2" }
        }
      ]
    }
  ]
}
```

Day 1 PM:

Admin thin slice:

```text
questionnaire list
question list
create question
edit question
move up / move down
disable question
publish version
```

Do not build:

```text
drag-and-drop sorting
complex rule builder
multi-person review workflow
question-bank import/export
```

Day 2 AM:

Kiosk answering:

```text
large font
large buttons
one question per screen
previous / next
progress bar
simple rule-based next-question selection
```

Day 2 PM:

`questionnaire_result.v1` baseline:

```json
{
  "schema_version": "questionnaire_result.v1",
  "questionnaire_id": "basic_triage",
  "questionnaire_version": "0.1.0",
  "answers": [
    {
      "question_id": "q1",
      "answer": "yes"
    }
  ],
  "branching_path": ["q1", "q2", "q_end"],
  "public_summary": {
    "status_code": "NORMAL_REFERENCE",
    "title": "問卷已完成",
    "message": "系統已完成健康問卷整理，請依現場流程進行後續服務。"
  }
}
```

Acceptance:

```text
1. Admin can create one questionnaire version.
2. Admin can create at least five questions.
3. Single-choice questions work.
4. Simple if/then branching works.
5. Questionnaire can be published.
6. Kiosk can complete answering.
7. Result writes to DB.
8. Result creates report_section.
9. Public report shows questionnaire summary.
```

## Sprint 4: Avatar Guide And Redpanda Event Layer

Dates:

```text
2026-07-06 Mon to 2026-07-07 Tue
```

Objective:

```text
Avatar guides the kiosk flow and Redpanda receives events without becoming a
critical-path dependency.
```

Deliverables:

```text
1. Avatar opening guidance
2. Avatar module-transition prompts
3. Avatar fallback message
4. avatar_events table
5. outbox-worker
6. Redpanda topics
7. Redpanda producer
8. Schema Registry skeleton
9. Redpanda Console event visibility
```

Day 1 AM:

Avatar is deterministic, not an AI clinical agent.

```text
Opening:
您好，歡迎使用智慧健康倉，本系統將引導您完成簡易健康自我檢測。

Questionnaire:
接下來請回答幾個簡短問題，請依照實際狀況選擇。

Vision:
接下來會進行視覺自我檢測，請依畫面指示選擇缺口方向。

Hearing:
接下來會播放不同方向的提示音，聽到聲音請按下有聽到。

Report:
檢測已完成，請查看螢幕上的綜合結果。您也可以掃描 QR Code 帶走報告。
```

Day 1 PM:

Kiosk flow:

```text
Avatar intro
-> questionnaire
-> Avatar transition
-> vision
-> Avatar transition
-> hearing
-> Avatar report intro
-> report
```

Day 2 AM:

Redpanda topics:

```text
shc.module.events.v1
shc.questionnaire.results.v1
shc.vision.results.v1
shc.hearing.results.v1
shc.avatar.events.v1
shc.report.events.v1
shc.audit.events.v1
```

Outbox worker:

```text
poll unpublished outbox_events
publish to Redpanda
update published_at / topic / partition / offset
retry failures with backoff
```

Day 2 PM:

E2E demo path:

```text
1. open kiosk-web
2. create session
3. Avatar opening
4. complete questionnaire
5. complete vision
6. complete hearing
7. show report
8. scan QR Code
9. admin-web sees session
10. PostgreSQL contains results
11. outbox_events are published
12. Redpanda Console shows events
```

Acceptance:

```text
1. Avatar guides the flow.
2. Avatar event writes to DB.
3. outbox-worker publishes to Redpanda.
4. Redpanda Console shows events.
5. Kiosk can finish if Redpanda is down.
6. Outbox can backfill when Redpanda returns.
7. Public report shows questionnaire, vision, and hearing sections.
```

## Ten-Workday Delivery Map

| Date | Sprint | Daily finish line |
| --- | --- | --- |
| `2026-06-24` Wed | Sprint 0 D1 | monorepo, apps, packages, Docker skeleton |
| `2026-06-25` Thu | Sprint 0 D2 | DB migration, API skeleton, CI |
| `2026-06-26` Fri | Sprint 1 D1 | module registry, module_run lifecycle |
| `2026-06-29` Mon | Sprint 1 D2 | report section, QR token, outbox table |
| `2026-06-30` Tue | Sprint 2 D1 | vision UI, hearing tone generator |
| `2026-07-01` Wed | Sprint 2 D2 | vision/hearing result API and report integration |
| `2026-07-02` Thu | Sprint 3 D1 | questionnaire data model and CMS thin slice |
| `2026-07-03` Fri | Sprint 3 D2 | kiosk answering, questionnaire_result, report |
| `2026-07-06` Mon | Sprint 4 D1 | deterministic Avatar guide |
| `2026-07-07` Tue | Sprint 4 D2 | Redpanda outbox-worker and E2E demo |

## Deferred To Sprint 5+

```text
1. full visual field test
2. full color-vision test
3. full astigmatism test
4. formal dB HL hearing calibration
5. complete speaker-calibration UI
6. complex questionnaire rule editor
7. questionnaire review workflow
8. real AI Avatar conversation
9. HIS adapter
10. Kubernetes
11. formal tenant billing/provisioning
12. detailed dashboard
13. full FHIR mapping
```

## Team Assumption

Minimum realistic fast-march team:

```text
Tech Lead / Backend: 1
Frontend / Kiosk UI: 1
Frontend / Admin UI: 1
QA / PM / Spec owner: 1
UI/UX: 0.5
```

If only one engineer is available, this schedule can produce a demo skeleton,
not a reliable four-module integrated MVP.

## Daily Operating Rhythm

Morning `30` minutes:

```text
1. what finished yesterday
2. today's three commitments
3. blockers to cut or defer
```

Evening `30` minutes:

```text
1. run E2E demo
2. capture screenshot or video
3. update docs/devlog/YYYY-MM-DD.md
4. prepare tomorrow's work
```

Every sprint closeout:

```text
1. demo video or screenshot set
2. merged PR
3. runnable migration
4. API docs update
5. known issues list
```

## Final Recommendation

The fast-march target is not to finish every requested feature faster. The
target is to make the system spine real:

```text
By 2026-07-07, a reviewer can run:
Avatar guide -> questionnaire -> vision -> hearing -> report -> QR Code
-> PostgreSQL -> Redpanda.
```

After this path works, visual precision, hearing calibration, questionnaire
content, Avatar intelligence, HIS readiness, and validation can become
controlled iterations instead of integration risk.
