---
id: smart-health-cabin-sprint-2-codex-goal-prompt
title: "Sprint 2 Codex Goal Prompt"
date: 2026-06-25
topic: smart-health-cabin
type: codex-goal-prompt
status: active
source:
  - ../specs/MVP-QUESTIONNAIRE-AVATAR-SPRINT-PLAN.md
  - ../devlog/2026-06-26.md
  - ../devlog/2026-06-29.md
  - ../devlog/2026-06-30.md
  - ../../modules/questionnaire/seed/phq9.zh-TW.surveyjs.json
  - ../../modules/questionnaire/scoring/phq9.public-scoring-config.json
---

# Sprint 2 Codex Goal Prompt

結論：Sprint 2 的任務要鎖死成一條產品化延伸線，不是重做問卷系統。

已完成基礎是：

```text
PHQ-9 SurveyJS seed -> kiosk render -> touch answer -> API submit -> PostgreSQL persist -> backend score -> item 9 safety flag -> non-diagnostic public summary -> pending outbox row
```

Sprint 2 要新增的是：

```text
admin CMS -> questionnaire versioning -> publish active version -> report_section -> public token / QR -> admin response list -> audit trail
```

下面這段可以直接貼給 Codex。

````text
You are Codex working on the Smart Health Cabin MVP repo.

Primary goal:
Finish Sprint 2 of the updated Smart Health Cabin MVP plan.

Sprint 2 is NOT a rebuild of the PHQ-9 runtime.
Sprint 2 is also NOT Avatar, ASR, LLM, TTS, Redpanda, vision, or hearing.

Sprint 2 is:

Dates: 2026-07-01 to 2026-07-02
Theme: questionnaire CMS + versioning + report
Goal: Turn the already-working PHQ-9 runtime path into an open questionnaire system where admin users can manage SurveyJS questionnaire versions, publish an active version, and generate a safe public report via token / QR.

Required end-to-end path:

admin creates or edits SurveyJS JSON
-> admin validates and previews questionnaire
-> admin publishes active questionnaire version
-> kiosk reads only active published version
-> user completes questionnaire
-> backend persists raw answers
-> backend recomputes score and safety flags
-> backend creates report_section
-> system creates public report token / QR URL
-> public report shows safe filtered summary only
-> audit events record create/edit/publish/report actions

Repository and local source paths:

Main repo:
`/home/jnclaw/every_on_git_jnclaw/phd-life-system/imedtac-smart-health-cabin-v0`

Planning repo:
`/home/jnclaw/every_on_git_jnclaw/phd-life-system/planning-everything-track`

Local SurveyJS source zip, available on the user machine:
`~/Downloads/survey-library-master.zip`

First questionnaire source, available on the user machine:
`~/Downloads/phq9_ai_agent_readable_zh-TW.md`

Use the SurveyJS zip only if needed.
Prefer the repo's existing package-manager route and existing SurveyJS renderer first.
Do not vendor, fork, or rewrite SurveyJS unless import/package use is impossible.
If the zip must be used, inspect it first with `unzip -l`, extract only necessary files, document the reason, and keep upstream code clearly separated under `third_party/` or `vendor/`.

Use the PHQ-9 markdown only if the repo is missing the source copy or if you need to verify wording.
Do not change PHQ-9 item keys unless you also update migrations, tests, samples, scoring, and report contracts together.
Known PHQ-9 answer keys must remain:

`phq9_01`
`phq9_02`
`phq9_03`
`phq9_04`
`phq9_05`
`phq9_06`
`phq9_07`
`phq9_08`
`phq9_09`

Each item value must remain integer `0..3`.

Important baseline:
Sprint 0 and Sprint 1 are already treated as complete.
Do not rebuild their work.

Sprint 0 already provided:

* pnpm workspace
* `apps/kiosk-web`
* `apps/admin-web`
* `apps/api-server`
* `apps/voice-agent-server`
* `apps/outbox-worker`
* `packages/contracts`
* `packages/questionnaire-core`
* `packages/report-core`
* PostgreSQL migration skeleton
* module manifests
* local dev docs
* CI skeleton

Sprint 1 already provided:

* PHQ-9 SurveyJS JSON seed
* kiosk SurveyJS rendering path
* `GET /api/v1/questionnaires/active`
* `POST /api/v1/questionnaire-responses`
* backend answer validation
* backend PHQ-9 score calculation
* `phq9_09 > 0` human-review safety flag
* public non-diagnostic summary
* pending outbox row after response persistence
* tests for questionnaire/report/API/kiosk seed

Start by inspecting before editing:

```bash
cd /home/jnclaw/every_on_git_jnclaw/phd-life-system/imedtac-smart-health-cabin-v0

git status --short
find . -maxdepth 3 -type f | sort | sed -n '1,240p'

jq . modules/questionnaire/seed/phq9.zh-TW.surveyjs.json >/dev/null
jq . modules/questionnaire/scoring/phq9.public-scoring-config.json >/dev/null

corepack pnpm validate:json
corepack pnpm test
git diff --check
```

Expected baseline:

* JSON validation passes.
* Vitest passes current baseline.
* `docs/devlog/2026-06-26.md` exists.
* `docs/devlog/2026-06-29.md` exists.
* `docs/devlog/2026-06-30.md` exists.
* `GET /api/v1/questionnaires/active` still returns active PHQ-9.
* `POST /api/v1/questionnaire-responses` still persists and scores PHQ-9.

If this baseline regresses, fix the regression first. Do not add Sprint 2 features on top of a broken Sprint 1 path.

Architecture rules:

1. Keep the repo as a modular monolith.
   Do not split repos.
   Do not introduce a second backend framework.
   Do not duplicate the questionnaire engine.

2. Use layered design in `apps/api-server`:

* route/controller layer: HTTP only
* schema/DTO validation layer: validate request and response shape
* service layer: business workflow and transactions
* repository layer: PostgreSQL access
* domain/core packages: scoring, public report mapping, contract helpers

3. Backend is the source of truth.
   Frontend may preview SurveyJS.
   Frontend must not be trusted for scoring, safety flags, report wording, or publish state.

4. Preserve bounded contexts:

* `apps/admin-web`: admin CMS interface
* `apps/kiosk-web`: public/kiosk questionnaire runtime
* `apps/api-server`: API, persistence, scoring, report, audit
* `packages/questionnaire-core`: validation/scoring helpers
* `packages/report-core`: safe public wording and filtering
* `packages/contracts`: shared API/domain contracts
* `apps/outbox-worker`: future Redpanda publishing seam, not Sprint 2 implementation

5. Version lifecycle must be explicit:

```text
draft -> published -> archived
```

Rules:

* Kiosk reads only the active published version.
* Editing a published version must create a new draft/version or preserve historical immutability.
* Publishing one version must archive/deactivate previous active version for the same questionnaire/template.
* Completed responses must keep their original questionnaire version reference.
* Publish action must write an audit event.

6. Public/internal boundary:

Internal may store:

* raw answers
* PHQ-9 total score
* internal score band
* item 9 value
* safety flags
* audit payload
* report generation payload

Public may show only:

* module title
* safe public status code
* safe summary
* staff / healthcare-professional review recommendation
* disclaimer

Public must not show:

* raw PHQ-9 answers
* internal score labels
* diagnostic labels
* treatment advice
* autonomous medical conclusions

Banned public wording includes:

* 憂鬱症
* 中度憂鬱
* 重度憂鬱
* 診斷
* 治療建議
* any wording that sounds like the system independently diagnosed or treated the user

Allowed public wording style:

* 健康自我檢測參考
* 建議洽詢現場人員或醫護人員
* 需要進一步關心的項目
* 本次填答結果可作為健康自我檢測參考
* 若有持續困擾，建議洽詢現場人員或醫護人員

7. Item 9 safety rule:
   If `phq9_09 > 0`, then:

* `item9_positive = true`
* `requires_human_review = true`
* public status should prioritize `CONSULT_STAFF`
* public message must recommend onsite staff or healthcare-professional support
* do not show self-harm details in public report

Sprint 2 implementation scope:

Do:

* admin questionnaire template list
* admin create/edit form
* SurveyJS JSON textarea editor
* JSON validation
* SurveyJS preview using the same renderer adapter pattern as kiosk
* draft / published / archived lifecycle
* active version selection
* publish action
* admin response list
* `report_sections` integration
* public report token route
* QR URL payload or QR code display
* audit events for create/edit/publish/report actions
* tests and devlogs

Do not:

* build drag-and-drop Survey Creator
* build complex rule editor
* build full RBAC/auth system
* implement Avatar voice loop
* implement ASR/LLM/TTS
* implement Redpanda publish
* implement vision/hearing
* expose real patient/HIS integration
* replace PHQ-9 runtime with custom HTML

Minimal API routes required:

```text
GET  /api/v1/admin/questionnaire-templates
POST /api/v1/admin/questionnaire-templates
POST /api/v1/admin/questionnaire-versions
POST /api/v1/admin/questionnaire-versions/{id}/publish
GET  /api/v1/admin/questionnaire-responses
GET  /api/v1/reports/{token}/public
```

Keep existing routes working:

```text
GET  /healthz
GET  /api/v1/questionnaires/active
POST /api/v1/questionnaire-responses
```

Suggested admin API contracts:

`GET /api/v1/admin/questionnaire-templates`

Return:

```json
{
  "templates": [
    {
      "id": "qtpl_phq9",
      "code": "phq9",
      "title": "病人健康狀況問卷-9（PHQ-9）",
      "description": "健康自我檢測問卷",
      "active_version_id": "qver_phq9_0_1_0",
      "active_version": "0.1.0",
      "status": "published",
      "updated_at": "2026-07-01T10:00:00+08:00"
    }
  ]
}
```

`POST /api/v1/admin/questionnaire-templates`

Request:

```json
{
  "code": "phq9",
  "title": "病人健康狀況問卷-9（PHQ-9）",
  "description": "健康自我檢測問卷"
}
```

`POST /api/v1/admin/questionnaire-versions`

Request:

```json
{
  "template_id": "qtpl_phq9",
  "version": "0.2.0",
  "surveyjs_json": {},
  "scoring_config_code": "phq9_public_v1",
  "status": "draft"
}
```

Validation rules:

* request body must be valid JSON
* `surveyjs_json` must have at least `title` and `pages` or the existing project’s SurveyJS validation convention
* reject invalid JSON with stable error code
* preserve existing PHQ-9 required item rules for PHQ-9 templates

Error example:

```json
{
  "error": {
    "code": "INVALID_SURVEYJS_JSON",
    "message": "SurveyJS JSON is invalid or missing required questionnaire structure."
  }
}
```

`POST /api/v1/admin/questionnaire-versions/{id}/publish`

Behavior:

* transaction starts
* target version becomes `published`
* target version becomes active for its template/code
* previous active version becomes archived/inactive
* audit event is inserted
* transaction commits
* `GET /api/v1/questionnaires/active` now returns the newly published version

Return:

```json
{
  "version_id": "qver_phq9_0_2_0",
  "template_id": "qtpl_phq9",
  "questionnaire_code": "phq9",
  "version": "0.2.0",
  "status": "published",
  "is_active": true
}
```

`GET /api/v1/admin/questionnaire-responses`

Return filtered internal/admin list, not public report:

```json
{
  "responses": [
    {
      "response_id": "qres_demo_001",
      "session_id": "sess_demo_001",
      "questionnaire_code": "phq9",
      "questionnaire_version": "0.1.0",
      "public_status_code": "NORMAL_REFERENCE",
      "requires_human_review": false,
      "created_at": "2026-07-02T10:00:00+08:00"
    }
  ]
}
```

`GET /api/v1/reports/{token}/public`

Return:

```json
{
  "report_id": "rpt_demo_001",
  "token": "public_demo_token",
  "sections": [
    {
      "module_id": "questionnaire",
      "title": "健康問卷已完成",
      "public_status_code": "NORMAL_REFERENCE",
      "summary": "本次問卷結果可作為健康自我檢測參考。若有持續困擾，建議洽詢現場人員或醫護人員。",
      "disclaimer": "本結果僅供健康自我檢測與現場人員參考，不作為疾病診斷或治療依據。"
    }
  ]
}
```

Public report must not include:

* `raw_answers`
* `internal_score`
* `internal_band`
* individual PHQ-9 item values
* diagnostic labels

Database/migration work:

Inspect existing migrations first.
If tables already exist, extend them without destructive changes.
If needed, add a new migration such as:

`infra/migrations/0002_sprint2_questionnaire_cms_report.sql`

Minimal tables or columns:

`questionnaire_templates`

* `id`
* `code`
* `title`
* `description`
* `created_at`
* `updated_at`

`questionnaire_versions`

* preserve existing fields
* add/confirm `template_id`
* add/confirm `version`
* add/confirm `status`
* add/confirm `is_active`
* add/confirm `surveyjs_json`
* add/confirm `scoring_config_code`
* add/confirm `published_at`
* add/confirm `archived_at`

`questionnaire_responses`

* preserve existing response records
* confirm each response links to exact questionnaire version
* confirm score and safety payloads remain backend-owned

`report_sections`

* `id`
* `session_id`
* `response_id`
* `module_id`
* `title`
* `public_status_code`
* `safe_summary`
* `disclaimer`
* `sort_order`
* `created_at`

`report_access_tokens`

* `id`
* `token`
* `session_id`
* `response_id` or report reference
* `created_at`
* `expires_at`
* `revoked_at`

`audit_events`

* `id`
* `actor_id`
* `action`
* `entity_type`
* `entity_id`
* `payload_json`
* `created_at`

Use transactions for publish and report creation.
Publish must not leave two active published versions for the same questionnaire.
Report creation must occur after successful questionnaire response persistence/scoring.

Implementation tasks, Day 1:

Must-win:
Admin can list templates, paste SurveyJS JSON, validate it, preview it, and publish one active version.

Day 1 task list:

1. Re-run Sprint 0/1 baseline validation.
2. Inspect existing admin-web structure.
3. Add or extend admin questionnaire page.
4. Add template list UI.
5. Add create/edit form.
6. Add SurveyJS JSON textarea editor.
7. Add client-side basic JSON validation for fast feedback.
8. Add server-side validation as the authoritative gate.
9. Add preview UI using the same SurveyJS renderer adapter pattern as kiosk.
10. Add publish action.
11. Ensure old active version is archived/inactive.
12. Ensure `GET /api/v1/questionnaires/active` returns only the active published version.
13. Insert audit event for create/edit/publish.
14. Add tests.
15. Write `docs/devlog/2026-07-01.md`.

Day 1 acceptance:

* admin can list templates
* admin can paste SurveyJS JSON
* invalid JSON is rejected
* preview renders the questionnaire
* one version can be published active
* kiosk reads only active published version
* audit event is recorded
* baseline tests still pass

Implementation tasks, Day 2:

Must-win:
One completed questionnaire response becomes a report section and QR-accessible public report.

Day 2 task list:

1. Reuse existing `POST /api/v1/questionnaire-responses`.
2. After successful response persistence and backend scoring, create a `report_section`.
3. Create or reuse public report token.
4. Add `GET /api/v1/reports/{token}/public`.
5. Add QR payload support:

   * minimum acceptable: API/UI returns a public report URL suitable for QR display
   * better: render QR code in UI if a small existing or acceptable dependency is available
   * do not overbuild QR management
6. Add admin response list.
7. Confirm item 9 positive prioritizes staff-review wording.
8. Confirm public report filtering:

   * no raw answers
   * no diagnostic labels
   * no internal score labels
9. Add audit event for report/public-token creation.
10. Add tests.
11. Write `docs/devlog/2026-07-02.md`.

Day 2 acceptance:

* completed response creates report section
* QR/public token route returns safe summary
* admin can see response list
* item 9 positive prioritizes staff review
* audit trail exists for publish/report actions
* baseline tests still pass

Testing requirements:

Add or extend tests for:

1. SurveyJS JSON validation:

* valid PHQ-9 SurveyJS JSON passes
* invalid JSON fails with stable error code
* missing required PHQ-9 keys fails for PHQ-9 template if applicable

2. Publish lifecycle:

* draft can be published
* published version becomes active
* previous active version is archived/inactive
* kiosk active route returns new active published version
* completed response remains linked to original version

3. Report creation:

* completed questionnaire response creates report section
* public report token is generated
* public report route returns safe public summary
* public report does not include raw answers or internal score payload

4. Safety boundary:

* `phq9_09 > 0` sets `requires_human_review`
* public status is `CONSULT_STAFF`
* public message recommends onsite staff or healthcare-professional support
* public output does not contain banned diagnostic wording

5. Audit:

* create/edit/publish actions write audit events
* report/token creation writes audit event or documented audit record

6. Regression:

* existing PHQ-9 render/save/score tests remain green
* touch fallback remains the questionnaire completion path

Validation commands to run before closeout:

```bash
cd /home/jnclaw/every_on_git_jnclaw/phd-life-system/imedtac-smart-health-cabin-v0

git status --short
corepack pnpm validate:json
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm build
corepack pnpm test
git diff --check
```

If PostgreSQL/local services are needed:

```bash
DOCKER_CONFIG=$PWD/.local/docker-config docker compose -f infra/docker-compose.yml config
DOCKER_CONFIG=$PWD/.local/docker-config docker compose -f infra/docker-compose.yml up -d postgres
corepack pnpm --filter @shc/api-server migrate
```

Suggested smoke checks:

```bash
curl -fsS http://localhost:3000/healthz

curl -fsS http://localhost:3000/api/v1/questionnaires/active

curl -fsS http://localhost:3000/api/v1/admin/questionnaire-templates

curl -fsS -X POST http://localhost:3000/api/v1/questionnaire-responses \
  -H 'content-type: application/json' \
  --data @samples/phq9-response-low-risk.json

curl -fsS -X POST http://localhost:3000/api/v1/questionnaire-responses \
  -H 'content-type: application/json' \
  --data @samples/phq9-response-item9-positive.json
```

Add additional curl samples for:

* create questionnaire template
* create questionnaire version
* publish questionnaire version
* fetch admin response list
* fetch public report by token

Devlog requirements:

Create or update:

`docs/devlog/2026-07-01.md`

Use this structure:

```markdown
# 2026-07-01 Sprint 2 D1 Closeout

## Entry Baseline
- Sprint 0/1 regression check:
- PHQ-9 runtime reused:
- No PHQ-9 runtime rebuild:

## Result
- Questionnaire template list:
- JSON edit/validate:
- SurveyJS preview:
- Publish active version:
- Audit event:

## Evidence
- Commands/screenshots:
- Files changed:

## Blocker Or Next Action
-
```

Create or update:

`docs/devlog/2026-07-02.md`

Use this structure:

```markdown
# 2026-07-02 Sprint 2 D2 Closeout

## Entry Baseline
- Sprint 1 response persistence reused:
- Sprint 2 D1 publish path reused:

## Result
- Report section:
- Public token / QR:
- Admin response list:
- PHQ-9 item 9 wording:

## Scope Control
- Public output avoids diagnostic wording.

## Evidence
-

## Blocker Or Next Action
-
```

Planning repo rule:

Keep implementation detail in the Smart Health Cabin repo.
If updating planning repo, record only:

* locator
* outcome
* blocker
* validation evidence
* next action

Do not duplicate full implementation details into planning notes.

Efficiency rules:

* Make the shortest useful vertical slice.
* Use textarea JSON editor, not drag/drop creator.
* Reuse existing SurveyJS renderer.
* Reuse existing scoring/report core.
* Reuse existing API validation conventions.
* Reuse existing migration style.
* Reuse existing test framework.
* Avoid new dependencies unless they remove more complexity than they add.
* If QR generation becomes expensive, return QR-ready public URL first and document QR rendering as a polish task.
* If admin auth becomes a blocker, mark Sprint 2 admin as local/dev admin surface and defer full RBAC to Sprint 5.

Future-sprint seam rules:

Sprint 3 will need:

* active questionnaire version
* current question text/options
* touch fallback
* response submit route
* public summary boundary

Therefore, expose enough questionnaire state for voice guidance later, but do not implement voice now.

Sprint 4 will need:

* report path
* outbox rows
* audit events
* Redpanda publish from outbox

Therefore, preserve outbox/audit seams, but do not implement Redpanda publish now.

Cut line if time is tight:

Must keep:

* JSON editor
* validation
* preview
* publish active version
* kiosk reads active published version
* completed response creates report section
* public token route returns safe summary

Can cut or keep minimal:

* response dashboard polish
* advanced template search/filter
* drag/drop editor
* QR visual styling
* admin auth/RBAC
* complex questionnaire rule editor

Final response required from Codex:

At the end, report:

1. Files changed.
2. Migrations added or changed.
3. API routes added or changed.
4. Tests added or changed.
5. Validation commands run and results.
6. Any blockers.
7. Whether Sprint 2 D1 and D2 acceptance criteria are complete.
8. Any exact follow-up needed for Sprint 3.
````

這份 prompt 的重點是：讓 Codex 先保護 Sprint 0/1 已完成的 vertical slice，再做 Sprint 2 的產品化層。真正要避免的錯誤是「看到 CMS 就開始做大型後台」、「看到 QR 就開始做完整報告平台」、「看到 Avatar 計畫就提早做 voice」。Sprint 2 只要把問卷從 hard-coded demo 變成可版本管理、可發布、可產生安全報告的系統，就算打到正確目標。
