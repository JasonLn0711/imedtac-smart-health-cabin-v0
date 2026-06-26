---
id: smart-health-cabin-breezyvoice-true-parallel-segment-batch-runtime-codex-goal-prompt
title: "BreezyVoice True Parallel Segment Batch Runtime Codex Goal Prompt"
date: 2026-06-26
topic: smart-health-cabin
type: codex-goal-prompt
status: active
supersedes:
  - ./breezyvoice-batch-tts-2x2-batch-size-2-3-codex-goal-prompt.md
source:
  - ./breezyvoice-batch-tts-2x2-batch-size-2-3-codex-goal-prompt.md
  - ./breezyvoice-unblock-cd-true-streaming-runtime-codex-goal-prompt.md
  - ../evidence/2026-06-26-breezyvoice-batch-tts-2x2-experiment-log.md
  - ../../scripts/tts-benchmark/README.md
---

# Codex Goal Prompt - Implement True Parallel Segment TTS Runtime And Run Batch2/Batch3

Using FIRST PRINCIPLE, continue inside:

```text
/home/jnclaw/every_on_git_jnclaw/phd-life-system/imedtac-smart-health-cabin-v0
```

Read and obey `~/.codex/AGENTS.md` and this repo's `AGENTS.md`. In this task,
`serial_fallback`, batch harness, smoke tests, and source-level blocked reports
are not completion. They are baselines or preflight only. The task is complete
only if the live experiment runs with the target runtime, or else final status
must be `BLOCKED_UNRESOLVED`.

This goal is not complete if the result is `serial_fallback`.

The previous batch run produced a batch harness, while the runtime still ran
segments serially:

```text
S1 -> TTS complete
S2 -> TTS complete
S3 -> TTS complete
```

That result is valid blocker evidence. It is not a completed batch runtime
experiment.

The correct next objective is:

```text
Implement true_model_batch or true_parallel_workers first.
Prove it with a runtime probe.
Only after the probe passes, run the real batch2/batch3 live experiment.
```

## Non-Negotiable Rule

Do not mark this goal complete after:

- batch harness only
- serial fallback
- deterministic smoke
- fake timing
- mocked TTS
- synthetic audio
- C/D renamed from B_segment
- source-level blocked report
- reporting `BLOCKED_UNRESOLVED` as complete

If the final runtime is `serial_fallback`, final status must be:

```text
BLOCKED_UNRESOLVED
```

## Allowed Final Statuses

Use only:

- `PREFLIGHT_ONLY`
- `TRUE_PARALLEL_RUNTIME_READY`
- `LIVE_BATCH_MINIMUM_COMPLETED`
- `LIVE_BATCH_FULL_COMPLETED`
- `BLOCKED_UNRESOLVED`

Use `LIVE_BATCH_MINIMUM_COMPLETED` or `LIVE_BATCH_FULL_COMPLETED` only when the
runtime probe passes and live batch runs produce real generated audio,
reconstructed audio, and event traces.

## Definitions

### serial_fallback

Invalid as final runtime:

```python
for segment in segments:
    audio = synthesize(segment)
    outputs.append(audio)
```

This is a baseline only.

### true_model_batch

Valid.

The model runtime accepts multiple segment inputs in one grouped inference path.

Evidence required:

- one request contains multiple texts
- one model invocation handles multiple items together
- logs record `batch_runtime_mode=true_model_batch`
- output audio exists for every segment
- timestamps prove grouped model processing

### true_parallel_workers

Valid.

Multiple live TTS jobs are dispatched concurrently. This is acceptable even if
the GPU internally schedules kernels serially, because the system experiment
measures real concurrent dispatch, queueing, resource pressure, and ordered
playback behavior.

Evidence required:

- all segment jobs in the same batch group are dispatched before any one
  segment fully completes
- segment request start times are close together
- event trace shows overlapping request intervals
- logs record `batch_runtime_mode=true_parallel_workers`
- output audio exists for every segment
- ordered reconstructed audio exists

Minimum concurrency proof:

```text
batch2:
  both segment jobs start within 250 ms of each other

batch3:
  all three segment jobs start within 500 ms of each other

both:
  at least one later segment starts before segment 0 finishes
  overlap_ratio > 0.30, unless GPU-level serialization is observed and reported
```

If dispatch is concurrent and overlap is low, record:

```text
batch_runtime_mode=true_parallel_dispatch_low_overlap
```

Do not relabel it as serial.

## Required Variant Mapping

Keep the previous batch group naming so reports stay comparable.

### Batch Size 2

| Group | Variant id | Runtime requirement |
| ---: | --- | --- |
| 5 | `E_batch2_original` | Valid only with `true_model_batch`; otherwise record as blocked or baseline-only. |
| 6 | `F_batch2_segment` | Required. Maps to `P2_parallel_segment_batch2`. |
| 7 | `G_batch2_token` | Optional. Run only if local C_token true streaming is valid. |
| 8 | `H_batch2_hybrid` | Optional. Run only if local D_hybrid true streaming is valid. |

### Batch Size 3

| Group | Variant id | Runtime requirement |
| ---: | --- | --- |
| 9 | `I_batch3_original` | Valid only with `true_model_batch`; otherwise record as blocked or baseline-only. |
| 10 | `J_batch3_segment` | Required. Maps to `P3_parallel_segment_batch3`. |
| 11 | `K_batch3_token` | Optional. Run only if local C_token true streaming is valid. |
| 12 | `L_batch3_hybrid` | Optional. Run only if local D_hybrid true streaming is valid. |

Also include this baseline:

```text
S_serial_segment_baseline:
  sequential segment synthesis
  baseline only
  not a product recommendation unless all parallel modes fail and the report
  explicitly states that no true parallel runtime passed gates
```

## Implementation Target

Implement a real parallel batch sidecar endpoint or benchmark adapter.

Preferred endpoint:

```text
POST /v1/tts/synthesize-batch
```

Request shape:

```json
{
  "request_id": "batch_req_001",
  "batch_runtime_mode": "true_parallel_workers",
  "ordered_playback": true,
  "segments": [
    {
      "segment_id": 0,
      "text": "第一句。",
      "priority": "high"
    },
    {
      "segment_id": 1,
      "text": "第二句。",
      "priority": "normal"
    },
    {
      "segment_id": 2,
      "text": "第三句。",
      "priority": "normal"
    }
  ],
  "speaker_profile_id": "default",
  "variant": "P3_parallel_segment_batch3"
}
```

Response may be:

- ordered reconstructed WAV
- JSON metadata plus per-segment audio paths
- streaming ordered PCM chunks when already supported

Every segment must be live-generated.

## Required Implementation Behavior

For `true_parallel_workers`, use one of:

- `asyncio.gather(...)` over independent live TTS HTTP calls
- multiprocessing worker pool with model workers already loaded
- multiple sidecar processes on different ports
- one queue with N workers, where N >= batch_size for the probe
- one GPU worker plus concurrent request dispatch, if timestamps prove
  concurrent dispatch and queue behavior

Accepted runtime evidence starts all segment jobs before the first one fully
finishes.

## Runtime Probe Before Experiment

Create or update:

```text
scripts/tts-benchmark/probe_true_parallel_batch_runtime.py
```

Probe inputs:

- one 2-sentence text
- one 3-sentence text
- one long PHQ-style multi-sentence text

Probe pass criteria:

- generated audio exists for every segment
- reconstructed ordered WAV exists
- `batch_runtime_mode` is one of:
  - `true_model_batch`
  - `true_parallel_workers`
  - `true_parallel_dispatch_low_overlap`
- segment jobs are dispatched concurrently
- event trace shows overlapping segment intervals or concurrent dispatch before
  first segment completion
- `segment_1_start < segment_0_end`
- for batch3, `segment_2_start < segment_0_end` or
  `segment_2_start < segment_1_end`
- logs include start/end timestamps per segment
- logs include group-level latency and per-segment latency

If the probe fails, stop before the final experiment and produce
`blocked_unresolved_report.md`.

## Required Logs

Every batch group must log:

```text
experiments/<run_id>/logs/batch_request_summary.jsonl
```

Required fields:

- `run_id`
- `batch_id`
- `variant`
- `batch_size`
- `batch_runtime_mode`
- `sample_id`
- `repeat_idx`
- `segment_count`
- `segment_ids`
- `all_segments_dispatched_ms`
- `first_segment_audio_ready_ms`
- `first_ordered_audio_ready_ms`
- `last_segment_audio_ready_ms`
- `reconstructed_audio_ready_ms`
- `total_wall_time_ms`
- `sum_segment_synthesis_ms`
- `max_segment_synthesis_ms`
- `parallel_speedup_vs_serial`
- `overlap_ratio`
- `gpu_memory_peak_mb`
- `gpu_util_mean`
- `status`
- `error`

Event trace:

```text
experiments/<run_id>/logs/batch_event_trace.jsonl
```

Required fields:

- `run_id`
- `batch_id`
- `variant`
- `sample_id`
- `repeat_idx`
- `segment_id`
- `event`
- `t_monotonic_ns`
- `t_wall`
- `text`
- `char_count`
- `audio_duration_sec`
- `bytes`
- `gpu_allocated_mb`
- `gpu_reserved_mb`

Required events:

- `batch_received`
- `segment_dispatch_start`
- `segment_request_sent`
- `segment_synthesis_start`
- `segment_first_audio_ready`
- `segment_synthesis_end`
- `segment_audio_saved`
- `ordered_reconstruction_start`
- `ordered_reconstruction_end`
- `batch_end`

Also record:

```text
experiments/<run_id>/logs/gpu_metrics.jsonl
experiments/<run_id>/logs/error_log.jsonl
```

## Required Artifacts

Create:

```text
experiments/<run_id>/audio/segments/<variant>/<sample_id>/<repeat_idx>/segment_0.wav
experiments/<run_id>/audio/segments/<variant>/<sample_id>/<repeat_idx>/segment_1.wav
experiments/<run_id>/audio/segments/<variant>/<sample_id>/<repeat_idx>/segment_2.wav
experiments/<run_id>/audio/reconstructed/<variant>/<sample_id>_<repeat_idx>.wav
```

Reports:

```text
experiments/<run_id>/reports/parallel_runtime_validity_report.md
experiments/<run_id>/reports/batch_latency_report.md
experiments/<run_id>/reports/batch_failure_analysis.md
experiments/<run_id>/reports/batch_final_decision.md
```

Create `batch_final_decision.md` only when the runtime is true parallel or true
model batch. Use `blocked_unresolved_report.md` when final runtime remains
serial fallback.

## Benchmark Design

Use synthetic, non-PHI text only.

Minimum live benchmark:

```text
12 samples
3 repeats
variants:
  S_serial_segment_baseline
  P2_parallel_segment_batch2
  P3_parallel_segment_batch3
minimum total:
  12 x 3 x 3 = 108 real batch-group runs
```

If C/D streaming is locally valid, add:

```text
PD2_parallel_hybrid_batch2
PD3_parallel_hybrid_batch3
```

Full benchmark target:

```text
40 samples
10 repeats
all valid variants
randomize by (sample_id, repeat_idx, variant)
```

Run randomized paired execution. Keep serial baseline, P2, and P3 interleaved.

## Sample Requirements

Manifest must include:

- short 2-sentence acknowledgement
- 2-sentence instruction
- 3-sentence PHQ-style prompt
- long no-punctuation sentence that must be split
- punctuation-heavy sentence
- numeric medical values
- code-switching terms: ASR, LLM, TTS, API, GPU, PHQ-9
- Taiwanese Mandarin medical terms
- polyphone-sensitive terms

## Metrics

Compute:

- first ordered audio ready time
- first segment audio ready time
- total wall time
- sum of segment synthesis times
- max segment synthesis time
- parallel speedup vs serial baseline
- overlap ratio
- reconstructed audio duration
- p50 / p90 / p95 / p99 latency
- RTF group-level
- RTF per-segment
- GPU memory peak
- GPU utilization
- failure rate
- timeout rate
- audio reconstruction success rate

Definitions:

```text
parallel_speedup_vs_serial =
  serial_baseline_total_wall_time_ms / parallel_total_wall_time_ms
```

```text
overlap_ratio =
  1 - (parallel_total_wall_time_ms / sum_segment_synthesis_ms)
```

Higher overlap ratio means stronger real concurrency.

## Hard Gates

Parallel runtime cannot be selected if:

- `batch_runtime_mode=serial_fallback`
- segment audio files are missing
- reconstructed audio is missing
- event trace does not prove concurrent dispatch
- failure rate > 0.5%
- OOM rate > 0.1%
- p95 group RTF > 1.0
- p95 first ordered audio ready > 1500 ms for short samples
- severe reconstructed audio seams
- repeated or truncated speech
- batch3 causes unstable memory behavior

If no variant passes hard gates, say so and keep the production default
unchanged.

## Required Durable Evidence

Create or update:

```text
docs/evidence/<date>-breezyvoice-true-parallel-segment-batch-experiment-log.md
docs/source-index.md
scripts/tts-benchmark/README.md, only if commands or flags changed
```

Evidence document must include:

- why the previous run was a harness result, not true batch runtime
- exact `serial_fallback` blocker
- new implementation approach
- files changed
- exact command lines
- probe result
- live benchmark run ID
- artifact paths
- validity table
- latency table
- final status

## Validation Commands

Run at minimum:

```bash
python3 -m py_compile scripts/tts-benchmark/*.py
python3 scripts/tts-benchmark/probe_true_parallel_batch_runtime.py --help
git diff --check
```

Also run when available:

```bash
corepack pnpm validate:json
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
```

These are engineering validations. They do not count as the live experiment.

## Final Response Format

At the end, report exactly:

```text
Status: <allowed status>

Run ID: <run_id or none>

Runtime:
- batch_runtime_mode: <true_parallel_workers / true_model_batch / true_parallel_dispatch_low_overlap / serial_fallback>
- probe_passed: <true / false>

Live counts:
- S_serial_segment_baseline: <N real runs, N reconstructed wav>
- P2_parallel_segment_batch2: <N real runs, N reconstructed wav>
- P3_parallel_segment_batch3: <N real runs, N reconstructed wav>
- PD2_parallel_hybrid_batch2: <N real runs, N reconstructed wav or skipped>
- PD3_parallel_hybrid_batch3: <N real runs, N reconstructed wav or skipped>

Artifacts:
- <path>
- <path>
- <path>

Decision:
- Production default: <variant or none>
- Operational fallback: <variant or none>
- Research candidate: <variant or none>
- Next optimization candidate: <variant or none>
```

The central rule is:

```text
serial_fallback is baseline evidence.
true_model_batch or true_parallel_workers is the runtime target.
the live batch experiment starts only after the runtime probe passes.
```
