# BreezyVoice Streaming 2x2 Experiment Log

## Experiment Name And Purpose

BreezyVoice Streaming 2x2 factorial smoke for Smart Health Cabin Avatar TTS latency architecture.

## Date And Time

Local started_at: `2026-06-26T09:42:47.459+08:00`

UTC started_at: `2026-06-26T01:42:47.459Z`

Local analyzed_at: `2026-06-26T09:46:03.372+08:00`

UTC analyzed_at: `2026-06-26T01:46:03.372Z`

## Repo And Runtime

Run directory: `experiments/smoke_tts_streaming`

Command: `python3 scripts/tts-benchmark/run_tts_matrix.py --manifest experiments/manifests/tts_eval_manifest.jsonl --variants A_original,B_segment --repeats 1 --warmup 1 --randomize true --mode deterministic --output experiments/smoke_tts_streaming`

Mode: `deterministic`

## Provider Configuration And Services

See `manifest/environment.yaml` and `manifest/model_manifest.yaml` for hardware, GPU, service URL, process, and port snapshots.

## Sample And Repeat Counts

Main rows: `88`

Requested variants: `A_original, B_segment`

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
| A_original | 423.0 | 623.0 | 639.0 | 0.215 | 0.000 | pass |
| B_segment | 391.0 | 519.0 | 728.0 | 0.251 | 0.000 | pass |
| C_token |  |  |  |  |  | research_only |
| D_hybrid |  |  |  |  |  | research_only |

## Hard Gates

| Variant | Decision | Reason |
| --- | --- | --- |
| A_original | pass | passes deterministic/live measured gates available in this run |
| B_segment | pass | passes deterministic/live measured gates available in this run |
| C_token | research_only | capability flag is disabled |
| D_hybrid | research_only | capability flag is disabled |

## Weighted Score

| Variant | Score | Expected role |
| --- | --- | --- |
| A_original | 0.99 | Baseline and fallback |
| B_segment | 0.978 | MVP candidate |
| C_token |  | Research candidate |
| D_hybrid |  | Product candidate after C passes quality gates |

## Recommended Default And Fallback

No production default change from deterministic smoke. B_segment is the MVP live A/B candidate.

A_original remains fallback.

## Scope Controls

This run uses synthetic/repo-owned text only. Raw patient audio and private data are outside the benchmark path. The production TTS sidecar endpoint remains unchanged.

## Next Validation Action

Start live BreezyVoice upstream and TTS sidecar, rerun A/B with `--mode live`, then review audio quality before selecting a product default.

## Validation Commands And Results

Local validation window:

```text
Local started_at: 2026-06-26T09:41:17.589+08:00
Local ended_at:   2026-06-26T09:44:00+08:00
UTC started_at:   2026-06-26T01:41:17.589Z
UTC ended_at:     2026-06-26T01:44:00Z
```

Commands and outcomes:

| Command | Result |
| --- | --- |
| `python3 scripts/tts-benchmark/generate_manifest.py --domain-profiles phq9_zh_tw,smart_cabin_measurement,kiosk_faq --output experiments/manifests/tts_eval_manifest.jsonl` | Passed; wrote `44` TTS rows plus dialogue and human-eval manifests. |
| `python3 -m py_compile scripts/tts-benchmark/*.py` | Passed. |
| `python3 scripts/tts-benchmark/generate_manifest.py --help` | Passed. |
| `python3 scripts/tts-benchmark/run_tts_matrix.py --help` | Passed. |
| `python3 scripts/tts-benchmark/analyze_tts_matrix.py --help` | Passed. |
| `python3 scripts/tts-benchmark/collect_environment.py --help` | Passed. |
| `corepack pnpm smoke:tts-streaming` | Passed; deterministic A/B smoke wrote `92` requests including warmup and `88` main request summaries. |
| `corepack pnpm analyze:tts-streaming` | Passed; wrote latency, quality, dialogue-fluency, failure, human-eval, final-decision, and evidence reports. |
| `python3 scripts/tts-benchmark/run_tts_matrix.py --manifest experiments/manifests/tts_eval_manifest.jsonl --variants A_original,B_segment,C_token,D_hybrid --repeats 1 --warmup 0 --randomize false --mode deterministic --limit 1 --output experiments/smoke_tts_streaming_capability_flags` | Passed; A/B returned `ok`; C/D returned `skipped_capability_disabled`. |
| Domain and timestamp invariant check | Passed; manifest includes PHQ-9, Smart Cabin measurement, kiosk FAQ, and Taiwan zh-TW stress domains; `88` main summaries include local/UTC timestamps; `375` event rows include local/UTC wall time and monotonic time. |
| `git diff --check` | Passed. |
| `corepack pnpm validate:json` | Passed. |
| `python3 -c 'import json, pathlib; [json.loads(line) for p in pathlib.Path("experiments/manifests").glob("*.jsonl") for line in p.read_text(encoding="utf-8").splitlines() if line.strip()]; print("jsonl ok")'` | Passed. |
| `corepack pnpm lint` | Passed. |
| `corepack pnpm typecheck` | Passed. |
| `corepack pnpm test` | Passed; `8` test files, `78` tests. |
| `corepack pnpm build` | Passed; Vite reported existing large chunk warnings for admin and kiosk bundles. |

Live-provider status:

```text
live_provider_status = not_required_for_deterministic_smoke
smoke_mode = deterministic
next_validation_action = start TTS sidecar on 8012, keep BreezyVoice upstream on 9003, and rerun A/B with --mode live
```
