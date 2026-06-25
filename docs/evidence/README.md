# Evidence Log Operating Standard

This folder owns experiment evidence for Smart Health Cabin runnable work.
Every experiment entry records enough context to reproduce the run, compare
later runs, and explain which validation layer the result supports.

## Required Fields For Every Experiment

Every future experiment log entry must include:

- Experiment name and purpose.
- Local date and time with timezone, plus UTC time when a tool emits UTC.
- Repo path, branch, base commit, and whether the worktree had local changes.
- Hardware and operating-system snapshot when model or voice behavior is being
  measured.
- Runtime services, ports, PIDs or container names, and log-file paths.
- Provider configuration for wakeword, ASR, LLM, TTS, reranker, broker, and any
  sidecar used by the run.
- Exact commands or scripts used for validation.
- Key structured outputs, including provider readiness, smoke results, browser
  request evidence, pass/fail counts, and any fallback state.
- Scope controls that define what the run proves and what remains for the next
  validation layer.
- Next validation action.

## Time Recording Rule

每一次實驗都要完整記錄日期與時間。The preferred format is:

```text
Local started_at: 2026-06-25T23:50:17+08:00
Local ended_at:   2026-06-25T23:50:46+08:00
UTC started_at:   2026-06-25T15:50:17Z
UTC ended_at:     2026-06-25T15:50:46Z
```

If a command output does not include timestamps, wrap the command with an
outer timestamp capture before saving the result into the evidence log.
