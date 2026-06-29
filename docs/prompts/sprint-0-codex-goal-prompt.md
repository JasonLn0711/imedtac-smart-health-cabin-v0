---
id: smart-health-cabin-sprint-0-codex-goal-prompt
title: "Sprint 0 Codex Goal Prompt"
date: 2026-06-25
topic: smart-health-cabin
type: codex-goal-prompt
status: active
source:
  - ../specs/MVP-QUESTIONNAIRE-AVATAR-SPRINT-PLAN.md
  - ../specs/MVP-FAST-MARCH-SPRINT-PLAN.md
  - ../../modules/questionnaire/seed/phq9.zh-TW.surveyjs.json
  - ../../modules/questionnaire/scoring/phq9.public-scoring-config.json
---

# Sprint 0 Codex Goal Prompt

結論：Sprint 0 的目標不是開始做完整 SurveyJS 問卷系統，而是把「問卷 + Avatar MVP」的最小工程骨架建立起來：monorepo、module registry、API skeleton、DB migration skeleton、PHQ-9 seed、local dev docs、CI skeleton，以及明確 closeout devlog。

下面是可直接貼進 Codex CLI 的版本。

```text
你是 Codex，請以資深 full-stack / systems engineer 的標準，在本機完成 Smart Health Cabin 更新後的 Sprint 0。請直接執行、修改檔案、驗證結果，最後回報 diff summary、validation evidence、blocker 或 done status。不要只寫計畫。

## 任務結論

這個 Sprint 0 不是舊版四模組 fast-march Sprint 0，也不是要直接做完整 SurveyJS 問卷產品。這是 2026-06-25 pivot 後的主線：

Phase 1 核心是「開放式問卷系統 + ASR/LLM/TTS Avatar Agent」。

Phase 2 才是 vision / hearing。Sprint 0 只保留它們的 module registry entry，不實作。

Sprint 0 完成線是：

monorepo skeleton
+ module registry
+ API skeleton
+ PostgreSQL / migration skeleton
+ PHQ-9 seed source path
+ local dev docs
+ CI skeleton
+ closeout devlog

如果無法完成，必須記錄 exact blocker。不要假裝完成。

## 已知路徑

Canonical implementation repo：

/home/jnclaw/every_on_git_jnclaw/phd-life-system/imedtac-smart-health-cabin-v0

Survey program / SurveyJS upstream reference：

~/Downloads/survey-library-master.zip

第一份問卷 source：

~/Downloads/phq9_ai_agent_readable_zh-TW.md

請優先進入 canonical implementation repo 執行。`survey-library-master.zip` 原則上視為 SurveyJS upstream/reference，不要直接把整個 SurveyJS library vendor 進本 repo。除非現有架構真的需要 patch upstream，否則 Sprint 1 再透過 dependency 或 adapter 接 SurveyJS。

若 canonical repo 不存在，不要默默在錯誤位置建立專案；請在 devlog 記錄 exact blocker。

## 執行前安全檢查

先執行：

cd /home/jnclaw/every_on_git_jnclaw/phd-life-system/imedtac-smart-health-cabin-v0
pwd
git status --short
find . -maxdepth 3 -type f | sort | sed -n '1,200p'

原則：

1. 保留既有架構與使用者未提交改動。
2. 不做大規模 rename / delete / rewrite。
3. 若已有 stack，沿用既有 stack。
4. 若沒有 stack，採用最小 TypeScript + pnpm monorepo。
5. 只新增 Sprint 0 必需的 skeleton、contract、migration、docs、CI。
6. 若某項無法完成，必須在 `docs/devlog/2026-06-26.md` 寫清楚 blocker、證據、下一步。

## 必要 repo shape

建立或驗證：

imedtac-smart-health-cabin-v0/
  apps/
    kiosk-web/
    admin-web/
    api-server/
    voice-agent-server/
    outbox-worker/
  modules/
    questionnaire/
      module.manifest.json
      seed/
        phq9.zh-TW.surveyjs.json
      scoring/
        phq9.public-scoring-config.json
      source/
        phq9.zh-TW.agent-readable.md
    avatar-agent/
      module.manifest.json
    vision/
      module.manifest.json
      README_PHASE_2.md
    hearing/
      module.manifest.json
      README_PHASE_2.md
  packages/
    contracts/
    questionnaire-core/
    report-core/
  infra/
    docker-compose.yml
    migrations/
      0001_sprint0_schema.sql
  docs/
    devlog/
      2026-06-26.md
    specs/
  .github/
    workflows/
      ci.yml
  package.json
  pnpm-workspace.yaml

若部分目錄已存在，請合併，不要建立衝突副本。

## Workspace

如果 repo 尚未有 workspace，建立：

package.json
pnpm-workspace.yaml

root scripts 至少提供：

pnpm lint
pnpm typecheck
pnpm build
pnpm test

不要加 Turborepo，除非 repo 已經在用或今天真的需要。

預設技術選擇：

* API：TypeScript + Fastify，或沿用既有 backend stack。
* Web skeleton：Vite React 或 Next.js，選 repo 已有或最少依賴者。
* Contracts：TypeScript types；若 repo 已有 Zod，可用 Zod。
* DB：Sprint 0 先用 SQL migration，不強行導入 ORM。若 repo 已有 Prisma/Drizzle，沿用既有工具。

## Module registry

`questionnaire` 是 Phase 1 core：

{
  "module_id": "questionnaire",
  "module_version": "0.1.0",
  "display_name": "開放式健康問卷系統",
  "status": "phase_1_core",
  "enabled_by_default": true,
  "can_run_standalone": true,
  "supports_admin_cms": true,
  "supports_surveyjs": true,
  "input_contract": "questionnaire_session_input.v1",
  "output_contract": "questionnaire_response.v1",
  "public_report_section": "questionnaire_public_summary.v1",
  "first_seed": "phq9.zh-TW.surveyjs.json"
}

`avatar_agent` 是 Phase 1 core placeholder：

{
  "module_id": "avatar_agent",
  "module_version": "0.1.0",
  "display_name": "語音 Avatar Agent",
  "status": "phase_1_core",
  "enabled_by_default": true,
  "can_run_standalone": false,
  "depends_on": ["questionnaire"],
  "input_contract": "agent_turn_input.v1",
  "output_contract": "agent_turn.v1",
  "capabilities": ["asr", "llm_flow_guidance", "tts", "avatar_ui_state"],
  "scope_control": "流程導引、題目與選項說明、答案確認；不做診斷或治療建議。"
}

`vision` 與 `hearing` 只標記：

status: phase_2_planned
enabled_by_default: false

並各自加 `README_PHASE_2.md`，說明等問卷 + Avatar MVP 跑通後才啟用。

## PHQ-9 source 與 seed

如果存在：

~/Downloads/phq9_ai_agent_readable_zh-TW.md

複製到：

modules/questionnaire/source/phq9.zh-TW.agent-readable.md

如果 repo 已有：

modules/questionnaire/seed/phq9.zh-TW.surveyjs.json
modules/questionnaire/scoring/phq9.public-scoring-config.json

請 validate JSON 並保留。

如果缺 seed，建立最小 PHQ-9 SurveyJS JSON：

* 9 個 required radiogroup。
* name：`phq9_01` 到 `phq9_09`。
* choices value：0、1、2、3。
* choices text：「完全沒有」、「幾天」、「一半以上的天數」、「幾乎每天」。

如果缺 scoring config，建立：

* total score：0 到 27。
* required items：`phq9_01` 到 `phq9_09`。
* `phq9_09 > 0` 時要標示 `requires_human_review` 或 `CONSULT_STAFF`。

Public report 禁止使用診斷語句，例如：

你有憂鬱症
中度憂鬱
重度憂鬱

Public report 可使用：

您有填答到需要進一步關心的項目，建議洽詢現場人員或醫護人員協助。

## API skeleton

最低要求：

GET /healthz
GET /api/v1/questionnaires/active

`GET /healthz` 回傳：

{
  "status": "ok",
  "service": "api-server",
  "version": "0.1.0"
}

`GET /api/v1/questionnaires/active` 回傳：

{
  "questionnaire_code": "phq9",
  "questionnaire_version": "0.1.0",
  "surveyjs_json_path": "modules/questionnaire/seed/phq9.zh-TW.surveyjs.json",
  "public_scoring_config_path": "modules/questionnaire/scoring/phq9.public-scoring-config.json"
}

如果很便宜，也可加：

POST /api/v1/kiosk/sessions
GET  /api/v1/kiosk/sessions/{session_id}

但不要為了 session route 阻塞 `/healthz` 與 active questionnaire route。

API 原則：

* route layer thin。
* domain / contract 放 packages。
* 不把 SurveyJS rendering 寫進 API。
* 不把 PHQ-9 public language 和 internal label 混在一起。
* error response 穩定，例如：

{
  "error": {
    "code": "SOME_ERROR",
    "message": "Human-readable message"
  }
}

## App skeleton

`apps/kiosk-web`：

* 最小可啟動頁面。
* 顯示「Smart Health Cabin Kiosk」。
* 顯示 Phase 1：Questionnaire + Avatar。
* 可加 API fetch placeholder。
* 不必完整 render SurveyJS；那是 Sprint 1。

`apps/admin-web`：

* 最小可啟動頁面。
* 顯示「Smart Health Cabin Admin」。
* 顯示 CMS / versioning 是 Sprint 2。
* 不做 JSON editor。

`apps/voice-agent-server`：

* Sprint 0 placeholder。
* README 寫明 Sprint 3 activation：ASR endpoint、LLM flow guidance、TTS endpoint、agent_turns logging。
* 不實作正式 ASR/LLM/TTS runtime。

`apps/outbox-worker`：

* Sprint 0 placeholder。
* README 寫明 Sprint 4 activation：outbox_events -> Redpanda publish。
* 不讓 Redpanda 成為 Sprint 0 blocker。

## DB / storage skeleton

建立：

infra/docker-compose.yml
infra/migrations/0001_sprint0_schema.sql

`docker-compose.yml` 至少包含 PostgreSQL：

* image：`postgres:16-alpine`
* database：`smart_health_cabin`
* local dev user/password
* volume persist
* healthcheck 若簡單可加

Migration 至少包含：

sessions
questionnaire_versions
questionnaire_responses
report_sections
report_access_tokens
outbox_events
audit_events

建議欄位：

* `id uuid primary key`
* `created_at timestamptz not null default now()`
* JSON payload 用 `jsonb`
* `questionnaire_versions` 保存 `surveyjs_json`、`public_scoring_config`、`status`、`version`
* `questionnaire_responses` 保存 `raw_answers`、`computed_score`、`requires_human_review`
* `outbox_events` 有 `status`，預設 `pending`
* `audit_events` 可記錄 actor/action/target/payload

Sprint 0 可以不接上 DB runtime，但不能沒有 schema / migration plan。

## Packages

建立最小 packages：

`packages/contracts`：

* module manifest type
* Healthz response type
* Active questionnaire response type
* Kiosk session placeholder type
* Questionnaire response placeholder type

`packages/questionnaire-core`：

* pure helper：validate PHQ-9 required item keys 或 compute score function。
* 不依賴 web framework。
* 不依賴 DB。
* 讓 Sprint 1 的 SurveyJS render/save 可以使用。

`packages/report-core`：

* placeholder 或 public report message mapping helper。
* 保持 public non-diagnostic language 與 internal scoring label 分離。

Design pattern：

* Module Registry pattern：module 由 manifest 宣告能力、phase、enabled state。
* Ports and Adapters：SurveyJS、DB、Avatar、Outbox 都透過邊界隔離。
* Outbox pattern：先把事件存在 DB，Redpanda publish 之後再啟用。
* Thin vertical slice：先通 session/questionnaire/report skeleton，再擴展 CMS、voice、vision/hearing。
* Explicit blocker：不能完成就記錄 blocker，不要假裝完成。

## Local dev docs

新增或更新 `README.md` 或 `docs/dev/LOCAL_DEV.md`，包含：

pnpm install
pnpm lint
pnpm typecheck
pnpm build
cd infra && docker compose up -d postgres
pnpm --filter api-server dev
pnpm --filter kiosk-web dev
pnpm --filter admin-web dev

若 package name 使用 scope，例如 `@shc/api-server`，請用實際名字。

README 必須說清楚：

* 怎麼啟動 PostgreSQL。
* 怎麼啟動 API。
* 怎麼啟動 kiosk/admin skeleton。
* 怎麼驗證 module manifests 與 PHQ-9 seed。
* 哪些功能是 Sprint 1/2/3/4 才做。

## CI skeleton

建立：

.github/workflows/ci.yml

至少包含：

* checkout
* setup node
* setup pnpm
* install
* lint 或 format check
* typecheck 或 build
* JSON validation

CI 不需要完美，但不能是空 workflow。

## Validation

完成後至少嘗試：

jq . modules/questionnaire/module.manifest.json >/dev/null
jq . modules/avatar-agent/module.manifest.json >/dev/null
jq . modules/vision/module.manifest.json >/dev/null
jq . modules/hearing/module.manifest.json >/dev/null
jq . modules/questionnaire/seed/phq9.zh-TW.surveyjs.json >/dev/null
jq . modules/questionnaire/scoring/phq9.public-scoring-config.json >/dev/null

test -d apps/kiosk-web
test -d apps/admin-web
test -d apps/api-server
test -f infra/docker-compose.yml

docker compose -f infra/docker-compose.yml config
pnpm install
pnpm lint
pnpm typecheck
pnpm build
git diff --check

若 API 可啟動，驗證：

pnpm --filter api-server dev
curl -fsS http://localhost:3000/healthz
curl -fsS http://localhost:3000/api/v1/questionnaires/active

若 port 不是 3000，請用實際 port，並寫入 README 與 devlog。

## Closeout devlog

建立或更新：

docs/devlog/2026-06-26.md

格式：

# 2026-06-26 Sprint 0 D2 Closeout

## Result
- Workspace skeleton:
- App skeletons:
- API `/healthz`:
- Active questionnaire route:
- PostgreSQL / migration skeleton:
- Module registry status:
- Local dev command:
- CI skeleton:

## Evidence
- Commands run:
- Command output summary:
- Files added/changed:

## Scope Control
- Phase 1 remains questionnaire + Avatar.
- Vision/hearing remain Phase 2 planned modules.
- No clinical diagnostic claim added.

## Blocker Or Next Action
-

如果驗證成功，使用：

Sprint 0 closes with the questionnaire + Avatar MVP skeleton established: module registry, app/API/storage skeleton, local dev route, and validation evidence are recorded in the Smart Health Cabin devlog.

如果未成功，使用：

Sprint 0 remains blocked by [exact blocker]. Sprint 1 cannot be called complete until the PHQ-9 render/save runtime path has a skeleton or explicit blocker.

## 最終回報格式

最後請回報：

1. Sprint 0 status: `complete` / `blocked` / `partially complete`。
2. 主要檔案變更清單。
3. 已完成的 acceptance checklist。
4. 未完成項目與 exact blocker。
5. validation commands 與結果。
6. 下一步 Sprint 1 entry gate：PHQ-9 SurveyJS render + answer save 要從哪裡開始。

不要只說「完成」。必須給 evidence。
```

## Engineering Note

貼進 Codex 後，最重要是盯兩件事：第一，它有沒有真的跑 validation；第二，它有沒有在 `docs/devlog/2026-06-26.md` 留下證據。沒有 evidence 的「完成」不算完成。
