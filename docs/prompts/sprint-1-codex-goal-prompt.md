---
id: smart-health-cabin-sprint-1-codex-goal-prompt
title: "Sprint 1 Codex Goal Prompt"
date: 2026-06-25
topic: smart-health-cabin
type: codex-goal-prompt
status: active
source:
  - ../specs/MVP-QUESTIONNAIRE-AVATAR-SPRINT-PLAN.md
  - ../../modules/questionnaire/seed/phq9.zh-TW.surveyjs.json
  - ../../modules/questionnaire/scoring/phq9.public-scoring-config.json
---

# Sprint 1 Codex Goal Prompt

結論：Sprint 1 的 Codex Goal Prompt 應該把任務鎖定成一條完整 vertical slice：

```text
PHQ-9 SurveyJS seed -> kiosk render -> touch answer -> submit -> PostgreSQL persist -> backend scoring -> item 9 safety flag -> non-diagnostic public summary -> devlog/validation evidence
```

不要把 Avatar、Redpanda、視力、聽力、CMS 拉進 Sprint 1。這些要保留架構接口，但不是這兩天的完成標準。

下面這段可以直接貼給 Codex。

```text
You are Codex working on the Smart Health Cabin MVP repo.

Primary goal:
Finish Sprint 1 of the updated Smart Health Cabin MVP plan.

Sprint 1 is NOT the old four-module fast-march sprint.
Sprint 1 is:

Dates: 2026-06-29 to 2026-06-30
Theme: SurveyJS + PHQ-9 seed + kiosk answer save
Goal: Render PHQ-9 from SurveyJS JSON and save completed answers to PostgreSQL.

The required end-to-end path is:

PHQ-9 SurveyJS seed
-> kiosk-web renders the questionnaire
-> user answers all 9 PHQ-9 items by touch
-> submit produces raw answer JSON
-> api-server persists the response
-> backend computes PHQ-9 total score
-> backend detects phq9_09 safety flag
-> backend returns/stores a non-diagnostic public summary
-> devlogs and validation evidence are written

Important scope rule:
Do NOT implement Avatar, ASR, LLM, TTS, Redpanda, vision, hearing, or CMS in Sprint 1.
Only preserve clean future seams for those modules.
Sprint 1 must close the questionnaire runtime path first.

Repository and local source paths:
- Main repo:
  /home/jnclaw/every_on_git_jnclaw/phd-life-system/imedtac-smart-health-cabin-v0

- Planning repo:
  /home/jnclaw/every_on_git_jnclaw/phd-life-system/planning-everything-track

- Local SurveyJS source zip, available on the user machine:
  ~/Downloads/survey-library-master.zip

Use the SurveyJS zip only if needed.
Prefer the repo's existing package-manager route first.
Do not vendor or rewrite the entire SurveyJS library unless package install/import is impossible.
If the local zip must be used, inspect it first with unzip -l, extract only what is necessary, and document the source under third_party/ or vendor/ with a clear note.
Do not modify upstream SurveyJS source unless a concrete blocker requires it.

First, inspect before editing:
1. cd into the main repo.
2. Run git status --short.
3. Inspect the top-level structure.
4. Check whether these paths already exist:
   - apps/kiosk-web
   - apps/api-server
   - infra/docker-compose.yml
   - modules/questionnaire/seed/phq9.zh-TW.surveyjs.json
   - modules/questionnaire/scoring/phq9.public-scoring-config.json
   - modules/questionnaire/module.manifest.json
   - docs/specs/MVP-QUESTIONNAIRE-AVATAR-SPRINT-PLAN.md
5. Detect package manager and stack:
   - package.json / pnpm-lock.yaml / yarn.lock / package-lock.json
   - pyproject.toml / requirements.txt
   - docker-compose.yml
   - migration tool, ORM, or SQL migration convention
6. Preserve existing conventions. Do not introduce a second framework if one already exists.

Known required files and contracts:
- PHQ-9 seed:
  modules/questionnaire/seed/phq9.zh-TW.surveyjs.json

- PHQ-9 scoring config:
  modules/questionnaire/scoring/phq9.public-scoring-config.json

- Questionnaire manifest:
  modules/questionnaire/module.manifest.json

Minimal API routes required for Sprint 1:
- GET /healthz
- GET /api/v1/questionnaires/active
- POST /api/v1/questionnaire-responses

Optional only if already present:
- POST /api/v1/kiosk/sessions
- GET /api/v1/kiosk/sessions/{session_id}

Minimal data contract:

Active questionnaire response:

{
  "questionnaire_code": "phq9",
  "questionnaire_version": "0.1.0",
  "title": "病人健康狀況問卷-9（PHQ-9）",
  "surveyjs_json": {},
  "scoring_config_code": "phq9_public_v1"
}

Completed response request:

{
  "session_id": "sess_demo_001",
  "questionnaire_code": "phq9",
  "questionnaire_version": "0.1.0",
  "raw_answers": {
    "phq9_01": 0,
    "phq9_02": 1,
    "phq9_03": 0,
    "phq9_04": 1,
    "phq9_05": 0,
    "phq9_06": 0,
    "phq9_07": 1,
    "phq9_08": 0,
    "phq9_09": 0
  }
}

Completed response result:

{
  "response_id": "qres_demo_001",
  "session_id": "sess_demo_001",
  "questionnaire_code": "phq9",
  "questionnaire_version": "0.1.0",
  "internal_score": {
    "total": 3,
    "item9": 0,
    "internal_band": "minimal_reference"
  },
  "safety_flags": {
    "requires_human_review": false,
    "item9_positive": false
  },
  "public_summary": {
    "public_status_code": "NORMAL_REFERENCE",
    "title": "健康問卷已完成",
    "message": "本次填答結果可作為健康自我檢測參考。若仍有不適，建議洽詢現場人員或醫護人員。"
  }
}

Backend design rules:
1. Backend is the scoring source of truth.
   SurveyJS calculatedValues may exist, but do not trust frontend scoring.
   Recompute score server-side from raw_answers.

2. Validate every PHQ-9 item:
   Required keys:
   phq9_01, phq9_02, phq9_03, phq9_04, phq9_05, phq9_06, phq9_07, phq9_08, phq9_09

   Each value must be an integer from 0 to 3.

3. Score:
   phq9_total_score = sum phq9_01 through phq9_09

4. Safety:
   If phq9_09 > 0:
   - item9_positive = true
   - requires_human_review = true
   - public_status_code = CONSULT_STAFF
   - public message must prioritize staff / healthcare-professional support

5. Public wording:
   Allowed public wording:
   - 正常參考
   - 需注意
   - 建議洽詢現場人員或醫護人員
   - 健康自我檢測參考
   - 您有填答到需要進一步關心的項目，建議洽詢現場人員或醫護人員協助。

   Disallowed public wording:
   - 你有憂鬱症
   - 中度憂鬱
   - 重度憂鬱
   - 診斷
   - 治療建議
   - any wording that sounds like autonomous medical diagnosis

6. Public UI must not display raw answers or diagnostic labels.
   Internal score may be stored for staff/admin use, but public kiosk summary must remain non-diagnostic.

Architecture to implement:
Use a thin modular-monolith structure unless the repo already has another convention.

Preferred conceptual layers:

apps/kiosk-web
- UI shell for kiosk
- Questionnaire page
- SurveyJS renderer adapter
- API client
- public completion summary

apps/api-server
- HTTP routes
- request validation
- questionnaire service
- scoring service
- repository/data access
- database migration/seed path

modules/questionnaire
- seed SurveyJS JSON
- public scoring config
- module manifest
- domain contract docs if needed

infra
- PostgreSQL docker-compose or existing DB setup
- migration files

docs/devlog
- Sprint 1 D1 and D2 closeout records

Use these design patterns:
1. Adapter Pattern:
   Create a QuestionnaireRenderer or SurveyJsQuestionnaireRenderer wrapper.
   The kiosk should depend on our adapter, not directly scatter SurveyJS logic everywhere.

2. Repository Pattern:
   Keep database reads/writes behind QuestionnaireRepository or equivalent.
   Do not mix SQL directly into route handlers unless the repo is already intentionally minimal.

3. Service Layer:
   QuestionnaireService handles active questionnaire fetching and response submission.
   Phq9ScoringService handles scoring and safety flag logic.

4. Strategy Pattern:
   Implement scoring as a strategy keyed by questionnaire_code.
   For Sprint 1 only phq9 is needed, but avoid hard-coding the whole system as "PHQ-9 only".
   Example:
   scoreQuestionnaire(questionnaire_code, raw_answers)
   dispatches to scorePhq9 for questionnaire_code === "phq9".

5. State Boundary:
   Response lifecycle should be conceptually:
   received -> validated -> scored -> summarized -> persisted
   For item9 positive:
   received -> validated -> scored -> review_required -> summarized -> persisted

6. Public/Internal Boundary:
   Store raw_answers and internal_score_json internally.
   Public output should be a filtered public_summary_json.

7. Transaction Boundary:
   POST /api/v1/questionnaire-responses should validate, score, summarize, and persist in one coherent operation.
   If using SQL, wrap response insert in the existing transaction mechanism if available.

8. Future Outbox Seam:
   Do not implement Redpanda in Sprint 1.
   If the repo already has an outbox table, optionally write an outbox placeholder event after successful persistence.
   If not present, leave a TODO in docs only.
   Redpanda failure must never block kiosk questionnaire completion in later sprints.

Implementation tasks:

Task A — Readiness check
- Confirm repo path.
- Confirm PHQ-9 seed JSON parses.
- Confirm scoring config parses.
- Confirm manifest parses.
- Confirm whether kiosk-web/api-server/database skeleton exists.
- If skeleton is missing, create the smallest maintainable skeleton needed to close Sprint 1.
- Only record a blocker if the repo is not writable, package manager is unusable, PostgreSQL cannot be run, or the main repo is missing.

Task B — SurveyJS kiosk rendering
- Wire SurveyJS Form Library into kiosk-web.
- Do not use Survey Creator in Sprint 1.
- Load PHQ-9 from the active questionnaire API if api-server exists.
- Acceptable fallback for D1: import local seed JSON directly.
- Do not hand-code the 9 questions as custom HTML.
- SurveyJS JSON must own the form structure.
- Render title, description, all 9 radio questions, required validation, and submit.
- Make controls touch-friendly:
  large radio/select areas, readable font, clear submit state.
- On completion, collect raw answer JSON.
- Submit raw answers to POST /api/v1/questionnaire-responses when API is available.
- Show only safe public_summary after submit.

Suggested frontend files, adapt to existing stack:
- apps/kiosk-web/src/features/questionnaire/QuestionnairePage.tsx
- apps/kiosk-web/src/features/questionnaire/SurveyJsQuestionnaireRenderer.tsx
- apps/kiosk-web/src/features/questionnaire/questionnaireApi.ts
- apps/kiosk-web/src/app/questionnaire/page.tsx
or the equivalent route used by the repo.

If using React/Next/Vite:
- Prefer survey-core + survey-react-ui.
- Import SurveyJS CSS through the repo's normal style mechanism.
- Keep the SurveyJS dependency isolated in SurveyJsQuestionnaireRenderer.

Task C — API active questionnaire
Implement GET /api/v1/questionnaires/active.

Behavior:
- Return the active PHQ-9 questionnaire.
- Use the seed file from modules/questionnaire/seed/phq9.zh-TW.surveyjs.json.
- If questionnaire_versions table exists, read the active published version from DB.
- If no DB seed exists yet, seed PHQ-9 into questionnaire_versions.
- Do not serve draft/unpublished versions to kiosk.

Task D — database persistence
Implement the minimal database contract.

Required logical tables:

questionnaire_versions:
- id
- tenant_id
- questionnaire_code
- version
- status
- surveyjs_json
- scoring_config
- published_at
- created_at

questionnaire_responses:
- id
- tenant_id
- session_id
- questionnaire_version_id
- raw_answers
- internal_score_json
- safety_flags
- public_summary_json
- completed_at

Use JSONB if PostgreSQL is used.
Use UUID primary keys if the repo already supports it.
Use the repo's existing migration naming convention.

Seed:
- Insert PHQ-9 as questionnaire_code = "phq9"
- version = "0.1.0"
- status = "published"
- surveyjs_json = contents of phq9.zh-TW.surveyjs.json
- scoring_config = contents of phq9.public-scoring-config.json

Task E — response submit route
Implement POST /api/v1/questionnaire-responses.

Request body:
- session_id
- questionnaire_code
- questionnaire_version
- raw_answers

Behavior:
1. Validate request.
2. Load questionnaire version.
3. Validate PHQ-9 answer completeness.
4. Compute score.
5. Compute safety flags.
6. Compute public summary.
7. Persist response.
8. Return response_id, safety_flags, public_summary, and internal_score if the current contract expects it.
9. Kiosk must display only public_summary.

Task F — PHQ-9 scoring service
Implement a focused scoring module.

Pseudo-logic:

requiredItems = [
  "phq9_01", "phq9_02", "phq9_03",
  "phq9_04", "phq9_05", "phq9_06",
  "phq9_07", "phq9_08", "phq9_09"
]

for each required item:
  assert value is integer 0..3

total = sum values
item9 = raw_answers.phq9_09
item9_positive = item9 > 0
requires_human_review = item9_positive

if item9_positive:
  public_status_code = "CONSULT_STAFF"
  message = "您有填答到需要進一步關心的項目，建議洽詢現場人員或醫護人員協助。"
else if total <= 9:
  public_status_code = "NORMAL_REFERENCE"
  message = "本次問卷結果可作為健康自我檢測參考，若有持續困擾，建議洽詢現場人員或醫護人員。"
else:
  public_status_code = "CONSULT_STAFF"
  message = "本次填答結果顯示有部分狀況值得進一步關心，建議洽詢現場人員或醫護人員。"

Internal bands may exist for staff/admin only.
Do not expose diagnostic labels in public UI.

Task G — sample payloads
Create sample request payloads if missing:

samples/phq9-response-low-risk.json

{
  "session_id": "sess_demo_low_risk",
  "questionnaire_code": "phq9",
  "questionnaire_version": "0.1.0",
  "raw_answers": {
    "phq9_01": 0,
    "phq9_02": 1,
    "phq9_03": 0,
    "phq9_04": 1,
    "phq9_05": 0,
    "phq9_06": 0,
    "phq9_07": 1,
    "phq9_08": 0,
    "phq9_09": 0
  }
}

samples/phq9-response-item9-positive.json

{
  "session_id": "sess_demo_item9_positive",
  "questionnaire_code": "phq9",
  "questionnaire_version": "0.1.0",
  "raw_answers": {
    "phq9_01": 0,
    "phq9_02": 0,
    "phq9_03": 0,
    "phq9_04": 0,
    "phq9_05": 0,
    "phq9_06": 0,
    "phq9_07": 0,
    "phq9_08": 0,
    "phq9_09": 1
  }
}

Task H — tests
Add tests according to the repo's test framework.

Minimum tests:
1. PHQ-9 low-risk scoring:
   total = 3
   item9_positive = false
   requires_human_review = false
   public_status_code = NORMAL_REFERENCE

2. PHQ-9 score >= 10:
   requires_human_review can remain false if item9 = 0
   public_status_code = CONSULT_STAFF
   public message is non-diagnostic

3. PHQ-9 item9 positive:
   total may be low
   item9_positive = true
   requires_human_review = true
   public_status_code = CONSULT_STAFF

4. Missing item rejects request.

5. Invalid value outside 0..3 rejects request.

6. Public summary does not include:
   憂鬱症
   中度憂鬱
   重度憂鬱
   診斷
   治療建議

Task I — validation commands
Run or create the closest repo-equivalent commands.

Planning repo:

cd /home/jnclaw/every_on_git_jnclaw/phd-life-system/planning-everything-track
python3 scripts/agenda.py today --date 2026-06-29
python3 scripts/agenda.py today --date 2026-06-30
python3 scripts/agenda.py week 2026-W27
git diff --check

Smart Health Cabin repo:

cd /home/jnclaw/every_on_git_jnclaw/phd-life-system/imedtac-smart-health-cabin-v0
jq . modules/questionnaire/seed/phq9.zh-TW.surveyjs.json >/dev/null
jq . modules/questionnaire/scoring/phq9.public-scoring-config.json >/dev/null
jq . modules/questionnaire/module.manifest.json >/dev/null
git diff --check

Runtime checks after implementation:

curl -fsS http://localhost:3000/healthz
curl -fsS http://localhost:3000/api/v1/questionnaires/active

curl -fsS -X POST http://localhost:3000/api/v1/questionnaire-responses \
  -H 'content-type: application/json' \
  --data @samples/phq9-response-low-risk.json

curl -fsS -X POST http://localhost:3000/api/v1/questionnaire-responses \
  -H 'content-type: application/json' \
  --data @samples/phq9-response-item9-positive.json

Use the actual port if the repo already uses another port.
Document the exact command used.

Task J — devlogs and planning closeout
Create or update:

docs/devlog/2026-06-29.md
docs/devlog/2026-06-30.md

D1 devlog should record:
- PHQ-9 SurveyJS seed render status
- kiosk route
- evidence
- whether all 9 items are visible
- whether submit produces raw answer JSON
- blocker if runtime skeleton was missing
- explicit note: no CMS / Avatar / Redpanda / vision / hearing work was pulled into Sprint 1

D2 devlog should record:
- answer persistence status
- total score status
- item 9 safety flag status
- public summary status
- evidence from curl/test/manual run
- blocker if PostgreSQL/storage could not run
- explicit note that public output avoids diagnostic wording

Also update planning daily notes only with outcome, blocker, and next action:
- 2026-06-29 daily note
- 2026-06-30 daily note

Do not write long essays into planning notes.
Canonical technical evidence belongs in repo devlogs.

Acceptance checklist:
Sprint 1 is done only when all of these are true:

- Updated Sprint 1 is being followed, not the old fast-march Sprint 1.
- PHQ-9 SurveyJS seed loads from modules/questionnaire/seed/phq9.zh-TW.surveyjs.json.
- Kiosk path renders PHQ-9.
- User can answer all 9 questions by touch.
- Submit produces raw answer JSON.
- Completed answers persist to PostgreSQL.
- PHQ-9 total score is computed server-side.
- phq9_09 > 0 triggers requires_human_review.
- Public summary avoids diagnostic wording.
- Raw answers/internal score are not displayed in public kiosk/report UI.
- docs/devlog/2026-06-29.md records D1 evidence or exact blocker.
- docs/devlog/2026-06-30.md records D2 evidence or exact blocker.
- Planning daily notes are updated with outcome, blocker, and next action.
- git diff --check passes.
- Relevant unit/API tests pass or exact failure/blocker is documented.

Sprint 1 is not done if:
- PHQ-9 only exists as JSON but does not render.
- PHQ-9 renders but answers cannot be captured.
- Answers are captured but not saved and no exact storage blocker is named.
- Item 9 does not produce human-review routing.
- Public output uses diagnostic labels.
- Work drifts into CMS, Avatar, Redpanda, vision, or hearing before questionnaire path is closed.

Efficiency rules:
- Make the smallest useful vertical slice.
- Prefer adapting existing repo conventions over creating new architecture.
- Do not overbuild admin CMS, event streaming, or avatar runtime.
- Keep SurveyJS behind one adapter component.
- Keep PHQ-9 scoring behind one service/strategy function.
- Keep DB writes behind repository/data-access functions.
- Avoid broad rewrites.
- Do not reformat unrelated files.
- Do not commit unless explicitly instructed by the user.
- End with a concise final report:
  1. What changed
  2. Commands run
  3. Evidence
  4. Remaining blockers
  5. Exact next action
```

## Engineering Note

這份 prompt 的核心設計是：先封住範圍，再要求 Codex 做完整 vertical slice。這樣不會掉進「看起來做很多模組，但沒有任何一條路徑真的跑通」的陷阱。

Sprint 1 的工程重點不是「問卷 JSON 做好了」而已，而是「資料從 UI 進來，經過 API、驗證、儲存、計分、安全旗標、公共摘要，再留下驗收證據」。這才叫可驗收的軟體工程成果。

`~/Downloads/survey-library-master.zip` 的正確定位是第三方依賴來源，不是主程式碼。Codex 應該先用既有 package manager；只有在 npm/pnpm 不可用或專案已經要求本地 source 時，才把它納入 `third_party/` 或 `vendor/`，並清楚記錄來源。不要把整個 SurveyJS 改成自己的 fork，除非真的有不可避開的 blocker。

Sprint 1 完成後，可以對外說的是：我們已經完成智慧健康艙第一條最小資料路徑，PHQ-9 可由 SurveyJS JSON 渲染，使用者可在 kiosk 完成填答，系統可保存答案、計算總分、處理第 9 題安全旗標，並輸出非診斷式公共摘要。這比單純展示 UI 更有系統工程價值。
