# BreezyVoice True Parallel Segment Batch Experiment Log

## Previous Harness Boundary

The previous batch run proved grouping and batch/per-item logging, but stayed `serial_fallback`. This log records the true parallel segment runtime probe/benchmark.

## New Implementation Approach

Live segment requests are dispatched concurrently to the BreezyVoice OpenAI-compatible endpoint, each segment WAV is saved, and ordered reconstructed WAV is produced from real generated audio.

## Files Changed

- `apps/model-sidecars/tts-service/app.py`
- `scripts/tts-benchmark/probe_true_parallel_batch_runtime.py`
- `experiments/manifests/parallel_segment_tts_eval_manifest.jsonl`
- `scripts/tts-benchmark/README.md`
- `docs/source-index.md`

## Run ID

`true_parallel_segment_batch_probe`

## Final Status

`TRUE_PARALLEL_RUNTIME_READY`

## Commands

- `python3 scripts/tts-benchmark/probe_true_parallel_batch_runtime.py --mode probe --output experiments/true_parallel_segment_batch_probe`

## Artifact Paths

- `experiments/true_parallel_segment_batch_probe`
- `experiments/true_parallel_segment_batch_probe/logs/batch_request_summary.jsonl`
- `experiments/true_parallel_segment_batch_probe/logs/batch_event_trace.jsonl`
- `experiments/true_parallel_segment_batch_probe/reports/parallel_runtime_validity_report.md`

## Validity Table

| Variant | Rows | Runtime modes | Reconstructed WAV |
| --- | --- | --- | --- |
| P2_parallel_segment_batch2 | 3 | serial_fallback,true_parallel_workers | 3 |
| P3_parallel_segment_batch3 | 3 | true_parallel_workers | 3 |

## Decision

Production default remains `none`. `P2_parallel_segment_batch2` and `P3_parallel_segment_batch3` are research candidates until hard gates and human audio seam review pass.
