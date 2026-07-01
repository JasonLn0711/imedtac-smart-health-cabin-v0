# AGENTS.md

This folder is the execution and source workspace for the 慧誠智醫（imedtac
Co., Ltd.）Smart Health Cabin collaboration lane.

## Mission

Preserve and develop the materials needed to evaluate, scope, and eventually
implement the Smart Health Cabin collaboration project: hearing, vision,
questionnaire, Avatar interaction, integrated report, QR report access,
structured export, and future HIS-ready interface planning.

## Ownership

- This folder owns Smart Health Cabin source copies, meeting records,
  feasibility notes, module discovery notes, questionnaire-source analysis,
  MVP scope, and future handoff material.
- `../imedtac-ai-triage-kiosk-v0` owns the separate AI Triage demo lane and its stable
  imedtac-facing demo API history.
- `../planning-everything-track` owns capacity, priority, status, project
  locators, and day-note mirrors.

## Scope Controls

- Treat Smart Health Cabin as a distinct cooperation project, not as a feature
  inside `imedtac-ai-triage-kiosk-v0`.
- Keep the first release in screening support, health measurement summary,
  public-health risk self-assessment, and human-review workflow language.
- Do not present this folder as a production clinical product, diagnosis
  system, treatment system, medical-device validation package, or live HIS
  integration.
- Do not store real patient data, credentials, private API tokens, production
  HIS details, or unredacted private links in tracked files.
- Keep patent-sensitive method details internal unless Prof. Wu / Tomi clear a
  sharing path.
- Keep customer module choice visible: hearing, vision, questionnaire, and
  Avatar interaction should each state what they produce, what they consume,
  and how they can be enabled without forcing the other modules.
- Treat Kafka or Kafka-like infrastructure as an activation gate, not a default.
  Start from a small module event/report envelope and add heavier streaming only
  when replay, multiple consumers, ordering, or deployment scale requires it.

## Writing Method

Use affirmative, product-minded writing:

```text
capability -> workflow value -> evidence/source control -> human-review or
screening-support boundary -> next decision
```

For company-facing material, lead with what the project can own and what the
next decision is. State safety and validation boundaries as design controls,
not apologies.

For boss-facing or operator-facing quotation packets, use a confident executive
decision voice. Remove internal coaching phrases such as "recommended message
to Prof. Wu", "talking point", or "negotiation bottom line" from the released
version. Write scope controls as included capabilities, operating focus,
decision options, and separately activated work packages; avoid defensive or
negation-led phrasing.

Before release, rewrite human-facing documents away from 否定語氣、防守語氣,
and 防衛語氣. Lead with the active service, retained rights, included work
packages, activation gates, and next decision; express limits as positive scope,
separate work packages, validation layers, and stewardship commitments. Preserve
exact source quotes and legal / safety wording when precision requires it.

## Evidence Log Method

Every experiment log must record the date, local time, timezone, command,
environment or port context, hardware/runtime context, and outcome for each
experiment or check. For repeated runs, record each run separately with its own
timestamp, session ID or run ID, input, output, and acceptance result. Use
Taiwan local time (`Asia/Taipei`, UTC+08:00) unless a source timestamp is
explicitly UTC.

## BreezyVoice And TTS Experiment Rules

- `serial_fallback` is allowed only as a baseline.
- Batch harness completion is not experiment completion.
- C/D streaming cannot be faked by `StreamingResponse(BytesIO(full_wav))`.
- True batch requires `true_model_batch` or `true_parallel_workers`.
- True parallel workers must dispatch segment jobs before the first segment
  fully completes, and the event trace must show overlapping or concurrently
  dispatched work.
- True streaming requires `first_speech_token`, `first_pcm_chunk`, and at
  least one non-final PCM/audio chunk before full utterance completion.
- Smoke tests, deterministic runs, source-level blocker reports, and batch
  harnesses are preflight or infrastructure evidence only.
- If the target runtime is blocked, status must be `BLOCKED_UNRESOLVED`.
- If only serial fallback runs for a target-runtime task, status must be
  `BLOCKED_UNRESOLVED`, not goal complete.
- Final decision reports are reserved for valid target-runtime live
  experiments. Use `blocked_unresolved_report.md` when the target runtime is
  blocked.
- Every BreezyVoice/TTS experiment goal prompt should start with:

```text
Read and obey ~/.codex/AGENTS.md and this repo's AGENTS.md. In this task,
serial_fallback, batch harness, smoke tests, and source-level blocked reports
are not completion. They are baselines or preflight only. The task is complete
only if the live experiment runs with the target runtime, or else final status
must be BLOCKED_UNRESOLVED.
```

## Taiwan zh-TW Product Voice

For durable docs, agent plans, kiosk UI, Avatar speech, and company-facing
handoff notes, write in Taiwan Traditional Chinese when the reader or user
surface is zh-TW. Use terms and phrasing familiar in Taiwan healthcare and
service settings, such as `現場人員`, `健康檢測`, `問卷填答`, `檢測結果`,
`QR Code`, `觸控填答`, `重新錄音`, `協助確認`, and `人員覆核`.

Use a confident, generous, positive-scope tone: lead with what the system can
do, how the workflow continues, which evidence supports it, and what the next
confirmation layer owns. For user-facing copy, prefer service-continuity
phrasing such as `觸控填答可接續完成`, `請確認最接近的選項`,
`現場人員會協助確認`, and `系統已整理成候選答案`. Keep clinical and safety
boundaries as workflow controls, confirmation steps, and human-review paths.

For Taiwan-facing quotation documents intended for teachers, bosses, operators,
or company decision-makers, use Traditional Chinese with Taiwan business terms:
`新臺幣`, `健康量測站`, `維運`, `驗收`, `另案啟動`, `營運導入`, and
`決策建議`. Prefer affirmative headings such as `合作案定位`, `價格依據`,
`版本比較`, `另案啟動項目`, and `建議決策`.

## File Routing

- `source/`: copied evidence, meeting transcripts, LINE/Gmail/Teams records,
  requirement packages, and agent-readable source files.
- `workstreams/`: interpreted discovery notes, MVP scope, feasibility logic,
  module plans, decision logs, and reusable internal analysis.
- `handoff/`: future cleared company-facing or Prof. Wu-facing drafts.
- `docs/`: repo-level indexes, source maps, and operating policies.
- `decisions/`: dated decisions once project scope, repo strategy, or delivery
  commitments are fixed.

## Git Rules

- Keep this project separate from `../imedtac-ai-triage-kiosk-v0` commits.
- Do not push to GitHub without explicit confirmation.
- If planning is updated in the same work session, commit this folder and
  `../planning-everything-track` separately.
