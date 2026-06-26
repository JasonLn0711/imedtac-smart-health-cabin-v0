# BreezyVoice True Parallel Segment Batch Experiment Log

## Run Registry

This log records every true-parallel segment batch experiment in this run, with local/UTC timestamps, hardware snapshot, service state, commands, batch rows, event rows, audio artifacts, and decision gates.

- Evidence log updated local time: `2026-06-26T14:40:14+08:00` and after minimum completion.
- Canonical prompt: `docs/prompts/breezyvoice-true-parallel-segment-batch-runtime-codex-goal-prompt.md`
- Previous harness log: `docs/evidence/2026-06-26-breezyvoice-batch-tts-2x2-experiment-log.md`
- Final status: `LIVE_BATCH_MINIMUM_COMPLETED`

## Previous Harness Boundary

The previous batch run proved batch grouping and batch/per-item logging, but stayed `serial_fallback`. That was valid blocker evidence, not a completed true batch runtime. This experiment replaces that boundary with live concurrent segment dispatch and ordered reconstruction from real BreezyVoice audio.

## New Implementation Approach

- `scripts/tts-benchmark/probe_true_parallel_batch_runtime.py` dispatches segment-level live BreezyVoice HTTP synthesis concurrently with `ThreadPoolExecutor`.
- Each segment is saved as its own WAV file under `audio/segments/`.
- Ordered reconstructed WAV files are saved under `audio/reconstructed/`.
- Runtime mode is inferred from real segment start/end timestamps and overlap, not mocked timing.
- P2 proves the first two segment jobs start together; P3 proves up to three segment jobs start together.
- PD2 and PD3 now use the strict BreezyVoice D_hybrid token/audio streaming
  runtime inside each parallel segment worker. They are not P2/P3 aliases:
  event traces must include `first_speech_token`, `first_pcm_chunk`, and
  `pcm_chunk` events with `segment_index`.

## Files Changed

- `apps/model-sidecars/tts-service/app.py`
- `scripts/tts-benchmark/probe_true_parallel_batch_runtime.py`
- `experiments/manifests/parallel_segment_tts_eval_manifest.jsonl`
- `scripts/tts-benchmark/README.md`
- `docs/source-index.md`
- `docs/evidence/2026-06-26-breezyvoice-true-parallel-segment-batch-experiment-log.md`

## Hardware And Runtime Snapshot

- Repo branch/commit: `main` / `89b0a04`
- Worktree status at metadata capture: `dirty_with_local_changes`
- OS/kernel: `Linux-6.17.0-35-generic-x86_64-with-glibc2.39` / `6.17.0-35-generic`
- CPU: `x86_64`
- RAM: `62.4 GB`
- Python: `3.12.3`
- GPU available: `True`
- GPU: `NVIDIA GeForce RTX 4090 Laptop GPU`
- GPU driver: `580.159.03`
- GPU memory total: `16376 MB`
- GPU temperature at capture: `47 C`
- GPU power draw at capture: `4.61 W`
- GPU utilization at capture: `0 %`
- BreezyVoice model: `MediaTek-Research/BreezyVoice`
- BreezyVoice base URL: `http://localhost:9003/v1`
- TTS sidecar URL: `http://localhost:8012`

In-run GPU snapshot captured at `2026-06-26T14:40:14+08:00` during the minimum
live matrix:

```text
NVIDIA GeForce RTX 4090 Laptop GPU
Driver 580.159.03
CUDA 13.0
Memory 6104 MiB / 16376 MiB
Temperature 56 C
Power 72 W / 80 W
GPU utilization 2 %
GPU processes:
  PID 86692  ../../.venv-asr/bin/python             2234 MiB
  PID 388803 /home/jnclaw/every_on_git_jnclaw/BreezyVoice/.venv/bin/python 3842 MiB
```

Ports snapshot:

```text
LISTEN 0      511          0.0.0.0:3011       0.0.0.0:*    users:(("node",pid=450942,fd=21))
LISTEN 0      511          0.0.0.0:3010       0.0.0.0:*    users:(("node",pid=626361,fd=32))
LISTEN 0      511          0.0.0.0:3000       0.0.0.0:*    users:(("node",pid=621065,fd=34))
LISTEN 0      2048         0.0.0.0:9003       0.0.0.0:*    users:(("pt_main_thread",pid=388803,fd=68))
LISTEN 0      4096       127.0.0.1:11434      0.0.0.0:*    users:(("ollama",pid=86744,fd=3))
```

Process snapshot:

```text
86744 ollama          /home/jnclaw/every_on_git_jnclaw/phd-life-system/jarvis-voice-sight/.local/ollama/extract/bin/ollama serve
 358041 bash            bash -lc corepack pnpm --filter @shc/api-server dev 2>&1 | tee .local/logs/api-server.log
 358056 node            node /usr/bin/corepack pnpm --filter @shc/api-server dev
 358058 tee             tee .local/logs/api-server.log
 358104 node            node /home/jnclaw/every_on_git_jnclaw/phd-life-system/imedtac-smart-health-cabin-v0/apps/api-server/node_modules/.bin/../tsx/dist/cli.mjs watch src/server.ts
 388803 pt_main_thread  /home/jnclaw/every_on_git_jnclaw/BreezyVoice/.venv/bin/python -m uvicorn api:app --host 0.0.0.0 --port 9003
 389771 node            node /usr/bin/corepack pnpm --filter @shc/api-server start
 389784 node            node /home/jnclaw/every_on_git_jnclaw/phd-life-system/imedtac-smart-health-cabin-v0/apps/api-server/node_modules/.bin/../tsx/dist/cli.mjs src/server.ts
 389991 node            node /usr/bin/corepack pnpm --filter @shc/voice-agent-server start
 450927 zsh             /usr/bin/zsh -c VOICE_AGENT_PORT=3011 API_BASE_URL=http://localhost:3010 LLM_PROVIDER=ollama_native LLM_COMPUTE_BACKEND=gpu LLM_DEVICE=cuda LLM_CPU_OFFLOAD=false LLM_ALLOW_CPU_FALLBACK=false LLM_BASE_URL=http://localhost:11434 LLM_MODEL=gemma4:e4b LLM_REQUEST_TIMEOUT_MS=30000 corepack pnpm --filter @shc/voice-agent-server start 2>&1 | tee .local/run/voice-agent-3011.log
 450928 node            node /usr/bin/corepack pnpm --filter @shc/voice-agent-server start
 450929 tee             tee .local/run/voice-agent-3011.log
 626331 node            node /usr/bin/corepack pnpm --filter @shc/api-server start
 626345 node            node /home/jnclaw/every_on_git_jnclaw/phd-life-system/imedtac-smart-health-cabin-v0/apps/api-server/node_modules/.bin/../tsx/dist/cli.mjs src/server.ts
```

## Experiment Runs

### Runtime probe

- Run ID: `true_parallel_segment_batch_probe`
- Status: `TRUE_PARALLEL_RUNTIME_READY`
- Local started: `2026-06-26T14:34:20.667+08:00`
- Local ended: `2026-06-26T14:34:57.286+08:00`
- UTC started: `2026-06-26T06:34:20.667Z`
- UTC ended: `2026-06-26T06:34:57.286Z`
- Metadata updated: `2026-06-26T14:47:48.231+08:00` / `2026-06-26T06:47:48.231Z`
- Command: `BREEZYVOICE_BASE_URL=http://localhost:9003/v1 python3 scripts/tts-benchmark/probe_true_parallel_batch_runtime.py --mode probe --output experiments/true_parallel_segment_batch_probe`
- Batch summary rows: `6`
- Event trace rows: `120`
- Reconstructed WAV files: `6`
- Segment WAV files: `16`

| Variant | Rows | Runtime modes | Reconstructed WAV | First ordered p95 ms | Total p95 ms | Overlap median | Speedup median |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P2_parallel_segment_batch2 | 3 | true_parallel_workers:3 | 3 | 7512.797 | 7567.125 | 0.496 | n/a |
| P3_parallel_segment_batch3 | 3 | true_parallel_workers:3 | 3 | 6810.172 | 6850.332 | 0.663 | n/a |

### Minimum live matrix

- Run ID: `true_parallel_segment_batch_minimum`
- Status: `LIVE_BATCH_MINIMUM_COMPLETED`
- Local started: `2026-06-26T14:35:06.042+08:00`
- Local ended: `2026-06-26T14:46:09.396+08:00`
- UTC started: `2026-06-26T06:35:06.042Z`
- UTC ended: `2026-06-26T06:46:09.396Z`
- Metadata updated: `2026-06-26T14:47:48.324+08:00` / `2026-06-26T06:47:48.324Z`
- Command: `BREEZYVOICE_BASE_URL=http://localhost:9003/v1 python3 scripts/tts-benchmark/probe_true_parallel_batch_runtime.py --mode minimum --output experiments/true_parallel_segment_batch_minimum`
- Batch summary rows: `108`
- Event trace rows: `2214`
- Reconstructed WAV files: `108`
- Segment WAV files: `297`

| Variant | Rows | Runtime modes | Reconstructed WAV | First ordered p95 ms | Total p95 ms | Overlap median | Speedup median |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P2_parallel_segment_batch2 | 36 | true_parallel_workers:36 | 36 | 6883.558 | 7161.048 | 0.497 | 1.007 |
| P3_parallel_segment_batch3 | 36 | true_parallel_workers:36 | 36 | 7371.461 | 7416.005 | 0.664 | 0.998 |
| S_serial_segment_baseline | 36 | serial_baseline:36 | 36 | 4324.753 | 7053.978 | 0.0 | 1.0 |

### PD hybrid probe

- Run ID: `pd_hybrid_parallel_probe_full`
- Status: `TRUE_PARALLEL_RUNTIME_READY`
- Local started: `2026-06-26T15:24:56.284+08:00`
- Local ended: `2026-06-26T15:28:50.708+08:00`
- UTC started: `2026-06-26T07:24:56.284Z`
- UTC ended: `2026-06-26T07:28:50.708Z`
- Command: `BREEZYVOICE_BASE_URL=http://localhost:9003/v1 /home/jnclaw/every_on_git_jnclaw/BreezyVoice/.venv/bin/python scripts/tts-benchmark/probe_true_parallel_batch_runtime.py --mode probe --variants PD2_parallel_hybrid_batch2,PD3_parallel_hybrid_batch3 --output experiments/pd_hybrid_parallel_probe_full`
- Batch summary rows: `6`
- Reconstructed WAV files: `6`
- Segment WAV files: `16`
- Event evidence: `first_speech_token:16`, `first_pcm_chunk:16`,
  `pcm_chunk:143`, `speech_token_chunk:3414`.

| Variant | Rows | Runtime modes | Valid rows | Reconstructed WAV | PCM chunks | First PCM ms values | Total ms values |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PD2_parallel_hybrid_batch2 | 3 | true_parallel_workers:3 | 3 | 3 | 73 | 3571.133, 3282.149, 3513.312 | 40814.364, 22945.156, 57271.140 |
| PD3_parallel_hybrid_batch3 | 3 | true_parallel_workers:3 | 3 | 3 | 70 | 4177.142, 4945.231, 5143.175 | 21532.318, 37915.609, 53674.536 |

### Full PD hybrid minimum matrix

- Run ID: `pd_hybrid_parallel_minimum_r3`
- Status: `LIVE_BATCH_MINIMUM_COMPLETED`
- Local started: `2026-06-26T15:49:07.806+08:00`
- Local ended: `2026-06-26T16:45:48.261+08:00`
- UTC started: `2026-06-26T07:49:07.806Z`
- UTC ended: `2026-06-26T08:45:48.261Z`
- Command: `BREEZYVOICE_BASE_URL=http://localhost:9003/v1 /home/jnclaw/every_on_git_jnclaw/BreezyVoice/.venv/bin/python scripts/tts-benchmark/probe_true_parallel_batch_runtime.py --mode minimum --repeats 3 --variants S_serial_segment_baseline,P2_parallel_segment_batch2,P3_parallel_segment_batch3,PD2_parallel_hybrid_batch2,PD3_parallel_hybrid_batch3 --output experiments/pd_hybrid_parallel_minimum_r3`
- Batch summary rows: `180`
- Event trace rows: `45513`
- GPU metric rows: `180`
- Error rows: `0`
- Reconstructed WAV files: `180`
- Segment WAV files: `495`
- BreezyVoice runtime branch/commit:
  `feat/breezyvoice-true-streaming-runtime` / `d592c9d`
- Runtime Python: `/home/jnclaw/every_on_git_jnclaw/BreezyVoice/.venv/bin/python`
  / `3.10.20`
- GPU snapshot at run start: `NVIDIA GeForce RTX 4090 Laptop GPU`,
  driver `580.159.03`, memory total `16376 MB`, temperature `49 C`,
  power draw `30.17 W`, utilization `45 %`.

| Variant | Rows | Runtime modes | Valid rows | Reconstructed WAV | First ordered p95 ms | Total p95 ms | Overlap median | Speedup median |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S_serial_segment_baseline | 36 | serial_baseline:36 | 36 | 36 | 4437.115 | 7279.241 | 0.0 | 1.0 |
| P2_parallel_segment_batch2 | 36 | true_parallel_workers:36 | 36 | 36 | 7043.776 | 7282.483 | 0.495 | 0.997 |
| P3_parallel_segment_batch3 | 36 | true_parallel_workers:36 | 36 | 36 | 7515.056 | 7628.449 | 0.663 | 0.975 |
| PD2_parallel_hybrid_batch2 | 36 | true_parallel_workers:33; true_parallel_dispatch_low_overlap:3 | 36 | 36 | 45936.001 | 45989.325 | 0.431 | 0.168 |
| PD3_parallel_hybrid_batch3 | 36 | true_parallel_workers:33; true_parallel_dispatch_low_overlap:3 | 36 | 36 | 50909.348 | 52327.288 | 0.582 | 0.159 |

PD streaming event evidence:

| Variant | first_speech_token | speech_token_chunk | first_pcm_chunk | first_audio_chunk_sent | pcm_chunk |
| --- | ---: | ---: | ---: | ---: | ---: |
| PD2_parallel_hybrid_batch2 | 99 | 19222 | 99 | 99 | 811 |
| PD3_parallel_hybrid_batch3 | 99 | 20142 | 99 | 99 | 856 |

## Required Event Coverage

Both probe and minimum run event traces include: `batch_received`, `segment_dispatch_start`, `segment_request_sent`, `segment_synthesis_start`, `segment_first_audio_ready`, `segment_synthesis_end`, `segment_audio_saved`, `ordered_reconstruction_start`, `ordered_reconstruction_end`, and `batch_end`.

Every batch summary row now carries `local_started_at`, `utc_started_at`, `local_ended_at`, and `utc_ended_at`. The event trace also records `t_wall`, `t_wall_utc`, and `t_monotonic_ns` per event.

PD hybrid runs additionally include `llm_start`, `first_speech_token`,
`speech_token_chunk`, `first_mel_chunk`, `first_pcm_chunk`,
`first_audio_chunk_sent`, and `pcm_chunk` events. These events prove PD2/PD3
are not skipped and are not renamed P2/P3 full-segment WAV synthesis.

## Artifact Paths

- `experiments/true_parallel_segment_batch_probe/logs/batch_request_summary.jsonl`
- `experiments/true_parallel_segment_batch_probe/logs/batch_event_trace.jsonl`
- `experiments/true_parallel_segment_batch_probe/audio/segments/`
- `experiments/true_parallel_segment_batch_probe/audio/reconstructed/`
- `experiments/true_parallel_segment_batch_minimum/logs/batch_request_summary.jsonl`
- `experiments/true_parallel_segment_batch_minimum/logs/batch_event_trace.jsonl`
- `experiments/true_parallel_segment_batch_minimum/audio/segments/`
- `experiments/true_parallel_segment_batch_minimum/audio/reconstructed/`
- `experiments/true_parallel_segment_batch_minimum/reports/parallel_runtime_validity_report.md`
- `experiments/true_parallel_segment_batch_minimum/reports/batch_latency_report.md`
- `experiments/true_parallel_segment_batch_minimum/reports/batch_failure_analysis.md`
- `experiments/true_parallel_segment_batch_minimum/reports/batch_final_decision.md`
- `experiments/pd_hybrid_parallel_probe_full/logs/batch_request_summary.jsonl`
- `experiments/pd_hybrid_parallel_probe_full/logs/batch_event_trace.jsonl`
- `experiments/pd_hybrid_parallel_probe_full/audio/segments/`
- `experiments/pd_hybrid_parallel_probe_full/audio/reconstructed/`
- `experiments/pd_hybrid_parallel_minimum_r3/logs/batch_request_summary.jsonl`
- `experiments/pd_hybrid_parallel_minimum_r3/logs/batch_event_trace.jsonl`
- `experiments/pd_hybrid_parallel_minimum_r3/audio/segments/`
- `experiments/pd_hybrid_parallel_minimum_r3/audio/reconstructed/`
- `experiments/pd_hybrid_parallel_minimum_r3/reports/parallel_runtime_validity_report.md`
- `experiments/pd_hybrid_parallel_minimum_r3/reports/batch_latency_report.md`
- `experiments/pd_hybrid_parallel_minimum_r3/reports/batch_failure_analysis.md`
- `experiments/pd_hybrid_parallel_minimum_r3/reports/batch_final_decision.md`

## Hard-Gate Decision

The runtime gate is satisfied for the expanded minimum matrix:
`P2_parallel_segment_batch2`, `P3_parallel_segment_batch3`,
`PD2_parallel_hybrid_batch2`, and `PD3_parallel_hybrid_batch3` all produced
valid rows. The expanded matrix recorded `180` successful batch rows, `180`
reconstructed WAV files, `495` segment WAV files, `45513` event trace rows,
and `0` error rows.

Production selection remains gated: p95 first ordered audio is still above the
1500 ms short-sample interaction target for every variant, PD2/PD3 are much
slower than P2/P3, and human audio seam review has not been completed. No
production default changes in this evidence layer.

## Final Decision

- Production default: `none`
- Operational fallback: `S_serial_segment_baseline`
- Research candidate: `P2_parallel_segment_batch2`,
  `P3_parallel_segment_batch3`, `PD2_parallel_hybrid_batch2`,
  `PD3_parallel_hybrid_batch3`
- Next optimization candidate: reduce first ordered audio latency and run human
  seam-quality review. PD2/PD3 are valid hybrid implementations, but their p95
  latency confirms the prefix/window streaming cost remains too high for the
  current product path.

## Next Patch

Keep the true-parallel segment runner, then optimize queue strategy and audio
playback policy for P2/P3. Keep PD2/PD3 as research evidence until
cache-aware BreezyVoice/CosyVoice2 streaming can reduce prefix/window
recomputation cost.
