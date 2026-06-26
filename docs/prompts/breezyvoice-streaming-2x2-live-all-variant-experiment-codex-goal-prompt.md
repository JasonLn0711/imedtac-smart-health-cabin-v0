---
id: smart-health-cabin-breezyvoice-streaming-2x2-live-all-variant-experiment-codex-goal-prompt
title: "BreezyVoice Streaming 2x2 Live All-Variant Experiment Codex Goal Prompt"
date: 2026-06-26
topic: smart-health-cabin
type: codex-goal-prompt
status: active
source:
  - ./breezyvoice-streaming-2x2-factorial-experiment-codex-goal-prompt.md
  - ../evidence/2026-06-26-breezyvoice-streaming-2x2-experiment-log.md
  - ../../scripts/tts-benchmark/README.md
---

# Codex Goal Prompt - BreezyVoice 2x2 Live All-Variant Experiment

Using FIRST PRINCIPLE, please continue inside:

```text
/home/jnclaw/every_on_git_jnclaw/phd-life-system/imedtac-smart-health-cabin-v0
```

## Goal

Actually complete the live BreezyVoice 2x2 factorial experiment for all four
variants and find the best default mode for Smart Health Cabin Avatar TTS.

This is not a deterministic smoke run. This is a real live experiment using the
local BreezyVoice runtime.

## Variants That Must Be Implemented And Actually Run

### A_original

```text
Full input text -> current BreezyVoice completed WAV response.
```

### B_segment

```text
Split text into stable sentence-like segments.
Synthesize each segment in order.
Emit/record per-segment first-audio timing.
Save final concatenated audio.
This must be a real segment-level run, not the A result relabeled.
```

### C_token

```text
Implement or expose true token/audio streaming from the BreezyVoice / CosyVoice
runtime if available in the local code.

Measure first speech token, first mel chunk, first PCM/audio chunk, and chunk
timing.

If the current local BreezyVoice code cannot expose true token/audio streaming,
inspect the upstream BreezyVoice and CosyVoice internals and either:

1. implement the smallest working local adapter that exposes real chunk-level
   audio, or
2. stop before claiming completion and record the exact source-level blocker,
   file path, function, missing API, and next patch needed.

Do not fake token streaming by splitting text into segments.
```

### D_hybrid

```text
Combine sentence segmentation with real token/audio streaming inside each
segment.

If C_token is blocked, D_hybrid is also blocked; record this dependency
explicitly.

Do not fake D by running B only.
```

## First Principle

The experiment measures when the user hears stable continuous speech, not just
total synthesis time.

The decision metric is:

```text
Fast start + smooth playback + stable content + Taiwan zh-TW pronunciation +
bounded engineering complexity.
```

## Hard Rule

Do not claim all four variants ran unless A, B, C, and D each produced their
own real output rows, event traces, and saved audio files.

If C/D cannot be made real in this session, the correct result is a documented
blocker, not a fake benchmark.

## Read First

```text
docs/prompts/breezyvoice-streaming-2x2-factorial-experiment-codex-goal-prompt.md
scripts/tts-benchmark/README.md
scripts/tts-benchmark/run_tts_matrix.py
scripts/tts-benchmark/analyze_tts_matrix.py
scripts/tts-benchmark/tts_benchmark_lib.py
apps/model-sidecars/tts-service/app.py
apps/model-sidecars/tts-service/README.md
docs/ops/LIVE_PROVIDER_RUNBOOK.md
docs/evidence/2026-06-26-breezyvoice-streaming-2x2-experiment-log.md
```

Also inspect the local BreezyVoice repo:

```text
/home/jnclaw/every_on_git_jnclaw/BreezyVoice
```

Specifically inspect:

```text
api.py
single_inference.py
any CosyVoice inference / streaming generator functions
model inference functions that yield speech tokens, mel chunks, PCM chunks, or
generator outputs
```

## Implementation Requirements

1. Keep the production `/v1/tts/synthesize` endpoint backward-compatible.
2. Add experimental endpoints or adapters only behind experiment flags.
3. Keep default voice only.
4. Do not store patient data or private audio.
5. Use only synthetic/repo-owned manifest text.
6. Save generated benchmark audio under ignored `experiments/<run_id>/audio/`.
7. Keep tracked files limited to scripts, docs, manifests, and evidence
   summaries.
8. Record local and UTC timestamps for every run.
9. Record hardware, GPU, process, port, model, commit, and worktree metadata.
10. Record `request_summary.jsonl` and `event_trace.jsonl` for every request.
11. Record per-variant latency, streaming, quality, stability, hard-gate, and
    weighted-score tables.

## Run Plan

1. Start or verify BreezyVoice upstream on port `9003`.
2. Start or verify TTS sidecar on port `8012` if needed.
3. Generate or refresh manifests:

```bash
python3 scripts/tts-benchmark/generate_manifest.py \
  --domain-profiles phq9_zh_tw,smart_cabin_measurement,kiosk_faq \
  --output experiments/manifests/tts_eval_manifest.jsonl
```

4. Run a live all-variant pilot with a small sample count:

```bash
python3 scripts/tts-benchmark/run_tts_matrix.py \
  --manifest experiments/manifests/tts_eval_manifest.jsonl \
  --variants A_original,B_segment,C_token,D_hybrid \
  --repeats 1 \
  --warmup 1 \
  --randomize true \
  --mode live \
  --limit 5 \
  --output experiments/live_tts_streaming_pilot
```

5. Fix real runtime bugs until the pilot produces valid per-variant evidence or
   a real C/D source-level blocker.
6. If pilot succeeds, run the full live matrix:

```bash
python3 scripts/tts-benchmark/run_tts_matrix.py \
  --manifest experiments/manifests/tts_eval_manifest.jsonl \
  --variants A_original,B_segment,C_token,D_hybrid \
  --repeats 10 \
  --warmup 10 \
  --randomize true \
  --mode live \
  --output experiments/$(date +%Y%m%d_%H%M%S)_breezyvoice_streaming_matrix_live
```

7. Analyze:

```bash
python3 scripts/tts-benchmark/analyze_tts_matrix.py \
  --run-dir experiments/<live_run_id> \
  --report experiments/<live_run_id>/reports/final_decision.md
```

8. Update:

```text
docs/evidence/YYYY-MM-DD-breezyvoice-streaming-2x2-live-experiment-log.md
docs/source-index.md
scripts/tts-benchmark/README.md if commands changed
```

## Decision Rule

Only variants that pass hard gates can become default.

Hard gates:

```text
failure_rate <= 0.5%
OOM_rate <= 0.1%
keyword recall >= 99%
number recall >= 99%
P95 TTFA_client <= 1500 ms
RTF p95 <= 1.0
buffer_underrun_count == 0 for accepted runs
no obvious audio truncation
no fake streaming
default voice only
touch questionnaire remains independent
```

Weighted score:

```text
FinalScore =
  0.30 * TTFA_score
+ 0.20 * P95_turn_latency_score
+ 0.15 * RTF_score
+ 0.15 * audio_quality_score
+ 0.10 * robustness_score
+ 0.05 * resource_efficiency_score
+ 0.05 * engineering_maintainability_score
```

## Expected Final Deliverables

1. Live run directory under `experiments/<live_run_id>/` with:

```text
manifest/
logs/
audio/
reports/
```

2. `final_decision.md` with:

```text
A/B/C/D comparison
hard-gate table
weighted-score table
recommended default mode
recommended fallback mode
reason for decision
```

3. Evidence markdown with:

```text
exact date/time
hardware/GPU/process/port snapshot
exact commands
sample count
repeat count
all four variant statuses
blocker details if any variant cannot run
next validation action
```

4. Updated `docs/source-index.md`.
5. Git commits separated logically:

```text
implementation changes
experiment evidence/docs
planning mirror, if planning-everything-track is also updated
```

## Validation

Run at minimum:

```bash
python3 -m py_compile scripts/tts-benchmark/*.py
python3 scripts/tts-benchmark/generate_manifest.py --help
python3 scripts/tts-benchmark/run_tts_matrix.py --help
python3 scripts/tts-benchmark/analyze_tts_matrix.py --help
corepack pnpm validate:json
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
git diff --check
```

## Completion Definition

The goal is complete only if one of these is true:

### A. Full Live Completion

All four variants A/B/C/D actually ran live, generated separate audio, event
traces, request summaries, reports, and a final best-mode decision.

### B. Source-Level Blocker Completion

A/B ran live, C/D were proven impossible in the current local BreezyVoice
runtime without deeper upstream model changes, and the blocker is documented
with exact file/function evidence and next implementation patch path.

Do not mark complete if C/D are only capability flags without source-level
investigation.

Do not mark complete if deterministic mode is used as the final result.

Do not mark complete if generated results are not recorded in evidence.
