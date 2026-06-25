---
id: smart-health-cabin-sprint-3-codex-goal-prompt
title: "Sprint 3 Codex Goal Prompt"
date: 2026-06-25
topic: smart-health-cabin
type: codex-goal-prompt
status: active
source:
  - ../specs/MVP-QUESTIONNAIRE-AVATAR-SPRINT-PLAN.md
  - ./sprint-2-codex-goal-prompt.md
  - ../../modules/questionnaire/seed/phq9.zh-TW.surveyjs.json
  - ../../modules/questionnaire/scoring/phq9.public-scoring-config.json
---

# Sprint 3 Codex Goal Prompt

結論：Sprint 3 的 Codex Goal Prompt 要把任務收斂成「安全語音問卷導引層」，不是重做問卷、不是做診斷 Agent、也不是先做 Avatar 視覺。核心交付是 voice loop、agent session/turn log、PHQ-9 題目與選項朗讀、語音答案候選映射、確認後才寫入 SurveyJS 問卷狀態，並且觸控備援永遠可完成問卷。

下面這段可以直接貼進 Codex CLI。

````text
You are Codex working inside the Smart Health Cabin execution repo.

Your mission is to complete Sprint 3 of the Smart Health Cabin MVP.

Repository:

```bash
cd /home/jnclaw/every_on_git_jnclaw/phd-life-system/imedtac-smart-health-cabin-v0
```

External local inputs, only if needed:

```text
~/Downloads/survey-library-master.zip
~/Downloads/phq9_ai_agent_readable_zh-TW.md
```

Do not assume these external files are required. First inspect the repo. If SurveyJS and PHQ-9 already exist in the repo, reuse them. If `phq9_ai_agent_readable_zh-TW.md` is missing from the repo, copy it into the proper questionnaire source path, but do not rebuild the questionnaire engine.

Sprint 3 theme:

```text
ASR + LLM + TTS Voice Agent MVP
```

Sprint 3 dates:

```text
2026-07-03
2026-07-06
```

Sprint 3 goal:

```text
Create the first safe voice loop for the existing questionnaire path:

record audio
-> ASR text
-> LLM flow guidance
-> TTS audio
-> agent_turn logged
-> touch fallback remains available
```

The voice Agent must guide the existing questionnaire flow. It must not create a second questionnaire engine.

Current expected baseline from Sprint 0/1/2:

```text
PHQ-9 SurveyJS seed
-> kiosk SurveyJS render
-> touch answer capture
-> API submit
-> PostgreSQL persistence
-> backend PHQ-9 scoring
-> item 9 human-review flag
-> non-diagnostic public summary
-> report / QR path from Sprint 2
-> pending outbox row
```

Before adding Sprint 3 work, run and record baseline status:

```bash
git status --short
find . -maxdepth 3 -type f | sort | sed -n '1,240p'

jq . modules/questionnaire/seed/phq9.zh-TW.surveyjs.json >/dev/null
jq . modules/questionnaire/scoring/phq9.public-scoring-config.json >/dev/null

corepack pnpm validate:json
corepack pnpm test
git diff --check
```

If baseline tests fail, fix regressions first. Do not start Sprint 3 on top of a broken Sprint 0/1/2 path.

Hard scope rules:

Do:

```text
- microphone capture in kiosk-web;
- ASR endpoint;
- LLM flow-guidance endpoint;
- TTS endpoint;
- agent_sessions persistence;
- agent_turns persistence;
- safety system prompt;
- PHQ-9 question/options reading from active SurveyJS JSON;
- spoken-answer-to-candidate-option mapping;
- confirmation before answer write;
- touch fallback;
- devlogs for 2026-07-03 and 2026-07-06;
- tests for the new service boundaries.
```

Do not:

```text
- build polished Avatar UI yet;
- implement Redpanda;
- implement vision/hearing;
- diagnose depression;
- provide treatment advice;
- let the LLM change scoring;
- expose raw PHQ-9 answers in public report;
- auto-fill answers without explicit user confirmation;
- hard-code a second PHQ-9 question list separate from SurveyJS;
- rewrite Sprint 0/1/2 architecture unless an exact blocker is recorded.
```

System design principles:

Use a modular-monolith style unless the repo already has stronger separation. Preserve the existing app/package structure.

Use these boundaries:

```text
apps/kiosk-web
  - microphone capture UI;
  - voice status UI;
  - current question context;
  - touch fallback;
  - confirmation UX before writing answer state.

apps/api-server
  - public API routes or BFF routes for agent session/turns;
  - request validation;
  - service orchestration;
  - repository calls;
  - safety boundary enforcement.

apps/voice-agent-server
  - use if already wired;
  - otherwise keep adapter seam ready and route through api-server;
  - do not overbuild service-to-service networking if it delays Sprint 3.

packages/contracts
  - shared request/response DTOs;
  - typed agent session / turn / option candidate contracts.

packages/questionnaire-core
  - SurveyJS question extraction;
  - choice extraction;
  - question name/value mapping;
  - do not move scoring to frontend.

packages/report-core
  - preserve public wording boundary;
  - no diagnostic labels in public-facing output.

modules/questionnaire
  - source-of-truth SurveyJS seed and scoring config.
```

Use these design patterns:

```text
Adapter Pattern:
  ASRAdapter, LLMFlowGuidanceAdapter, TTSAdapter.
  Implement provider adapters only if credentials/config already exist.
  Otherwise implement deterministic mock adapters and record provider blocker.

Repository Pattern:
  AgentSessionRepository and AgentTurnRepository own database access.
  Route handlers must stay thin.

Application Service Layer:
  AgentVoiceService orchestrates ASR -> LLM -> TTS -> persistence.
  QuestionnaireVoiceGuidanceService reads active SurveyJS state and prepares question/options.

State Machine:
  voice state must be explicit:
    idle
    recording
    uploading
    transcribing
    thinking
    speaking
    confirming_answer
    error_fallback

Safety Boundary:
  LLM output is guidance only.
  Backend scoring remains authoritative.
  Confirmation is mandatory before answer write.
```

Database requirements:

Inspect existing migrations first.

If `agent_sessions` and `agent_turns` do not exist, add a new migration, for example:

```text
infra/migrations/000X_sprint3_agent_voice.sql
```

Minimal `agent_sessions` fields:

```text
id
session_key or kiosk_session_id
questionnaire_version_id
status
started_at
ended_at nullable
created_at
updated_at
metadata jsonb
```

Minimal `agent_turns` fields:

```text
id
agent_session_id
turn_index
current_question_name nullable
audio_mime_type nullable
audio_duration_ms nullable
asr_provider
asr_text
asr_confidence nullable
llm_provider
llm_prompt_version
llm_response_text
tts_provider
tts_mime_type nullable
tts_asset_ref nullable
candidate_question_name nullable
candidate_option_value nullable
candidate_option_text nullable
candidate_confidence nullable
confirmation_state
safety_flag
error_code nullable
error_message nullable
created_at
metadata jsonb
```

Prefer not to store raw audio in the database for MVP. Store metadata and provider result. If temporary audio files are needed, store them under a clearly ignored local temp path and avoid committing generated audio.

Minimal API routes:

```text
POST /api/v1/agent-sessions
POST /api/v1/agent-turns/asr
POST /api/v1/agent-turns/respond
POST /api/v1/agent-turns/tts
```

Suggested route behavior:

`POST /api/v1/agent-sessions`

Input:

```json
{
  "kiosk_session_id": "string",
  "questionnaire_version_id": "string"
}
```

Output:

```json
{
  "agent_session_id": "string",
  "status": "active"
}
```

`POST /api/v1/agent-turns/asr`

Input: multipart audio upload plus:

```json
{
  "agent_session_id": "string",
  "current_question_name": "phq9_01"
}
```

Output:

```json
{
  "agent_turn_id": "string",
  "asr_text": "幾天",
  "asr_confidence": 0.9,
  "provider": "mock|real_provider_name"
}
```

`POST /api/v1/agent-turns/respond`

Input:

```json
{
  "agent_session_id": "string",
  "agent_turn_id": "string",
  "asr_text": "幾天",
  "current_question_name": "phq9_01",
  "questionnaire_state": {}
}
```

Output:

```json
{
  "agent_turn_id": "string",
  "response_text": "我聽到您回答「幾天」。請問是否確認選擇「幾天」？",
  "action": "confirm_candidate",
  "candidate": {
    "question_name": "phq9_01",
    "option_value": 1,
    "option_text": "幾天",
    "confidence": 0.95
  },
  "requires_confirmation": true,
  "safety_flag": false
}
```

`POST /api/v1/agent-turns/tts`

Input:

```json
{
  "agent_session_id": "string",
  "agent_turn_id": "string",
  "text": "我聽到您回答「幾天」。請問是否確認選擇「幾天」？"
}
```

Output may be binary audio, a signed/local audio URL, or a JSON wrapper depending on existing repo conventions. It must be playable by kiosk-web. If no real TTS provider exists, return deterministic mock playable audio and record the blocker.

Safety system prompt:

```text
You are the Smart Health Cabin voice guide.
You help users understand questionnaire questions and interface actions.
You do not diagnose disease, provide treatment advice, or change scoring.
When the user mentions self-harm, suicide, immediate danger, or PHQ-9 item 9 is positive, guide the user to onsite staff or healthcare-professional support.
Use short, clear Traditional Chinese suitable for older adults.
```

Required public safety invariants:

```text
- PHQ-9 item 9 positive always routes to staff or healthcare-professional support.
- Voice Agent must not say the user has depression.
- Voice Agent must not tell the user what treatment to take.
- Voice Agent must not expose internal score bands to the public user.
- Public summary remains backend-owned.
- Touch fallback remains available at all times.
```

Day 1 target: 2026-07-03

Must-win:

```text
One voice loop works:
microphone -> ASR -> LLM short guidance -> TTS -> agent_turn.
```

Implement in this order:

1. Inspect existing kiosk questionnaire flow.
2. Add minimal microphone capture button near the questionnaire UI.
3. Add voice state display:
   `idle`, `recording`, `uploading`, `transcribing`, `thinking`, `speaking`, `error_fallback`.
4. Add `POST /api/v1/agent-sessions`.
5. Add `POST /api/v1/agent-turns/asr`.
6. Add ASR adapter interface.
7. Add deterministic mock ASR adapter if no real provider is configured.
8. Add `POST /api/v1/agent-turns/respond`.
9. Add LLM flow-guidance adapter interface.
10. Add deterministic mock LLM guidance if no real provider is configured.
11. Add `POST /api/v1/agent-turns/tts`.
12. Add TTS adapter interface.
13. Add deterministic playable mock TTS if no real provider is configured.
14. Add `agent_sessions` / `agent_turns` persistence.
15. Log each completed turn.
16. Confirm touch questionnaire completion still works.
17. Write `docs/devlog/2026-07-03.md`.

Day 1 acceptance:

```text
- frontend records audio or exact browser blocker is recorded;
- backend receives audio or exact blocker is recorded;
- ASR returns text;
- LLM returns short Traditional Chinese flow guidance;
- TTS returns playable audio;
- agent_turn row/log exists;
- touch fallback still completes PHQ-9;
- tests pass;
- devlog exists.
```

Day 2 target: 2026-07-06

Must-win:

```text
Voice Agent reads/explains PHQ-9, maps speech to candidate option, asks confirmation, and preserves touch fallback.
```

Implement in this order:

1. Add a SurveyJS question extraction helper.
2. Read the current PHQ-9 question from active SurveyJS JSON.
3. Read options from active SurveyJS JSON.
4. Do not hard-code a second PHQ-9 question list.
5. Add deterministic spoken-answer mapping for choices:

   * `完全沒有`, `沒有`, `零`, `0` -> value `0`;
   * `幾天`, `有幾天`, `一兩天`, `1` -> value `1`;
   * `一半以上`, `超過一半`, `2` -> value `2`;
   * `幾乎每天`, `每天`, `3` -> value `3`.
6. Use LLM only as a fallback candidate mapper or explanation generator.
7. Add confidence and ambiguity handling.
8. If mapping is ambiguous, ask the user to repeat or use touch.
9. If mapping is clear, ask confirmation:
   `我聽到您回答「{option_text}」。請問是否確認？`
10. Only after explicit confirmation, update the kiosk questionnaire state.
11. Confirmed answers must still submit through the existing Sprint 1 `POST /api/v1/questionnaire-responses` path.
12. Ensure item 9 positive does not produce diagnosis; route to staff-review wording.
13. Confirm touch fallback still completes the full PHQ-9.
14. Write `docs/devlog/2026-07-06.md`.

Day 2 acceptance:

```text
- Agent can read current PHQ-9 question;
- Agent can read answer options;
- spoken answer maps to existing SurveyJS option values 0..3;
- confirmation is required before writing answer state;
- confirmed answer updates questionnaire state;
- existing questionnaire submit route remains the only scoring/persistence path;
- item 9 positive keeps staff/healthcare-professional support wording;
- no autonomous diagnosis or treatment advice;
- touch fallback passes;
- tests pass;
- devlog exists.
```

Frontend requirements:

In `apps/kiosk-web`, implement only a minimal voice control layer.

The UI should show:

```text
- Start recording / stop recording;
- transcript text;
- assistant guidance text;
- audio playback;
- current voice state;
- candidate answer preview;
- confirm / reject buttons when a candidate answer exists;
- visible touch fallback.
```

Do not spend time on polished Avatar visuals. Avatar UI belongs to Sprint 4.

Backend requirements:

Route handlers must stay thin.

Expected layering:

```text
route
-> request schema validation
-> application service
-> adapter interface
-> repository
-> response DTO
```

Never put clinical safety rules only inside a frontend component. Safety prompt, candidate write rules, and public wording boundary must be backend-aware.

Provider strategy:

If real ASR/LLM/TTS providers are configured, use them behind adapters.

If not configured, implement deterministic mocks:

```text
MockASRAdapter:
  returns a predictable transcript for test audio or a dev override transcript.

MockLLMFlowGuidanceAdapter:
  returns short Traditional Chinese guidance.
  Must follow safety prompt.
  Must not diagnose.

MockTTSAdapter:
  returns playable mock audio or a browser-playable fallback asset.
  Must mark provider as mock.
```

Record exact provider blockers in devlog:

```text
ASR provider blocker:
LLM provider blocker:
TTS provider blocker:
Fallback used:
```

Questionnaire voice lifecycle:

```text
question read
-> user speaks
-> ASR text
-> option candidate
-> confirmation prompt
-> confirmed answer
-> questionnaire state
-> existing questionnaire submit route
```

Important: LLM may suggest candidate answer, but the system must require user confirmation before writing the answer.

Safety handling:

If ASR text or user utterance mentions:

```text
自殺
想死
不想活
傷害自己
立即危險
```

or if the current question is `phq9_09` and candidate value is greater than `0`, response must guide to onsite staff or healthcare-professional support. It must not diagnose or give treatment advice.

Suggested response wording:

```text
這個項目需要現場人員或醫護人員協助確認。我會保留您的填答，請洽現場人員協助。
```

Testing requirements:

Add or update tests for:

```text
- ASR adapter mock behavior;
- LLM safety prompt / no diagnosis wording;
- TTS mock returns playable response shape;
- agent session creation;
- agent turn persistence;
- SurveyJS current question extraction;
- PHQ-9 choice extraction;
- spoken answer mapping to values 0..3;
- ambiguous answer handling;
- confirmation required before answer write;
- item 9 positive safety handling;
- touch fallback does not regress.
```

Run:

```bash
corepack pnpm validate:json
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
git diff --check
```

If some script does not exist in the repo, do not invent success. Record the exact missing script and run the closest existing validation scripts.

Devlog files:

Create:

```text
docs/devlog/2026-07-03.md
docs/devlog/2026-07-06.md
```

Use this for `2026-07-03`:

```markdown
# 2026-07-03 Sprint 3 D1 Closeout

## Entry Baseline
- Questionnaire active-version path reused:
- Touch questionnaire fallback:

## Result
- Microphone capture:
- ASR:
- LLM flow guidance:
- TTS:
- agent_turn logging:
- Touch fallback:

## Safety
- Agent does not diagnose, treat, rescore, or auto-fill.

## Evidence
- Commands:
- Screenshots/logs:
- Files changed:

## Blocker Or Next Action
-
```

Use this for `2026-07-06`:

```markdown
# 2026-07-06 Sprint 3 D2 Closeout

## Entry Baseline
- Sprint 3 D1 voice loop reused:
- Existing SurveyJS question/options reused:

## Result
- Agent reads PHQ-9:
- Speech-to-option mapping:
- Confirmation before write:
- Touch fallback:

## Safety
- Item 9 and self-harm wording routes to onsite staff or healthcare-professional support.
- No diagnosis or treatment advice.

## Evidence
- Commands:
- Screenshots/logs:
- Files changed:

## Blocker Or Next Action
-
```

Closeout evidence to capture:

```text
- command output for validation;
- API route test output;
- one agent_session row/log;
- one agent_turn row/log;
- kiosk screenshot or console evidence for voice state;
- transcript example;
- assistant guidance example;
- TTS playable evidence;
- candidate option mapping evidence;
- confirmation-before-write evidence;
- touch fallback completion evidence.
```

Final definition of done:

Sprint 3 is complete only when:

```text
1. Sprint 2 published-version path still works.
2. Kiosk can record audio or exact browser/provider blocker is documented.
3. ASR endpoint produces text.
4. LLM guidance endpoint returns short safe Traditional Chinese guidance.
5. TTS endpoint returns playable audio or exact provider blocker plus deterministic mock.
6. agent_sessions and agent_turns persist/log turns.
7. Agent reads PHQ-9 question/options from active SurveyJS JSON.
8. Spoken answer maps to existing SurveyJS option value.
9. User confirmation is required before writing answer.
10. Confirmed answer updates kiosk questionnaire state.
11. Existing questionnaire submit route remains the only scoring/persistence path.
12. PHQ-9 item 9 positive keeps staff-review support wording.
13. Touch fallback still completes PHQ-9.
14. Public output remains non-diagnostic.
15. Tests and validation pass or exact blockers are recorded.
16. Devlogs for 2026-07-03 and 2026-07-06 exist.
```

Cut line:

If live ASR/TTS/LLM providers fail, do not block Sprint 3. Use deterministic mock adapters, preserve adapter interfaces, and record exact provider blocker. The sprint goal is the voice-agent system seam and safe questionnaire workflow, not provider perfection.

Do not silently skip failures. Either fix them or document the exact blocker and the smallest next action.

At the end, report:

```text
- what changed;
- files changed;
- validation commands and results;
- what works in demo;
- what remains blocked;
- whether Sprint 3 acceptance is fully passed or passed with provider mocks.
```
````

這個 Sprint 3 的工程重點是「把 voice 變成問卷流程的輸入/導引 adapter」，不是把 LLM 變成臨床判斷核心。正確架構是：SurveyJS 仍是題目與選項來源，backend 仍是計分與安全摘要來源，voice Agent 只負責朗讀、解釋、候選答案、確認。

最容易踩雷的地方有三個。第一，把 PHQ-9 題目另外寫一份在 voice prompt 裡，這會造成版本漂移；要從 active SurveyJS JSON 讀。第二，讓 LLM 直接寫答案；這在醫療問卷場景不可接受，必須先候選、再確認。第三，為了追求真 ASR/TTS 而卡死；Sprint 3 的系統工程價值是 adapter seam、turn log、fallback、safety boundary，provider 可以先 mock，但 blocker 必須寫清楚。
