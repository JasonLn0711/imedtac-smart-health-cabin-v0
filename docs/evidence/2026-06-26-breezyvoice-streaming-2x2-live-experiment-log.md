# BreezyVoice Streaming 2x2 Experiment Log

## Experiment Name And Purpose

BreezyVoice Streaming 2x2 live pilot for Smart Health Cabin Avatar TTS latency architecture.

## Date And Time

Local started_at: `2026-06-26T10:09:19.992+08:00`

UTC started_at: `2026-06-26T02:09:19.992Z`

Local analyzed_at: `2026-06-26T10:11:22.179+08:00`

UTC analyzed_at: `2026-06-26T02:11:22.179Z`

## Repo And Runtime

Run directory: `experiments/live_tts_streaming_pilot`

Command: `python3 scripts/tts-benchmark/run_tts_matrix.py --manifest experiments/manifests/tts_eval_manifest.jsonl --variants A_original,B_segment,C_token,D_hybrid --repeats 1 --warmup 1 --randomize true --mode live --limit 5 --output experiments/live_tts_streaming_pilot`

Mode: `live`

## Provider Configuration And Services

See `manifest/environment.yaml` and `manifest/model_manifest.yaml` for hardware, GPU, service URL, process, and port snapshots.

## Hardware, GPU, Process, And Port Snapshot

- Machine: `Linux-6.17.0-35-generic-x86_64-with-glibc2.39`, RAM `62.4 GB`, Python `3.12.3`
- GPU: `NVIDIA GeForce RTX 4090 Laptop GPU`, driver `580.159.03`, memory `16376 MB`, start temperature `46 C`
- BreezyVoice upstream: `http://localhost:9003/v1`, PID `388803`, process `pt_main_thread`
- TTS sidecar: `http://localhost:8012`, PID `660485`, process `python -m uvicorn app:app`
- Additional live services observed: API `3000`, API `3010`, voice-agent `3011`, Ollama `11434`
- Main logs: `logs/request_summary.jsonl` has `20` rows and `logs/event_trace.jsonl` has `63` rows
- Warmup logs: `logs/warmup_summary.jsonl` has `8` rows and `logs/warmup_event_trace.jsonl` has `25` rows

## Sample And Repeat Counts

Main rows: `20`

Requested variants: `A_original, B_segment, C_token, D_hybrid`

Repeats: `1`

Warmup: `1`

## Variant Registry

| Variant | Segment | Token | Enabled | Role |
| --- | --- | --- | --- | --- |
| A_original | False | False | True | Baseline and fallback |
| B_segment | True | False | True | MVP candidate |
| C_token | False | True | False | Research candidate |
| D_hybrid | True | True | False | Product candidate after C passes quality gates |

## Result Summary

| Variant | TTFA p50 | TTFA p95 | Total p95 | RTF p95 | Failure rate | Gate |
| --- | --- | --- | --- | --- | --- | --- |
| A_original | 3630.864 | 6177.78 | 6170.18 | 0.524 | 0.000 | fail |
| B_segment | 2219.259 | 3236.798 | 6992.605 | 0.582 | 0.000 | fail |
| C_token |  |  |  |  |  | source_blocked |
| D_hybrid |  |  |  |  |  | source_blocked |

## Hard Gates

| Variant | Decision | Reason |
| --- | --- | --- |
| A_original | fail | P95 TTFA client 6177.78ms > 1500ms |
| B_segment | fail | P95 TTFA client 3236.798ms > 1500ms |
| C_token | source_blocked | Source-level blocker: local BreezyVoice returns full tokens, full mel, and full waveform only. Evidence: api.py:95-103 streams a completed WAV buffer; single_inference.py:192-215 returns only {'tts_speech'} after llm, flow, and hift complete; cosyvoice/llm/llm.py:191-206 appends tokens internally then returns one tensor; cosyvoice/flow/flow.py:100-141 returns one mel tensor; cosyvoice/hifigan/generator.py:390-391 returns one waveform tensor. |
| D_hybrid | source_blocked | Source-level blocker: D_hybrid depends on C_token. Segment scheduling exists in this benchmark, but local BreezyVoice has no real token/mel/PCM chunk API to run inside each segment. |

## Source-Level Blockers

| Variant | Source-level blocker | Next patch |
| --- | --- | --- |
| C_token | Source-level blocker: local BreezyVoice returns full tokens, full mel, and full waveform only. Evidence: api.py:95-103 streams a completed WAV buffer; single_inference.py:192-215 returns only {'tts_speech'} after llm, flow, and hift complete; cosyvoice/llm/llm.py:191-206 appends tokens internally then returns one tensor; cosyvoice/flow/flow.py:100-141 returns one mel tensor; cosyvoice/hifigan/generator.py:390-391 returns one waveform tensor. | Add an upstream experimental inference_stream path: yield speech tokens from LLM decode, add stable token-window Flow inference, add mel-window HiFiGAN overlap/crossfade, then expose an experiment-only sidecar endpoint. |
| D_hybrid | Source-level blocker: D_hybrid depends on C_token. Segment scheduling exists in this benchmark, but local BreezyVoice has no real token/mel/PCM chunk API to run inside each segment. | After C_token inference_stream exists, run that stream per segment and add a small ordered segment scheduler with cancellation and buffer accounting. |

## Weighted Score

| Variant | Score | Expected role |
| --- | --- | --- |
| A_original | 0.822 | Baseline and fallback |
| B_segment | 0.806 | MVP candidate |
| C_token |  | Research candidate |
| D_hybrid |  | Product candidate after C passes quality gates |

## Recommended Default And Fallback

No live variant qualifies as a new production default in this run. Keep A_original as the operational completed-WAV fallback; B_segment is the latency-improvement candidate for the next optimization pass.

A_original remains fallback.

## Scope Controls

This run uses synthetic/repo-owned text only. Raw patient audio and private data are outside the benchmark path. The production TTS sidecar endpoint remains unchanged.

## Next Validation Action

Optimize B_segment TTFA and implement the upstream C_token inference_stream patch path before rerunning C/D.
