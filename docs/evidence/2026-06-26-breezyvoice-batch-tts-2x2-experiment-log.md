# BreezyVoice Batch TTS 2x2 Experiment Log

## Run Registry

Date/time recorded: `2026-06-26T13:54:05+08:00`.

Goal prompt:

```text
docs/prompts/breezyvoice-batch-tts-2x2-batch-size-2-3-codex-goal-prompt.md
```

Pilot artifacts:

```text
experiments/live_tts_batch2_pilot/
experiments/live_tts_batch3_pilot/
```

Final status label:

```text
BLOCKED_UNRESOLVED
```

This is a precise runtime blocker, not a production batch result. The harness
now defines and runs the batch groups, records batch/per-item timing, and marks
the current runtime as `serial_fallback`. No variant passes the true-batch hard
gate.

## Batch Runtime Implementation

Implemented in:

```text
scripts/tts-benchmark/tts_benchmark_lib.py
scripts/tts-benchmark/run_tts_matrix.py
scripts/tts-benchmark/analyze_tts_matrix.py
scripts/tts-benchmark/README.md
```

Variant groups:

| Group | Variant | Batch size | Segment | Token/audio |
| ---: | --- | ---: | ---: | ---: |
| 5 | `E_batch2_original` | 2 | 0 | 0 |
| 6 | `F_batch2_segment` | 2 | 1 | 0 |
| 7 | `G_batch2_token` | 2 | 0 | 1 |
| 8 | `H_batch2_hybrid` | 2 | 1 | 1 |
| 9 | `I_batch3_original` | 3 | 0 | 0 |
| 10 | `J_batch3_segment` | 3 | 1 | 0 |
| 11 | `K_batch3_token` | 3 | 0 | 1 |
| 12 | `L_batch3_hybrid` | 3 | 1 | 1 |

The runner now accepts `--batch-size`, groups same-phase / same-variant /
same-length-bucket requests, and records:

```text
batch_id
batch_size_configured
batch_size_actual
position_in_batch
batch_runtime_mode
batch_formation_start
batch_formation_end
batch_dispatch_start
batch_dispatch_end
batch_metrics
item_metrics
```

Event traces now include batch events such as `batch_formation_start`,
`batch_item_added`, `batch_dispatch_start`, `batch_item_first_audio_chunk_sent`,
`batch_item_last_audio_chunk_sent`, `batch_dispatch_end`, and
`batch_completed`.

## Batch Size 2 Results

Command:

```bash
python3 scripts/tts-benchmark/run_tts_matrix.py --manifest experiments/manifests/tts_eval_manifest.jsonl --variants E_batch2_original,F_batch2_segment,G_batch2_token,H_batch2_hybrid --batch-size 2 --repeats 1 --warmup 1 --randomize true --mode deterministic --limit 6 --output experiments/live_tts_batch2_pilot
python3 scripts/tts-benchmark/analyze_tts_matrix.py --run-dir experiments/live_tts_batch2_pilot --report experiments/live_tts_batch2_pilot/reports/final_decision.md --evidence docs/evidence/2026-06-26-breezyvoice-batch-tts-2x2-experiment-log.md
```

Observed pilot output:

```text
run_id=live_tts_batch2_pilot
requests=32
batches=24
batch_runtime_mode=serial_fallback
```

Main request summary:

```text
rows=24
variants=E_batch2_original,F_batch2_segment,G_batch2_token,H_batch2_hybrid
statuses=BLOCKED_BY_TRUE_STREAMING_RUNTIME,ok
batch fields present=yes
```

Batch report:

| Variant | Group | Runtime mode | Batches | Queue wait p95 | Item TTFA p95 | TTFA spread p95 |
| --- | ---: | --- | ---: | ---: | ---: | ---: |
| `E_batch2_original` | 5 | `serial_fallback` | 4 | 0.065 | 663.0 | 32.0 |
| `F_batch2_segment` | 6 | `serial_fallback` | 4 | 0.037 | 431.0 | 136.0 |
| `G_batch2_token` | 7 | `serial_fallback` | 4 | 0.039 | n/a | n/a |
| `H_batch2_hybrid` | 8 | `serial_fallback` | 4 | 0.038 | n/a | n/a |

## Batch Size 3 Results

Command:

```bash
python3 scripts/tts-benchmark/run_tts_matrix.py --manifest experiments/manifests/tts_eval_manifest.jsonl --variants I_batch3_original,J_batch3_segment,K_batch3_token,L_batch3_hybrid --batch-size 3 --repeats 1 --warmup 1 --randomize true --mode deterministic --limit 6 --output experiments/live_tts_batch3_pilot
python3 scripts/tts-benchmark/analyze_tts_matrix.py --run-dir experiments/live_tts_batch3_pilot --report experiments/live_tts_batch3_pilot/reports/final_decision.md --evidence docs/evidence/2026-06-26-breezyvoice-batch-tts-2x2-experiment-log.batch3.tmp.md
```

Observed pilot output:

```text
run_id=live_tts_batch3_pilot
requests=32
batches=24
batch_runtime_mode=serial_fallback
```

Main request summary:

```text
rows=24
variants=I_batch3_original,J_batch3_segment,K_batch3_token,L_batch3_hybrid
statuses=BLOCKED_BY_TRUE_STREAMING_RUNTIME,ok
batch fields present=yes
```

Batch report:

| Variant | Group | Runtime mode | Batches | Queue wait p95 | Item TTFA p95 | TTFA spread p95 |
| --- | ---: | --- | ---: | ---: | ---: | ---: |
| `I_batch3_original` | 9 | `serial_fallback` | 4 | 0.051 | 663.0 | 32.0 |
| `J_batch3_segment` | 10 | `serial_fallback` | 4 | 0.051 | 431.0 | 136.0 |
| `K_batch3_token` | 11 | `serial_fallback` | 4 | 0.051 | n/a | n/a |
| `L_batch3_hybrid` | 12 | `serial_fallback` | 4 | 0.051 | n/a | n/a |

## Batch Fairness

The harness records queue wait and TTFA spread. These values are harness-level
only because `serial_fallback` dispatches each item through the existing
single-request path. They are useful for verifying logging and report shape;
they are not valid evidence for production batch fairness.

## Throughput

No production throughput claim is made. `serial_fallback` cannot prove batch
GPU utilization, batch makespan efficiency, or improved items per second.

## Audio Quality

Deterministic pilot audio exists only for harness validation in the ignored
experiment directories. No generated audio or raw logs are committed. Token
batch groups do not generate fake token/audio streaming audio.

## C/D Streaming Dependency

Strict single-request C/D streaming has already been validated in:

```text
docs/evidence/2026-06-26-breezyvoice-true-streaming-runtime-unblock-log.md
experiments/strict_breezyvoice_abcd_matrix_minimum/
```

Batch C/D remains blocked because the batch harness has no true batch
token/audio adapter. `G/H/K/L` therefore record:

```text
BLOCKED_BY_TRUE_STREAMING_RUNTIME
```

This preserves the dependency gate without relabeling segment-level or
deterministic output as token/audio batch streaming.

## Decision

Hard-gate result:

| Batch size | Result | Reason |
| ---: | --- | --- |
| 2 | fail | `batch_runtime_mode=serial_fallback`; `true_batch` required. |
| 3 | fail | `batch_runtime_mode=serial_fallback`; `true_batch` required. |
| 2 token/hybrid | source blocked | no true batch C/D token/audio adapter. |
| 3 token/hybrid | source blocked | no true batch C/D token/audio adapter. |

Recommended runtime option:

```text
none
```

Keep the prior single-request fallback and research path. Batch TTS is not a
product option until the runtime exposes true batch synthesis.

## Next Patch

Wire and prove the smallest true batch boundary before rerunning live batch
pilots:

```text
apps/model-sidecars/tts-service/app.py:
  experimental /v1/tts/synthesize-batch now accepts ordered text segments,
  dispatches live BreezyVoice work through a worker pool, and returns
  per-segment audio plus a reconstructed WAV.

scripts/tts-benchmark/run_tts_matrix.py:
  switch batch_runtime_mode from serial_fallback only after the runner calls
  /v1/tts/synthesize-batch and the event trace proves concurrent dispatch.

strict BreezyVoice runtime:
  keep C/D batch groups blocked until token/audio streaming can run per item
  inside a true batch dispatch boundary.
```
