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
