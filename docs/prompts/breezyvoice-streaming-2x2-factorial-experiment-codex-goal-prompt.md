---
id: smart-health-cabin-breezyvoice-streaming-2x2-factorial-experiment-codex-goal-prompt
title: "BreezyVoice Streaming 2x2 Factorial Experiment Codex Goal Prompt"
date: 2026-06-26
created_at_local: 2026-06-26T09:18:06+08:00
created_at_utc: 2026-06-26T01:18:06Z
topic: smart-health-cabin
type: codex-goal-prompt
status: active
source:
  - ../evidence/README.md
  - ../ops/LIVE_PROVIDER_RUNBOOK.md
  - ../dev/LOCAL_DEV.md
  - ../handoff/sprint-4.5-model-selection.md
  - ../voice-asr-safety-six-layer-pipeline.md
  - ./voice-asr-safety-qwen3-reranker-codex-goal-prompt.md
external_reference:
  - https://arxiv.org/abs/2501.17790
  - https://github.com/mtkresearch/BreezyVoice/blob/main/api.py
  - https://github.com/mtkresearch/BreezyVoice/blob/main/single_inference.py
  - https://github.com/mtkresearch/BreezyVoice/blob/main/README.md
  - https://github.com/FunAudioLLM/CosyVoice
---

# Codex Goal Prompt - BreezyVoice Streaming 2x2 Factorial Experiment

結論：Smart Health Cabin 的 BreezyVoice 串流實驗要設計成
**2x2 factorial experiment**，並且用同一套可擴充的 manifest、variant
adapter、event trace、quality metric、dialogue fluency metric、evidence log
與 final decision rule 來比較四種推論模式。

這份 prompt 的目標是讓 Codex 建立一套可重複、可擴充、可審計的實驗框架，
用來回答一個產品問題：

```text
在維持台灣華語自然度、注音控制、code-switching、問卷語意正確性與系統穩定性的前提下，
哪一種 BreezyVoice 推論模式最適合 Smart Health Cabin Avatar TTS 的即時互動體驗？
```

四組實驗是兩個工程因子的組合：

| Variant | 句段級 generator streaming | CosyVoice-style token/audio streaming | 產品定義 |
| --- | ---: | ---: | --- |
| A original | 0 | 0 | 完整文字進入 BreezyVoice，完整 WAV 產出後回傳。 |
| B segment | 1 | 0 | 每個自然句段合成完成後立即送出，主要改善長句與多句回答的 first audible audio。 |
| C token | 0 | 1 | 保留完整文字輸入，由模型內部 speech-token / mel / PCM chunk 產生音訊串流。 |
| D hybrid | 1 | 1 | 先切自然句段，每個句段內部使用 token/audio streaming，產品長期候選。 |

最優解採取產品導向判準：

```text
通過 hard gates 的 variant 中，選擇 TTFA、P95 turn latency、RTF、音訊品質、
台灣華語正確性、穩定性、資源效率與維護成本的綜合分數最高者。
```

## Current Project Context

You are Codex working inside the Smart Health Cabin execution repo:

```text
/home/jnclaw/every_on_git_jnclaw/phd-life-system/imedtac-smart-health-cabin-v0
```

Read these files before implementation:

```text
docs/evidence/README.md
docs/ops/LIVE_PROVIDER_RUNBOOK.md
docs/dev/LOCAL_DEV.md
docs/handoff/sprint-4.5-model-selection.md
docs/voice-asr-safety-six-layer-pipeline.md
docs/prompts/voice-asr-safety-qwen3-reranker-codex-goal-prompt.md
apps/model-sidecars/tts-service/README.md
apps/model-sidecars/tts-service/app.py
apps/kiosk-web/src/features/avatar/voiceAgentApi.ts
apps/kiosk-web/src/features/avatar/AvatarPanel.tsx
modules/questionnaire/seed/phq9.zh-TW.surveyjs.json
packages/voice-safety-core/domain-packs/README.md
```

Current Phase 1 voice contract:

```text
Touch questionnaire remains a complete path.
Wake word only starts recording.
ASR produces evidence and candidates.
High-confidence single candidates create questionnaire writes.
Uncertain, ambiguous, or safety-sensitive input routes to retry, touch
completion, or staff review before any write.
LLM phrases guidance and clarification.
TTS speaks approved prompts, summaries, and next-question guidance.
PostgreSQL is the source of truth.
Redpanda publishes asynchronously and preserves questionnaire completion.
Raw patient audio is outside the default retention path.
```

Current TTS runtime:

```text
TTS sidecar:
  apps/model-sidecars/tts-service
  FastAPI
  port 8012
  POST /v1/tts/synthesize
  provider breezyvoice_default
  default voice only

BreezyVoice upstream:
  /home/jnclaw/every_on_git_jnclaw/BreezyVoice
  port 9003
  OpenAI-compatible /v1/audio/speech
  model MediaTek-Research/BreezyVoice
  GPU path, CUDA, onnxruntime-gpu
```

The current sidecar returns base64 WAV. The benchmark should measure the current
path as A original, then add experimental streaming paths behind feature flags
and adapter boundaries. The existing `/v1/tts/synthesize` contract remains
compatible with the kiosk while streaming experiments are developed and measured.

## Source Grounding

Use primary references as implementation context:

- BreezyVoice is a Taiwanese Mandarin TTS system with phonetic control,
  polyphone disambiguation focus, code-switching strength, and CosyVoice-based
  architecture components. See [BreezyVoice arXiv](https://arxiv.org/abs/2501.17790).
- The public BreezyVoice `api.py` currently calls
  `inference_zero_shot_no_normalize`, writes `output["tts_speech"]` to a WAV
  `BytesIO`, then returns a `StreamingResponse`. This confirms response
  streaming of a completed WAV buffer; generator-level audio streaming is a
  separate capability to implement and measure. See
  [BreezyVoice api.py](https://github.com/mtkresearch/BreezyVoice/blob/main/api.py).
- The public BreezyVoice `single_inference.py` iterates text segments and
  appends `tts_speech`, then returns `torch.concat(tts_speeches, dim=1)`.
  This makes B segment streaming the lowest-risk first engineering slice. See
  [BreezyVoice single_inference.py](https://github.com/mtkresearch/BreezyVoice/blob/main/single_inference.py).
- The BreezyVoice README documents automatic 注音 annotation, manual 注音
  correction, Python 3.10, and GPU setup with `onnxruntime-gpu`. See
  [BreezyVoice README](https://github.com/mtkresearch/BreezyVoice/blob/main/README.md).
- CosyVoice documents bi-streaming, text-in streaming, audio-out streaming,
  and streaming inference support. Treat this as the research reference for C
  and D, while validating compatibility with BreezyVoice weights and runtime.
  See [CosyVoice README](https://github.com/FunAudioLLM/CosyVoice).

## First Principle

Voice interaction quality is governed by the moment the user hears stable,
continuous speech, the continuity of playback, and the trustworthiness of the
spoken content. A lower total synthesis time is useful, while the primary
experience metric is:

```text
T_user_hears_first_continuous_audio
```

Measure:

```text
server-side first audio chunk sent
client-side first byte received
client-side first decodable audio
client-side first scheduled sample
client-side first audible continuous 500 ms playback
```

The system decision uses product value:

```text
Fast start + smooth playback + stable content + Taiwan zh-TW pronunciation +
bounded engineering complexity.
```

## Scope Controls

Keep this experiment inside Smart Health Cabin screening-support and product
latency evaluation scope.

Use only synthetic or repo-owned questionnaire text. Keep patient data, private
clinical records, production HIS data, credentials, and real patient audio
outside this experiment path.

Use default BreezyVoice voice for this lane. Custom speaker identity, speaker
embedding, voice cloning, and private reference audio belong to a separate
approved validation path.

Keep generated benchmark audio, raw JSONL logs, GPU traces, and human-listener
raw forms in local experiment directories unless the team explicitly curates a
small synthetic sample set for version control.

Every experiment run records date and time:

```text
Local started_at: 2026-06-26T09:18:06+08:00
Local ended_at:   2026-06-26T09:28:06+08:00
UTC started_at:   2026-06-26T01:18:06Z
UTC ended_at:     2026-06-26T01:28:06Z
```

Every report uses Taiwan-facing Traditional Chinese wording:

```text
正向、主動、可信任、邊界清楚。
```

For UI and participant-facing wording, use Taiwanese Mandarin product language:

```text
螢幕
資料
品質
量測
回覆
重新錄音
改用觸控選擇
健康艙
健保卡
身分證字號
血壓
血氧
心率
糖化血色素
```

Phrase uncertainty as an active recovery step:

```text
「這段語音需要再確認一次，請重新說一次，或直接用螢幕選擇。」
「我剛剛聽到您說『有幾天』。如果不正確，請直接用螢幕選擇。」
「這題也可以直接用螢幕點選答案。」
```

## Experiment Questions

Answer five product and engineering questions:

```text
Latency:
  Which variant lowers server TTFA, client TTFA, first audible 500 ms playback,
  total turn latency, and P95/P99 tail latency?

Throughput:
  Which variant improves RTF, GPU utilization, queue wait, and concurrent
  session behavior?

Quality:
  Which variant preserves Taiwanese Mandarin naturalness, 注音 correction,
  polyphone accuracy, code-switching, number reading, medical term clarity,
  speaker similarity, and audio continuity?

Dialogue fluency:
  Which variant makes Avatar questionnaire turns feel immediate, continuous,
  and trustworthy during PHQ-9, measurement prompts, acknowledgement, and recovery?

Engineering ROI:
  Which variant delivers the best improvement with manageable code complexity,
  test coverage, rollback path, upstream divergence, and maintenance cost?
```

## Hypotheses

### H0 - A Original BreezyVoice Baseline

Expected behavior:

```text
highest implementation stability
strong default audio quality
TTFA increases with input text length
first byte is close to completed WAV readiness
```

### H1 - B Segment Streaming

Expected behavior:

```text
large TTFA improvement for long and multi-sentence prompts
total synthesis time close to baseline
low audio-quality risk
possible small pause at segment boundaries
best MVP engineering ROI candidate
```

### H2 - C Token/Audio Streaming

Expected behavior:

```text
lower first-sentence internal latency when streaming state works
valuable research path
medium-high risk for seams, dropped tail words, rhythm shifts, and cache bugs
requires strong compatibility validation with BreezyVoice weights
```

### H3 - D Hybrid Streaming

Expected behavior:

```text
strong long-term product candidate
combines natural sentence segmentation with intra-segment streaming
requires pipeline overlap measurement
highest implementation complexity
candidate default only after C-level quality and stability gates pass
```

## Required Repository Design

Create an extensible benchmark suite. Suggested paths:

```text
apps/model-sidecars/tts-service/
  app.py
  streaming_modes.py
  streaming_instrumentation.py
  streaming_segmenter.py
  tests/

scripts/tts-benchmark/
  run_tts_matrix.py
  analyze_tts_matrix.py
  collect_environment.py
  collect_gpu_metrics.py
  generate_manifest.py
  README.md

experiments/manifests/
  tts_eval_manifest.jsonl
  dialogue_manifest.jsonl
  human_eval_manifest.jsonl

docs/evidence/
  YYYY-MM-DD-breezyvoice-streaming-2x2-experiment-log.md
```

Use these paths only after inspecting the current repo. If an equivalent local
pattern already exists, align with that pattern and document the choice.

## Extensible Architecture

### Variant Registry

Implement a variant registry so future TTS modes can be added without rewriting
the runner:

```python
VariantSpec = {
  "id": "B_segment",
  "display_name": "Segment streaming",
  "segment_streaming": True,
  "token_streaming": False,
  "transport": "pcm16_ws",
  "adapter": "BreezyVoiceSegmentStreamingAdapter",
  "quality_gate_profile": "mvp"
}
```

Required variants:

```text
A_original
B_segment
C_token
D_hybrid
```

Future variants should be additive:

```text
E_segment_overlap_prefetch
F_token_streaming_with_seam_smoothing
G_hybrid_low_latency_profile
H_cosyvoice3_reference_adapter
```

### Domain Profile Registry

Implement a domain-profile layer for text manifests. The first profile set
comes from current Smart Health Cabin modules:

```text
phq9_zh_tw:
  current MVP questionnaire; four bounded frequency options; item 9 human-review
  workflow wording; supportive and concise Avatar follow-up.

hpa_adult_preventive_zh_tw:
  adult preventive health form vocabulary; health behavior, disease history,
  medication, family history, two-week cough, mood screening, body measurement,
  blood pressure, blood glucose, lipid, liver, kidney, and urine terms.

smart_cabin_measurement:
  health cabin workflow prompts; height, weight, BMI, waist, blood pressure,
  blood oxygen, heart rate, report, QR code, retake, skip, staff review.

vision_screening_phase2:
  future vision-screening prompts; left eye, right eye, naked vision, corrected
  vision, distance, contrast, color vision, cannot see clearly, retake.

hearing_screening_phase2:
  future hearing-screening prompts; left ear, right ear, tone heard, noise,
  volume, hearing aid, retest, cannot hear clearly.

kiosk_faq:
  operational user questions; how to answer, repeat question, start over, use
  touch screen, privacy, report access, QR code, staff support.
```

Each domain profile owns:

```json
{
  "domain_id": "phq9_zh_tw",
  "source_files": [
    "modules/questionnaire/seed/phq9.zh-TW.surveyjs.json"
  ],
  "spoken_prompt_categories": [
    "question_text",
    "answer_acknowledgement",
    "next_question_guidance",
    "retry_guidance",
    "touch_fallback_guidance"
  ],
  "hotwords": ["PHQ-9", "有幾天", "一半以上的天數", "幾乎每天"],
  "polyphones": [
    {"text": "重", "expected_reading_context": "重新錄音"},
    {"text": "行", "expected_reading_context": "這樣也可以"},
    {"text": "會", "expected_reading_context": "我會接著說明"}
  ],
  "code_switching_terms": ["ASR", "LLM", "TTS", "PHQ-9", "API", "GPU"],
  "measurement_terms": ["血壓", "血氧", "心率"],
  "taiwan_terms": ["螢幕", "資料", "品質", "健保卡"],
  "safety_workflow_terms": ["工作人員協助", "人工覆核", "健康篩檢"]
}
```

Adding a new questionnaire should require:

```text
1. Add a domain profile.
2. Point the manifest generator to the questionnaire source.
3. Add hotwords, polyphones, code-switching terms, numeric patterns, and
   acknowledgement and fallback wording.
4. Reuse the same variant registry, runner, logs, metrics, and reports.
```

### Manifest Schema Versioning

Use JSONL. Every row is one synthesis sample:

```json
{
  "schema_version": "tts-eval-manifest-v1",
  "sample_id": "phq9_q1_long_001",
  "domain_id": "phq9_zh_tw",
  "category": "question_text",
  "length_bucket": "long",
  "input_text": "接下來是第一題。最近兩週，你是否常常覺得做事情沒有興趣，或者做什麼都提不起勁？",
  "expected_keywords": ["最近兩週", "做事情沒有興趣", "提不起勁"],
  "expected_numbers": [],
  "expected_code_switching_terms": ["PHQ-9"],
  "expected_polyphones": [],
  "manual_bopomofo_text": null,
  "source_file": "modules/questionnaire/seed/phq9.zh-TW.surveyjs.json",
  "synthetic": true,
  "phi_status": "synthetic_non_phi"
}
```

## Test Corpus Design

### Length Buckets

Minimum MVP corpus:

```text
short_5_15_chars: 20 samples
medium_16_50_chars: 20 samples
long_51_120_chars: 20 samples
multi_sentence_121_300_chars: 20 samples
extra_long_300_600_chars: 5 samples
```

Formal corpus:

```text
short_5_15_chars: 30 samples
medium_16_50_chars: 30 samples
long_51_120_chars: 30 samples
multi_sentence_121_300_chars: 30 samples
extra_long_300_600_chars: 10 samples
```

### Smart Health Cabin Domain Samples

Include samples from:

```text
PHQ-9 question text
PHQ-9 answer acknowledgement
PHQ-9 next-question guidance
questionnaire explanation
measurement instructions
vision module prompts
hearing module prompts
report and QR code guidance
touch fallback guidance
recording retry guidance
staff-review workflow guidance
kiosk FAQ answers
```

### Taiwan zh-TW And 注音 Samples

Include:

```text
多音字:
  重、行、長、樂、會、便、得

台灣常用詞:
  螢幕、資料、品質、血壓、身分證字號、健保卡、量測、回覆

醫療與健康篩檢詞:
  憂鬱、焦慮、攝護腺、血氧、心率、糖化血色素、血脂、尿蛋白

中英混合:
  ASR、LLM、TTS、PHQ-9、iMVS、Wi-Fi、API、GPU、Redpanda

數字與單位:
  2026 年 6 月 26 日、血壓 128/76、心率 82、HbA1c 6.5%、血氧 97%
```

For polyphone samples, generate paired rows:

```text
auto_bopomofo
manual_bopomofo_correction
```

### Boundary Stress Samples

Include:

```text
沒有標點的長句
大量逗號但沒有句號
括號、斜線、百分比、小數點
英文縮寫連續出現
數字與單位混雜
重複短句
短 acknowledgement
長醫療說明
真人常見口語轉寫文字
```

## Variant Definitions

### A - Original Offline BreezyVoice

Definition:

```text
input text
-> text normalization
-> bopomofo conversion
-> frontend_zero_shot
-> model inference for full utterance
-> concat all internal segments
-> encode full wav
-> return full wav
```

Measure:

```text
request_received to full_wav_ready
request_received to first_byte_sent
request_received to client_first_playback
```

### B - Segment-Level Generator Streaming

Definition:

```text
input text
-> text normalization
-> bopomofo conversion
-> split into stable sentence-like segments
-> synthesize segment 1
-> yield segment 1 audio
-> synthesize segment 2
-> yield segment 2 audio
-> continue until complete
```

Segment policy:

```text
Hard boundary:
  。！？；?!

Soft boundary:
  ，、, when current segment is longer than 35-45 zh characters.

Protected spans:
  [:ㄏㄠ3]
  PHQ-9
  API
  Wi-Fi
  128/76
  HbA1c 6.5%
  URLs
  QR Code
  timestamps
```

Measure:

```text
first segment latency
segment boundary gap
chunk inter-arrival jitter
playback buffer needs
first audible continuous 500 ms playback
```

### C - CosyVoice-Style Token/Audio Streaming

Definition:

```text
input full text
-> normalization
-> bopomofo
-> frontend_zero_shot
-> LLM speech-token generation with streaming/cache
-> token buffer reaches threshold
-> flow chunk
-> vocoder chunk
-> yield PCM chunk
-> continue until EOS
```

Additional trace events:

```text
first_speech_token
first_mel_chunk
first_pcm_chunk
token_chunk_size
mel_chunk_size
vocoder_chunk_size
lookahead_frames
overlap_frames
fade_in_ms
fade_out_ms
cache_hit
cache_miss
ras_enabled
dropped_token_count
repeated_token_count
```

### D - Hybrid Segment + Token/Audio Streaming

Definition:

```text
input text or LLM streaming text
-> stable sentence boundary detector
-> for each stable segment:
     token-level streaming TTS
     yield audio chunks
-> start segment n+1 synthesis while segment n is playing when scheduler allows
```

Measure pipeline overlap:

```text
segment_n_synthesis_start
segment_n_playback_start
segment_n_playback_end
segment_n_plus_1_synthesis_start
segment_n_plus_1_first_audio_ready
gap_between_segments_ms
```

## Configuration

Add or document environment variables:

```env
BREEZYVOICE_STREAMING_MODE=offline
BREEZYVOICE_ENABLE_TTS_CACHE=false
BREEZYVOICE_MAX_SEGMENT_CHARS=40
BREEZYVOICE_MIN_SEGMENT_CHARS=8
BREEZYVOICE_AUDIO_TRANSPORT=pcm16_ws
BREEZYVOICE_TRACE_ENABLED=true
BREEZYVOICE_SAVE_AUDIO=true
BREEZYVOICE_MODEL=MediaTek-Research/BreezyVoice
BREEZYVOICE_BASE_URL=http://localhost:9003/v1
BREEZYVOICE_SAMPLE_RATE=22050
BREEZYVOICE_GPU_DTYPE=float16
BREEZYVOICE_ALLOW_CPU_FALLBACK=false
BREEZYVOICE_REQUIRE_CUDA=true
TTS_EXPERIMENT_RUN_ID=20260626_breezyvoice_streaming_matrix
TTS_EXPERIMENT_OUTPUT_DIR=experiments/20260626_breezyvoice_streaming_matrix
TTS_EXPERIMENT_DOMAIN_PROFILES=phq9_zh_tw,smart_cabin_measurement,kiosk_faq
TTS_EXPERIMENT_RANDOMIZE=true
TTS_EXPERIMENT_SAVE_EVENT_TRACE=true
TTS_EXPERIMENT_SAVE_CLIENT_METRICS=true
```

Keep current live acceptance variables aligned:

```env
TTS_PROVIDER=breezyvoice_default
TTS_COMPUTE_BACKEND=gpu
TTS_DEVICE=cuda
TTS_CPU_OFFLOAD=false
TTS_ALLOW_CPU_FALLBACK=false
TTS_SERVICE_URL=http://localhost:8012
TTS_SYNTHESIZE_PATH=/v1/tts/synthesize
TTS_VOICE_ID=default
```

## Logging Schema

All experiment logs use JSONL. Every run creates a directory:

```text
experiments/
  breezyvoice_streaming_matrix_YYYYMMDD_HHMMSS/
    manifest/
      tts_eval_manifest.jsonl
      dialogue_manifest.jsonl
      human_eval_manifest.jsonl
      environment.yaml
      model_manifest.yaml
      variant_manifest.json
    logs/
      request_summary.jsonl
      event_trace.jsonl
      gpu_metrics.jsonl
      client_metrics.jsonl
      error_log.jsonl
      cancellation_log.jsonl
    audio/
      A_original/
      B_segment/
      C_token/
      D_hybrid/
    reports/
      latency_report.md
      quality_report.md
      dialogue_fluency_report.md
      failure_analysis.md
      human_eval_report.md
      final_decision.md
```

### Request Summary Log

```json
{
  "schema_version": "tts-exp-v1",
  "run_id": "20260626_091806_breezyvoice_streaming_matrix",
  "request_id": "req_000123",
  "local_started_at": "2026-06-26T09:18:06.123+08:00",
  "local_ended_at": "2026-06-26T09:18:08.264+08:00",
  "utc_started_at": "2026-06-26T01:18:06.123Z",
  "utc_ended_at": "2026-06-26T01:18:08.264Z",
  "variant": "D_hybrid",
  "segment_streaming": true,
  "token_streaming": true,
  "git_commit": "abc1234",
  "worktree_status": "dirty_with_unrelated_changes",
  "docker_image_digest": null,
  "model_id": "MediaTek-Research/BreezyVoice",
  "model_hash": "sha256:...",
  "speaker_profile_id": "tc_speaker_default",
  "speaker_prompt_audio_hash": "sha256:...",
  "domain_id": "phq9_zh_tw",
  "sample_id": "phq9_q1_long_001",
  "repeat_idx": 7,
  "input_text": "接下來是第一題。最近兩週，你是否常常覺得做事情沒有興趣，或者做什麼都提不起勁？",
  "normalized_text": "接下來是第一題。最近兩週，你是否常常覺得做事情沒有興趣，或者做什麼都提不起勁？",
  "bopomofo_text": null,
  "char_count": 54,
  "segment_count": 2,
  "cache_enabled": false,
  "cache_hit": false,
  "audio_duration_sec": 6.42,
  "metrics": {
    "ttfa_server_ms": 612.4,
    "ttfa_client_ms": 734.1,
    "first_audible_500ms_ms": 781.3,
    "total_synthesis_ms": 2140.7,
    "rtf": 0.333,
    "chunk_count": 9,
    "chunk_jitter_p95_ms": 41.2,
    "max_silence_gap_between_chunks_ms": 62.0,
    "buffer_underrun_count": 0,
    "gpu_memory_peak_mb": 8320,
    "gpu_util_mean": 71.4
  },
  "quality_metrics": {
    "cer": 0.018,
    "wer": 0.032,
    "keyword_recall": 1.0,
    "number_recall": 1.0,
    "code_switching_recall": 1.0,
    "polyphone_accuracy": 1.0,
    "seam_score": 0.12,
    "clipping_ratio": 0.0,
    "leading_silence_ms": 84,
    "trailing_silence_ms": 102
  },
  "status": "ok",
  "error": null
}
```

### Event Trace Log

```json
{
  "schema_version": "tts-event-trace-v1",
  "run_id": "20260626_091806_breezyvoice_streaming_matrix",
  "request_id": "req_000123",
  "variant": "B_segment",
  "domain_id": "phq9_zh_tw",
  "sample_id": "phq9_q1_long_001",
  "event": "first_audio_chunk_sent",
  "t_monotonic_ns": 183746281736451,
  "t_wall_local": "2026-06-26T09:18:21.381+08:00",
  "t_wall_utc": "2026-06-26T01:18:21.381Z",
  "segment_index": 0,
  "chunk_index": 0,
  "audio_chunk_duration_ms": 820,
  "bytes": 36192,
  "gpu_allocated_mb": 7162,
  "gpu_reserved_mb": 8074
}
```

### Required Event Names

Server side:

```text
request_received
normalization_start
normalization_end
bopomofo_start
bopomofo_end
frontend_start
frontend_end
llm_start
first_speech_token
llm_end
flow_start
first_mel_chunk
flow_end
vocoder_start
first_pcm_chunk
vocoder_end
segment_synthesis_start
segment_synthesis_end
first_audio_chunk_encoded
first_audio_chunk_sent
last_audio_chunk_sent
request_completed
request_failed
```

Client side:

```text
client_request_sent
client_first_byte_received
client_first_decodable_audio
client_audio_playback_start
client_first_audible_500ms
client_audio_playback_end
client_buffer_underrun
client_request_completed
```

Cancellation and barge-in:

```text
barge_in_detected
tts_cancel_requested
tts_cancel_acknowledged
gpu_worker_released
playback_queue_cleared
next_turn_started
```

## Environment Capture

Before every run, create `environment.yaml`:

```yaml
schema_version: tts-environment-v1
local_started_at: "2026-06-26T09:18:06+08:00"
utc_started_at: "2026-06-26T01:18:06Z"
repo:
  path: "/home/jnclaw/every_on_git_jnclaw/phd-life-system/imedtac-smart-health-cabin-v0"
  branch: "main"
  commit: "abc1234"
  worktree_status: "dirty_with_unrelated_changes"
machine:
  os: "Ubuntu 24.04"
  kernel: "..."
  cpu: "..."
  ram_gb: 64
gpu:
  name: "NVIDIA GeForce RTX 4090 Laptop GPU"
  driver: "..."
  cuda: "..."
  memory_total_mb: 16384
  power_limit_w: "..."
  temperature_start_c: "..."
runtime:
  python: "3.10.x"
  torch: "..."
  torchaudio: "..."
  onnxruntime_providers: ["CUDAExecutionProvider", "CPUExecutionProvider"]
  fastapi: "..."
  uvicorn: "..."
models:
  breezyvoice_model: "MediaTek-Research/BreezyVoice"
  breezyvoice_commit: "..."
  cosyvoice_commit: "..."
  speaker_prompt_audio_hash: "sha256:..."
services:
  tts_sidecar_url: "http://localhost:8012"
  breezyvoice_base_url: "http://localhost:9003/v1"
  api_server_url: "http://localhost:3000"
```

Record service ports, PIDs, process command lines, and log paths for every run.

## Metrics

### Latency

```text
TTFA_server = first_audio_chunk_sent - request_received
TTFA_client = client_audio_playback_start - client_request_sent
FirstAudible500 = client_first_audible_500ms - client_request_sent
TTST = last_audio_chunk_sent - request_received
TurnLatency = client_audio_playback_start - user_asr_final
RTF = synthesis_wall_time / generated_audio_duration
FirstChunkRTF = first_chunk_latency / first_chunk_audio_duration
```

Report:

```text
mean
median
p50
p90
p95
p99
standard deviation
95% bootstrap confidence interval
```

### Streaming Quality

```text
chunk_count
mean_chunk_duration_ms
chunk_interval_p50_ms
chunk_interval_p95_ms
chunk_interval_p99_ms
chunk_jitter_ms
max_silence_gap_between_chunks_ms
buffer_underrun_count
audio_seam_count
audio_seam_score
first_decodable_audio_ms
first_audible_500ms_ms
```

### Audio Quality

Save every generated audio file and compute:

```text
sample_rate
duration_sec
rms
peak
clipping_ratio
silence_ratio
leading_silence_ms
trailing_silence_ms
segment_boundary_silence_ms
spectral_discontinuity_score
```

### Text And Pronunciation Correctness

Use one fixed ASR model for relative comparison across generated audio:

```text
CER
WER
keyword recall
number recall
medical term recall
code-switching term recall
polyphone target accuracy
dropped phrase count
repeated phrase count
```

### System Stability

```text
failure_rate
timeout_count
OOM_count
GPU memory peak
GPU fragmentation signal
latency drift over time
thermal throttling signal
cancellation success rate
barge-in recovery success rate
```

## Experiment Modes

### Mode 1 - Isolated TTS Benchmark

Purpose:

```text
Measure TTS-only performance with fixed text, fixed voice, fixed model,
fixed transport, fixed cache policy, and randomized variant order.
```

This is the main quantitative experiment.

### Mode 2 - Controlled Dialogue Benchmark

Purpose:

```text
Measure Avatar pipeline scheduling with fixed ASR transcript and fixed LLM
output, so TTS streaming behavior can be compared without ASR/LLM variance.
```

Use a dialogue manifest:

```json
{
  "schema_version": "dialogue-manifest-v1",
  "dialogue_id": "phq9_001",
  "turn_id": 3,
  "domain_id": "phq9_zh_tw",
  "user_asr_text": "有幾天",
  "llm_output_text": "我幫你記錄為有幾天。接下來是第二題，最近兩週，你是否常常感到心情低落、沮喪，或沒有希望？",
  "expected_tts_text": "我幫你記錄為有幾天。接下來是第二題，最近兩週，你是否常常感到心情低落、沮喪，或沒有希望？",
  "expected_state": "PHQ9_Q2"
}
```

Metrics:

```text
dead_air_ms
turn_latency
dialogue_completion_time
audio_interruption_count
reprompt_count
state_transition_correctness
barge_in_recovery_success
```

### Mode 3 - Human Interaction Study

Purpose:

```text
Measure perceived immediacy, voice quality, clarity, confidence, and kiosk
fit with internal participants first, then larger formal evaluation.
```

MVP human evaluation:

```text
5-8 internal listeners
16-24 clips per listener
randomized blind order
balanced A/B/C/D exposure
```

Formal evaluation:

```text
20-30 listeners
Latin square order
each clip rated by at least 5 listeners
within-subject comparison
short breaks between variants
```

Questions use affirmative Taiwan zh-TW wording:

```text
「語音開始回覆的速度讓我覺得互動順暢。」
「聲音自然，適合健康艙使用。」
「醫療與健康篩檢詞聽起來清楚。」
「英文縮寫與數字聽起來清楚。」
「我願意用這種語音完成問卷。」
```

## Procedure

### Step 0 - Preflight And Environment Seal

Record:

```text
OS, kernel, CPU, RAM
GPU name, driver, CUDA, memory, temperature, power
Python, PyTorch, torchaudio, onnxruntime providers
BreezyVoice repo path, commit, model path, model hash
CosyVoice repo path, commit if used
speaker prompt path and hash
Smart Health Cabin repo branch, commit, worktree status
service ports, PIDs, process commands
local and UTC timestamps
```

Validate:

```text
CUDAExecutionProvider is available for GPU runs.
TTS sidecar is reachable at port 8012.
BreezyVoice upstream is reachable at port 9003.
Application-level TTS cache is disabled for primary benchmark.
Default voice path is active.
```

### Step 1 - Manifest Generation

Generate or update:

```text
experiments/manifests/tts_eval_manifest.jsonl
experiments/manifests/dialogue_manifest.jsonl
experiments/manifests/human_eval_manifest.jsonl
```

The manifest generator should read current project sources where possible:

```text
modules/questionnaire/seed/phq9.zh-TW.surveyjs.json
packages/voice-safety-core/domain-packs/*.json
docs/ops/LIVE_PROVIDER_RUNBOOK.md
docs/voice-asr-safety-six-layer-pipeline.md
```

### Step 2 - Warm-Up

For each variant:

```text
10 warm-up requests
exclude warm-up from main statistics
record warm-up logs separately
torch.cuda.synchronize around timed GPU work
clear only system-error outliers with written reason
```

### Step 3 - Main 2x2 Benchmark

MVP scale:

```text
40-85 text samples
4 variants
10 repeats
randomized order
1600-3400 requests
```

Formal scale:

```text
100-130 text samples
4 variants
20 repeats
randomized order
8000-10400 requests
```

Randomization key:

```text
shuffle(sample_id, variant, repeat_idx)
```

Keep:

```text
same hardware
same model weights
same speaker prompt
same sampling rate
same response format for saved output
same precision
same cache policy
same server protocol where feasible
same client playback implementation
```

### Step 4 - Concurrency Benchmark

For each variant:

```text
concurrency levels: 1, 2, 4, 8
100 requests per level for MVP
300 requests per level for formal run
```

Record:

```text
TTFA p50/p95/p99
RTF p50/p95
queue wait time
GPU memory peak
OOM count
timeout count
failure rate
```

### Step 5 - Soak Test

Run:

```text
2 hours or 500-1000 requests
```

Record:

```text
memory leak signals
GPU fragmentation
latency drift
temperature and power drift
thermal throttling signals
audio corruption rate
failure rate
```

### Step 6 - Cancellation And Barge-In

Simulate:

```text
user starts speaking during TTS playback
TTS cancellation requested mid-chunk
next turn starts after cancellation
```

Validate:

```text
stream closes cleanly
GPU worker releases
playback queue clears
next turn receives fresh audio only
no stale segment continues into next prompt
```

### Step 7 - Controlled Dialogue

Run:

```text
30 fixed dialogues
5-12 turns each
all four variants
randomized variant order
```

Include flows:

```text
PHQ-9 start and first questions
bounded answer acknowledgement
answer follow-up
retry guidance
touch fallback guidance
measurement prompt
QR report guidance
kiosk FAQ
```

### Step 8 - Human Evaluation

Generate blind audio packets:

```text
A vs B
A vs C
A vs D
B vs D
C vs D
```

Collect:

```text
naturalness MOS 1-5
Taiwan Mandarin naturalness 1-5
speaker similarity 1-5
pronunciation clarity 1-5
code-switching clarity 1-5
seam artifact heard yes/no
kiosk acceptability yes/no
free-text notes with timestamp and sample id
```

### Step 9 - Analysis

Compute:

```text
latency distribution
quality metrics
dialogue fluency metrics
stability metrics
factorial effects
final weighted score
hard-gate decision
```

Factorial model:

```text
Latency ~ SegmentStreaming + TokenStreaming + SegmentStreaming:TokenStreaming + TextLength + (1|SampleID)
```

Report:

```text
Segment main effect
Token main effect
Interaction effect
Text length effect
Domain profile effect
```

## Hard Gates

A variant is eligible for default only when it passes:

```text
failure_rate <= 0.5%
OOM_rate <= 0.1%
CER regression vs A <= 0.5-1.0 percentage point
keyword recall >= 99%
number recall >= 99%
polyphone target accuracy aligned with A
human MOS regression vs A <= 0.25
seam artifact yes-rate <= 5%
P95 TTFA_client <= 1500 ms
RTF p95 <= 1.0
cancellation success rate >= 99%
```

If a variant is excellent in latency and below gate on quality, route it to
research-candidate status and list the next engineering layer:

```text
seam smoothing
overlap-add
larger lookahead
token threshold tuning
cache-state repair
segment boundary scheduler
```

## Weighted Score

For variants passing hard gates:

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

Score definitions:

```text
TTFA_score:
  relative improvement vs A original, capped at product-relevant bounds.

P95_turn_latency_score:
  lower dead-air and first audible 500 ms playback in controlled dialogues.

RTF_score:
  p50 and p95 synthesis speed, with RTF <= 1.0 as interactive gate.

audio_quality_score:
  MOS, pronunciation, CER/WER, code-switching recall, polyphone accuracy,
  seam penalty, clipping, and silence quality.

robustness_score:
  failure rate, underruns, cancellation, retries, long-run drift.

resource_efficiency_score:
  GPU memory, utilization, concurrency, thermal stability.

engineering_maintainability_score:
  code size, adapter simplicity, test coverage, rollback path, upstream
  divergence, and operational support cost.
```

## Expected Decision Pattern

Use data as the final authority. The prior expectation is:

| Variant | Expected role |
| --- | --- |
| A original | Scientific baseline and fallback mode. |
| B segment | MVP candidate with strong engineering ROI. |
| C token | Research candidate with lower first-sentence latency potential. |
| D hybrid | Long-term product candidate when token/audio quality gates pass. |

Practical sequencing:

```text
1. Implement instrumentation and A baseline.
2. Implement B segment streaming.
3. Run A/B benchmark and quality comparison.
4. Add C token streaming as a feasibility spike behind flags.
5. Add D hybrid after C has traceable quality and stability evidence.
6. Select default with hard gates and weighted score.
```

## Required Reports

Create:

```text
experiments/<run_id>/reports/latency_report.md
experiments/<run_id>/reports/quality_report.md
experiments/<run_id>/reports/dialogue_fluency_report.md
experiments/<run_id>/reports/failure_analysis.md
experiments/<run_id>/reports/human_eval_report.md
experiments/<run_id>/reports/final_decision.md
docs/evidence/YYYY-MM-DD-breezyvoice-streaming-2x2-experiment-log.md
```

The evidence markdown must include:

```text
experiment name and purpose
local and UTC started_at / ended_at
repo path, branch, commit, worktree status
hardware and OS snapshot
runtime services, ports, PIDs, process commands
provider configuration
exact commands
sample count and repeat count
variant registry
domain profiles
structured result summary
hard-gate table
weighted score table
recommended default mode
recommended fallback mode
scope controls
next validation action
```

`final_decision.md` format:

```markdown
# Final Decision - BreezyVoice Streaming 2x2 Experiment

## Executive Summary

## Experiment Window

## Environment And Hardware

## Variant Matrix

| Variant | TTFA p50 | TTFA p95 | FirstAudible500 p95 | RTF p95 | MOS | Seam artifact | Failure rate | Complexity | Decision |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| A original | | | | | | | | Low | Baseline |
| B segment | | | | | | | | Low-Med | MVP candidate |
| C token | | | | | | | | High | Research candidate |
| D hybrid | | | | | | | | High | Product candidate if stable |

## Latency Distribution

## Audio Quality

## Taiwan zh-TW Pronunciation And Code-Switching

## Dialogue Fluency

## Stability And Resource Use

## Factorial Effects

## Hard-Gate Decision

## Weighted Score

## Recommended Default Mode

## Recommended Fallback Mode

## Implementation Tasks For Next Sprint
```

## Commands

Add or document runner commands:

```bash
python3 scripts/tts-benchmark/generate_manifest.py \
  --domain-profiles phq9_zh_tw,smart_cabin_measurement,kiosk_faq \
  --output experiments/manifests/tts_eval_manifest.jsonl
```

```bash
python3 scripts/tts-benchmark/run_tts_matrix.py \
  --manifest experiments/manifests/tts_eval_manifest.jsonl \
  --variants A_original,B_segment,C_token,D_hybrid \
  --repeats 20 \
  --warmup 10 \
  --randomize true \
  --output experiments/$(date +%Y%m%d_%H%M%S)_breezyvoice_streaming_matrix
```

```bash
python3 scripts/tts-benchmark/analyze_tts_matrix.py \
  --run-dir experiments/<run_id> \
  --report experiments/<run_id>/reports/final_decision.md
```

Add package scripts if they fit the current repo pattern:

```json
{
  "scripts": {
    "smoke:tts-streaming": "python3 scripts/tts-benchmark/run_tts_matrix.py --manifest experiments/manifests/tts_eval_manifest.jsonl --variants A_original,B_segment --repeats 1 --warmup 1 --randomize true --output experiments/smoke_tts_streaming",
    "analyze:tts-streaming": "python3 scripts/tts-benchmark/analyze_tts_matrix.py --run-dir experiments/smoke_tts_streaming --report experiments/smoke_tts_streaming/reports/final_decision.md"
  }
}
```

## Acceptance Criteria

The Codex implementation is complete when:

```text
The 2x2 factorial experiment is represented as variant registry data.
A original and B segment can run in MVP smoke mode.
C token and D hybrid are represented behind capability flags even when the
current runtime needs a feasibility spike before live acceptance.
The manifest schema supports current and future questionnaire/domain profiles.
PHQ-9, Smart Cabin measurement, kiosk FAQ, and Taiwan zh-TW stress samples are present.
Every request summary includes local and UTC timestamps.
Every event trace includes local and UTC wall time plus monotonic time.
Environment, hardware, GPU, model, and service metadata are captured.
Generated audio paths are deterministic by run_id, variant, sample_id, and repeat.
Analysis reports compute latency, quality, streaming, stability, and decision tables.
The final decision uses hard gates plus weighted score.
The existing TTS sidecar default endpoint remains compatible.
Touch questionnaire completion remains independent of TTS experiment success.
The evidence markdown records exact commands and results.
```

Validation commands:

```bash
python3 scripts/tts-benchmark/generate_manifest.py --help
python3 scripts/tts-benchmark/run_tts_matrix.py --help
python3 scripts/tts-benchmark/analyze_tts_matrix.py --help
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm smoke:tts-streaming
```

When live providers await activation, run deterministic smoke mode and record
the activation gate:

```text
live_provider_status = unavailable
smoke_mode = deterministic
next_validation_action = start live BreezyVoice upstream and repeat A/B run
```

## Final Response Required From Codex

When done, report:

```text
1. Files changed.
2. Variant registry and experiment architecture added.
3. How the corpus supports current and future Smart Health Cabin domains.
4. How timestamps, hardware, GPU, provider, and audio logs are captured.
5. Commands run.
6. Test and smoke results.
7. Live-provider status.
8. Current recommended default, if enough data exists.
9. Current fallback mode.
10. Risks and next validation action.
```

Use precise evidence language. Claim live results only when the live run
actually completed and produced logs.
