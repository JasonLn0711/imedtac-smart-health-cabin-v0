---
id: smart-health-cabin-breezyvoice-unblock-cd-true-streaming-runtime-codex-goal-prompt
title: "BreezyVoice Unblock C/D True Streaming Runtime Codex Goal Prompt"
date: 2026-06-26
topic: smart-health-cabin
type: codex-goal-prompt
status: active
supersedes:
  - ./breezyvoice-streaming-2x2-live-all-variant-experiment-codex-goal-prompt.md
source:
  - ../evidence/2026-06-26-breezyvoice-streaming-2x2-live-experiment-log.md
  - ./breezyvoice-streaming-2x2-factorial-experiment-codex-goal-prompt.md
  - ../../scripts/tts-benchmark/README.md
external_primary_sources:
  - https://github.com/FunAudioLLM/CosyVoice
  - https://github.com/FunAudioLLM/CosyVoice/blob/main/cosyvoice/cli/model.py
  - https://arxiv.org/abs/2501.17790
  - https://arxiv.org/abs/2412.10117
---

# Codex Goal Prompt - Unblock BreezyVoice C/D True Streaming Runtime

Using FIRST PRINCIPLE, continue inside:

```text
/home/jnclaw/every_on_git_jnclaw/phd-life-system/imedtac-smart-health-cabin-v0
```

This is not a smoke-test task. This is not an A/B-only benchmark task.

The correct next objective is:

```text
Unblock C_token and D_hybrid by implementing true token/audio streaming in the
BreezyVoice runtime, prove it with a streaming validity probe, then run the
ABCD live benchmark only after C/D validity passes.
```

## Why This Goal Exists

The prior live run proved that the current project can run live BreezyVoice
A/B:

- Prior live run path: `experiments/live_tts_streaming_pilot/`
- Prior A/B result: `A_original` 5 real WAV OK, `B_segment` 5 real WAV OK
- Prior C/D result: `source_blocked`
- Prior evidence: `docs/evidence/2026-06-26-breezyvoice-streaming-2x2-live-experiment-log.md`
- Prior commits:
  - `2ffcdba feat: add BreezyVoice TTS benchmark harness`
  - `5007031 docs: record BreezyVoice live streaming experiment`

The prior blocked result is useful engineering evidence. It is not the final
product or experiment answer.

The current source-level finding is:

- BreezyVoice API currently waits for full inference.
- `StreamingResponse` currently streams completed WAV bytes, not generation-time
  audio.
- BreezyVoice/CosyVoice local runtime currently runs full LLM token generation,
  full Flow mel generation, then full HiFT/HiFiGAN waveform generation before
  returning `tts_speech`.
- The local LLM has an internal token decode loop, but it returns a full token
  tensor at the end instead of yielding token chunks.

These findings define the implementation target. They are not a reason to stop.

## External Technical Basis

Use primary sources only when refreshing upstream behavior.

The CosyVoice upstream repository documents current streaming-oriented support,
including text-in streaming, audio-out streaming, and low-latency operation.
BreezyVoice is built on CosyVoice and adapts the stack for Taiwanese Mandarin
with phonetic control, S3 tokenizer, LLM, OT-CFM, and G2P changes. CosyVoice 2
describes chunk-aware causal flow matching as a key model-side design for
supporting both streaming and non-streaming synthesis.

Treat these references as implementation leads, not as proof that the local
BreezyVoice fork already supports true streaming.

## Non-Negotiable Rule

Do not mark this goal complete after:

- deterministic smoke tests
- dry runs
- mocked inference
- synthetic timing
- fake generated audio
- source-level blocked reports
- A/B-only live runs
- C/D implemented as renamed `B_segment`
- HTTP `StreamingResponse` over an already-completed WAV
- text segmentation pretending to be token/audio streaming

Smoke tests are allowed only as preflight checks. They are not accepted
deliverables.

If true C/D live inference cannot be implemented, the only valid final status is:

```text
BLOCKED_UNRESOLVED
```

In that case:

- Do not say goal complete.
- Do not produce `final_decision.md` as if the experiment succeeded.
- Produce `blocked_unresolved_report.md`.
- Record exact missing runtime capability.
- Record exact files/functions inspected.
- Record exact attempted patch.
- Record exact failure mode.
- Record next implementation steps.

## Status Vocabulary

Use only these status labels in progress reports and final summary:

- `PREFLIGHT_ONLY`
- `STREAMING_IMPL_IN_PROGRESS`
- `C_D_TRUE_STREAMING_READY`
- `LIVE_MINIMUM_ABCD_COMPLETED`
- `LIVE_FULL_ABCD_COMPLETED`
- `BLOCKED_UNRESOLVED`

Never use `DONE`, `COMPLETE`, or `GOAL COMPLETE` unless status is either:

- `LIVE_MINIMUM_ABCD_COMPLETED`
- `LIVE_FULL_ABCD_COMPLETED`

## Required Work Order

Do the work in this order:

1. Inspect current project documents, benchmark scripts, and prior evidence.
2. Inspect local BreezyVoice source and upstream CosyVoice streaming source.
3. Create a safe implementation branch for BreezyVoice runtime changes.
4. Implement or port true token/audio streaming runtime support.
5. Add `streaming_runtime_probe.py`.
6. Run streaming validity probes for C and D.
7. Only if probes pass, run ABCD randomized paired live benchmark.
8. Produce reports and evidence.
9. Update extensible docs and source indexes.
10. Commit logical changes separately.

Do not jump directly to the full ABCD benchmark.

## Project And Repository Boundaries

Follow all repo instructions, especially `AGENTS.md`.

This Smart Health Cabin repo owns:

- benchmark scripts
- manifests
- sidecar integration
- experiment logs
- evidence reports
- decision reports
- source index entries
- Codex goal prompts

The local BreezyVoice repo owns:

- BreezyVoice runtime patch
- CosyVoice streaming state-machine port
- model inference changes
- any experimental runtime endpoint needed by the benchmark

Before editing external BreezyVoice source:

```bash
cd /home/jnclaw/every_on_git_jnclaw/BreezyVoice
git status --short -uall
git branch --show-current
git rev-parse --short HEAD
git remote -v
```

If it is a git repo, create a feature branch such as:

```text
feat/breezyvoice-true-streaming-runtime
```

Do not force-push. Do not reset user work. Do not leave sidecar servers running
at the end.

Do not disturb an existing production-like BreezyVoice upstream on port `9003`
unless explicitly needed. Prefer a separate experiment port such as `8012`,
`8015`, or another free port.

## Documentation Extensibility Contract

Design the new documents so the next experiments can extend them without
rewriting them.

Use these conventions:

- Every new JSONL row has a `schema_version`.
- Every report names `run_id`, local timestamp, UTC timestamp, repo commit, and
  BreezyVoice commit.
- Every report distinguishes `strict_breezyvoice` from `product_streaming_backend`
  if a CosyVoice2/3 backend is introduced.
- Every new artifact path appears in `docs/source-index.md`.
- Evidence files are date-prefixed and experiment-specific.
- Keep large generated audio and per-run logs under ignored
  `experiments/<run_id>/`.
- Keep durable summaries under `docs/evidence/`.
- Keep reusable command documentation under `scripts/tts-benchmark/README.md`.
- Keep future prompt files under `docs/prompts/`.
- Use appendable sections instead of one-off prose:
  - `Run Registry`
  - `Source Inspection`
  - `Implementation Attempt`
  - `Streaming Validity`
  - `Benchmark Result`
  - `Decision`
  - `Next Patch`

Update or create these durable files:

```text
docs/evidence/<date>-breezyvoice-true-streaming-runtime-unblock-log.md
docs/source-index.md
scripts/tts-benchmark/README.md
docs/prompts/<this prompt file>
```

If the ABCD benchmark runs, create:

```text
docs/evidence/<date>-breezyvoice-true-streaming-abcd-live-experiment-log.md
```

## Core Experiment Design

This remains a 2x2 factorial experiment after C/D are unblocked.

Factors:

- Factor 1: segment-level generator streaming
- Factor 2: CosyVoice-style token/audio streaming

Variants:

- `A_original`: segment streaming OFF, token/audio streaming OFF
- `B_segment`: segment streaming ON, token/audio streaming OFF
- `C_token`: segment streaming OFF, token/audio streaming ON
- `D_hybrid`: segment streaming ON, token/audio streaming ON

Important distinction:

- A/B may be used as implementation milestones.
- C/D may be used as implementation milestones.
- Final comparison must run A/B/C/D together in one randomized paired live
  benchmark after true C/D implementation is available.
- Do not compare final results across different run IDs.
- Do not run A/B today and C/D tomorrow as the final comparison.

## True Streaming Definitions

### A_original

A is the current offline BreezyVoice behavior:

```text
input text -> full inference -> full waveform -> one complete output
```

A may return one completed WAV or one completed PCM response.

### B_segment

B must perform real segment-level streaming:

```text
input text
-> normalize
-> bopomofo
-> split into sentence-like segments
-> synthesize segment 1
-> send/play segment 1
-> synthesize segment 2
-> send/play segment 2
-> ...
```

B is valid only if, for multi-segment samples:

- `chunk_count >= segment_count`
- `first_audio_chunk_sent < last_audio_chunk_sent`
- first audio is emitted before all later segments are synthesized
- logs show segment index and timing per segment

B is invalid if it only returns one complete concatenated WAV without
per-segment emission/timing evidence.

### C_token

C must perform true token/audio streaming inside the model runtime.

C is valid only if:

- BreezyVoice/CosyVoice runtime exposes speech-token generation events before
  full utterance completion.
- Event trace includes `first_speech_token`.
- Event trace includes `first_mel_chunk` if flow chunking is implemented.
- Event trace includes `first_pcm_chunk`.
- For long samples, `first_pcm_chunk` occurs before the full utterance is
  completely generated.
- At least one non-final audio chunk is produced before final audio completion.
- Logs include `chunk_index`, `token_start`, `token_end`, `is_final`, and chunk
  duration.
- C does not rely on text segmentation.
- C does not use HTTP first byte of a completed WAV as fake streaming.

If full flow/vocoder streaming cannot be implemented directly, implement a
conservative real prefix/window streaming strategy before declaring blocked:

- make LLM yield speech tokens incrementally
- accumulate speech tokens until a configurable chunk threshold
- run flow/vocoder on the current prefix or rolling window
- emit only the new stable audio region after trimming overlap
- use overlap/fade to reduce seams
- log recomputation cost and overlap duration
- ensure first emitted PCM occurs before full utterance completion

This may be inefficient. It is acceptable for the experiment if it is real and
correctly logged.

### D_hybrid

D must combine B and C:

```text
input text
-> segment boundary detector
-> for each segment, token/audio streaming inside that segment
-> emit audio chunks before segment completion when possible
-> continue next segment
```

D is valid only if:

- it uses sentence/segment boundaries
- each segment uses the same true token/audio streaming mechanism as C
- logs include both `segment_index` and `chunk_index`
- for long multi-segment samples, `first_pcm_chunk` occurs before final segment
  completion
- D is not just `B_segment`

## Source Evidence To Inspect First

Inspect these files first and preserve exact findings in the evidence document:

```text
/home/jnclaw/every_on_git_jnclaw/BreezyVoice/api.py
/home/jnclaw/every_on_git_jnclaw/BreezyVoice/single_inference.py
/home/jnclaw/every_on_git_jnclaw/BreezyVoice/cosyvoice/llm/llm.py
/home/jnclaw/every_on_git_jnclaw/BreezyVoice/cosyvoice/cli/model.py
/home/jnclaw/every_on_git_jnclaw/BreezyVoice/cosyvoice/flow/flow.py
/home/jnclaw/every_on_git_jnclaw/BreezyVoice/cosyvoice/hifigan/generator.py
```

Also inspect:

```text
scripts/tts-benchmark/
experiments/live_tts_streaming_pilot/
docs/evidence/2026-06-26-breezyvoice-streaming-2x2-live-experiment-log.md
```

Inspect upstream CosyVoice primary source:

```text
https://github.com/FunAudioLLM/CosyVoice
https://github.com/FunAudioLLM/CosyVoice/blob/main/cosyvoice/cli/model.py
```

Search for and study these upstream concepts:

```text
stream=True
tts(stream=True)
inference stream
llm_job
token2wav
token_min_hop_len
token_hop_len
token_overlap_len
mel_overlap_dict
flow_cache_dict
hift_cache_dict
fade_in_out
pre_lookahead_len
finalize
```

Confirm the current prior findings:

- `api.py` currently waits for `inference_zero_shot_no_normalize(...)`.
- It saves full `output["tts_speech"]` into a WAV buffer.
- `StreamingResponse` currently streams completed bytes, not generation-time
  audio.
- `single_inference.py` currently runs LLM -> Flow -> HiFT/HiFiGAN as full-output
  stages.
- `llm.py` has an internal token loop but returns a full token tensor at the end.

These findings are not a reason to stop. They define the runtime patch.

## Implementation Strategy

### Strategy 1: Strict BreezyVoice C/D

Preserve BreezyVoice weights, Taiwanese Mandarin normalization, bopomofo control,
speaker prompt path, and current model stack.

Port upstream CosyVoice streaming runtime concepts into the local BreezyVoice
runtime.

This is the preferred research-clean path.

Expected target functions may include:

```text
llm.inference_stream(...)
model.inference_stream(...)
inference_zero_shot_no_normalize_stream(...)
tts_stream(...)
token2wav(...)
fade_in_out(...)
```

### Strategy 2: Product Streaming Backend Fallback

If strict BreezyVoice streaming cannot produce true non-final PCM chunks within
the implementation window, create a separate product-candidate path using a
true CosyVoice2/3 streaming backend.

This must not be mislabeled as strict BreezyVoice C/D.

Use separate variant names:

```text
E_cosyvoice2_token
F_cosyvoice2_hybrid
```

This path can support Smart Health Cabin product latency decisions, but it must
not be mixed into strict BreezyVoice ABCD comparison.

## Required Runtime Changes

### Layer 1: LLM Token Streaming

Change the current full-token return path into a stream-capable path.

Target behavior:

```python
def inference_stream(...):
    for token in decode_loop(...):
        yield token
```

Event trace must include:

```text
llm_start
first_speech_token
speech_token_chunk
llm_end
```

This layer alone is not enough for C/D validity. It proves token streaming, not
audio streaming.

### Layer 2: Flow Mel Chunking

Implement or port a chunk-aware Flow path.

Preferred approach:

- port upstream CosyVoice token hop / overlap / lookahead logic
- maintain flow cache where available
- produce mel chunks or prefix-window mel updates
- record first mel chunk timing

Event trace must include:

```text
flow_start
first_mel_chunk
mel_chunk
flow_end
```

### Layer 3: HiFT/HiFiGAN PCM Chunking

Implement or port continuous vocoder output.

Required controls:

- mel overlap
- speech overlap
- fade-in / fade-out
- hift cache
- source cache if available
- final chunk handling
- reconstruction path for one full WAV per request

Event trace must include:

```text
vocoder_start
first_pcm_chunk
pcm_chunk
vocoder_end
first_audio_chunk_encoded
first_audio_chunk_sent
last_audio_chunk_sent
```

## Streaming Runtime Probe

Before running the full ABCD benchmark, create:

```text
scripts/tts-benchmark/streaming_runtime_probe.py
```

The probe does one job:

```text
Prove C/D can emit real non-final PCM chunks before full utterance completion.
```

Run the probe on at least:

- one short acknowledgement
- one long single-sentence text
- one multi-sentence PHQ-style text

Required probe output:

```text
experiments/<run_id>/logs/request_summary.jsonl
experiments/<run_id>/logs/event_trace.jsonl
experiments/<run_id>/logs/error_log.jsonl
experiments/<run_id>/audio/C_token/
experiments/<run_id>/audio/D_hybrid/
experiments/<run_id>/reports/streaming_validity_report.md
```

Pass criteria:

- `C_token` long text has `chunk_count > 1`.
- `C_token` long text has `first_speech_token`.
- `C_token` long text has `first_pcm_chunk`.
- `C_token` long text has `first_pcm_chunk_ms < total_synthesis_ms`.
- `D_hybrid` multi-sentence text has `segment_count > 1`.
- `D_hybrid` multi-sentence text has `chunk_count > segment_count`.
- Reconstructed WAV files exist and are playable.
- Event trace contains `first_speech_token`, `first_pcm_chunk`, `pcm_chunk`, and
  `last_audio_chunk_sent`.

If this probe fails, stop with `BLOCKED_UNRESOLVED`. Do not run ABCD benchmark.

## Hybrid Segment Rules

D uses zh-TW sentence boundary detection.

Hard boundaries:

```text
。！？；?!
```

Soft boundaries:

```text
，、,
```

Use soft boundaries only when segment length exceeds a configurable threshold.

Never split inside:

- bopomofo annotations such as `[:ㄏㄠ3]`
- `PHQ-9`
- `API`
- `ASR`
- `LLM`
- `TTS`
- `128/76`
- `HbA1c 6.5%`
- URLs
- filenames
- English abbreviations

## Benchmark Manifest

Use synthetic, non-PHI text only.

Create or update:

```text
experiments/manifests/tts_eval_manifest.jsonl
```

Minimum live benchmark after C/D validity passes:

- at least 12 samples
- at least 3 repeats
- all 4 strict BreezyVoice variants
- total minimum: `12 x 3 x 4 = 144` real TTS variant-runs

Full benchmark target if feasible:

- at least 40 samples
- at least 10 repeats
- all 4 strict BreezyVoice variants
- total target: `40 x 10 x 4 = 1600` real TTS variant-runs

If full benchmark is too expensive, run the minimum live benchmark. Do not fall
back to smoke-only.

Sample categories must include:

- short acknowledgement
- medium instruction
- long PHQ-style question
- multi-sentence questionnaire prompt
- no-punctuation long sentence
- numeric medical values
- code-switching terms: `ASR`, `LLM`, `TTS`, `API`, `GPU`, `PHQ-9`
- Taiwanese Mandarin medical terms
- polyphone-sensitive terms
- punctuation-heavy text

## Randomized Paired Execution

The final benchmark must not run all A, then all B, then all C, then all D.

For every `(sample_id, repeat_idx)`, run all four variants in randomized order.

Example:

```text
sample_001 repeat_0: C, A, D, B
sample_001 repeat_1: B, D, A, C
sample_002 repeat_0: A, C, B, D
```

Use a fixed random seed and record it.

This reduces confounding from:

- GPU temperature
- CUDA warm-up
- allocator state
- background system load
- request order
- text length distribution
- thermal throttling

## Required Logs And Artifacts

Every live request must produce real JSONL logs.

Required files for successful ABCD benchmark:

```text
experiments/<run_id>/logs/request_summary.jsonl
experiments/<run_id>/logs/event_trace.jsonl
experiments/<run_id>/logs/gpu_metrics.jsonl
experiments/<run_id>/logs/client_metrics.jsonl
experiments/<run_id>/logs/error_log.jsonl
experiments/<run_id>/audio/A_original/
experiments/<run_id>/audio/B_segment/
experiments/<run_id>/audio/C_token/
experiments/<run_id>/audio/D_hybrid/
experiments/<run_id>/reports/latency_report.md
experiments/<run_id>/reports/quality_report.md
experiments/<run_id>/reports/failure_analysis.md
experiments/<run_id>/reports/streaming_validity_report.md
experiments/<run_id>/reports/final_decision.md
```

If C/D remain unresolved, do not create `final_decision.md`. Create:

```text
experiments/<run_id>/reports/blocked_unresolved_report.md
```

## Required Request Summary Fields

Each request summary JSON object must include:

- `schema_version`
- `run_id`
- `variant`
- `git_commit`
- `breezyvoice_commit`
- `model_id`
- `model_hash`
- `speaker_profile_id`
- `speaker_prompt_audio_hash`
- `sample_id`
- `repeat_idx`
- `input_text`
- `normalized_text`
- `bopomofo_text`
- `char_count`
- `segment_count`
- `chunk_count`
- `streaming_validity`
- `cache_enabled`
- `cache_hit`
- `audio_duration_sec`
- `ttfa_server_ms`
- `ttfa_client_ms`
- `total_synthesis_ms`
- `rtf`
- `first_speech_token_ms`
- `first_mel_chunk_ms`
- `first_pcm_chunk_ms`
- `first_audio_chunk_sent_ms`
- `chunk_jitter_p95_ms`
- `max_inter_chunk_gap_ms`
- `buffer_underrun_count`
- `gpu_memory_peak_mb`
- `gpu_util_mean`
- `status`
- `error`

Use `null` only when a metric is not technically available, and explain why in
the evidence report.

## Required Event Trace Fields

Each event trace JSON object must include:

- `schema_version`
- `run_id`
- `request_id`
- `variant`
- `sample_id`
- `repeat_idx`
- `event`
- `t_monotonic_ns`
- `t_wall_local`
- `t_wall_utc`
- `segment_index`
- `chunk_index`
- `token_start`
- `token_end`
- `audio_chunk_duration_ms`
- `bytes`
- `is_final`
- `gpu_allocated_mb`
- `gpu_reserved_mb`

Use monotonic clocks for duration. Use `torch.cuda.synchronize()` around CUDA
timing when measuring model-stage durations.

## Streaming Validity Report

Create:

```text
experiments/<run_id>/reports/streaming_validity_report.md
```

For each variant, explicitly state whether it is valid.

A valid C/D report must show:

- `first_speech_token` exists
- `first_pcm_chunk` exists
- for long samples, first non-final PCM chunk is emitted before full utterance
  completion
- long samples have `chunk_count > 1`
- C does not depend on sentence segmentation
- D depends on segmentation and also uses token/audio streaming inside segments
- generated audio files exist
- event traces are non-empty and real

If C/D fail these criteria:

- Do not include them in final ranking.
- Mark final status `BLOCKED_UNRESOLVED`.
- Create `blocked_unresolved_report.md`.

## Metrics

Compute at least:

- `TTFA_server`
- `TTFA_client` if available
- `total_synthesis_time`
- `RTF`
- p50 / p90 / p95 / p99 latency
- first speech token latency
- first mel chunk latency
- first PCM chunk latency
- first audio chunk sent latency
- inter-chunk jitter
- max inter-chunk gap
- generated audio duration
- GPU memory peak
- GPU utilization
- error rate
- timeout rate
- streaming validity rate

Optional if available:

- ASR-based CER/WER on generated TTS audio
- number recall
- keyword recall
- clipping ratio
- silence ratio
- seam discontinuity score

## Statistical Analysis

Use paired analysis by `sample_id` and `repeat_idx`.

Report:

- A vs B
- A vs C
- B vs D
- C vs D
- all-variant ranking

Compute factorial effects:

```text
Segment effect ~= ((B - A) + (D - C)) / 2
Token effect ~= ((C - A) + (D - B)) / 2
Interaction ~= (D - C) - (B - A)
```

For latency metrics, lower is better. Present both absolute difference and
relative improvement.

Report p50 and p95 prominently. Do not optimize only mean latency.

## Hard Gates

A variant cannot be selected as production default if any of these occur:

- invalid streaming implementation
- fake streaming
- failure rate > 0.5%
- OOM rate > 0.1%
- p95 RTF > 1.0
- p95 TTFA client > 1500 ms, if client metric is available
- p95 TTFA server > 1500 ms, if client metric is unavailable
- severe audio corruption
- repeated or truncated speech in long samples
- C/D chunk streaming produces unusable audio seams

If no variant passes hard gates, say so. Do not force a winner.

## Final Decision Rule

After hard gates, compute a weighted score:

- 30% TTFA
- 20% p95 turn latency or p95 TTFA if turn latency unavailable
- 15% RTF
- 15% audio quality / audio validity
- 10% robustness
- 5% resource efficiency
- 5% maintainability

The final recommendation must distinguish:

- production default
- operational fallback
- research candidate
- next optimization candidate

Expected but not assumed:

- A may remain the safest fallback.
- B may be the best MVP candidate.
- C may be high-risk but informative.
- D may become the best long-term candidate only if true token/audio streaming is
  stable.

Do not assume D wins.

## Required Reports

Always create or update:

```text
docs/evidence/<date>-breezyvoice-true-streaming-runtime-unblock-log.md
```

The runtime unblock evidence document must include:

- source files inspected
- upstream source files inspected
- exact implementation changes
- why previous C/D were blocked
- how this run attempted to unblock C/D
- whether C/D are now valid
- exact probe commands
- exact run IDs
- artifact paths
- final status label

Only after C/D validity passes and ABCD live benchmark completes, create:

```text
docs/evidence/<date>-breezyvoice-true-streaming-abcd-live-experiment-log.md
experiments/<run_id>/reports/final_decision.md
```

The final decision must include:

- comparison table
- latency distribution summary
- streaming validity table
- failure analysis
- engineering maintainability assessment
- selected default / fallback / research candidate
- next sprint tasks

If C/D remain unresolved, create instead:

```text
experiments/<run_id>/reports/blocked_unresolved_report.md
```

## Validation Commands

At minimum, run:

```bash
python3 -m py_compile scripts/tts-benchmark/*.py
python3 scripts/tts-benchmark/generate_manifest.py --help
python3 scripts/tts-benchmark/run_tts_matrix.py --help
python3 scripts/tts-benchmark/analyze_tts_matrix.py --help
python3 scripts/tts-benchmark/streaming_runtime_probe.py --help
corepack pnpm validate:json
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
git diff --check
```

If any command is unavailable, record the exact command, exit status, and
reason.

These validations are engineering checks. They are not the experiment.

## Completion Criteria

The task is complete only if all of the following are true:

1. A/B/C/D implementations exist and are selectable by config or CLI.
2. C/D are not fake streaming.
3. C/D pass streaming validity criteria.
4. A/B/C/D are run in one randomized paired live benchmark matrix.
5. Real audio files exist for all successful runs.
6. Real request summary logs exist.
7. Real event trace logs exist.
8. GPU metrics are recorded.
9. `streaming_validity_report.md` exists.
10. `latency_report.md` exists.
11. `failure_analysis.md` exists.
12. `final_decision.md` exists only if C/D are valid and live ABCD benchmark
    completed.
13. Final status is either `LIVE_MINIMUM_ABCD_COMPLETED` or
    `LIVE_FULL_ABCD_COMPLETED`.

If any of 1-8 fail, final status must be `BLOCKED_UNRESOLVED`.

## Final Response Format

At the end, report exactly:

```text
Status: <one of the allowed status labels>

Run ID: <run_id or none>

Artifacts:
- <path>
- <path>
- <path>

Live counts:
- A_original: <N real runs, N audio files>
- B_segment: <N real runs, N audio files>
- C_token: <N real runs, N audio files>
- D_hybrid: <N real runs, N audio files>

Streaming validity:
- A_original: <valid baseline / invalid>
- B_segment: <valid / invalid>
- C_token: <valid / invalid>
- D_hybrid: <valid / invalid>

Decision:
- Production default: <variant or none>
- Operational fallback: <variant or none>
- Research candidate: <variant or none>
- Next optimization candidate: <variant or none>
```

Do not say the goal is complete unless the final status is
`LIVE_MINIMUM_ABCD_COMPLETED` or `LIVE_FULL_ABCD_COMPLETED`.
