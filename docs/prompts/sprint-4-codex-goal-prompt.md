---
id: smart-health-cabin-sprint-4-codex-goal-prompt
title: "Sprint 4 Codex Goal Prompt"
date: 2026-06-25
topic: smart-health-cabin
type: codex-goal-prompt
status: active
source:
  - ../specs/MVP-QUESTIONNAIRE-AVATAR-SPRINT-PLAN.md
  - ./sprint-2-codex-goal-prompt.md
  - ./sprint-3-codex-goal-prompt.md
  - ../../modules/questionnaire/seed/phq9.zh-TW.surveyjs.json
  - ../../modules/avatar-agent/module.manifest.json
---

# Sprint 4 Codex Goal Prompt

結論：Sprint 4 不是再做基礎建設，而是把前三個 sprint 的成果串成可展示的產品脊椎：

```text
PHQ-9 問卷 -> voice Agent -> Avatar 狀態 UI -> confirmed answer -> report / QR -> outbox -> Redpanda
```

核心設計判斷如下：

Sprint 4 要守住兩條邊界。第一，Avatar 只是 voice Agent 的可視化互動層，不是新的問卷引擎，也不能診斷、計分或自動填答。第二，Redpanda 只是 outbox 的非同步事件傳輸層，不是交易資料庫；Redpanda 掛掉時，問卷完成、報告產生、QR/public report 都必須繼續成立。

下面是可直接貼進 Codex 的主 prompt 版本。

````text
你是 Codex。請以資深 full-stack / systems engineer / systems architect 的標準，在本機直接完成 Smart Health Cabin 更新後的 Sprint 4。請實際修改檔案、執行驗證、補上測試與 devlog，最後回報 diff summary、validation evidence、E2E demo evidence、blocker 或 done status。不要只寫計畫。

# 0. Sprint 4 任務結論

Sprint 4 主題：

Avatar UI + voice-guided questionnaire + Redpanda outbox

完成線：

Sprint 2 report path still works

* Sprint 3 voice Agent turn path still works
* Avatar UI visible
* Avatar state machine visible
* at least 3 PHQ-9 answers can be voice-confirmed
* touch fallback still completes the questionnaire
* outbox rows are created after domain writes
* outbox-worker publishes to Redpanda or records an exact environment blocker
* Redpanda failure never blocks kiosk questionnaire/report completion
* E2E path reaches public report / QR
* docs/devlog/2026-07-07.md and docs/devlog/2026-07-08.md are written

This sprint is an integration sprint, not a foundation rewrite.

Avatar UI is only a visible interaction/state layer over the existing voice Agent.
Redpanda is only an asynchronous event layer over the existing transactional outbox.
Neither may replace the existing questionnaire transaction path.

# 1. Repo and local source paths

Canonical implementation repo:

/home/jnclaw/every_on_git_jnclaw/phd-life-system/imedtac-smart-health-cabin-v0

Planning repo, if needed for reference only:

/home/jnclaw/every_on_git_jnclaw/phd-life-system/planning-everything-track

Local SurveyJS source zip, available on the user machine if needed:

~/Downloads/survey-library-master.zip

First questionnaire source, available on the user machine if needed:

~/Downloads/phq9_ai_agent_readable_zh-TW.md

Rules:

1. Prefer the repo's existing package/dependency path for SurveyJS.
2. Do not vendor the whole SurveyJS upstream source unless an exact blocker proves it is required.
3. If the PHQ-9 agent-readable markdown is missing from the repo and the local file exists, copy it into the repo's existing questionnaire source path.
4. Do not rewrite PHQ-9 answer names unless every migration, test, sample, and voice mapping is updated together.

# 2. Product boundary

The active MVP is:

open questionnaire platform -> voice Agent -> Avatar UI/outbox

Vision and hearing are Phase 2 planned modules. Do not implement them in Sprint 4.

The target E2E spine is:

Admin publishes PHQ-9
-> Kiosk loads active questionnaire
-> Avatar reads question/options
-> user answers by voice
-> system maps speech to candidate SurveyJS option
-> user confirms
-> confirmed answer writes into questionnaire state
-> completed questionnaire submits through existing API
-> backend scoring and safety flag remain authoritative
-> report section created
-> QR/public report shows safe non-diagnostic summary
-> outbox row created
-> outbox-worker publishes to Redpanda
-> Redpanda Console shows event, or exact Redpanda blocker is recorded

# 3. Non-negotiable constraints

1. Do not rebuild Sprint 0/1/2/3 foundations unless a regression blocks Sprint 4.
2. Do not build a polished 3D Avatar. Sprint 4 needs a clear UI shell and visible states.
3. Do not let Avatar diagnose, score, treat, or override backend scoring.
4. Do not let LLM auto-fill an answer without explicit user confirmation.
5. Do not let Redpanda become the transactional source of truth.
6. Do not let Redpanda outage block kiosk completion, response persistence, report creation, or public report access.
7. Do not expose raw PHQ-9 answers, diagnostic labels, treatment advice, or internal score bands in public report UI.
8. Preserve touch fallback. If voice fails, the user must still complete the questionnaire by touch.
9. Use demo/local data only. Do not add real patient data handling.
10. Preserve existing user changes. No broad rename/delete/rewrite.

Forbidden public wording:

憂鬱症
中度憂鬱
重度憂鬱
診斷
治療建議

Allowed public framing:

健康自我檢測參考
建議洽詢現場人員或醫護人員
本次填答結果可作為參考
您有填答到需要進一步關心的項目，建議洽詢現場人員或醫護人員協助。

# 4. Inspect before editing

Run:

cd /home/jnclaw/every_on_git_jnclaw/phd-life-system/imedtac-smart-health-cabin-v0
pwd
git status --short
find . -maxdepth 4 -type f | sort | sed -n '1,260p'

Detect existing stack:

ls -la
find . -maxdepth 3 ( -name package.json -o -name pnpm-lock.yaml -o -name yarn.lock -o -name package-lock.json -o -name pyproject.toml -o -name requirements.txt -o -name docker-compose.yml ) -print

Inspect expected files:

apps/kiosk-web
apps/admin-web
apps/api-server
apps/voice-agent-server
apps/outbox-worker
packages/contracts
packages/questionnaire-core
packages/report-core
infra/docker-compose.yml
infra/migrations
modules/questionnaire/seed/phq9.zh-TW.surveyjs.json
modules/questionnaire/scoring/phq9.public-scoring-config.json
modules/questionnaire/module.manifest.json
modules/avatar-agent/module.manifest.json
docs/devlog/2026-06-26.md
docs/devlog/2026-06-29.md
docs/devlog/2026-06-30.md
docs/devlog/2026-07-01.md
docs/devlog/2026-07-02.md
docs/devlog/2026-07-03.md
docs/devlog/2026-07-06.md

Run baseline validation:

jq . modules/questionnaire/seed/phq9.zh-TW.surveyjs.json >/dev/null
jq . modules/questionnaire/scoring/phq9.public-scoring-config.json >/dev/null
corepack pnpm validate:json || true
corepack pnpm lint || true
corepack pnpm typecheck || true
corepack pnpm build || true
corepack pnpm test || true
git diff --check

If one validation command fails because the repo never had that script, do not invent a pass. Record the exact command and reason. If a real regression exists, fix the smallest regression needed for Sprint 4.

# 5. Sprint 4 entry gates

Before Sprint 4 implementation, verify or minimally restore:

Sprint 2 gate:

* active PHQ-9 route still works;
* completed response creates a report section;
* public report token / QR route returns safe summary;
* public report hides raw answers and diagnostic labels.

Sprint 3 gate:

* voice Agent session/turn path exists;
* ASR text can be produced by live provider or deterministic mock;
* LLM returns short flow guidance by live provider or deterministic mock;
* TTS returns playable audio by live provider or deterministic mock;
* agent_turn row/log exists;
* Agent can read current PHQ-9 question/options;
* speech-to-option mapping requires confirmation before answer write;
* touch fallback still works.

If Sprint 2/3 gates are missing:

1. Do not fake Sprint 4 completion.
2. If the missing item is a small regression, fix it as prerequisite repair and record it in Sprint 4 devlog.
3. If the missing item is too large, implement Sprint 4 pieces behind clean interfaces and record the exact blocker.
4. Final answer must clearly say complete, partial, or blocked.

# 6. Day 1: Avatar UI + voice-confirmed PHQ-9 answers

Day 1 must-win:

Avatar UI appears and supports at least three voice-confirmed PHQ-9 answers.

Preferred frontend shape, adapted to existing repo conventions:

apps/kiosk-web/src/features/avatar/
AvatarPanel.tsx
AvatarStateBadge.tsx
VoiceControlButton.tsx
VoiceAnswerConfirmation.tsx
avatarStateMachine.ts
avatarTypes.ts
useAvatarStateMachine.ts
useVoiceQuestionnaireController.ts

Do not scatter voice/Avatar state directly through page components. Keep a small state machine and a controller hook.

Canonical Avatar states:

idle -> 待命
speaking -> 說明中
listening -> 聆聽中
transcribing -> 語音辨識中
thinking -> 整理回應中
confirming_answer -> 等待確認
error_fallback -> 可改用觸控填答

Expected transitions:

idle -> speaking -> listening
listening -> transcribing -> thinking
thinking -> confirming_answer
confirming_answer -> speaking or idle after confirm
confirming_answer -> listening after retry/reject
any state -> error_fallback on ASR/LLM/TTS failure

Touch fallback remains available in every state.

Voice-guided questionnaire rules:

1. Read question name, title, and choices from the active SurveyJS model.
2. Do not create a second hard-coded PHQ-9 question engine.
3. Send current question context to the existing voice Agent path.
4. Avatar reads or explains the current question and choices in short Traditional Chinese.
5. Capture user speech.
6. Convert ASR text to candidate option value.
7. Show candidate answer visibly.
8. Ask user to confirm.
9. Only after confirmation, write value into existing questionnaire state.
10. Submit completed questionnaire through the existing Sprint 1/2 response API.

PHQ-9 option values remain:

0 = 完全沒有
1 = 幾天
2 = 一半以上的天數
3 = 幾乎每天

Deterministic speech mapping examples:

完全沒有, 沒有, 都沒有, 0 -> 0
幾天, 有幾天, 偶爾, 1 -> 1
一半以上, 一半以上的天數, 超過一半, 2 -> 2
幾乎每天, 每天, 幾乎天天, 3 -> 3

If LLM mapping exists, keep deterministic mapping as fallback or test oracle. Do not trust LLM output without validating it against available choices.

Confirmation UI must show:

* current question title;
* ASR transcript;
* candidate answer text and value;
* confirm button;
* retry / re-record button;
* touch fallback.

Confirmed answer writes into questionnaire state through the same mechanism touch answers use.

# 7. Day 2: outbox-worker + Redpanda

Day 2 must-win:

Outbox publishes questionnaire/report/agent/audit events to Redpanda, and Redpanda failure does not block kiosk completion.

Use transactional outbox:

domain write succeeds inside DB transaction
-> outbox row inserted as pending
-> API returns success
-> outbox-worker polls pending rows
-> worker publishes to Redpanda
-> worker marks row published
-> if publish fails, row remains retryable

Event types:

shc.questionnaire.response.completed.v1
shc.agent.turn.created.v1
shc.report.created.v1
shc.audit.event.created.v1

Topic mapping:

shc.questionnaire.response.completed.v1 -> shc.questionnaire.responses.v1
shc.agent.turn.created.v1 -> shc.agent.turns.v1
shc.report.created.v1 -> shc.report.events.v1
shc.audit.event.created.v1 -> shc.audit.events.v1

Event envelope:

{
"specversion": "1.0",
"id": "evt_demo_001",
"source": "shc/kiosk/kiosk_demo/questionnaire",
"type": "shc.questionnaire.response.completed.v1",
"subject": "session/sess_demo_001",
"time": "2026-07-08T10:00:00+08:00",
"tenant_id": "tenant_demo",
"kiosk_id": "kiosk_demo",
"session_id": "sess_demo_001",
"data": {
"questionnaire_code": "phq9",
"questionnaire_version": "0.1.0",
"public_status_code": "NORMAL_REFERENCE",
"safety_flag": false
}
}

The public/demo event payload should not include raw PHQ-9 answers. Prefer minimal event payload.

Reuse the existing `outbox_events` table if present. If columns are missing, add a new migration with the smallest safe extension.

Suggested fields:

id uuid primary key
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
event_type text not null
topic text not null
aggregate_type text
aggregate_id text
payload jsonb not null
status text not null default 'pending'
attempts int not null default 0
next_attempt_at timestamptz
published_at timestamptz
last_error text

Statuses:

pending
processing
published
failed

Add outbox event records after successful domain writes for:

1. questionnaire response completed;
2. report created;
3. agent turn logged;
4. audit event created.

Preferred worker shape:

apps/outbox-worker/src/index.ts
apps/outbox-worker/src/outboxWorker.ts
apps/outbox-worker/src/redpandaPublisher.ts
apps/outbox-worker/src/topicMap.ts
apps/outbox-worker/src/config.ts

Service boundaries:

OutboxRepository:

* findPending(limit)
* markProcessing(id)
* markPublished(id)
* markFailed(id, error, nextAttemptAt)

EventPublisher interface:

* publish(topic, key, payload): Promise<void>

RedpandaPublisher implements EventPublisher.
MockPublisher / InMemoryPublisher is used for tests.

Use `kafkajs` or the existing Kafka/Redpanda client if already installed. Redpanda speaks Kafka protocol.

Environment variables:

REDPANDA_BROKERS=localhost:9092
REDPANDA_CLIENT_ID=smart-health-cabin-outbox-worker
OUTBOX_POLL_INTERVAL_MS=1000
OUTBOX_BATCH_SIZE=25
OUTBOX_MAX_ATTEMPTS=10

If Redpanda is not in `infra/docker-compose.yml`, add optional local dev services:

* redpanda;
* redpanda-console.

Redpanda must be optional for API/kiosk path. API server must not require Redpanda env vars to start.

If Redpanda cannot run locally:

1. Keep outbox rows working.
2. Keep worker code and tests working with mock publisher.
3. Record exact Redpanda blocker in `docs/devlog/2026-07-08.md`.
4. Final response must say Redpanda visibility is environment-blocked, not transaction-path-blocked.

# 8. Design patterns to enforce

Adapter Pattern:

* SurveyJS behind renderer/questionnaire adapter.
* ASR/LLM/TTS behind provider adapters.
* Redpanda behind EventPublisher interface.

Repository Pattern:

* DB operations outside route handlers.
* Use repositories for responses, reports, agent turns, audit events, outbox events.

Service Layer:

* QuestionnaireService owns response submission.
* ReportService owns report creation and public filtering.
* AgentService owns agent turns and voice guidance.
* OutboxService/EventEnvelopeFactory owns event construction.

Strategy Pattern:

* PHQ-9 scoring remains questionnaire-specific strategy.
* Speech-to-option mapping should be based on current choices, not hard-coded forever.

State Machine:

* Avatar state transitions explicit and testable.
* Avoid hidden boolean soup.

Transactional Outbox:

* API writes DB and outbox row.
* Worker publishes asynchronously.

# 9. Expected routes

Preserve existing routes. Do not rename unless required.

Expected existing or minimal routes:

GET  /healthz
GET  /api/v1/questionnaires/active
POST /api/v1/questionnaire-responses
GET  /api/v1/reports/{token}/public
POST /api/v1/agent-sessions
POST /api/v1/agent-turns/asr
POST /api/v1/agent-turns/respond
POST /api/v1/agent-turns/tts

Only add new route if existing Sprint 3 route cannot support Sprint 4. Possible small addition:

POST /api/v1/agent-turns/map-answer

Prefer existing Sprint 3 respond/mapping route if present.

# 10. Tests

Add or update tests.

Frontend/unit:

* Avatar state machine transitions.
* Voice answer confirmation writes only after confirm.
* Reject/retry does not write answer.
* Error state keeps touch fallback available.
* At least 3 PHQ-9 answers can be filled through mocked voice-confirmed path.

Mapping tests:

* 完全沒有 / 沒有 / 都沒有 -> 0
* 幾天 / 有幾天 / 偶爾 -> 1
* 一半以上 / 超過一半 -> 2
* 幾乎每天 / 每天 / 幾乎天天 -> 3
* invalid transcript returns no candidate and requires retry/touch fallback
* candidate value must be one of current SurveyJS choices

Backend/service:

* questionnaire response completed creates outbox event.
* report created creates outbox event.
* agent turn logged creates outbox event.
* audit event created creates outbox event.
* event envelope has required fields.
* event type maps to expected topic.
* public event payload avoids raw PHQ-9 answers.

Outbox worker:

* pending event publishes and is marked published.
* publisher failure leaves event retryable.
* retry attempts increment.
* next_attempt_at/backoff is set or explicit retry placeholder exists.
* Redpanda publisher can be replaced by mock publisher.

Regression:

* PHQ-9 item 9 positive still requires human review.
* public report still avoids forbidden diagnostic wording.
* touch questionnaire completion still works.

# 11. Validation commands

Run whatever repo supports, but prefer:

corepack pnpm validate:json
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm build
corepack pnpm test
git diff --check

If docker compose is available:

DOCKER_CONFIG=$PWD/.local/docker-config docker compose -f infra/docker-compose.yml up -d postgres
DOCKER_CONFIG=$PWD/.local/docker-config docker compose -f infra/docker-compose.yml up -d redpanda redpanda-console || true

If migration script exists:

corepack pnpm --filter @shc/api-server migrate

If API can run locally:

curl -fsS http://localhost:3000/healthz
curl -fsS http://localhost:3000/api/v1/questionnaires/active

Demo evidence must prove:

1. kiosk loads active questionnaire;
2. Avatar state is visible;
3. Avatar can read PHQ-9 question/options;
4. at least three answers can be voice-confirmed;
5. user confirmation is required;
6. completed response still submits through existing API;
7. public report route returns safe summary;
8. outbox event exists;
9. worker publishes at least one event or exact Redpanda blocker is recorded;
10. Redpanda unavailable does not block questionnaire/report path.

# 12. Devlogs

Write `docs/devlog/2026-07-07.md`:

# 2026-07-07 Sprint 4 D1 Closeout

## Entry Baseline

* Sprint 3 voice Agent turn reused:
* Sprint 2 report path preserved:

## Result

* Avatar UI:
* Avatar states:
* Voice-confirmed PHQ-9 answers:
* Public report and touch fallback:

## Evidence

* Commands/screenshots/logs:
* Files changed:

## Blocker Or Next Action

*

Write `docs/devlog/2026-07-08.md`:

# 2026-07-08 Sprint 4 D2 Closeout

## Entry Baseline

* Sprint 4 D1 Avatar state path reused:
* Existing outbox rows / event seam reused:

## Result

* Outbox rows:
* Redpanda topics:
* Redpanda Console:
* E2E path:
* Redpanda failure behavior:

## Evidence

* Commands/screenshots/logs:
* Database rows:
* Redpanda Console event or blocker:
* Files changed:

## Blocker Or Next Action

*

Devlogs must be factual. Do not claim screenshots, Redpanda visibility, provider success, or E2E success unless actually produced.

# 13. Cut lines

Keep:

* visible Avatar UI states;
* voice-confirmed answer path for at least three PHQ-9 answers;
* touch fallback;
* safe public report;
* outbox rows;
* worker with mock publisher tests;
* Redpanda blocker documented if Redpanda cannot run.

Cut:

* 3D Avatar;
* advanced animation;
* drag-and-drop Survey Creator;
* live provider perfection;
* complex Redpanda admin tooling;
* vision/hearing;
* HIS/FHIR integration;
* production clinical validation.

# 14. Final response format

When finished, report:

1. Status: complete / partial / blocked.
2. What changed: kiosk Avatar UI, voice questionnaire integration, backend/outbox, Redpanda worker, tests, docs.
3. Validation evidence: exact commands and pass/fail results.
4. E2E evidence: what path was actually demonstrated.
5. Redpanda status: published event visible / worker code validated with mock / exact environment blocker.
6. Safety boundary: public report remains non-diagnostic and touch fallback remains available.
7. Files changed summary.
8. Next smallest action if anything remains.

Do not end with vague statements. Give exact evidence or exact blockers.
````

Sprint 4 的工程重點不是「多加功能」，而是把系統風險降下來：UI 狀態可觀察、語音填答可回退、醫療語意不越界、事件傳輸不阻塞主交易。這才是給客戶 demo 時最有說服力的完成標準。
