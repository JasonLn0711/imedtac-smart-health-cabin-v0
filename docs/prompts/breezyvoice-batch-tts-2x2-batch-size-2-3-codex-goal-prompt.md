---
id: smart-health-cabin-breezyvoice-batch-tts-2x2-batch-size-2-3-codex-goal-prompt
title: "BreezyVoice Batch TTS 2x2 Batch Size 2 And 3 Codex Goal Prompt"
date: 2026-06-26
topic: smart-health-cabin
type: codex-goal-prompt
status: active
source:
  - ./breezyvoice-unblock-cd-true-streaming-runtime-codex-goal-prompt.md
  - ./breezyvoice-streaming-2x2-factorial-experiment-codex-goal-prompt.md
  - ./breezyvoice-streaming-2x2-live-all-variant-experiment-codex-goal-prompt.md
  - ../evidence/2026-06-26-breezyvoice-true-streaming-runtime-unblock-log.md
  - ../../scripts/tts-benchmark/README.md
---

# Codex Goal Prompt - BreezyVoice Batch TTS 2x2 Experiment, Batch Size 2 And 3

Using FIRST PRINCIPLE, continue inside:

```text
/home/jnclaw/every_on_git_jnclaw/phd-life-system/imedtac-smart-health-cabin-v0
```

This goal extends the existing BreezyVoice ABCD streaming experiment with batch
TTS runs.

The correct next objective is:

```text
Run the same 2x2 streaming experiment again with batch TTS:

batch_size = 2:
  Group 5  = E_batch2_original
  Group 6  = F_batch2_segment
  Group 7  = G_batch2_token
  Group 8  = H_batch2_hybrid

batch_size = 3:
  Group 9  = I_batch3_original
  Group 10 = J_batch3_segment
  Group 11 = K_batch3_token
  Group 12 = L_batch3_hybrid
```

## Why This Goal Exists

The prior experiment answers single-request latency and streaming behavior.
Batch TTS answers a different product/runtime question:

```text
When the Smart Health Cabin backend has multiple pending TTS requests, can small
micro-batches improve throughput while keeping first audible audio, fairness,
Taiwan zh-TW pronunciation, and Avatar turn flow within product gates?
```

Batch TTS is an optimization layer. It does not replace the existing ABCD
streaming validity rules.

## Non-Negotiable Rule

Batching must be measured as batching, not as relabeled single-request work.

Every batch run must record:

- `batch_id`
- `batch_size_configured`
- `batch_size_actual`
- `batch_formation_start`
- `batch_formation_end`
- `batch_dispatch_start`
- `batch_dispatch_end`
- per-item request timing
- per-item first audio timing
- per-item saved audio path
- per-item status

C/D-derived groups remain valid only when true token/audio streaming is already
valid:

```text
G_batch2_token and K_batch3_token require valid C_token.
H_batch2_hybrid and L_batch3_hybrid require valid D_hybrid.
```

If C/D true streaming is still blocked, run E/F and I/J only, then record
G/H/K/L as:

```text
BLOCKED_BY_TRUE_STREAMING_RUNTIME
```

Do not fill G/H/K/L with segment-only output.

## Status Vocabulary

Use only these status labels:

- `PREFLIGHT_ONLY`
- `BATCH_IMPL_IN_PROGRESS`
- `BATCH2_MINIMUM_COMPLETED`
- `BATCH3_MINIMUM_COMPLETED`
- `BATCH2_BATCH3_COMPLETED`
- `PARTIAL_C_D_BLOCKED`
- `BLOCKED_UNRESOLVED`

## Read First

```text
docs/prompts/breezyvoice-unblock-cd-true-streaming-runtime-codex-goal-prompt.md
docs/prompts/breezyvoice-streaming-2x2-factorial-experiment-codex-goal-prompt.md
docs/prompts/breezyvoice-streaming-2x2-live-all-variant-experiment-codex-goal-prompt.md
scripts/tts-benchmark/README.md
scripts/tts-benchmark/run_tts_matrix.py
scripts/tts-benchmark/tts_benchmark_lib.py
scripts/tts-benchmark/analyze_tts_matrix.py
apps/model-sidecars/tts-service/app.py
docs/evidence/2026-06-26-breezyvoice-true-streaming-runtime-unblock-log.md
```

## Experiment Design

This is a controlled extension of the same 2x2 design.

Base factors:

- segment-level generator streaming
- token/audio streaming

New controlled factor:

- batch size

Run batch size 2 first. Run batch size 3 second, using the same manifest,
randomization seed family, logging schema, hard gates, and analysis report
shape.

### Batch Size 2 Groups

| Group | Variant id | segment streaming | token/audio streaming | batch size |
| ---: | --- | ---: | ---: | ---: |
| 5 | `E_batch2_original` | 0 | 0 | 2 |
| 6 | `F_batch2_segment` | 1 | 0 | 2 |
| 7 | `G_batch2_token` | 0 | 1 | 2 |
| 8 | `H_batch2_hybrid` | 1 | 1 | 2 |

### Batch Size 3 Groups

| Group | Variant id | segment streaming | token/audio streaming | batch size |
| ---: | --- | ---: | ---: | ---: |
| 9 | `I_batch3_original` | 0 | 0 | 3 |
| 10 | `J_batch3_segment` | 1 | 0 | 3 |
| 11 | `K_batch3_token` | 0 | 1 | 3 |
| 12 | `L_batch3_hybrid` | 1 | 1 | 3 |

## Batch Formation Rules

Keep batching simple and fair:

```text
Only batch requests from the same variant.
Only batch requests from the same length bucket when possible.
Preserve each sample_id and repeat_idx.
Do not mix batch_size=2 and batch_size=3 inside one run.
Do not compare final batch2 and batch3 results unless each batch size has its
own complete randomized paired run.
```

Preferred batch queue policy:

```text
max_batch_size = 2 or 3
max_batch_wait_ms = 50
same_variant_only = true
same_voice_only = true
same_model_only = true
same_response_format_only = true
```

For Smart Health Cabin, batch wait is a product cost. Record it separately from
model inference.

## Required Metrics

Keep all existing metrics and add batch metrics.

Per batch:

```text
batch_id
batch_size_configured
batch_size_actual
batch_formation_wait_ms
batch_dispatch_ms
batch_makespan_ms
batch_audio_duration_total_sec
batch_rtf
batch_gpu_memory_peak_mb
batch_gpu_util_mean
batch_failure_count
```

Per item:

```text
request_id
batch_id
sample_id
position_in_batch
item_queue_wait_ms
item_ttfa_server_ms
item_ttfa_client_ms
item_first_audible_500ms_ms
item_total_synthesis_ms
item_rtf
item_audio_duration_sec
item_status
```

Fairness:

```text
batch_ttfa_spread_ms = max(item_ttfa_server_ms) - min(item_ttfa_server_ms)
head_of_line_blocking_ms
p95_item_queue_wait_ms
p95_item_ttfa_client_ms
```

Throughput:

```text
items_per_second
audio_seconds_generated_per_second
gpu_memory_per_item_mb
```

## Logging Schema Additions

Extend `request_summary.jsonl` with:

```json
{
  "schema_version": "tts-exp-v1",
  "variant": "F_batch2_segment",
  "group_number": 6,
  "batch_id": "batch_000042",
  "batch_size_configured": 2,
  "batch_size_actual": 2,
  "position_in_batch": 1,
  "batch_metrics": {
    "batch_formation_wait_ms": 37.4,
    "batch_dispatch_ms": 1840.2,
    "batch_makespan_ms": 1881.9,
    "batch_ttfa_spread_ms": 72.1,
    "head_of_line_blocking_ms": 41.8
  },
  "item_metrics": {
    "item_queue_wait_ms": 29.2,
    "item_ttfa_server_ms": 640.5,
    "item_ttfa_client_ms": 742.0,
    "item_first_audible_500ms_ms": 790.4,
    "item_total_synthesis_ms": 1881.9,
    "item_rtf": 0.41
  }
}
```

Extend `event_trace.jsonl` with:

```text
batch_formation_start
batch_item_added
batch_formation_end
batch_dispatch_start
batch_model_forward_start
batch_first_audio_chunk_ready
batch_item_first_audio_chunk_sent
batch_item_last_audio_chunk_sent
batch_dispatch_end
batch_completed
```

## Run Plan

### Step 1 - Preflight

Inspect current benchmark support. Reuse existing scripts if they already have
batch arguments.

If no batch support exists, add the smallest batch wrapper around the existing
variant runner:

```text
group manifest rows into micro-batches
call the selected variant adapter with a batch payload when supported
otherwise run per item but mark batch_runtime_mode=serial_fallback
```

`serial_fallback` is useful for harness validation only. It is not accepted as
batch TTS evidence.

### Step 2 - Batch Size 2 Pilot

Run the minimum batch2 pilot:

```bash
python3 scripts/tts-benchmark/run_tts_matrix.py \
  --manifest experiments/manifests/tts_eval_manifest.jsonl \
  --variants E_batch2_original,F_batch2_segment,G_batch2_token,H_batch2_hybrid \
  --batch-size 2 \
  --repeats 1 \
  --warmup 1 \
  --randomize true \
  --mode live \
  --limit 6 \
  --output experiments/live_tts_batch2_pilot
```

### Step 3 - Batch Size 2 Main Run

After pilot passes:

```bash
python3 scripts/tts-benchmark/run_tts_matrix.py \
  --manifest experiments/manifests/tts_eval_manifest.jsonl \
  --variants E_batch2_original,F_batch2_segment,G_batch2_token,H_batch2_hybrid \
  --batch-size 2 \
  --repeats 10 \
  --warmup 10 \
  --randomize true \
  --mode live \
  --output experiments/$(date +%Y%m%d_%H%M%S)_breezyvoice_batch2_streaming_matrix_live
```

### Step 4 - Batch Size 3 Pilot

Use the same method after batch2 pilot is understood:

```bash
python3 scripts/tts-benchmark/run_tts_matrix.py \
  --manifest experiments/manifests/tts_eval_manifest.jsonl \
  --variants I_batch3_original,J_batch3_segment,K_batch3_token,L_batch3_hybrid \
  --batch-size 3 \
  --repeats 1 \
  --warmup 1 \
  --randomize true \
  --mode live \
  --limit 6 \
  --output experiments/live_tts_batch3_pilot
```

### Step 5 - Batch Size 3 Main Run

```bash
python3 scripts/tts-benchmark/run_tts_matrix.py \
  --manifest experiments/manifests/tts_eval_manifest.jsonl \
  --variants I_batch3_original,J_batch3_segment,K_batch3_token,L_batch3_hybrid \
  --batch-size 3 \
  --repeats 10 \
  --warmup 10 \
  --randomize true \
  --mode live \
  --output experiments/$(date +%Y%m%d_%H%M%S)_breezyvoice_batch3_streaming_matrix_live
```

### Step 6 - Analysis

Generate separate reports:

```bash
python3 scripts/tts-benchmark/analyze_tts_matrix.py \
  --run-dir experiments/<batch2_run_id> \
  --report experiments/<batch2_run_id>/reports/final_decision.md
```

```bash
python3 scripts/tts-benchmark/analyze_tts_matrix.py \
  --run-dir experiments/<batch3_run_id> \
  --report experiments/<batch3_run_id>/reports/final_decision.md
```

Then create one comparison note:

```text
docs/evidence/YYYY-MM-DD-breezyvoice-batch-tts-2x2-experiment-log.md
```

## Decision Rule

Batch TTS can become a product runtime option only when it improves throughput
without weakening interaction responsiveness.

Hard gates:

```text
batch_runtime_mode == true_batch
failure_rate <= 0.5%
OOM_rate <= 0.1%
P95 item TTFA_client <= 1500 ms
P95 item queue wait <= 100 ms
RTF p95 <= 1.0
batch TTFA spread p95 <= 250 ms
buffer_underrun_count == 0 for accepted runs
keyword recall >= 99%
number recall >= 99%
no obvious audio truncation
default voice only
touch questionnaire remains independent
```

Weighted score:

```text
FinalScore =
  0.25 * item_TTFA_score
+ 0.20 * throughput_score
+ 0.15 * P95_turn_latency_score
+ 0.15 * audio_quality_score
+ 0.10 * fairness_score
+ 0.10 * robustness_score
+ 0.05 * maintainability_score
```

Expected interpretation:

```text
batch_size=2 is the first product candidate.
batch_size=3 is useful only if throughput improves while queue wait and TTFA
stay inside gates.
If batch_size=3 increases head-of-line blocking, keep batch_size=2 or single
request mode as the default.
```

## Required Durable Updates

Update or create:

```text
docs/evidence/YYYY-MM-DD-breezyvoice-batch-tts-2x2-experiment-log.md
docs/source-index.md
scripts/tts-benchmark/README.md, only if commands or flags changed
docs/prompts/breezyvoice-batch-tts-2x2-batch-size-2-3-codex-goal-prompt.md
```

Evidence report sections:

```text
Run Registry
Batch Runtime Implementation
Batch Size 2 Results
Batch Size 3 Results
Batch Fairness
Throughput
Audio Quality
C/D Streaming Dependency
Decision
Next Patch
```

## Acceptance Criteria

This goal is complete when:

```text
Groups 5-8 are defined and runnable for batch_size=2.
Groups 9-12 are defined and runnable for batch_size=3.
Batch logs include batch_id, configured size, actual size, and per-item timing.
Batch2 pilot produces true batch evidence or a precise blocker.
Batch3 pilot produces true batch evidence or a precise blocker.
Reports distinguish true_batch from serial_fallback.
C/D batch groups inherit true streaming validity gates.
No generated audio or large raw logs are committed.
docs/source-index.md points to this prompt and the evidence log.
```

## Final Response Required From Codex

When done, report:

```text
1. Files changed.
2. Batch variant names and group numbers.
3. Whether batch_size=2 ran as true_batch, serial_fallback, or blocked.
4. Whether batch_size=3 ran as true_batch, serial_fallback, or blocked.
5. C/D streaming dependency status.
6. Exact commands run.
7. Evidence paths.
8. Hard-gate result.
9. Recommended runtime option.
10. Next patch.
```
