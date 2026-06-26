# BreezyVoice True Streaming Runtime Unblock Log

## Run Registry

| Field | Value |
| --- | --- |
| Status label | `LIVE_MINIMUM_ABCD_COMPLETED` |
| Probe run ID | `strict_breezyvoice_streaming_runtime_probe_v2` |
| ABCD pilot run ID | `strict_breezyvoice_abcd_matrix_pilot_v2` |
| Minimum matrix run ID | `strict_breezyvoice_abcd_matrix_minimum` |
| Local window | `2026-06-26T10:43:30+08:00` to `2026-06-26T11:46:55.694+08:00` |
| UTC window | `2026-06-26T02:43:30Z` to `2026-06-26T03:46:55.694Z` |
| Smart Health Cabin base commit at run | `5007031` |
| BreezyVoice branch | `feat/breezyvoice-true-streaming-runtime` |
| BreezyVoice commit base | `d592c9d` |
| Probe command | `/home/jnclaw/every_on_git_jnclaw/BreezyVoice/.venv/bin/python scripts/tts-benchmark/streaming_runtime_probe.py --breezyvoice-root /home/jnclaw/every_on_git_jnclaw/BreezyVoice --model-path MediaTek-Research/BreezyVoice --token-hop-len 25 --output experiments/strict_breezyvoice_streaming_runtime_probe_v2` |
| ABCD pilot command | `/home/jnclaw/every_on_git_jnclaw/BreezyVoice/.venv/bin/python scripts/tts-benchmark/run_true_streaming_matrix.py --manifest experiments/manifests/tts_eval_manifest.jsonl --breezyvoice-root /home/jnclaw/every_on_git_jnclaw/BreezyVoice --model-path MediaTek-Research/BreezyVoice --token-hop-len 25 --limit 1 --repeats 1 --seed 20260626 --output experiments/strict_breezyvoice_abcd_matrix_pilot_v2` |
| Minimum matrix command | `/home/jnclaw/every_on_git_jnclaw/BreezyVoice/.venv/bin/python scripts/tts-benchmark/run_true_streaming_matrix.py --manifest experiments/manifests/tts_eval_manifest.jsonl --breezyvoice-root /home/jnclaw/every_on_git_jnclaw/BreezyVoice --model-path MediaTek-Research/BreezyVoice --token-hop-len 25 --limit 12 --repeats 3 --seed 20260626 --output experiments/strict_breezyvoice_abcd_matrix_minimum` |

## Source Inspection

The prior blocked result was confirmed before implementation:

- `/home/jnclaw/every_on_git_jnclaw/BreezyVoice/api.py` waits for `inference_zero_shot_no_normalize(...)`, saves full `output["tts_speech"]`, then streams an already-completed WAV buffer.
- `/home/jnclaw/every_on_git_jnclaw/BreezyVoice/single_inference.py` used full LLM token generation, full Flow mel generation, then full HiFT/HiFiGAN waveform generation before returning.
- `/home/jnclaw/every_on_git_jnclaw/BreezyVoice/cosyvoice/llm/llm.py` already decoded token-by-token internally, but returned one complete token tensor at the end.
- `/home/jnclaw/every_on_git_jnclaw/BreezyVoice/cosyvoice/flow/flow.py` exposes one full-output `inference(...)` path without upstream `flow_cache`, `streaming`, or `finalize` arguments.
- `/home/jnclaw/every_on_git_jnclaw/BreezyVoice/cosyvoice/hifigan/generator.py` exposes `inference(mel)` and returns one full waveform tensor.

Upstream CosyVoice source was inspected through `https://raw.githubusercontent.com/FunAudioLLM/CosyVoice/main/cosyvoice/cli/model.py`. The useful implementation concepts were:

- `llm_job`
- `token2wav`
- `tts(stream=True)`
- token hop length
- token overlap
- mel overlap
- flow cache
- HiFT cache
- fade-in / fade-out
- final chunk handling

Direct copy was not possible because local BreezyVoice Flow and HiFiGAN signatures do not match the current upstream streaming APIs.

## Implementation Attempt

Strict BreezyVoice path was implemented first.

Modified external BreezyVoice files:

```text
/home/jnclaw/every_on_git_jnclaw/BreezyVoice/cosyvoice/llm/llm.py
/home/jnclaw/every_on_git_jnclaw/BreezyVoice/single_inference.py
```

Implemented runtime behavior:

- Added `TransformerLM.inference_stream(...)` that yields speech tokens during the decode loop.
- Added `CustomCosyVoiceModel.inference_stream(...)`.
- Added prefix/window audio streaming: accumulate generated speech tokens, run Flow/HiFiGAN on the current prefix, emit only the newly available PCM region.
- Added token events and PCM chunk metadata from the generator.
- Added `CustomCosyVoice.inference_zero_shot_no_normalize_stream(...)` with `segment_streaming=False` for C and `segment_streaming=True` for D.
- Corrected `CustomCosyVoice.__init__` to instantiate `CustomCosyVoiceModel`, so the new runtime path is actually used.

Modified Smart Health Cabin files:

```text
scripts/tts-benchmark/streaming_runtime_probe.py
scripts/tts-benchmark/run_true_streaming_matrix.py
scripts/tts-benchmark/README.md
.gitignore
docs/evidence/2026-06-26-breezyvoice-true-streaming-runtime-unblock-log.md
docs/prompts/breezyvoice-unblock-cd-true-streaming-runtime-codex-goal-prompt.md
docs/source-index.md
```

The probe initializes BreezyVoice directly with the BreezyVoice virtualenv and writes request summaries, event traces, generated audio, and a streaming validity report.

The matrix runner loads the same strict BreezyVoice runtime once, then executes selectable `A_original`, `B_segment`, `C_token`, and `D_hybrid` variants in randomized paired order. It keeps `final_decision.md` gated behind the minimum live matrix size, so a pilot can prove routing without overstating the experiment.

## Streaming Validity

Artifact paths:

```text
experiments/strict_breezyvoice_streaming_runtime_probe_v2/logs/request_summary.jsonl
experiments/strict_breezyvoice_streaming_runtime_probe_v2/logs/event_trace.jsonl
experiments/strict_breezyvoice_streaming_runtime_probe_v2/audio/C_token/
experiments/strict_breezyvoice_streaming_runtime_probe_v2/audio/D_hybrid/
experiments/strict_breezyvoice_streaming_runtime_probe_v2/reports/streaming_validity_report.md
```

Probe result:

| Variant | Sample | Valid | Chunks | Token events | PCM events | First speech token ms | First PCM chunk ms | Total synthesis ms | RTF |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `C_token` | `probe_short_ack` | true | 7 | 176 | 7 | 1087.641 | 2587.334 | 13666.666 | 3.898 |
| `D_hybrid` | `probe_short_ack` | true | 8 | 197 | 8 | 390.410 | 1829.745 | 13148.488 | 3.351 |
| `C_token` | `probe_long_no_punctuation` | true | 26 | 632 | 26 | 428.089 | 1881.765 | 57252.781 | 4.537 |
| `D_hybrid` | `probe_long_no_punctuation` | true | 25 | 604 | 25 | 460.817 | 1924.181 | 53728.775 | 4.454 |
| `C_token` | `probe_phq_multisentence` | true | 20 | 501 | 20 | 434.606 | 1897.781 | 41138.613 | 4.111 |
| `D_hybrid` | `probe_phq_multisentence` | true | 23 | 545 | 23 | 406.734 | 1834.440 | 37274.304 | 3.434 |

Streaming validity report:

```text
C_token: 3 / 3 valid
D_hybrid: 3 / 3 valid
```

Event trace summary:

```text
2818 total events
C_token first_speech_token: 3
C_token first_mel_chunk: 3
C_token first_pcm_chunk: 3
C_token pcm_chunk: 53
D_hybrid first_speech_token: 5
D_hybrid first_mel_chunk: 3
D_hybrid first_pcm_chunk: 3
D_hybrid pcm_chunk: 56
```

The `D_hybrid` multi-sentence sample generated separate segment-level stream events and more PCM chunks than segment count.

## ABCD Same-Run Pilot

The strict BreezyVoice ABCD runner was validated with one randomized paired pilot cell. This is not the final benchmark because the required minimum live matrix is 12 samples x 3 repeats x 4 variants.

Artifact paths:

```text
experiments/strict_breezyvoice_abcd_matrix_pilot_v2/logs/request_summary.jsonl
experiments/strict_breezyvoice_abcd_matrix_pilot_v2/logs/event_trace.jsonl
experiments/strict_breezyvoice_abcd_matrix_pilot_v2/logs/gpu_metrics.jsonl
experiments/strict_breezyvoice_abcd_matrix_pilot_v2/logs/error_log.jsonl
experiments/strict_breezyvoice_abcd_matrix_pilot_v2/audio/A_original/
experiments/strict_breezyvoice_abcd_matrix_pilot_v2/audio/B_segment/
experiments/strict_breezyvoice_abcd_matrix_pilot_v2/audio/C_token/
experiments/strict_breezyvoice_abcd_matrix_pilot_v2/audio/D_hybrid/
experiments/strict_breezyvoice_abcd_matrix_pilot_v2/reports/streaming_validity_report.md
experiments/strict_breezyvoice_abcd_matrix_pilot_v2/reports/latency_report.md
experiments/strict_breezyvoice_abcd_matrix_pilot_v2/reports/failure_analysis.md
```

Pilot result:

| Variant | Sample | Status | Valid | Chunks | First PCM chunk ms | Total synthesis ms | Audio file |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `B_segment` | `phq9_zh_tw_001` | `ok` | true | 2 | n/a | 13531.988 | `audio/B_segment/phq9_zh_tw_001__r00.wav` |
| `C_token` | `phq9_zh_tw_001` | `ok` | true | 26 | 1944.611 | 58255.712 | `audio/C_token/phq9_zh_tw_001__r00.wav` |
| `D_hybrid` | `phq9_zh_tw_001` | `ok` | true | 31 | 1863.894 | 56138.484 | `audio/D_hybrid/phq9_zh_tw_001__r00.wav` |
| `A_original` | `phq9_zh_tw_001` | `ok` | true | 1 | n/a | 12275.010 | `audio/A_original/phq9_zh_tw_001__r00.wav` |

Pilot audio files:

```text
A_original/phq9_zh_tw_001__r00.wav: 645198 bytes
B_segment/phq9_zh_tw_001__r00.wav: 606286 bytes
C_token/phq9_zh_tw_001__r00.wav: 568910 bytes
D_hybrid/phq9_zh_tw_001__r00.wav: 656462 bytes
```

Pilot event trace summary:

```text
1481 total events
C_token pcm_chunk: 26
D_hybrid pcm_chunk: 31
```

## Minimum ABCD Live Matrix

The minimum randomized paired live matrix completed with 12 samples, 3 repeats,
and all 4 variants.

Artifact paths:

```text
experiments/strict_breezyvoice_abcd_matrix_minimum/run_metadata.json
experiments/strict_breezyvoice_abcd_matrix_minimum/logs/request_summary.jsonl
experiments/strict_breezyvoice_abcd_matrix_minimum/logs/event_trace.jsonl
experiments/strict_breezyvoice_abcd_matrix_minimum/logs/gpu_metrics.jsonl
experiments/strict_breezyvoice_abcd_matrix_minimum/logs/error_log.jsonl
experiments/strict_breezyvoice_abcd_matrix_minimum/audio/A_original/
experiments/strict_breezyvoice_abcd_matrix_minimum/audio/B_segment/
experiments/strict_breezyvoice_abcd_matrix_minimum/audio/C_token/
experiments/strict_breezyvoice_abcd_matrix_minimum/audio/D_hybrid/
experiments/strict_breezyvoice_abcd_matrix_minimum/reports/streaming_validity_report.md
experiments/strict_breezyvoice_abcd_matrix_minimum/reports/latency_report.md
experiments/strict_breezyvoice_abcd_matrix_minimum/reports/failure_analysis.md
experiments/strict_breezyvoice_abcd_matrix_minimum/reports/final_decision.md
```

Run counts:

| Variant | Request rows | OK rows | Valid rows | WAV files |
| --- | --- | --- | --- | --- |
| `A_original` | 36 | 36 | 36 | 36 |
| `B_segment` | 36 | 36 | 36 | 36 |
| `C_token` | 36 | 36 | 36 | 36 |
| `D_hybrid` | 36 | 36 | 36 | 36 |

Log counts:

```text
request_summary.jsonl: 144 rows
gpu_metrics.jsonl: 144 rows
error_log.jsonl: 0 rows
event_trace.jsonl: 27960 rows
```

Latency summary:

| Variant | TTFA p50 ms | TTFA p95 ms | Total p50 ms | Total p95 ms | RTF p50 | RTF p95 |
| --- | --- | --- | --- | --- | --- | --- |
| `A_original` | 7485.147 | 11406.936 | 7486.680 | 11409.848 | 1.041 | 1.135 |
| `B_segment` | 3690.371 | 5934.524 | 7279.493 | 12035.594 | 1.005 | 1.101 |
| `C_token` | 1892.224 | 1922.483 | 24816.642 | 53910.115 | 3.717 | 4.377 |
| `D_hybrid` | 1878.545 | 1932.596 | 24302.317 | 48335.129 | 3.477 | 3.733 |

Hard gate result:

| Variant | Hard gate pass | Primary reasons |
| --- | --- | --- |
| `A_original` | false | p95 RTF > 1.0; p95 TTFA server > 1500 ms |
| `B_segment` | false | p95 RTF > 1.0; p95 TTFA server > 1500 ms |
| `C_token` | false | p95 RTF > 1.0; p95 TTFA server > 1500 ms |
| `D_hybrid` | false | p95 RTF > 1.0; p95 TTFA server > 1500 ms |

Final decision:

```text
Production default: none
Operational fallback: A_original if local latency gates are accepted by the demo operator; otherwise none
Research candidate: C_token and D_hybrid
Next optimization candidate: D_hybrid seam quality and prefix/window recomputation cost
```

## Source-Verified Complexity Analysis

This section records the checked technical rationale behind the current C/D
result. It separates source-backed facts from project-specific inference.

### Sources Checked

Primary papers and technical references checked on `2026-06-26`:

- BreezyVoice paper:
  `https://arxiv.org/html/2501.17790v1`
- CosyVoice paper:
  `https://arxiv.org/html/2407.05407v2`
- CosyVoice2 paper:
  `https://arxiv.org/html/2412.10117v1`
- Upstream CosyVoice streaming runtime:
  `https://raw.githubusercontent.com/FunAudioLLM/CosyVoice/main/cosyvoice/cli/model.py`
- CosyVoice2 model card:
  `https://huggingface.co/FunAudioLLM/CosyVoice2-0.5B`
- Self-attention complexity paper:
  `https://arxiv.org/abs/2209.04881`
- HiFi-GAN paper:
  `https://proceedings.neurips.cc/paper/2020/file/c5d736809766d46260d816d8dbc9eb44-Paper.pdf`
- Conditional flow matching / OT-CFM references:
  `https://openreview.net/forum?id=PqvMRDCJT9t`
  and `https://arxiv.org/abs/2302.00482`
- RTF metric reference:
  `https://arxiv.org/html/2404.00569v1`

### Source-Backed Architecture Facts

BreezyVoice is not a single traditional acoustic model. The BreezyVoice paper
states that its framework contains an S3 tokenizer, LLM, OT-CFM model, and g2pW
front-end for Taiwanese Mandarin pronunciation control. The CosyVoice paper
describes the same model family as LLM-based TTS: speech is discretized into
semantic token sequences, the LLM performs text-to-token generation, and
conditional flow matching performs token-to-speech synthesis.

The simplified project architecture is:

```text
text / bopomofo / prompt speech
-> normalization + G2P / bopomofo
-> prompt and speaker conditioning
-> LLM speech semantic tokens
-> conditional flow matching / OT-CFM acoustic representation
-> HiFT / HiFiGAN-style vocoder waveform
-> audio output
```

The right sequence-length variables are:

```text
N_text = input text length
T      = generated speech token count
F      = acoustic / mel frame count
S      = waveform sample count
K      = flow matching solver / denoising steps or equivalent model passes
h      = streaming hop size
m      = number of emitted chunks, roughly F / h
```

The question is therefore not simply whether cost is linear in Chinese
characters. For TTS, generated audio duration, speech token count, and acoustic
frame count are more useful independent variables than raw text length.

### Complexity Interpretation

The model family is not exponential in utterance length. The more accurate
complexity interpretation is:

| Stage | Main cost driver | Practical complexity intuition |
| --- | --- | --- |
| Normalization / G2P | `N_text` | Usually close to `O(N_text)`; Transformer-based G2P can include attention terms. |
| LLM token generation | `T` | Autoregressive decode with attention can include `O(T^2)` total attention work without effective caching; self-attention is widely treated as quadratic in sequence length. |
| Flow / acoustic generation | `F`, `K` | Roughly `O(K * F)` if chunk/cache-aware; can become worse if every chunk reprocesses the full prefix. |
| Vocoder | `F` or `S` | HiFi-GAN-style generator is convolutional upsampling from mel to waveform, usually closer to linear in generated frames/samples. |
| Prefix recomputation streaming | `F`, `h` | Near-quadratic total work when each new chunk reruns the whole growing prefix. |

RTF is interpreted as synthesis time per second of generated waveform. A system
with `RTF = 1.0` synthesizes at real time; `RTF > 1.0` is slower than real time.

### Project Data Interpretation

Minimum matrix p95 metrics:

| Variant | p95 TTFA server | p95 total synthesis | p95 RTF |
| --- | ---: | ---: | ---: |
| `A_original` | `11406.936 ms` | `11409.848 ms` | `1.135` |
| `B_segment` | `5934.524 ms` | `12035.594 ms` | `1.101` |
| `C_token` | `1922.483 ms` | `53910.115 ms` | `4.377` |
| `D_hybrid` | `1932.596 ms` | `48335.129 ms` | `3.733` |

Observed effect:

```text
C_token p95 TTFA is 83.1% lower than A_original.
D_hybrid p95 TTFA is 83.1% lower than A_original.
D_hybrid p95 TTFA is 67.4% lower than B_segment.

C_token p95 total synthesis is 4.72x A_original.
D_hybrid p95 total synthesis is 4.24x A_original.
D_hybrid p95 total synthesis is 4.02x B_segment.
```

This supports the current interpretation:

```text
A_original: stable offline baseline, but first audio waits for full synthesis.
B_segment: sends audio earlier by sentence-like segments, but does not perform
           true token/audio model streaming.
C_token:   improves first audio by emitting token/audio chunks, but its current
           prefix/window implementation repeatedly recomputes acoustic output.
D_hybrid:  improves over C by bounding recomputation within text segments, but
           still pays prefix/window recomputation inside each segment.
```

### Prefix Recomputation Math

If the streaming runtime is cache-aware, each chunk computes mostly the new
region:

```text
cost_cache_aware ~= h + h + ... + h = m*h = O(F)
```

If each chunk reruns the entire growing prefix:

```text
cost_prefix ~= h + 2h + 3h + ... + mh
            = h * m(m + 1) / 2
            = O(F^2 / h)
```

If flow or attention inside each prefix call has additional full-sequence
operations, the wall-clock curve can bend even more strongly for long samples.
This is a project-specific inference from our measured C/D total time and the
current patched code path; it is not a claim that BreezyVoice itself is
inherently quadratic for all runtimes.

### CosyVoice2 Relevance

CosyVoice2 is relevant because it was designed for streaming rather than only
wrapped as a streaming API. The CosyVoice2 paper identifies response latency and
RTF as core interactive-experience concerns and introduces chunk-aware causal
flow matching for both streaming and non-streaming synthesis. The public model
card also describes bi-streaming support for text-in and audio-out streaming.

Upstream CosyVoice runtime exposes the implementation pattern missing from the
current strict BreezyVoice patch:

```text
llm_job background token generation
token_hop_len / token_offset
token2wav
flow_cache or streaming/finalize flow arguments
pre_lookahead_len
mel / HiFT cache
fade_in_out
final chunk handling
```

The current strict BreezyVoice patch has true token/audio events, but it is a
conservative prefix/window adapter. It does not yet have the full CosyVoice2
cache-aware flow/vocoder path.

### Next Measurement Gate

Before another production decision, run a scaling benchmark rather than another
same-size matrix:

```text
text lengths: 20, 50, 100, 200, 400, 800 characters
variants: A_original, B_segment, C_token, D_hybrid
repeats: at least 5 per length and variant
```

Required added fields:

```text
speech_token_count
mel_frame_count
audio_sample_count
chunk_count
tokens_processed_total
unique_tokens_generated
recompute_ratio = tokens_processed_total / unique_tokens_generated
flow_input_frames_per_chunk
vocoder_input_frames_per_chunk
llm_time_ms
flow_time_ms
vocoder_time_ms
```

Fit both models:

```text
linear:    time = aN + b
quadratic: time = aN^2 + bN + c
```

Use generated audio duration, speech token count, and acoustic frame count as
`N`, not only raw text length. If `recompute_ratio` rises with utterance length
and the quadratic fit explains C/D better than the linear fit, the bottleneck is
confirmed as prefix recomputation. The optimization target is then:

```text
reduce recomputation
add flow/vocoder cache
increase stable hop size only after audio quality is acceptable
emit only stable regions
preserve overlap/fade/finalize handling
```

## Validation

Engineering validation commands passed on `2026-06-26`:

```text
python3 -m py_compile scripts/tts-benchmark/*.py
corepack pnpm validate:json
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
git diff --check
```

## Decision

Status is `LIVE_MINIMUM_ABCD_COMPLETED`.

This completes the minimum live experiment gate. C/D are no longer source-blocked:
both variants emit true speech-token and PCM chunk evidence before final
utterance completion, and all four variants completed the same randomized paired
matrix. No variant qualifies as a production default under the current hard
gates, because all variants exceed the p95 RTF and TTFA limits.

## Next Gate

1. Run human audio-quality review on the 144 generated WAV files.
2. Optimize D_hybrid seam quality and prefix/window recomputation cost.
3. Decide whether to port true upstream CosyVoice2 streaming caches into BreezyVoice or use CosyVoice2 as a product streaming backend variant.
