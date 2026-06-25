---
id: smart-health-cabin-mvp-system-spec
title: "Smart Health Cabin MVP System Spec"
date: 2026-06-24
topic: smart-health-cabin
type: system-spec
status: reference
source:
  - ../../workstreams/smart-health-cabin/2026-06-24-mvp-monorepo-redpanda-architecture-note.md
  - ../../workstreams/smart-health-cabin/README.md
  - ../../workstreams/smart-health-cabin/reuse-from-ai-triage.md
  - ../../research-packets/2026-06-24-smart-health-cabin-module-research/module-event-layer/README.md
  - ../../../imedtac-ai-triage-kiosk-v0/docs/architecture-insertion-and-clinical-grounding.md
---

# Smart Health Cabin MVP System Spec

## Record Purpose

This spec preserves today's full-system MVP thinking for the Smart Health Cabin
lane. It records Jason's question, the engineering answer, and a practical
reference architecture for the first MVP.

This is a reference spec, not an external commitment to 慧誠智醫（imedtac
Co., Ltd.）. Names, folder paths, technologies, deadlines, and API shapes can
change after scope, ownership, budget, device facts, and delivery path are
confirmed.

## Original Question

Jason's question:

> 我第一次參與大型軟體開發，請問依照軟體工程、系統工程以及資深軟體工程師的角度，你認為四個模組加上 Redpanda 等，都要寫在不同的獨立的 repo 當中嗎？還是寫進同一個 repo 就好呢？以 mvp 版本來說，怎麼樣迭代以及快速部署，在這個階段會最方便呢？並且，請參考你剛剛給我的對話，給我 mvp 版本的全系統的 spec，並且在 spec 的地方，要考慮將來軟體更新、迭代與擴充的方便性。

## Recommendation

MVP 版本請用單一 monorepo，不要把四個模組拆成四個獨立 repo。

2026-06-25 update: Phase 1 delivery no longer tries to build all four modules
at once. The current MVP spine is:

```text
open questionnaire platform + ASR/LLM/TTS Avatar Agent
```

Vision and hearing stay in the module registry as Phase 2 planned modules.
This preserves the architecture without spending the first implementation cycle
on hardware calibration and measurement wording risk.

但 repo 內部要把程式碼邊界切清楚：四個模組可以在同一個 repo 內獨立
開發、獨立測試、獨立啟用、獨立升級。現在需要的是 modular monolith /
modular monorepo，不是 microservices，也不是多 repo。

第一原理：

```text
repo 是協作與版本管理邊界
module 是系統能力邊界
deployment 是營運邊界
```

這三件事不要混在一起。

需求文件要求的不只是四個功能，而是前台視聽力量測、問卷、Avatar、
CMS 後台、QR Code 報告、JSON API、資料庫 ERD、未來 HIS 對接、部署
說明等一整套交付物。這些東西高度共享 session、權限、報告、API
schema、資料格式，所以 MVP 拆多 repo 只會增加同步成本。

## 1. Repo Strategy

Recommended shape:

```text
smart-health-cabin/
  apps/
    kiosk-web/
    admin-web/
    api-server/
    outbox-worker/

  modules/
    questionnaire/
    vision/
    hearing/
    avatar/

  packages/
    contracts/
    ui/
    module-sdk/
    report-core/
    auth-core/
    config-core/

  infra/
    docker/
    postgres/
    redpanda/
    migrations/

  docs/
    specs/
    api/
    deployment/
```

This is not "everything mixed together." It is clear modularity inside one
repo.

Do not start with multiple repos because the first delivery would pay these
costs too early:

| Issue | Multi-repo cost |
| --- | --- |
| API schema change | One result schema change can require synchronized changes across API, report, admin, and frontend repos. |
| DB migration | Several repos may try to own related tables and migrations. |
| CI/CD | One feature can require multiple PRs and multiple pipelines. |
| Version dependency | Kiosk and admin apps must track exactly which backend version supports which result schema. |
| Debugging | A failed session requires tracing across several repos, services, logs, and releases. |
| First large-project load | Release coordination can overwhelm the first MVP team. |

Split repos later only when one or more of these become real:

- a module has its own team;
- a module is sold independently;
- a module has a separate regulatory, security, or licensing boundary;
- a module needs a separate runtime, such as GPU Avatar service;
- release cadence diverges materially;
- monorepo tooling no longer keeps CI/CD workable.

## 2. Tooling Default

If starting from zero, the reference stack is TypeScript-first:

```text
Frontend: React / Next.js or Vite React
Backend: NestJS or Fastify
DB ORM: Prisma or Drizzle
Validation: Zod + JSON Schema
DB: PostgreSQL
Event: Redpanda
Local Dev: Docker Compose
CI/CD: GitHub Actions
Monorepo: pnpm workspace + Turborepo
```

Reason: vision, hearing, questionnaire, Avatar guidance, kiosk UI, admin UI,
and API clients are web-heavy. TypeScript-first keeps shared contracts close to
both frontend and backend.

If the active delivery team is stronger in FastAPI, a second valid path is:

```text
Frontend: React / Next.js
Backend: FastAPI
Contracts: OpenAPI + generated TypeScript client
DB: PostgreSQL
Event: Redpanda
```

MVP default: choose the stack that preserves shared contracts, device testing,
and fast deployment with the least ceremony.

## 3. System Architecture

System layers:

```text
[ Kiosk Web 前台 ]
  - 視力模組
  - 聽力模組
  - 問卷模組
  - Avatar 導引模組
  - 結果頁 / QR Code

        ↓ REST API / WebSocket

[ API Server ]
  - Session Orchestrator
  - Module Registry
  - Result Normalizer
  - Report Assembler
  - Auth / RBAC
  - Audit Log
  - Outbox Writer

        ↓ transaction

[ PostgreSQL ]
  - tenant / user / kiosk / role
  - session / module_run
  - vision_result / hearing_result / questionnaire_result
  - report_section
  - outbox_event
  - audit_event

        ↓ outbox worker

[ Redpanda ]
  - module events
  - result events
  - report events
  - audit events
  - device telemetry

        ↓ future

[ HIS Adapter / Analytics / Dashboard ]
```

Core principle:

```text
PostgreSQL is the source of truth.
Redpanda is the event delivery and future expansion layer.
```

Do not let the frontend publish directly to Redpanda. Do not let modules call
each other directly. Modules write through the API server and shared module SDK.

## 4. Product Scope

System name:

```text
Smart Health Cabin MVP
```

Current Phase 1 name:

```text
Smart Health Cabin MVP v0.1: Questionnaire + Avatar Agent
```

Core purpose:

```text
讓民眾在智慧健康倉內，先完成可配置健康問卷與 Avatar 語音導引流程，
並產生結構化健康參考報告。系統保留未來視力、聽力與 HIS JSON API
串接能力，但 Phase 1 MVP 不直接實作正式視聽力量測或正式 HIS 寫入。
```

Sprint 5.6 voice entry update:

```text
wake word detected -> visible recording state -> VAD / endpointing auto-stop
-> ASR -> candidate answer mapping -> user confirmation -> questionnaire write
```

Wake word is a local activation gate only. It does not diagnose, transcribe,
start free conversation, or write questionnaire answers. Tap-to-start and touch
questionnaire remain complete fallback paths.

Scope controls:

```text
不作疾病診斷。
不作醫療分級。
不產生處方。
不替代醫師、護理師、驗光師、聽力師。
不把聽力喇叭測試宣稱為正式純音聽力檢查。
```

Public report wording should stay in low-risk support language:

```text
良好
正常參考
需注意
請洽醫護人員
環境不適合，請重測
```

Internal report data can preserve more detail:

```text
視力：decimal acuity、logMAR、Snellen equivalent、contrast result、
color check、astigmatism check、visual field flags

聽力：frequency response、estimated level、ambient noise、
speaker calibration profile、confidence、quality flags

問卷：questionnaire version、answers、branching path、triage category、
education message

Avatar：interaction trace、prompt version、guided module sequence、
fallback reason
```

## 5. Module Registry

Every module should have a manifest:

```json
{
  "module_id": "vision",
  "module_version": "0.1.0",
  "display_name": "視力自我檢測",
  "enabled_by_default": false,
  "can_run_standalone": true,
  "required_devices": ["touchscreen", "screen"],
  "optional_devices": ["webcam"],
  "input_contract": "vision_input.v1",
  "output_contract": "vision_result.v1",
  "public_report_section": "vision_public_summary.v1",
  "internal_report_section": "vision_internal_detail.v1"
}
```

Tenant configuration:

```json
{
  "tenant_id": "taipei-demo",
  "enabled_modules": [
    "questionnaire",
    "vision",
    "hearing",
    "avatar"
  ],
  "module_order": [
    "avatar_intro",
    "questionnaire",
    "vision",
    "hearing",
    "report"
  ],
  "public_report_mode": "low_risk_summary"
}
```

## 6. Module Specs

### 6.1 Questionnaire

MVP functions:

```text
1. 題目 CMS 新增、修改、排序、停用
2. 單選、多選、文字、數字、日期
3. if/then 跳題
4. 問卷版本管理
5. 發布版本與草稿版本分離
6. 前台大字體、大按鈕、長者友善
7. 問卷完成後產生 questionnaire_result.v1
```

MVP should use controlled questionnaires first. Avatar guides the flow; it does
not become an open-ended AI medical interviewer in the first release.

### 6.2 Vision

MVP functions:

```text
1. 距離與螢幕校準 profile
2. Landolt C / Tumbling E 四方向辨識
3. 對比視力簡化測試
4. 色覺簡化檢查
5. 散光自我感知檢查
6. 粗略視野檢查
7. 即時計算 internal metrics
8. 轉換為 public status
```

MVP cut:

```text
必要：視力、對比視力、結果分級、報告輸出
可選：色覺、散光、視野
先不要：正式 ETDRS、完整眼科視野檢查、眼動追蹤診斷
```

### 6.3 Hearing

MVP functions:

```text
1. 固定左右喇叭設定
2. speaker calibration profile
3. ambient noise check
4. 左側／右側喇叭純音反應測試
5. 500 / 1000 / 2000 / 4000 Hz
6. 25 / 35 / 45 / 55 dB SPL equivalent 階層
7. catch trial 防誤按
8. false positive / reaction time quality flag
9. public status 分級
```

MVP cut:

```text
必要：環境噪音、左右側喇叭純音反應、品質旗標、報告輸出
可選：語音噪音辨識
先不要：正式 audiogram、正式左右耳聽閾診斷、助聽器建議
```

### 6.4 Avatar

MVP functions:

```text
1. 開場說明
2. 引導使用者進入問卷、視力、聽力
3. 播放語音提示
4. 顯示文字提示
5. 錯誤時給出重試指引
6. 不做醫療判斷
7. 不直接修改醫療結果
```

Avatar is a UX layer, not a decision layer.

Safe wording:

```text
可以說：「請看螢幕上的圖示，選擇缺口方向。」
不可說：「你可能有某某疾病。」
可以說：「系統建議您洽詢現場醫護人員。」
不可說：「你有聽力損失。」
```

## 7. PostgreSQL Spec

PostgreSQL owns:

```text
1. 權限管理
2. 租戶隔離
3. session 狀態
4. module result
5. report section
6. audit log
7. outbox events
8. calibration profile
```

Core tables:

```text
tenants
users
tenant_memberships
kiosks
kiosk_devices
module_configs
sessions
module_runs
vision_results
hearing_results
questionnaire_results
avatar_interactions
report_sections
report_access_tokens
screen_calibration_profiles
speaker_calibration_profiles
outbox_events
audit_events
```

Roles:

```text
system_admin
tenant_admin
staff_operator
clinical_reviewer
auditor
kiosk_device
public_report_viewer
```

Permission principles:

| Role | Permission |
| --- | --- |
| `system_admin` | Manage system settings, not default citizen-result access. |
| `tenant_admin` | Manage own tenant kiosks, modules, and users. |
| `staff_operator` | Assist onsite, view public summary, trigger retest. |
| `clinical_reviewer` | View internal metrics and quality flags. |
| `auditor` | View audit log without modifying records. |
| `kiosk_device` | Create sessions and write results for its own kiosk. |
| `public_report_viewer` | View only the public report behind a valid QR token. |

Security principles:

```text
1. 民眾 QR Code 不直接暴露 session_id。
2. report token 存 hash，不存明文。
3. public report 與 internal result 分開。
4. kiosk device token 只能寫入該 kiosk 的資料。
5. 所有管理後台操作寫入 audit_events。
6. 所有 schema migration 只能 forward migration，不手動改 production DB。
```

## 8. Redpanda Spec

Redpanda does not replace PostgreSQL in the MVP. It provides event flow and
future expansion.

MVP pattern:

```text
API server writes PostgreSQL transaction
  -> same transaction writes outbox_events
  -> outbox-worker publishes to Redpanda
  -> worker updates published_at / topic / offset
```

Do not make a kiosk request wait synchronously for Redpanda success.

Topics:

```text
shc.module.events.v1
shc.vision.results.v1
shc.hearing.results.v1
shc.questionnaire.results.v1
shc.avatar.events.v1
shc.report.events.v1
shc.audit.events.v1
shc.device.telemetry.v1
```

CloudEvents-like envelope:

```json
{
  "specversion": "1.0",
  "id": "evt_01J...",
  "source": "shc/kiosk/kiosk_001/module/vision",
  "type": "shc.vision.result.created.v1",
  "subject": "session/sess_123",
  "time": "2026-06-24T10:00:00+08:00",
  "datacontenttype": "application/json",
  "tenant_id": "tenant_abc",
  "kiosk_id": "kiosk_001",
  "session_id": "sess_123",
  "module_run_id": "vision_run_123",
  "schema_version": "vision_result.v1",
  "data": {
    "result_id": "vision_result_123",
    "public_status_code": "NORMAL_REFERENCE",
    "confidence": "medium"
  }
}
```

Partition key:

```text
tenant_id + ":" + session_id
```

## 9. API Spec

Session:

```http
POST /api/v1/kiosk/sessions
GET  /api/v1/kiosk/sessions/{session_id}
POST /api/v1/kiosk/sessions/{session_id}/complete
```

Module:

```http
GET  /api/v1/kiosk/module-config
POST /api/v1/sessions/{session_id}/module-runs
POST /api/v1/module-runs/{module_run_id}/complete
POST /api/v1/module-runs/{module_run_id}/fail
```

Results:

```http
POST /api/v1/module-runs/{module_run_id}/questionnaire-result
POST /api/v1/module-runs/{module_run_id}/vision-result
POST /api/v1/module-runs/{module_run_id}/hearing-result
POST /api/v1/module-runs/{module_run_id}/avatar-event
```

Report:

```http
POST /api/v1/sessions/{session_id}/report
GET  /api/v1/reports/{report_token}/public
GET  /api/v1/admin/sessions/{session_id}/internal-report
```

Admin:

```http
GET    /api/v1/admin/kiosks
POST   /api/v1/admin/kiosks
GET    /api/v1/admin/module-configs
PATCH  /api/v1/admin/module-configs/{module_id}
GET    /api/v1/admin/questionnaires
POST   /api/v1/admin/questionnaires
PATCH  /api/v1/admin/questionnaires/{questionnaire_id}
POST   /api/v1/admin/questionnaires/{questionnaire_id}/publish
```

## 10. Internal Repo Folder Spec

```text
smart-health-cabin/
  apps/
    kiosk-web/
    admin-web/
    api-server/
    outbox-worker/
  modules/
    questionnaire/
    vision/
    hearing/
    avatar/
  packages/
    contracts/
    ui/
    module-sdk/
    report-core/
    auth-core/
  infra/
    docker-compose.yml
    postgres/
    redpanda/
    nginx/
    scripts/
  docs/
    specs/
      MVP-SYSTEM-SPEC.md
      API-SPEC.md
      DATABASE-ERD.md
      MODULE-CONTRACTS.md
      DEPLOYMENT.md
      TEST-PLAN.md
```

## 11. Deployment Strategy

Local development:

```bash
docker compose up -d postgres redpanda redpanda-console
pnpm install
pnpm db:migrate
pnpm dev
```

Expected local surfaces:

```text
kiosk-web:        http://localhost:3000
admin-web:        http://localhost:3001
api-server:       http://localhost:4000
redpanda-console: http://localhost:8080
postgres:         localhost:5432
```

MVP staging:

```text
1. api-server container
2. kiosk-web container
3. admin-web container
4. outbox-worker container
5. managed PostgreSQL or single-node PostgreSQL
6. Redpanda single-node or managed Redpanda
```

Production path should not start with Kubernetes. The first deployable path can
be Docker Compose on a VM, a platform such as Render/Fly/Railway, or cloud VM +
managed PostgreSQL.

Production minimum:

```text
1. HTTPS
2. Postgres backup
3. migration pipeline
4. environment variables managed outside repo
5. admin login
6. kiosk device token
7. error logging
8. audit log
9. Redpanda outside critical request path
```

## 12. Iteration Plan

The active compressed schedule is now the questionnaire + Avatar sprint plan:

```text
docs/specs/MVP-QUESTIONNAIRE-AVATAR-SPRINT-PLAN.md
```

The earlier four-module fast-march plan remains preserved as historical
reference in:

```text
docs/specs/MVP-FAST-MARCH-SPRINT-PLAN.md
```

The active goal is not to complete the full product. The goal is to make the
questionnaire + Avatar spine runnable:

```text
session -> published questionnaire -> PHQ-9 response -> score/safety flag
-> Avatar voice guidance -> report -> QR Code -> PostgreSQL -> outbox
-> Redpanda event
```

Active calendar:

| Sprint | Dates | Working days | Finish line |
| --- | --- | ---: | --- |
| Sprint 0 | `2026-06-25` to `2026-06-26` | 2 | monorepo + questionnaire skeleton |
| Sprint 1 | `2026-06-29` to `2026-06-30` | 2 | SurveyJS + PHQ-9 seed + kiosk answer save |
| Sprint 2 | `2026-07-01` to `2026-07-02` | 2 | questionnaire CMS + versioning + report |
| Sprint 3 | `2026-07-03` + `2026-07-06` | 2 | ASR + LLM + TTS voice Agent MVP |
| Sprint 4 | `2026-07-07` to `2026-07-08` | 2 | Avatar UI + voice-guided questionnaire + Redpanda outbox |
| Sprint 5 | `2026-07-09` to `2026-07-10` | 2 | E2E hardening + roles + deployment docs |

Operating controls:

```text
1. Keep one monorepo.
2. Keep PostgreSQL as the source of truth.
3. Keep Redpanda outside the kiosk critical path.
4. Use one report_section shape for all modules.
5. Keep public PHQ-9 output non-diagnostic and staff-review oriented.
6. Defer vision, hearing, HIS adapter, Kubernetes, full FHIR mapping, and full
   clinical-validation scope.
```

Calendar source control:

```text
The planning window excludes 2026-06-27 to 2026-06-28 and 2026-07-04 to
2026-07-05 weekends. 2026-06-26 is treated as a working day in this schedule.
```

Sprint 5+ backlog:

```text
formal vision calibration
formal hearing calibration
complex questionnaire rule editor
review workflow
autonomous clinical conversation
HIS adapter
Kubernetes
full FHIR mapping
production governance package
```

## 13. Versioning And Extension Rules

All schemas are versioned:

```text
vision_result.v1
hearing_result.v1
questionnaire_result.v1
avatar_event.v1
report_section.v1
module_event.v1
```

Rules:

```text
1. 新增 optional field 可以 minor upgrade。
2. 移除 field 必須 major upgrade。
3. 改 field meaning 必須 major upgrade。
4. public report schema 要比 internal result 更穩。
5. module version 與 schema version 分開。
```

Each module run stores:

```text
module_id
module_version
input_contract_version
output_contract_version
calibration_profile_id
created_at
```

This makes future reports traceable to the exact questionnaire, algorithm,
calibration, and contract version used at the time.

## 14. Test Strategy

Required tests:

| Type | Coverage |
| --- | --- |
| Unit test | 視力換算、聽力分級、問卷跳題、status mapping |
| Contract test | API response 是否符合 schema |
| Integration test | session -> module_run -> result -> report |
| E2E test | 使用者完整走完 kiosk 流程 |
| Permission test | 不同 role 是否只能看到該看的資料 |
| Migration test | DB migration 能否從空 DB 建立 |
| Outbox test | DB 寫入成功後事件能否 publish |
| Failure test | 某模組失敗時，整體 session 是否仍可完成 |

Vision-specific checks:

```text
不同螢幕解析度、不同距離 profile、大按鈕觸控、長者操作時間、重測流程
```

Hearing-specific checks:

```text
左右喇叭 channel routing、ambient noise 過高時阻擋、catch trial 誤按、喇叭校準過期、音量安全上限
```

## 15. Minimum Acceptance Standard

MVP completion means:

```text
1. 可以建立一個 session。
2. 可以依 tenant config 啟用或停用四個模組。
3. 使用者可在 kiosk-web 完成問卷、視力、聽力、Avatar 導引。
4. 任一模組失敗，不會讓整個流程崩潰。
5. 每個模組都會產生 module_run。
6. 每個完成模組都會產生 result。
7. 每個 result 都會轉成 public report section。
8. 報告可以用 QR Code 帶走。
9. 後台可以看 session、report、module status。
10. 權限能區分 admin、staff、reviewer、kiosk device。
11. PostgreSQL 有 audit log。
12. Redpanda 可以收到 outbox-worker 發出的事件。
13. API schema、ERD、部署文件可交付。
```

## 16. Avoided Failure Modes

Avoid starting with microservices. The first objective is stable delivery, not
service governance.

Avoid making Redpanda a critical-path dependency. User results should be saved
to PostgreSQL first; event publishing can retry.

Avoid making Avatar a clinical decision layer. Avatar guides, explains, and
recovers from errors; it does not diagnose, triage, or overwrite results.

Avoid module-to-module imports. Vision should not know questionnaire internals;
hearing should not know Avatar internals. Modules share contracts and module
SDK only.

Avoid mixing public report and internal metrics. Citizen-facing output stays
low-risk and understandable; internal detail stays available for reviewer
workflow.

## 17. Final Working Name

Use this name for the MVP stage:

```text
Modular Monorepo MVP
```

Do not call it:

```text
Microservices Platform
```

The name helps the team keep the scope practical: one repo, clear module
boundaries, PostgreSQL source of truth, Redpanda event layer through outbox,
Docker Compose deployment, three main apps, and four configurable modules.

## 18. Reference Links From Conversation

These links were part of today's architecture discussion and should be verified
before external citation:

- Turborepo: https://turborepo.dev/
- Nx: https://nx.dev/docs/getting-started/intro
- PostgreSQL Row Security Policies: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- Redpanda Schema Registry API: https://docs.redpanda.com/current/manage/schema-reg/schema-reg-api/
- CloudEvents specification: https://github.com/cloudevents/spec
