---
id: smart-health-cabin-expert-review-voice-first-cosyvoice3-update-2026-06-26
title: "Expert Review Update: Voice-First Questionnaire And CosyVoice3 Streaming"
date: 2026-06-26
topic: smart-health-cabin
type: expert-review-log
status: accepted
supersedes:
  - ./2026-06-26-expert-review-product-path-analysis.md
source:
  - ./2026-06-26-breezyvoice-true-streaming-runtime-unblock-log.md
  - ./2026-06-26-breezyvoice-true-parallel-segment-batch-experiment-log.md
  - ./2026-06-25-wakeword-continuous-live-voice-loop-experiment-log.md
  - ./2026-06-25-voice-safety-reranker-current-code-live-acceptance-log.md
  - ../decisions/2026-06-26-voice-first-cosyvoice3-product-path.md
  - ../prompts/voice-first-cosyvoice3-streaming-tts-codex-goal-prompt.md
external_source_pointers:
  - https://arxiv.org/abs/2412.10117
  - https://arxiv.org/abs/2505.17589
  - https://github.com/FunAudioLLM/CosyVoice
  - https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
---

# Expert Review Update: Voice-First Questionnaire And CosyVoice3 Streaming

## Record Purpose

This note preserves the updated expert recommendation from the current work
session and records that the repo adopts the new product direction.

The updated recommendation supersedes the earlier touch-first/static-audio
product default:

```text
Move the product mainline to VOICE-FIRST questionnaire conversation with
CosyVoice3 real-time streaming TTS as the production TTS candidate.
Keep BreezyVoice as fallback, comparison baseline, cached/static prompt
candidate, and Taiwan Mandarin quality reference.
```

## Adopted Product Interpretation

The Phase 1 spine already connects the core prototype:

```text
questionnaire CMS
+ PHQ-9 kiosk
+ public report
+ ASR/LLM/TTS Avatar loop
+ wakeword
+ voice answer auto-fill
+ Redpanda outbox evidence
```

The next product question is no longer whether the pieces can connect. The
next product question is whether a real user can complete the questionnaire by
voice in a real room with acceptable latency, safe write rules, visible
recovery, and auditable evidence.

## Adopted Direction

- Default questionnaire mode becomes `VOICE_CONVERSATION_PRIMARY`.
- Touch remains available as a safety and recovery fallback; it may be hidden or
  collapsed in voice-first mode, but the code path must not be removed.
- CosyVoice3 streaming becomes the production TTS candidate.
- CosyVoice2 streaming is a benchmark baseline when available.
- BreezyVoice remains fallback, research lane, regression baseline, cached
  prompt candidate, and Taiwan Mandarin quality reference.
- LLM remains bounded guidance only; deterministic answer mapping owns
  questionnaire writes.
- Wakeword remains `你好小慧` with tap-to-start fallback until physical-room
  acceptance proves default-on readiness.
- Redpanda remains an evidence/replay layer, not the kiosk critical path.

## Complete Expert Update

The following preserves the supplied updated expert analysis in full.

````text
結論：下一步不要再把主力放在 BreezyVoice runtime 魔改。專案主線應改成「VOICE-FIRST 問卷對話 + CosyVoice3 real-time streaming TTS」，BreezyVoice 保留為 fallback / 對照實驗 / 台灣華語品質參考。

你現在 repo 的 Phase 1 已經不是「能不能把 ASR/LLM/TTS 接起來」的問題。packet 裡已經證明：問卷 CMS、PHQ-9 kiosk、public report、ASR/LLM/TTS Avatar loop、wakeword、voice answer auto-fill、Redpanda outbox 都已經有可跑的 prototype spine。真正瓶頸是：使用者在真實場域中能不能用語音順暢完成問卷，而且不會因為 TTS 等太久、ASR 誤判、或狀態寫入不安全而失去信任。

照 first principle 來看，產品不是「很多 AI 模型的展示」，而是這個迴圈：

```text
喚醒 / 開始
→ 系統唸出目前問題
→ 使用者用語音回答
→ ASR 轉錄
→ deterministic answer mapping 找候選答案
→ 安全條件成立才寫入問卷狀態
→ 系統用語音確認並進下一題
→ 失敗時觸控 / 重錄 / 現場人員協助
```

所以接下來要優化的不是模型炫技，而是這個迴圈的「延遲、可靠性、錯誤恢復、可審計性」。

---

## 1. 我對目前實驗結果的判斷

根據 packet 內的 `00_EXECUTIVE_BRIEF.md`、`02_EXPERIMENT_INVENTORY_AND_RESULTS.md`、`03_FIRST_PRINCIPLE_ELON_STYLE_NEXT_STEPS.md`，目前最重要的事實是：

BreezyVoice strict ABCD 實驗已經不是 source-blocked。C/D 已經能產生 speech-token 與 PCM chunk events，但沒有任何 BreezyVoice variant 通過產品 hard gate。

| Variant    | p95 TTFA | p95 total | p95 RTF | 判斷                |
| ---------- | -------: | --------: | ------: | ----------------- |
| A_original |  11.407s |   11.410s |   1.135 | 太晚開始講，只能 fallback |
| B_segment  |   5.935s |   12.036s |   1.101 | 比 A 好，但仍太慢        |
| C_token    |   1.922s |   53.910s |   4.377 | 開始快，但總成本爆炸        |
| D_hybrid   |   1.933s |   48.335s |   3.733 | 研究價值高，產品不可用       |

PD2/PD3 parallel hybrid 也已經證明不是近產品候選：p95 first ordered 約 45–51 秒，總時間約 46–52 秒。這代表你們不是「差一點點優化」，而是目前 BreezyVoice streaming path 的成本結構錯了，可能還在 prefix/window recomputation。繼續用同一條路調 batch size、parallel size、token_hop_len，只會製造更多漂亮 log，不會變成產品。

BreezyVoice 應該保留，但角色要降級：

```text
BreezyVoice：
- operational fallback
- high-quality zh-TW reference
- research lane
- regression baseline
- static/cached prompt candidate

不要再當 production real-time TTS 主線。
```

---

## 2. 專案真正的下一步

你的新約束是正確的：問卷必須以 VOICE CONVERSATION 完成為主，tap-to-answer 為輔。

但我要挑戰一個細節：你不應該真的「移除觸控」。在健康艙場景，觸控是安全逃生門，不是低階替代品。比較正確的產品設計是：

```text
Voice-first default：
使用者主要用語音完成問卷。

Touch-assisted optional：
觸控答案可以顯示、縮小、或在設定中隱藏。

Safety fallback：
即使使用者選擇「不保留觸控填答」，系統仍必須保留「重新回答 / 改用觸控 / 現場人員協助」的緊急路徑。
```

也就是「不留觸控」不要解釋成 code path 刪掉，而是解釋成 UI 預設隱藏或弱化。否則真實場域只要遇到老人、口音、噪音、麥克風權限、ASR 混淆、聽力不佳，就會卡死。

下一步真正要做的是這五件事，順序不能反：

```text
1. 把 TTS production candidate 換成 CosyVoice3 streaming。
2. 把問卷體驗改成 voice-first conversation mode。
3. 保留 BreezyVoice fallback / cache / research lane。
4. 做真實房間 voice acceptance，不再只做 fake microphone / simulated wake。
5. 建立 CosyVoice3 vs CosyVoice2 vs BreezyVoice 的 live provider benchmark。
```

---

## 3. 為什麼選 CosyVoice3，不繼續硬改 BreezyVoice

CosyVoice2 本身就是針對 streaming speech synthesis 設計，論文描述它使用 chunk-aware causal flow matching 來支援 streaming 與 non-streaming synthesis，目標是低延遲、低 RTF、高品質。這正是你們現在 BreezyVoice C/D 缺的能力。([arXiv][1])

CosyVoice3 則在 CosyVoice2 之上強化 content consistency、speaker similarity、prosody naturalness，並擴大資料到 9 種語言與 18 種中文方言/口音；論文也提到從 0.5B 擴到 1.5B 可提升韻律自然度。([arXiv][2]) 官方 repo 也把 CosyVoice3 描述為比 CosyVoice2 在內容一致性、speaker similarity、韻律自然度更好的系統，並提供 inference、training、deployment 能力。([GitHub][3])

所以 first-principle 判斷很直接：

```text
你現在缺的是低延遲 streaming 架構。
CosyVoice2/3 已經把它當核心能力。
BreezyVoice 則需要你自己補 runtime、cache、flow/vocoder streaming。
```

這不是「BreezyVoice 不好」。BreezyVoice 的台灣華語價值仍然存在。但專案現在要的是 health kiosk 可用，而不是完成一篇 BreezyVoice streaming runtime 研究。

我的選型：

```text
Production candidate：Fun-CosyVoice3-0.5B-2512
Streaming baseline：CosyVoice2-0.5B
Operational fallback：BreezyVoice default voice / cached audio
Research lane：strict BreezyVoice D_hybrid cache-aware streaming
```

不要一開始用 CosyVoice3 1.5B 當主線。你目前硬體是 RTX 4090 Laptop 16GB VRAM，ASR + LLM + TTS 會同時吃 GPU。0.5B 是合理第一步。1.5B 等 CosyVoice3 0.5B 的 latency、RTF、音質都通過後再評估。

---

## 4. 不想要中國口音，先不要急著 fine-tune

你們不想要中國普通話腔，這是合理要求。但第一步不是 fine-tune，而是四層控制。

第一層：台灣 speaker prompt。
先錄 3–5 位台灣華語 speaker，每人 10–30 秒乾淨 prompt audio。語氣要像健康檢測現場，不要廣播腔，不要新聞播報腔。

第二層：zh-TW normalization。
很多「不像台灣」不是模型音色問題，而是文字正規化、詞彙、數字讀法、斷句問題。要做 `zh-TW_tts_normalization`：

```text
資料、品質、螢幕、身分證、健保卡、血壓、血氧、心率
PHQ-9、ASR、LLM、TTS、API、GPU
128/76、HbA1c 6.5%、2026 年 6 月 26 日
```

第三層：prompt instruction。
CosyVoice 系列支援 instruction control，例如語言、方言、情緒、速度、音量等。模型卡與官方資料都標示 CosyVoice3 支援 bi-streaming、instruct support、pronunciation inpainting、text normalization 等能力。([Hugging Face][4])

可以先測：

```text
請用台灣華語，語氣自然、清楚、溫和、專業。
不要兒化音，不要中國大陸普通話播音腔。
請用台灣醫療院所健康檢測服務人員的說話方式。
語速中等偏慢，句尾自然，不要誇張情緒。
```

第四層：如果還是不夠，再 fine-tune。
Fine-tune 成本大概率低於把 BreezyVoice 改成 production-grade real-time streaming，因為你要修的是「口音/語感」，不是重寫 streaming runtime。

Pilot fine-tune 可以這樣做：

```text
5–10 小時：驗證台灣華語 accent adaptation 是否有效
30–50 小時：做出比較穩的台灣健康檢測場景語音
100+ 小時：才開始接近產品級、多 speaker、多語速、多場域
```

但不要一開始 fine-tune flow/vocoder。先從文字正規化、prompt、speaker prompt、LLM/speech-token adaptation 開始。你要保留 CosyVoice3 的 streaming acoustic path，不要一開始就把它破壞掉。

---

## 5. 新目標架構

我建議把 TTS provider 改成可插拔三層：

```text
TTS Provider Router
├─ cosyvoice3_streaming        # production candidate
├─ cosyvoice2_streaming        # streaming baseline / fallback
└─ breezyvoice_default         # operational fallback / research baseline
```

API contract 不要綁死 BreezyVoice。現在 `/api/v1/agent-turns/tts` 應該升級成：

```text
POST /api/v1/agent-turns/tts
POST /api/v1/agent-turns/tts/stream
GET  /api/v1/providers/status
```

或 sidecar 層提供：

```text
GET  /healthz
GET  /readyz
POST /v1/audio/speech
WS   /v1/audio/stream
```

Streaming transport 我建議用 WebSocket + PCM16 chunks，不要先用 completed WAV。WAV header 對 streaming 不友善，容易又退回假 streaming。

資料流：

```text
Kiosk Web
→ VoiceConversationController
→ API voice-agent turn
→ TTS provider router
→ CosyVoice3 streaming sidecar
→ WebSocket PCM chunks
→ browser AudioWorklet playback queue
→ after playback, return to listening state
```

BreezyVoice 保留：

```text
BreezyVoice default voice：
- fixed prompt pre-generation
- fallback if CosyVoice3 unavailable
- regression benchmark
- zh-TW quality reference
```

---

## 6. Voice-first 問卷產品設計

目前問卷 UI 是 SurveyJS one-question-per-page + Avatar rail。下一步不是丟掉 SurveyJS，而是在 SurveyJS 上面加一層 voice conversation controller。

新的模式：

```text
VOICE_CONVERSATION_PRIMARY
TOUCH_ASSISTED
TOUCH_HIDDEN_BUT_RECOVERABLE
STAFF_ASSISTED
```

使用者一開始可以選：

```text
「使用語音完成問卷」
「保留觸控輔助」
「主要用觸控填答」
```

但系統內部一定保留 fallback：

```text
說「重新回答」→ 清除候選，重新錄音
說「改用觸控」→ 顯示選項按鈕
說「找人協助」→ staff_review
超時 / ASR 低信心 → 顯示觸控或請再說一次
```

Voice-first turn 應該長這樣：

```text
1. TTS 唸目前題目與四個選項
2. 使用者說答案
3. ASR 轉錄
4. deterministic mapper 只允許 0/1/2/3 四個候選
5. 若單一高信心：
   「我幫你記錄為：有幾天。接下來是第二題……」
   同時寫入 SurveyJS state
6. 若低信心：
   「我聽到的可能是有幾天，請說是或重新回答，也可以點選答案。」
7. 若 item 9 positive：
   寫入問卷可成立，但 public report 與 TTS 必須走 staff-support 文案，不得診斷。
```

關鍵規則：

```text
LLM 不可以決定答案。
LLM 不可以改寫 scoring。
LLM 不可以產生診斷。
LLM 只負責自然語音引導與澄清語句。
狀態寫入只能由 deterministic answer mapping + safety gate 控制。
```

這是醫療/健康場景的核心安全邊界。

---

## 7. 你們接下來真正要停止的事

依 packet 數據，我會直接停掉這些主線：

```text
停止把 BreezyVoice PD2/PD3 當近產品候選。
停止擴大 BreezyVoice batch size。
停止更多 LLM prompt / temperature sweep。
停止把 reranker 升級成必要元件，除非真實 ASR confusion 數據證明需要。
停止把 vision/hearing 拉回 Phase 1。
停止做 Avatar 動畫、lip-sync、3D、Live2D。
停止把 Redpanda 放進 kiosk critical path。
```

這些不是永遠不做，而是現在不是瓶頸。

---

## 8. 真正缺的實驗

目前最缺的是不是更多模型數據，而是真實場域數據。

下一批實驗應該是：

### Experiment 1：CosyVoice3 streaming provider live benchmark

比較：

```text
B_breezyvoice_segment
E_cosyvoice2_stream
F_cosyvoice2_hybrid
G_cosyvoice3_stream
H_cosyvoice3_hybrid
I_cosyvoice3_tw_prompt
J_cosyvoice3_tw_prompt_cache
```

指標：

```text
p50/p95 TTFA client
p50/p95 TTFA server
p95 RTF
total turn time
chunk jitter
buffer underrun
GPU memory peak
failure rate
human MOS
Taiwan accent acceptability
medical term correctness
```

Hard gate：

```text
p95 TTFA client <= 1500 ms
p95 RTF <= 1.0
failure rate <= 0.5%
zero fake streaming
no severe seam / repeat / truncation
Taiwan listener acceptability >= threshold
```

### Experiment 2：Voice-first PHQ-9 room test

真實房間、真實麥克風、真實使用者說：

```text
你好小慧
完全沒有
有幾天
一半以上的天數
幾乎每天
重新回答
改用觸控
找人協助
```

記錄：

```text
wake miss
false trigger
ASR transcript
answer mapping result
auto-write / confirmation / fallback
turn latency
user perceived awkward waiting
```

### Experiment 3：ASR confusion pack

重點不是 WER，而是 option decision error。

必測混淆：

```text
完全沒有 / 完全沒用
有幾天 / 好幾天
一半以上的天數
幾乎每天
沒有 / 沒有啦 / 還好 / 不太會
```

若 ASR 無法穩定處理，就不要急著上 reranker；先做 domain normalization、候選答案 grammar、confirmation。

### Experiment 4：Human TTS review

至少讓 5–10 位台灣聽者 blind review：

```text
BreezyVoice
CosyVoice2
CosyVoice3 raw
CosyVoice3 + 台灣 speaker prompt
CosyVoice3 + zh-TW normalization
```

評分：

```text
自然度
台灣華語感
醫療場景可信度
發音清楚度
聽起來是否像中國普通話
是否可接受在健康艙使用
```

---

## 9. 具體執行規劃

### Phase A：保留現有系統，新增 CosyVoice3 provider，不破壞 BreezyVoice

要改：

```text
.env.example
docs/ops/LIVE_PROVIDER_RUNBOOK.md
docs/ops/ROLLBACK_AND_FALLBACK.md
packages/contracts/src/index.ts
apps/api-server/src/services/ttsProvider.ts
apps/api-server/src/routes/questionnaireRoutes.ts
apps/model-sidecars/cosyvoice-service/
scripts/smoke-cosyvoice3.mjs
scripts/live-check.mjs
```

新增 env：

```text
TTS_PROVIDER=cosyvoice3_streaming
TTS_FALLBACK_PROVIDER=breezyvoice_default
COSYVOICE3_BASE_URL=http://localhost:8013
COSYVOICE3_MODEL_ID=FunAudioLLM/Fun-CosyVoice3-0.5B-2512
COSYVOICE3_STREAMING=true
COSYVOICE3_AUDIO_TRANSPORT=ws_pcm16
COSYVOICE3_TW_PROMPT_PROFILE=default_tw_healthcare
TTS_CACHE_ENABLED=true
TTS_CACHE_FIXED_PROMPTS=true
```

Provider status 要回傳：

```json
{
  "tts": {
    "provider": "cosyvoice3_streaming",
    "mode": "live",
    "streaming": true,
    "acceptanceEligible": true,
    "fallbackProvider": "breezyvoice_default",
    "computeBackend": "gpu",
    "cpuFallbackAllowed": false
  }
}
```

### Phase B：建立 CosyVoice3 FastAPI sidecar

目錄：

```text
apps/model-sidecars/cosyvoice-service/
  README.md
  requirements.txt
  server.py
  provider.py
  streaming.py
  tw_normalization.py
  prompt_profiles/
    default_tw_healthcare.json
```

API：

```text
GET /healthz
GET /readyz
POST /v1/audio/speech
WS /v1/audio/stream
POST /v1/audio/prewarm
```

Streaming event：

```json
{
  "event": "audio_chunk",
  "chunk_index": 3,
  "sample_rate": 24000,
  "format": "pcm16",
  "duration_ms": 420,
  "is_final": false
}
```

### Phase C：前端改成 voice conversation primary

新增：

```text
apps/kiosk-web/src/features/avatar/VoiceConversationController.ts
apps/kiosk-web/src/features/avatar/StreamingAudioPlayer.ts
apps/kiosk-web/src/features/avatar/voiceConversationMode.ts
```

UI 模式：

```text
voice_first_touch_visible
voice_first_touch_collapsed
touch_first_voice_assist
staff_assisted
```

使用者選「不留觸控」時，實作應該是：

```text
touch_collapsed = true
fallback_available = true
staff_override_available = true
```

不是把觸控功能刪掉。

### Phase D：問卷 voice turn contract

每一 turn 要記：

```text
question_id
question_text
allowed_options
spoken_transcript
normalized_transcript
mapped_candidate
candidate_confidence
write_decision
fallback_reason
tts_provider
tts_ttfa_ms
tts_rtf
asr_latency_ms
turn_total_ms
voice_mode
touch_visible
```

寫入規則：

```text
single deterministic option + high confidence → auto-write and echo confirmation
ambiguous candidate → ask confirmation
low confidence → retry/touch fallback
sensitive safety flag → staff-support route
```

### Phase E：benchmark and acceptance

新增 scripts：

```text
scripts/smoke-cosyvoice3.mjs
scripts/smoke-voice-conversation-live.mjs
scripts/tts-benchmark/run_tts_provider_matrix.py
scripts/voice-room/run_voice_first_phq9_room_test.py
```

必跑：

```bash
corepack pnpm validate:json
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm live:check
corepack pnpm smoke:cosyvoice3
corepack pnpm smoke:voice-conversation-live
python3 scripts/tts-benchmark/run_tts_provider_matrix.py
```

---

## 10. 最終預設路徑

我建議下一版 product default 定成：

```text
Questionnaire mode：
VOICE_CONVERSATION_PRIMARY

Touch：
輔助、可隱藏、不可刪除

TTS：
CosyVoice3 streaming

TTS fallback：
BreezyVoice default voice / cached fixed prompts

ASR：
Breeze-ASR-26 int8，加入 PHQ-9 domain normalization + confirmation gate

LLM：
Gemma 4 E4B native Ollama，think=false，temperature=0.3 demo / 0 stability

Reranker：
optional，不是 live acceptance 必要條件

Wakeword：
你好小慧 + tap-to-start fallback

Redpanda：
outbox evidence layer，不是 kiosk critical path

Vision/Hearing：
Phase 2，不拉回現在
```

最重要的一句話是：

```text
下一步不是做更多模型實驗，而是把 voice-first 問卷迴圈變成真實房間可用。
```

---

## 11. 可直接交給 Codex 的 Goal Prompt

# Codex Goal Prompt: Voice-First Questionnaire + CosyVoice3 Streaming TTS Integration

Read and obey `~/.codex/AGENTS.md` and this repo's `AGENTS.md`.

This is not a smoke-test-only task. This is a production-path architecture change for the Smart Health Cabin Phase 1 spine.

Primary goal:

Convert the current questionnaire + Avatar prototype into a voice-first questionnaire conversation system, with CosyVoice3 real-time streaming as the new TTS production candidate, while preserving BreezyVoice as fallback / research baseline.

Do not remove BreezyVoice. Do not delete touch fallback. Do not expand vision/hearing scope.

## Context

Current project status:

* Phase 1 spine exists: questionnaire CMS + PHQ-9 kiosk + public report + ASR/LLM/TTS Avatar loop + wakeword + voice answer auto-fill + Redpanda outbox evidence.
* Current ASR: faster-whisper Breeze-ASR-26 CT2 int8.
* Current LLM: native Ollama `gemma4:e4b`, `think=false`, `temperature=0.3`, `max_tokens=80`.
* Current TTS: BreezyVoice default voice.
* BreezyVoice ABCD and PD hybrid experiments show valid research events but fail product gates:

  * A/B too slow to first audio.
  * C/D improve TTFA but total synthesis and RTF are too slow.
  * PD2/PD3 are valid but not product candidates.
* The next product bottleneck is real-room, low-latency, safe voice questionnaire completion.

## Non-negotiable product rule

The questionnaire must be completed primarily through VOICE CONVERSATION.

Tap-to-answer is secondary and configurable:

* user may choose to keep touch visible;
* user may choose voice-first with touch collapsed;
* system must still retain touch/staff fallback internally for safety and recovery.

Do not interpret "no touch" as deleting fallback code paths. It means UI may hide or collapse touch answers until fallback/recovery is needed.

## Target provider decision

Add CosyVoice3 streaming as the production TTS candidate.

Keep:

* BreezyVoice default voice as fallback / baseline / research lane.
* CosyVoice2 streaming as optional benchmark baseline if available.

New provider names:

* `cosyvoice3_streaming`
* `cosyvoice2_streaming` if implemented
* `breezyvoice_default`

Default target:

* `TTS_PROVIDER=cosyvoice3_streaming`
* `TTS_FALLBACK_PROVIDER=breezyvoice_default`

## Required architecture changes

### 1. TTS provider abstraction

Update the TTS provider layer so it does not assume BreezyVoice.

Add or update:

* `packages/contracts/src/index.ts`
* `apps/api-server/src/services/ttsProvider.ts`
* `apps/api-server/src/routes/questionnaireRoutes.ts`
* `scripts/live-check.mjs`
* `docs/ops/LIVE_PROVIDER_RUNBOOK.md`
* `docs/ops/ROLLBACK_AND_FALLBACK.md`
* `.env.example`

Provider status must expose:

* provider name
* mode: mock/live/unavailable
* streaming true/false
* model id
* compute backend
* GPU required
* CPU fallback allowed false for strict live acceptance
* fallback provider
* acceptance eligibility
* blocker reason if unavailable

### 2. CosyVoice3 sidecar

Create:

`apps/model-sidecars/cosyvoice-service/`

Required files:

* `README.md`
* `requirements.txt`
* `server.py`
* `provider.py`
* `streaming.py`
* `tw_normalization.py`
* `prompt_profiles/default_tw_healthcare.json`

Required endpoints:

* `GET /healthz`
* `GET /readyz`
* `POST /v1/audio/speech`
* `WS /v1/audio/stream`
* `POST /v1/audio/prewarm`

The streaming endpoint must send real audio chunks before full utterance completion. Do not fake streaming with completed WAV bytes.

Preferred transport:

* WebSocket binary PCM16 chunks plus JSON metadata events.

Required metadata events:

* `request_received`
* `text_normalized`
* `stream_start`
* `first_audio_chunk`
* `audio_chunk`
* `stream_end`
* `error`

### 3. Taiwan zh-TW voice normalization

Implement `tw_normalization.py`.

It must handle:

* Taiwan healthcare terms;
* PHQ-9;
* ASR / LLM / TTS / API / GPU;
* blood pressure formats like `128/76`;
* HbA1c values;
* dates;
* numbers;
* public-health questionnaire phrases;
* avoiding Mainland Mandarin phrasing where possible.

Add a prompt profile:

`default_tw_healthcare.json`

The profile should instruct:

* Taiwan Mandarin;
* natural, clear, warm, professional health-kiosk style;
* no erhua;
* no Mainland broadcast tone;
* medium-slow speech;
* stable volume.

### 4. Voice-first questionnaire mode

Add a voice conversation controller in kiosk web.

Create or update:

* `apps/kiosk-web/src/features/avatar/VoiceConversationController.ts`
* `apps/kiosk-web/src/features/avatar/StreamingAudioPlayer.ts`
* `apps/kiosk-web/src/features/avatar/voiceConversationMode.ts`
* existing Avatar panel and state machine files.

Supported modes:

* `voice_first_touch_visible`
* `voice_first_touch_collapsed`
* `touch_first_voice_assist`
* `staff_assisted`

Voice-first flow:

1. System reads the current question and allowed options.
2. User answers by speech.
3. ASR transcribes.
4. Deterministic answer mapping maps only to allowed options.
5. If a single high-confidence option exists, write answer and speak confirmation.
6. If ambiguous or low-confidence, ask confirmation or show touch fallback.
7. After TTS playback, automatically continue listening for next answer.
8. User can say "重新回答", "改用觸控", or "找人協助".

LLM must not decide questionnaire answers. LLM may only generate bounded guidance text.

### 5. Safety write policy

Preserve and strengthen:

* no diagnosis;
* no treatment advice;
* no raw-answer public report exposure;
* item 9 staff-support route;
* deterministic option mapping before state write;
* confirmation on ambiguity;
* touch/staff fallback on uncertainty.

Voice writes must log:

* transcript;
* normalized transcript;
* candidate answer;
* confidence;
* write decision;
* fallback reason;
* active question id;
* voice mode;
* touch visibility;
* provider metrics.

### 6. Benchmarks

Create or update:

`experiments/manifests/tts_provider_eval_manifest.jsonl`

Variants:

* `B_breezyvoice_segment`
* `E_cosyvoice2_stream` if available
* `F_cosyvoice2_hybrid` if available
* `G_cosyvoice3_stream`
* `H_cosyvoice3_hybrid`
* `I_cosyvoice3_tw_prompt`
* `J_cosyvoice3_tw_prompt_cache`

Required metrics:

* p50/p95 TTFA server
* p50/p95 TTFA client if available
* p95 RTF
* total synthesis time
* chunk count
* chunk jitter
* buffer underrun
* failure rate
* GPU memory peak
* Taiwan Mandarin acceptability placeholder
* audio file path
* fallback use

Hard gates:

* p95 TTFA client <= 1500 ms if client metric available
* p95 TTFA server <= 1500 ms if client metric unavailable
* p95 RTF <= 1.0
* failure rate <= 0.5%
* no fake streaming
* no severe audio corruption, repetition, truncation, or unusable seams

### 7. Room voice acceptance

Add a room-test script or checklist:

`docs/evidence/voice-first-room-acceptance-plan.md`

Must test:

* spoken `你好小慧`;
* real microphone permission;
* spoken PHQ-9 answers;
* no-speech;
* background noise;
* "重新回答";
* "改用觸控";
* "找人協助";
* item 9 positive path.

Record:

* wake misses;
* false triggers;
* ASR transcript;
* answer mapping result;
* write decision;
* fallback reason;
* turn latency;
* user-visible mode.

### 8. Documentation

Create:

`docs/evidence/cosyvoice3-streaming-provider-validation.md`

Update:

* `docs/source-index.md`
* `docs/ops/LIVE_PROVIDER_RUNBOOK.md`
* `docs/ops/ROLLBACK_AND_FALLBACK.md`
* `docs/specs/VOICE-ENTRY-TECH-SELECTION-SDD-DRAFT.md`
* `.env.example`

The evidence document must explain:

* why BreezyVoice remains fallback/research;
* why CosyVoice3 is the production candidate;
* what was actually run live;
* what remains blocked;
* exact commands;
* exact run IDs;
* exact artifacts;
* final provider recommendation.

## Validation commands

Run, when available:

```bash
corepack pnpm validate:json
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
corepack pnpm live:check
corepack pnpm smoke:api
corepack pnpm smoke:voice-agent
corepack pnpm smoke:cosyvoice3
corepack pnpm smoke:voice-conversation-live
git diff --check
```

Python:

```bash
python3 -m py_compile apps/model-sidecars/cosyvoice-service/*.py
```

Benchmark:

```bash
python3 scripts/tts-benchmark/run_tts_provider_matrix.py \
  --manifest experiments/manifests/tts_provider_eval_manifest.jsonl \
  --variants B_breezyvoice_segment,G_cosyvoice3_stream,H_cosyvoice3_hybrid,I_cosyvoice3_tw_prompt,J_cosyvoice3_tw_prompt_cache \
  --repeats 3 \
  --warmup 1 \
  --randomize true \
  --output experiments/cosyvoice3_streaming_provider_validation
```

If CosyVoice3 cannot run live, final status must be `BLOCKED_UNRESOLVED`, not goal complete.

## Final status labels

Use only:

* `PREFLIGHT_ONLY`
* `COSYVOICE3_PROVIDER_IMPLEMENTED`
* `VOICE_FIRST_UI_IMPLEMENTED`
* `LIVE_COSYVOICE3_VALIDATION_COMPLETED`
* `LIVE_VOICE_FIRST_ROOM_READY`
* `BLOCKED_UNRESOLVED`

Do not say "complete" unless at least `LIVE_COSYVOICE3_VALIDATION_COMPLETED` is true.

## Final response format

Report exactly:

```text
Status:
Run ID:
Files changed:
Provider decision:

* production candidate:
* fallback:
* research lane:

Voice mode decision:

* default:
* touch behavior:
* safety fallback:

Live validation:

* commands:
* results:
* blockers:

Metrics:

* TTFA p50/p95:
* RTF p95:
* failure rate:
* GPU memory peak:

Next required field test:

* room:
* mic:
* wakeword:
* PHQ-9 voice answers:
* fallback:
```

這份 prompt 的重點是：把下一步從「再做 BreezyVoice 實驗」改成「把產品主線切到 CosyVoice3 streaming，同時保留 BreezyVoice」。這才符合你現在的資料。

[1]: https://arxiv.org/abs/2412.10117?utm_source=chatgpt.com "CosyVoice 2: Scalable Streaming Speech Synthesis with Large Language Models"
[2]: https://arxiv.org/abs/2505.17589?utm_source=chatgpt.com "CosyVoice 3: Towards In-the-wild Speech Generation via Scaling-up and Post-training"
[3]: https://github.com/FunAudioLLM/CosyVoice?utm_source=chatgpt.com "FunAudioLLM/CosyVoice: Multi-lingual large voice ..."
[4]: https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512?utm_source=chatgpt.com "FunAudioLLM/Fun-CosyVoice3-0.5B-2512"
````

## Adopted Follow-Up Files

- `docs/decisions/2026-06-26-voice-first-cosyvoice3-product-path.md`
- `docs/prompts/voice-first-cosyvoice3-streaming-tts-codex-goal-prompt.md`
- `docs/evidence/EVIDENCE_CHRONOLOGY.md`
