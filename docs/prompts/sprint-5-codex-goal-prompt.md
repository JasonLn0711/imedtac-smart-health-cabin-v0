---
id: smart-health-cabin-sprint-5-codex-goal-prompt
title: "Sprint 5 Codex Goal Prompt"
date: 2026-06-25
topic: smart-health-cabin
type: codex-goal-prompt
status: active
source:
  - ../handoff/sprint-0-4-to-sprint-5-plus-handoff.md
  - ./sprint-4.5-codex-goal-prompt.md
  - ../devlog/README.md
  - ../dev/LOCAL_DEV.md
  - ../../modules/questionnaire/seed/phq9.zh-TW.surveyjs.json
  - ../../modules/questionnaire/scoring/phq9.public-scoring-config.json
---

# Codex Goal Prompt - Smart Health Cabin Sprint 5 Live Acceptance Hardening

結論：Sprint 5 應改成 **Live Acceptance Hardening Sprint**。原本 packet
允許 `mock/live/unavailable` 混合，但這一版驗收更嚴格：
**驗收不能靠 mock；mock 只能留給單元測試或故障 fallback，不可算
Sprint 5 完成。**

下面這份可以直接貼進 Codex。

```text
You are Codex working inside the Smart Health Cabin execution repo.

Repository:

/home/jnclaw/every_on_git_jnclaw/phd-life-system/imedtac-smart-health-cabin-v0

External local source paths available on this machine:

~/Downloads/survey-library-master.zip
~/Downloads/phq9_ai_agent_readable_zh-TW.md

Primary goal:

Finish Sprint 5 as the Phase 1 live-service hardening, repeatable demo,
release-handoff, and evidence-freeze sprint.

This is not a mock demo sprint. Every real service in the Phase 1 product spine
must run live for Sprint 5 acceptance:

PostgreSQL
API server
Admin app
Kiosk app
SurveyJS questionnaire rendering
Voice agent server
ASR sidecar: faster-whisper + Breeze-ASR-26 CTranslate2 int8
LLM endpoint: local Gemma 4 E4B through vLLM OpenAI-compatible API
TTS sidecar: local BreezyVoice default voice only
Outbox worker
Redpanda
Public report route
Provider status route

Mock behavior may remain only for automated tests, local failure containment,
and degraded fallback. Mock behavior must not be counted as Sprint 5
acceptance evidence.

## Core principle

Sprint 5 must prove this path with live services:

admin publishes PHQ-9
-> kiosk loads active questionnaire
-> SurveyJS renders PHQ-9
-> static Avatar image shows voice state
-> voice Agent reads current question/options through live TTS
-> user speaks answer
-> live ASR transcribes audio
-> live LLM or deterministic live voice-agent parser maps transcript to candidate answer
-> user confirms candidate answer
-> confirmed value writes into SurveyJS questionnaire state
-> touch fallback remains available
-> response is submitted
-> backend scores PHQ-9 server-side
-> item 9 safety route is triggered when needed
-> report section is created
-> public report token / QR-ready URL is created
-> public report hides raw answers and diagnostic labels
-> outbox rows are written
-> outbox worker publishes events to live Redpanda

Do not stop at documentation. Implement, validate, and record evidence.

## Read first

Inspect the repo before changing anything.

Read these files if they exist:

docs/handoff/sprint-0-4-to-sprint-5-plus-handoff.md
docs/prompts/sprint-4.5-codex-goal-prompt.md
docs/devlog/README.md
docs/dev/LOCAL_DEV.md
docs/source-index.md
modules/questionnaire/seed/phq9.zh-TW.surveyjs.json
modules/questionnaire/scoring/phq9.public-scoring-config.json

Then run:

git status --short
find . -maxdepth 3 -type f | sort | sed -n '1,240p'

Before modifying files, identify:

1. Current app/package layout.
2. Current API framework and ports.
3. Current database migration system.
4. Current questionnaire seed and publish flow.
5. Current voice-agent implementation.
6. Current ASR/LLM/TTS provider seams.
7. Current Redpanda/outbox implementation.
8. Current validation scripts in package.json.
9. Existing docs/devlog convention.
10. Whether mock providers are currently mixed into runtime paths.

Do not rewrite the whole repo. Preserve the monorepo shape and existing Sprint
0-4.5 architecture unless a small targeted fix is necessary.

## User's non-negotiable Sprint 5 change

The previous Sprint 5 packet allowed provider states like:

live / mock / unavailable

For this run, acceptance is stricter.

Use this policy:

live = acceptable for Sprint 5 acceptance
mock = allowed only in tests or explicitly labeled degraded fallback; not acceptable as Sprint 5 completion
unavailable = blocker unless the affected path is intentionally being tested as fallback behavior
fallback = runtime safety behavior, not proof of live capability
rollback = operator/code recovery path, not normal user flow

Implement or update provider status so each provider exposes both runtime state
and acceptance eligibility.

Recommended provider status shape:

{
  "providers": {
    "asr": {
      "mode": "live",
      "acceptanceEligible": true,
      "provider": "faster-whisper",
      "model": "Breeze-ASR-26 CTranslate2 int8",
      "endpoint": "http://localhost:8011",
      "healthy": true,
      "ready": true,
      "latencyMs": 0,
      "lastError": null,
      "fallback": "touch input"
    },
    "llm": {
      "mode": "live",
      "acceptanceEligible": true,
      "provider": "vLLM OpenAI-compatible",
      "model": "Gemma 4 E4B",
      "endpoint": "http://localhost:8000/v1",
      "healthy": true,
      "ready": true,
      "latencyMs": 0,
      "lastError": null,
      "fallback": "deterministic rejection / touch input"
    },
    "tts": {
      "mode": "live",
      "acceptanceEligible": true,
      "provider": "BreezyVoice",
      "model": "default voice",
      "endpoint": "http://localhost:8012",
      "healthy": true,
      "ready": true,
      "latencyMs": 0,
      "lastError": null,
      "fallback": "text-only question display"
    },
    "redpanda": {
      "mode": "live",
      "acceptanceEligible": true,
      "brokers": "localhost:9092",
      "healthy": true,
      "ready": true,
      "lastPublishOk": true,
      "lastError": null,
      "fallback": "outbox rows remain pending and retryable"
    }
  },
  "sprint5Acceptance": {
    "allRequiredLive": true,
    "eligible": true
  }
}

If the existing route already has a different schema, minimally extend it
instead of breaking existing consumers. Add acceptanceEligible and
sprint5Acceptance if practical.

## Architecture rules

Keep the existing architecture:

apps/api
apps/kiosk
apps/admin
apps/voice-agent-server
packages/*
modules/questionnaire
modules/avatar-agent
storage/migrations
workers/outbox-worker
docs/*

If the exact layout differs, follow the repo's actual layout.

Use these design patterns:

1. Ports and adapters for ASR / LLM / TTS providers.
2. Circuit breaker / timeout / retry boundary around live providers.
3. Backend scoring as source of truth.
4. Event outbox pattern for Redpanda.
5. Idempotent submission and publishing where already designed.
6. Zod or equivalent schema validation at API boundaries.
7. State machine for Avatar/voice UI state if xstate is already present.
8. Explicit feature flags, but do not use feature flags to hide missing live
   services during acceptance.
9. JSON structured logs for operators.
10. Clear separation between clinical-safe public output and internal/admin
    evidence.

## Scope boundaries

Do not implement:

Avatar animation
lip-sync
viseme mapping
Live2D
3D Avatar SDK
customized TTS voice
reference audio
speaker embedding
voice cloning
vision module
hearing module
production HIS integration
FHIR production write-back
clinical diagnosis
treatment advice
real patient data workflow

Sprint 5 is about making the current questionnaire + static Avatar + live
voice provider + report + outbox path repeatable and handoff-ready.

## Live provider requirements

### ASR

Use:

faster-whisper
Breeze-ASR-26
CTranslate2 int8
Python FastAPI sidecar

Expected sidecar behavior:

GET /healthz      -> process is alive
GET /readyz       -> model path exists and model is loaded or loadable
POST /transcribe  -> accepts audio file/blob and returns transcript JSON

Expected transcript response shape, adjusted to existing repo conventions:

{
  "text": "好幾天",
  "language": "zh",
  "segments": [],
  "confidence": null,
  "provider": "faster-whisper",
  "model": "Breeze-ASR-26 CTranslate2 int8",
  "mode": "live"
}

Do not fake transcripts for Sprint 5 acceptance.

If no Breeze-ASR-26 int8 model path is configured, add clear .env.example
variables and fail the live acceptance check with a precise blocker.

Suggested env names:

ASR_PROVIDER=live
ASR_SERVICE_URL=http://localhost:8011
ASR_MODEL_PATH=/absolute/path/to/breeze-asr-26-ct2-int8
ASR_DEVICE=cuda
ASR_COMPUTE_TYPE=int8
ASR_LANGUAGE=zh
ASR_REQUEST_TIMEOUT_MS=30000

Do not download large models unless the repo already has an approved script and
the operator explicitly runs it.

### LLM

Use:

local Gemma 4 E4B
vLLM OpenAI-compatible server

Expected live check:

GET /v1/models
POST /v1/chat/completions

The voice-agent-server must call the live vLLM endpoint for language
interpretation when needed.

The LLM must never produce diagnosis, treatment advice, or autonomous clinical
interpretation. Its role is limited to:

read/phrase questionnaire interaction
map user transcript to a questionnaire option candidate
ask for confirmation
handle retry/reject
produce structured JSON only where possible

Suggested env names:

LLM_PROVIDER=live
VLLM_BASE_URL=http://localhost:8000/v1
VLLM_MODEL=gemma-4-e4b
LLM_REQUEST_TIMEOUT_MS=30000
LLM_TEMPERATURE=0

If model name differs, discover it from /v1/models and document the actual
value.

### TTS

Use:

local BreezyVoice
default voice only
Python FastAPI sidecar

Expected sidecar behavior:

GET /healthz
GET /readyz
POST /synthesize

Expected output:

audio/wav or audio/mpeg
non-empty playable audio
default voice only

Reject or ignore these fields if present:

reference_audio
speaker_embedding
custom_voice_id
voice_clone
speaker_wav
prompt_wav

Suggested env names:

TTS_PROVIDER=live
TTS_SERVICE_URL=http://localhost:8012
TTS_VOICE=default
TTS_REQUEST_TIMEOUT_MS=30000

### Redpanda

Redpanda must be live for acceptance.

Required evidence:

topic exists or is created by worker/startup script
outbox row is written after questionnaire/report/agent/audit action
worker publishes at least one event to Redpanda
published event has expected topic/key/payload shape
if Redpanda is temporarily unavailable, API still completes and outbox row remains retryable

Suggested env names:

REDPANDA_BROKERS=localhost:9092
OUTBOX_WORKER_ENABLED=true
OUTBOX_POLL_INTERVAL_MS=1000
OUTBOX_MAX_RETRIES=10

Do not make the questionnaire submit path synchronously depend on Redpanda.

## SurveyJS and PHQ-9 requirements

The first questionnaire is PHQ-9.

Use the repo's existing seed if it is already correct. If the seed is missing,
incomplete, or inconsistent with the current questionnaire system, read:

~/Downloads/phq9_ai_agent_readable_zh-TW.md

Convert or repair it into the repo's SurveyJS seed format, likely:

modules/questionnaire/seed/phq9.zh-TW.surveyjs.json

Required PHQ-9 behavior:

9 items
4 answer options per item
0-3 scoring values
server-side score calculation
item 9 positive safety flag when value > 0
public report is non-diagnostic
admin/internal route may retain score evidence
public route must not expose raw item answers

If SurveyJS library integration is missing or broken, inspect:

~/Downloads/survey-library-master.zip

Use it only if needed. Prefer existing package dependencies if already working.

If copying from the zip is necessary:

1. Do not overwrite app code blindly.
2. Preserve license and source attribution.
3. Vendor only what is needed.
4. Prefer package-level integration over copying random files into app
   components.
5. Keep SurveyJS behind a questionnaire renderer adapter so the app is not
   tightly coupled to raw library internals.

## Public safety rules

Public report must not contain:

raw PHQ-9 answers
internal score band
憂鬱症
中度憂鬱
重度憂鬱
診斷
治療建議
autonomous clinical recommendation

Public report may contain carefully bounded wording such as:

健康自我檢測參考
需要進一步關心的項目
建議洽詢現場人員或醫護人員
本結果僅供現場健康服務流程參考

Item 9 positive must route to staff / healthcare-professional support language.

Do not let the LLM generate the final public safety wording freely. Use
governed templates or strict schema validation.

## Fallback vs rollback

Implement and document both.

Fallback means runtime failure isolation:

ASR failure -> user can still answer by touch
LLM failure -> candidate answer is rejected safely; user can retry or use touch
TTS failure -> question/options remain visible as text
Redpanda failure -> API/report succeeds; outbox remains pending
Avatar image missing -> placeholder SVG loads

Fallback must be visible to the operator and user where appropriate. Fallback
must not be counted as live acceptance evidence.

Rollback means operator recovery:

return to last known good commit/tag
disable live provider feature flag for degraded local development only
restart sidecars
re-run migrations only through safe migration path
preserve submitted responses and outbox rows
do not delete data to recover from provider failure

Add or update a rollback/runbook doc if none exists.

Recommended file:

docs/ops/ROLLBACK_AND_FALLBACK.md

## Sprint 5 Day 1 work

Goal:

A reviewer can run the live demo path repeatedly, see provider status,
understand role boundaries, and verify safe fallback behavior.

Tasks:

1. Run baseline validation:

corepack pnpm validate:json
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm build
corepack pnpm test
git diff --check

2. Add or repair live provider status route.

Required route, adjusted to existing API conventions:

GET /api/v1/providers/status

It must check:

ASR sidecar health and readiness
LLM vLLM /v1/models and minimal completion
TTS sidecar health and readiness
Redpanda broker / topic / publish readiness if practical
outbox worker status if available

3. Add or repair live provider check script.

Suggested command:

corepack pnpm live:check

The command should fail non-zero if any required Sprint 5 provider is not live.

4. Verify static Avatar.

Acceptance:

static image path resolves
placeholder SVG exists if configured image is missing
voice state labels render
no animation or lip-sync work is introduced

5. Replay live E2E path.

Required path:

admin publish PHQ-9
kiosk load active PHQ-9
live TTS reads at least 3 questions/options
live ASR transcribes at least 3 spoken answers
live voice-agent maps each transcript to a candidate answer
user confirms each candidate answer
confirmed answers write into questionnaire state
remaining items can be completed by touch
submit response
backend scores response
item 9 safety path works when tested
public report URL returns safe summary
outbox row exists
outbox worker publishes to live Redpanda

6. Test fallback without treating it as success evidence.

Required fallback tests:

ASR unavailable -> touch fallback remains usable
TTS unavailable -> text remains usable
LLM invalid response -> no answer is written without confirmation
Redpanda unavailable -> response/report succeeds and outbox remains retryable

7. Add or refresh automated tests for:

public report hides raw answers
public report hides diagnostic wording
item 9 positive uses staff/healthcare support wording
voice candidate answer requires confirmation before write
reject/retry does not write answer
provider status marks mock as acceptanceEligible=false
Sprint 5 live check fails when provider is mock/unavailable
Redpanda failure does not block API response

8. Write D1 devlog.

Use repo convention. If packet dates are already used, write:

docs/devlog/2026-07-09.md

If repo convention requires actual execution date, use the next correct Sprint
5 devlog filename and clearly title it Sprint 5 D1 Closeout.

Include:

entry baseline
validation commands/results
provider status JSON summary
live E2E result
fallback tests
files changed
blockers
next smallest action

## Sprint 5 Day 2 work

Goal:

Another engineer can rebuild the live local demo, replay evidence, understand
service ownership, and know exactly what Phase 2 activates.

Tasks:

1. Update local deployment docs.

Document how to start:

PostgreSQL
API
kiosk
admin
voice-agent-server
ASR sidecar
vLLM Gemma 4 E4B
BreezyVoice sidecar
Redpanda
outbox worker

Recommended files, adjusted to existing repo structure:

docs/dev/LOCAL_DEV.md
docs/ops/LIVE_PROVIDER_RUNBOOK.md
docs/ops/ROLLBACK_AND_FALLBACK.md

2. Update .env.example.

Must include:

DATABASE_URL
API_BASE_URL
PUBLIC_REPORT_BASE_URL
STATIC_AVATAR_IMAGE_PATH
VOICE_AGENT_SERVER_URL

ASR_PROVIDER=live
ASR_SERVICE_URL
ASR_MODEL_PATH
ASR_DEVICE
ASR_COMPUTE_TYPE
ASR_LANGUAGE
ASR_REQUEST_TIMEOUT_MS

LLM_PROVIDER=live
VLLM_BASE_URL
VLLM_MODEL
LLM_REQUEST_TIMEOUT_MS
LLM_TEMPERATURE

TTS_PROVIDER=live
TTS_SERVICE_URL
TTS_VOICE=default
TTS_REQUEST_TIMEOUT_MS

REDPANDA_BROKERS
OUTBOX_WORKER_ENABLED
OUTBOX_POLL_INTERVAL_MS

SPRINT5_REQUIRE_LIVE_PROVIDERS=true
ALLOW_MOCK_PROVIDERS=false

If existing env names differ, preserve existing names and add aliases only if
needed.

3. Write API summary.

Recommended file:

docs/api/API_SUMMARY.md

Cover:

GET /healthz
GET /api/v1/questionnaires/active
admin questionnaire template/list/create/publish routes
questionnaire response submit route
public report token route
agent session route
agent turn route
ASR/respond/TTS orchestration routes if exposed
provider status route
outbox worker entry

4. Write DB relationship summary.

Recommended file:

docs/db/ERD_SUMMARY.md

Cover:

questionnaire_templates
questionnaire_versions
questionnaire_responses
questionnaire_response_answers if present
agent_sessions
agent_turns
report_sections
public_report_tokens
outbox_events
audit_events

If exact table names differ, use actual table names.

5. Write Phase 2 activation plan.

Recommended file:

docs/phase2/ACTIVATION_PLAN.md

Phase 2 lanes:

Provider validation:
- ASR Mandarin / Taiwanese / mixed speech smoke set
- noisy environment testing
- latency and confidence routing
- LLM structured-output validation
- TTS latency and intelligibility validation

Questionnaire expansion:
- additional questionnaire schema format
- scoring config governance
- versioning and publish approval
- public wording review

Vision/hearing activation:
- keep deferred from Phase 1
- define device/calibration requirements
- define non-diagnostic wording
- define regulatory and clinical validation gates

Integration/governance:
- no production HIS write-back until approved
- audit trail
- data minimization
- role boundary
- security review

6. Create five-run live demo evidence table.

Recommended file:

docs/evidence/sprint-5-five-run-demo.md

Each run must record:

run number
timestamp
git commit
provider status
admin publish result
kiosk load result
live TTS result
live ASR result
live LLM/voice-agent result
3 voice-confirmed answers result
touch completion result
submit response result
public report URL result
item 9 safety result where applicable
outbox row result
Redpanda publish result
fallback test result
overall pass/fail
exact blocker if failed

Sprint 5 is complete only if five consecutive runs pass with required providers
live, or the final response clearly marks Sprint 5 as blocked with the exact
failed gate.

7. Write D2 devlog.

Use repo convention. If packet dates are already used, write:

docs/devlog/2026-07-10.md

Include:

deployment docs updated
env/provider setup updated
API summary done
DB summary done
known limitations written as positive scope controls
Phase 2 activation plan done
five-run evidence status
remaining blockers
last sprint recommendation

## Validation commands

At minimum, run:

git status --short
corepack pnpm validate:json
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm build
corepack pnpm test
git diff --check

Add and run live smoke commands if implemented:

corepack pnpm live:check
corepack pnpm smoke:api
corepack pnpm smoke:e2e
corepack pnpm smoke:redpanda

If existing script names differ, use existing names and document exact
commands.

Also run HTTP smoke checks with actual ports:

curl -fsS http://localhost:3000/healthz
curl -fsS http://localhost:3000/api/v1/questionnaires/active
curl -fsS http://localhost:3000/api/v1/providers/status

If API port differs, use actual port.

## Implementation strategy

Work in small safe increments.

Recommended order:

1. Inspect repo and current sprint docs.
2. Run baseline validation and record failures.
3. Fix only blockers that prevent Sprint 5 acceptance.
4. Add live provider status and live-check script.
5. Ensure ASR/LLM/TTS adapters are live-capable and not hardwired to mock.
6. Ensure mock providers are test/degraded only.
7. Ensure voice path still requires confirmation before writing answer.
8. Ensure PHQ-9 backend scoring and item 9 safety path still work.
9. Ensure public report filtering still works.
10. Ensure Redpanda publish path works and remains nonblocking.
11. Add fallback/rollback docs.
12. Add API/DB/deployment docs.
13. Run five-run evidence.
14. Write devlogs.
15. Final self-audit.

## Do not hide blockers

If a live model or service cannot start because the machine lacks model files,
GPU memory, package dependencies, or local service configuration, do not
silently switch to mock and call Sprint 5 complete.

Instead:

1. Keep the app from crashing through fallback.
2. Mark the provider as not acceptance eligible.
3. Record exact blocker.
4. Record exact command that failed.
5. Record exact missing path/port/package/env var.
6. Mark final status as blocked or partial.

## Final acceptance criteria

Sprint 5 is complete only when all are true:

PostgreSQL live
API live
admin live
kiosk live
SurveyJS PHQ-9 live
voice-agent-server live
ASR live through faster-whisper + Breeze-ASR-26 int8
LLM live through local Gemma 4 E4B on vLLM
TTS live through BreezyVoice default voice
Redpanda live
outbox worker live
provider status route reports all required services live and acceptance eligible
touch path completes PHQ-9
voice path confirms at least 3 answers using live ASR/TTS/LLM path
backend scores PHQ-9 server-side
item 9 positive routes to staff/healthcare support wording
public report hides raw answers and diagnostic wording
outbox event is written
worker publishes to Redpanda
fallback tests pass without being counted as live acceptance
five consecutive demo runs pass or exact blocker is recorded
release docs are updated
Phase 2 activation plan is explicit
all validation commands pass or exact blockers are documented

## Final response format

Return exactly this structure:

# Sprint 5 Result

## Status
complete / partial / blocked

## What Changed
- file:
  - change:

## Validation Commands
| Command | Result | Notes |
| --- | --- | --- |
|  |  |  |

## Live Provider Matrix
| Service | Mode | Acceptance Eligible | Evidence | Fallback |
| --- | --- | --- | --- | --- |
| PostgreSQL |  |  |  |  |
| API |  |  |  |  |
| Admin |  |  |  |  |
| Kiosk |  |  |  |  |
| ASR |  |  |  |  |
| LLM |  |  |  |  |
| TTS |  |  |  |  |
| Redpanda |  |  |  |  |
| Outbox worker |  |  |  |  |

## E2E Evidence
- Admin publish:
- Kiosk load:
- Live TTS:
- Live ASR:
- Live LLM/voice-agent:
- 3 voice-confirmed answers:
- Touch fallback:
- Submit:
- Backend scoring:
- Item 9 safety:
- Public report:
- Outbox:
- Redpanda publish:
- Five-run result:

## Public Safety Boundary
- Raw answers hidden:
- Diagnostic wording absent:
- Item 9 support wording:
- LLM constrained:

## Fallback / Rollback
- Runtime fallback implemented:
- Operator rollback documented:
- Data preservation:

## Remaining Blockers
- blocker:
  - evidence:
  - next smallest action:

## Last Sprint Recommendation
- evidence-freeze / stakeholder handoff / narrow blocker burn-down:
```

## Key Change From Previous Sprint 5 Packet

This version makes one acceptance rule explicit:

```text
mock != Sprint 5 acceptance
```

Mock remains useful for tests and degraded fallback, but a Sprint 5 completion
claim requires live services or an explicit `partial` / `blocked` result with
the exact failed live gate.
