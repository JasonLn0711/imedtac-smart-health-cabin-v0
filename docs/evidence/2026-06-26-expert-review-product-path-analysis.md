---
id: smart-health-cabin-expert-review-product-path-analysis-2026-06-26
title: "Expert Review: Product Path After Voice Loop And TTS Experiments"
date: 2026-06-26
topic: smart-health-cabin
type: expert-review-log
status: superseded
superseded_by:
  - ./2026-06-26-expert-review-voice-first-cosyvoice3-update.md
source:
  - ../../docs/evidence/2026-06-26-breezyvoice-true-streaming-runtime-unblock-log.md
  - ../../docs/evidence/2026-06-26-breezyvoice-true-parallel-segment-batch-experiment-log.md
  - ../../docs/evidence/2026-06-25-wakeword-continuous-live-voice-loop-experiment-log.md
  - ../../docs/evidence/2026-06-25-llm-temperature-sweep-experiment-log.md
  - ../../docs/evidence/2026-06-25-voice-safety-reranker-current-code-live-acceptance-log.md
---

# Expert Review: Product Path After Voice Loop And TTS Experiments

## Superseded Status

This expert review is preserved as decision history and superseded by
`docs/evidence/2026-06-26-expert-review-voice-first-cosyvoice3-update.md`.

## Record Purpose

This note preserves the expert's current-stage analysis and recommendation for
the Smart Health Cabin workstream. It is recorded as product-path evidence, not
as a new implementation commit.

The central recommendation is:

```text
Do not continue expanding TTS variants, LLM prompt tuning, reranker promotion,
or Avatar animation before the real-room questionnaire-completion path is
proven.
```

## Executive Interpretation

The expert defines the current state as:

```text
System integration MVP exists.
Field-ready voice product does not yet exist.
```

The three current bottlenecks are:

1. real-room voice interaction reliability is not yet proven;
2. BreezyVoice runtime TTS is too slow for the critical path;
3. ASR confidence is unsafe as a decision signal when the sidecar returns
   `confidence: 1.0` despite observed option confusion such as
   `完全沒有` -> `完全沒用`.

The next product default should be:

```text
touch-first questionnaire
+ voice guidance assist
+ tap-to-start / wakeword optional
+ static audio prompt assets
+ conservative ASR mapping
+ confirmation/fallback
+ staff review
```

## Accepted Direction

This expert review supports the following product-path split:

- Product lane: make the real-room questionnaire loop safe, fast, recoverable,
  and auditable with the fewest moving parts.
- Research lane: continue BreezyVoice cache-aware streaming, CosyVoice2-style
  backend comparison, PD hybrid, and parallel TTS only as non-blocking research.

## Complete Expert Analysis

The following preserves the supplied expert analysis in full.

```text
我的判斷很明確：下一步不是再做更多 TTS 變體、LLM prompt tuning、reranker 或 avatar 動畫，而是把「真實場域可完成問卷」這條主路徑打穿。

現在 repo 已經證明「系統可以串起來」：問卷、Admin、API、Postgres、Redpanda outbox、ASR、LLM、TTS、wakeword、kiosk UI 都有原型與 live provider 路徑。可是數據也已經證明另一件事：目前還不能把 voice loop 當成穩定產品預設。真正瓶頸變成三個：

第一，真實房間裡的語音互動可靠性還沒被證明。
第二，BreezyVoice runtime TTS 太慢，不能放在 critical path。
第三，ASR confidence 現在是假的安全感，因為 sidecar 回傳 confidence: 1.0，但實驗已經出現「完全沒有」被辨成「完全沒用」這類 PHQ-9 選項風險。

所以 Elon / first-principle 式的決策是：刪掉不必要的複雜度，先讓產品用最少活動零件完成核心任務。這個產品的核心不是「展示一堆 AI 模型」，而是讓一個人在健康艙裡安全、快速、可恢復地完成問卷。

## 1. 目前做到什麼程度

根據 packet 裡的 00_EXECUTIVE_BRIEF.md、01_ARCHITECTURE_AND_SCOPE.md、02_EXPERIMENT_INVENTORY_AND_RESULTS.md、03_FIRST_PRINCIPLE_ELON_STYLE_NEXT_STEPS.md、code_context/ 與 experiment artifacts，我會把目前狀態定義成：

系統整合 MVP 已經成立，但 field-ready voice product 尚未成立。

目前成立的部分：

questionnaire CMS + PHQ-9 kiosk + public report + ASR/LLM/TTS Avatar loop + wakeword activation + voice answer auto-fill + Redpanda outbox evidence

技術選型也已經收斂：

ASR：faster-whisper + Breeze-ASR-26 CT2 int8
LLM：native Ollama gemma4:e4b，think=false，短輸出 guidance
TTS：local BreezyVoice default voice
Wakeword：sherpa-onnx KWS，phrase 你好小慧
Avatar：先用靜態圖片，不做動畫/對嘴
事件流：Postgres outbox + Redpanda
問卷：SurveyJS + PHQ-9 seed/scoring
產品邊界：screening support，不做診斷、不做醫囑、不做 HIS 寫回

這些是對的。你們已經避免掉一個很常見的錯誤：一開始就做 animated avatar、viseme、lip-sync、醫療診斷、HIS integration，最後核心流程反而跑不起來。

## 2. 實驗數據真正告訴我們什麼

### TTS ABCD 實驗的結論

ABCD 數據大概是這樣：

Variant: A_original
p95 TTFA: 11.4s
p95 Total: 11.4s
p95 RTF: 1.135
判斷: 可當 demo fallback，但等待太久

Variant: B_segment
p95 TTFA: 5.9s
p95 Total: 12.0s
p95 RTF: 1.101
判斷: 首段較快，但總時間仍長

Variant: C_token
p95 TTFA: 1.9s
p95 Total: 53.9s
p95 RTF: 4.377
判斷: TTFA 改善，但總時間爆掉

Variant: D_hybrid
p95 TTFA: 1.9s
p95 Total: 48.3s
p95 RTF: 3.733
判斷: 同上，不能產品化

這代表一件事：C/D 不是成功，只是把「第一次出聲」提前，代價是整體生成效率崩壞。

RTF > 1 代表生成速度慢於播放速度。C/D 的 RTF 到 3.7 到 4.4，等於系統每產生 1 秒音訊，可能要花 3 到 4 秒以上。這在互動式 kiosk 幾乎不可接受。

ABCD 的深層原因很可能不是 batch size 不夠，而是 prefix/window recomputation：每次 chunk 可能重算大量前文，沒有做到真正 cache-aware streaming。這就是為什麼 PD hybrid / token/audio events 雖然形式上看起來像 streaming，但實際 total latency 和 RTF 壞掉。

結論：不要再把 PD2/PD3、batch size expansion、假 streaming 當產品路線。

### Parallel segment / PD hybrid 的結論

你們的 parallel segment batch 也證明了一件事：

serial baseline p95 first ordered 約 4.4s、total 約 7.3s。
P2/P3 parallel first ordered 反而約 7.0 到 7.5s，total 也沒有改善。
PD2/PD3 更慘，p95 first/total 約 45 到 52s。

這代表：parallel segment 目前沒有改善使用者等待體感，PD hybrid 更不是產品路線。

first-principle 來看，平行化只有在三種情況有用：

一，總工作可被切分而且沒有重組等待。
二，first chunk 可以立刻播放，不必等排序。
三，GPU/CPU 資源沒有被 contention 吃掉。

你們現在的數據顯示這三件事沒有成立。所以不要硬拗。

### LLM 實驗的結論

LLM 已經夠用了。Native Ollama + think=false + 短 guidance 可以過 PHQ-9 1 到 5 句說明需求。現在不需要更多 prompt tuning。

因為產品核心不是讓 LLM 回答得更漂亮，而是：

使用者是否聽懂問題？
是否能正確回答？
系統是否能安全寫入？
不確定時是否能回到 touch/staff review？

所以 LLM 不是目前瓶頸。

### Wakeword 實驗的結論

wake/browser loop 已經用 simulated wake 和 fake mic audio 驗證過流程，但還沒有證明：

真實房間裡使用者說「你好小慧」能穩定喚醒。
不同距離、噪音、口音、音量下 false negative 多少。
背景對話下 false positive 多少。
iPad/筆電/艙體麥克風實際收音是否可用。
瀏覽器 mic permission、endpointing、VAD 是否穩定。

所以 wakeword 現在是 engineering readiness，不是 field readiness。

## 3. 最重要的第一性原理：這不是語音模型專案，是「安全狀態寫入」專案

你現在要把問題重新定義。

不要問：

「TTS 怎麼做得更快？」
「batch streaming 怎麼做得更漂亮？」
「reranker 要不要接？」
「Avatar 要不要更像真人？」

要問：

在健康艙裡，一個真人能不能安全完成 PHQ-9，而且任何錯誤都可以被發現、修正、回退？

這個產品真正危險的點不是 TTS 慢。慢只是 UX 問題。

真正危險的是：

ASR 聽錯
-> mapping 判錯
-> 系統自動填入問卷
-> 使用者沒注意
-> 報告生成
-> 工作人員誤解
-> 醫療/照護流程受到污染

所以最核心的 hard gate 應該是：

voice misfill rate
critical misfill rate
uncertainty recovery rate
full questionnaire completion rate
touch fallback success rate

而不是只有 TTFA/RTF。

## 4. 下一步真正需要優化的地方

### 優先級 1：把 TTS 從 critical path 刪掉

這是最大的產品槓桿。

PHQ-9 是固定 9 題，答案選項也是固定的。這種場景根本不應該每一輪都 runtime TTS。

你應該預先產生音檔：

歡迎語
9 題 PHQ-9 題目
4 個選項說明
低信心重問
請改用觸控
請洽工作人員
完成語
安全敏感提醒
每題回答確認語，例如「我剛剛聽到您選擇完全沒有，接下來是第二題」

這代表你可以把大部分 TTS latency 從 5 到 12 秒降到接近 0。播放 local audio asset 的 start latency 應該可以壓到 300ms 以內。

這才是 Elon-style 的做法：不是優化慢的東西，而是問這個東西是否根本不該存在於 runtime。

具體做法：

建立 audio_prompt_manifest.json，每個 prompt 有 key、文字、voice model、hash、duration、file path。

例如：

{
  "phq9.q1.prompt": {
    "text": "在過去兩週，您有多少時候對做事情提不起勁或沒有興趣？",
    "audio_path": "/audio/phq9/q1_prompt.wav",
    "text_hash": "...",
    "voice": "breezyvoice_default",
    "duration_ms": 5200
  }
}

Kiosk 不要直接呼叫 /tts 播固定問卷題目，而是：

promptKey -> manifest -> local wav/mp3 -> play

runtime TTS 只保留在兩種情境：

第一，真的需要動態語句。
第二，static asset miss 時的 fallback。

但 PHQ-9 MVP 幾乎都可以預產生。

這一步做完，你會立刻避開目前 BreezyVoice 最大瓶頸。

### 優先級 2：真實房間 voice loop acceptance

你們現在需要一個新的實驗，不是 TTS matrix，而是：

physical_room_voice_loop_acceptance

實驗目標不是證明模型可以跑，而是證明使用者在真實環境可以完成任務。

要測：

wakeword：真實說「你好小慧」是否喚醒
recording：瀏覽器收音是否穩定
endpointing：使用者講完是否準確停錄
ASR：四個選項是否會混淆
mapping：是否正確對應 SurveyJS choice
confirmation：不確定時是否要求確認
write：是否只在安全條件下寫入
fallback：失敗時是否能回觸控
completion：9 題能否完成
latency：每一輪總等待是否可接受

建議測試矩陣：

speaker: 至少 3 人
distance: 0.5m、1m、1.5m
noise: 安靜、一般背景音、人聲干擾
input: 四個 PHQ-9 選項 + 常見口語變體
device: 實際 kiosk 硬體
flow: full 9-question run

你需要收的指標：

wake miss rate
false trigger / hour
ASR transcript
mapped answer
是否 auto-fill
是否要求 confirmation
是否 fallback
end-to-end turn latency
user correction 是否成功
full completion time
manual intervention 次數

這個實驗比任何新模型實驗都重要。

### 優先級 3：修掉 ASR confidence 假象

目前 asr-service/app.py 回傳 confidence: 1.0。這在工程上很危險，因為下游 voice-safety routing 會相信它。

如果 confidence 是假的，就不應該被用來決定 auto-fill。

你現在有兩個選擇。

第一個選擇：短期安全做法。
在 PHQ-9 voice answer path 裡，先強制 confirmation。

也就是：

使用者說「完全沒有」
系統顯示/播放：「我聽到的是『完全沒有』，請確認是否正確。」
使用者可說「對」或直接觸控確認。

這會增加一點 friction，但能大幅降低錯填風險。

第二個選擇：中期工程做法。
從 faster-whisper 取得更可靠的 proxy confidence，例如 avg_logprob、no_speech_prob、compression_ratio、segment-level score，或乾脆做 N-best/候選重打分。

但不要偽裝成真 confidence。

尤其要處理這個已知錯誤：

完全沒有 -> 完全沒用

這不能只是簡單 replace。因為「沒用」在自然語言裡可能不是答案，而是使用者抱怨系統。所以比較安全的策略是：

在 PHQ-9 answer slot context 下，把「完全沒用」列為 candidate: 完全沒有，但 confirmation_required: true。
不要直接 high-confidence auto-fill。

### 優先級 4：重做 voice answer safety policy

目前有一個關鍵 mismatch：

domain pack 裡的 answer aliases 看起來有 confirmationRequired: true，但 processVoiceEvidence / routing 之後，高信心單一候選可能變成 confirmationRequired: false，kiosk 就會 auto-commit。

這要修。

對 PHQ-9 這種敏感問卷，我建議初期 policy 是：

一般題：高信心可以預選，但要有明顯可取消/修改 UI。
第 9 題或自傷相關：永遠 confirmation 或 staff review。
低信心：不寫入，只重問或切 touch。
ambiguous：不寫入，只請使用者點選。
no speech：不寫入。
非答案語句：不寫入。
ASR confidence unavailable：視為需要確認。

也就是說，產品預設不應該是「AI 聽到就填」，而是：

AI 幫你選，但你能看見、確認、修正。

### 優先級 5：把 UI correction 做成核心，不是備用功能

醫療/健康艙產品不能只追求 happy path。

Kiosk 每次 voice mapping 後都應該讓使用者看到：

我剛剛聽到的文字
系統判斷的選項
信心/狀態，不一定要顯示數字，但要有明確狀態
修改答案
改用觸控
請工作人員協助

目前 UI 已經有 voice loop，但要把「修正」視為主流程的一部分。

建議 UI 狀態：

listening
transcribing
mapped_candidate
needs_confirmation
committed
retry_or_touch
staff_review

不要再用 repeated ASR_DONE 去推狀態。這會讓狀態機看起來有流程，但實際上事件語意不清楚。要改成顯式事件：

ASR_TRANSCRIBED
TEXT_NORMALIZED
CANDIDATE_MAPPED
CONFIRMATION_REQUIRED
ANSWER_COMMITTED
FALLBACK_REQUIRED

這會讓 debug、evidence、audit 都更乾淨。

## 5. 現在不該做什麼

這一段很重要，因為你們很容易被「看起來很 AI」的事情拖走。

現在不該做：

不要繼續擴 batch size。
不要把 PD2/PD3 當產品候選。
不要做更多 LLM prompt variant，除非真實使用者聽不懂。
不要急著把 reranker promoted 成必要組件。
不要做 avatar animation / lip-sync。
不要做 vision/hearing Phase 2。
不要讓 Redpanda 變成 user critical path。
不要用 fake confidence 做 auto-fill。
不要把 simulated wakeword 測試包裝成 field readiness。
不要把 streaming event 存在當成 streaming product 成功。

這些東西不是永遠不能做，而是現在做會分散主戰場。

## 6. 推薦的產品預設路線

我建議現在的 product default 改成：

touch-first questionnaire + voice guidance assist + tap-to-start / wakeword optional + static audio prompt assets + conservative ASR mapping + confirmation/fallback + staff review.

也就是：

問卷完成主幹仍是 SurveyJS touch UI。
語音是輔助，不是唯一入口。
TTS 不 runtime 生成固定題目。
wakeword 通過真實場域測試前，不當唯一入口。
ASR 不確定時，不寫入。
LLM 只做說明，不決定分數、不替使用者回答。
Redpanda 做 evidence/replay，不阻塞使用者。

這樣才是最短可交付路線。

## 7. 具體 sprint 規劃

### Sprint A：決策收斂與刪減，1-2 天

目標：把 repo 的產品路線明確凍結，停止錯誤優化。

要做：

新增決策文件：

docs/decisions/2026-06-26-product-path-after-tts-matrix.md

內容寫清楚：

ABCD 無 production winner
PD2/PD3 research only
parallel segment 不當 product default
BreezyVoice live TTS 不進 critical path
product default 改為 static audio prompt assets
wakeword 需 physical-room acceptance
ASR confidence 未實作前禁止無確認 auto-fill
reranker optional，不是 acceptance gate

更新 AGENTS.md 或 agent global rules：

Voice/TTS product rule:
- Serial fallback, fake streaming, batch harness, and smoke tests are baselines only.
- They can unblock measurement but cannot be marked as product success.
- A product TTS path must pass real latency, audio quality, and safety gates.
- For fixed questionnaire prompts, prefer pre-rendered static audio assets over runtime TTS.
- Runtime TTS must not be placed on the critical path unless p95 TTFA, p95 total latency, RTF, audio quality, and recovery gates pass.

驗收：

pnpm lint/typecheck/test 過。
文件明確標註 product path / research path / blocked path。
Codex 不能再把 serial fallback 說成完成。

### Sprint B：Static Audio Prompt Asset，2-3 天

目標：把固定問卷 TTS latency 刪掉。

新增：

packages/audio-prompt-core 或直接先放在 apps/kiosk-web/src/audioPrompt/

建立 manifest：

apps/kiosk-web/public/audio/phq9/audio_prompt_manifest.json

音檔路徑：

apps/kiosk-web/public/audio/phq9/*.wav

prompt keys：

welcome
wake_greeting
phq9.q1.prompt
phq9.q2.prompt
...
phq9.q9.prompt
option.not_at_all
option.several_days
option.more_than_half
option.nearly_every_day
low_confidence_retry
ambiguous_retry
touch_fallback
staff_review
complete
confirm.heard.not_at_all
confirm.heard.several_days
confirm.heard.more_than_half
confirm.heard.nearly_every_day

新增 script：

scripts/tts-assets/generate_phq9_audio_assets.py
scripts/tts-assets/verify_audio_manifest.py

Kiosk 新增 env：

VITE_AUDIO_PROMPT_MODE=static
VITE_AUDIO_PROMPT_FALLBACK=live_tts

邏輯：

static mode 下，固定 prompt 永遠播放 local asset。
asset 不存在才 fallback live TTS。
測試要驗證標準 PHQ-9 full path 不呼叫 /tts。

驗收 gate：

固定 prompt playback start p95 < 300ms。
standard PHQ-9 9 題流程中，/tts 呼叫次數 = 0。
所有 manifest key 有音檔、hash、duration。
音檔人工聽過，無截斷、無重複、無破音。

### Sprint C：Physical-room voice loop acceptance，3-5 天

目標：證明真實健康艙場景可完成問卷。

新增實驗資料夾：

experiments/physical_room_voice_loop_2026-06-xx/
  README.md
  protocol.md
  raw_runs.jsonl
  summary.md
  confusion_matrix.csv
  latency_report.md
  failures.md

每一輪記錄：

{
  "run_id": "...",
  "speaker_id": "S1",
  "distance_m": 1.0,
  "noise_condition": "normal_room",
  "question_id": "phq9_q1",
  "expected_answer": "not_at_all",
  "wake_detected": true,
  "wake_latency_ms": 820,
  "recording_duration_ms": 2400,
  "asr_text": "完全沒用",
  "mapped_candidate": "not_at_all",
  "confirmation_required": true,
  "committed": false,
  "fallback_used": "confirmation",
  "turn_latency_ms": 3100,
  "error_type": "asr_option_confusion"
}

測試範圍：

至少 3 speakers。
每人跑 9 題 full flow。
每個 PHQ-9 option 至少 20 次。
至少測安靜、一般背景音、人聲干擾。
至少測 0.5m、1m、1.5m。

驗收 gate 建議：

critical unsafe auto-write = 0。
uncertain answer write without confirmation = 0。
full questionnaire completion success >= 90%。
touch fallback success = 100%。
wake false trigger <= 可接受門檻，例如每 30-60 分鐘小於 1 次。
wake miss rate 有明確數據；未達標則 tap-to-start 為 default。
所有 ASR confusion 都被分類，不允許 unknown failure。

### Sprint D：ASR / mapping safety hardening，2-4 天

目標：把「聽錯但自動填」這個風險降到最低。

要改：

asr-service/app.py 不要再固定回 confidence: 1.0。
若沒有可靠 confidence，就回傳 confidence_available: false。
voice-safety-core 遇到 confidence unavailable，要 route 到 confirmation。
加入 完全沒用 測試案例。
建立 PHQ-9 answer phrase pack。

phrase pack 至少包含：

完全沒有
沒有
都沒有
完全沒
沒有這種情況
幾天
好幾天
有幾天
一半以上
超過一半
很多天
幾乎每天
每天
天天

但每個 alias 要有策略：

明確答案：可 mapped。
口語但可能歧義：confirmation required。
抱怨/非答案：fallback/touch。
item 9：更保守。

新增測試：

packages/voice-safety-core/src/__tests__/phq9-answer-confusion.test.ts
packages/questionnaire-core/src/__tests__/voice-answer-map.phq9.test.ts

驗收：

完全沒用 不可直接 auto-commit。
ASR confidence unavailable 不可 high-confidence commit。
PHQ-9 item 9 不可無確認直接寫入。
所有 low/ambiguous/no-speech/safety-sensitive 都有 fallback。

### Sprint E：TTS research timebox，3-5 天，平行做，不阻塞產品

目標：決定 BreezyVoice 是否值得繼續改 cache-aware streaming。

只做一個研究問題：

BreezyVoice 現在 C/D 慢，是不是因為 recomputation？如果是，改成 cache-aware streaming 是否現實？

要加 stage-level metrics：

text length
speech token count
mel/acoustic frame count
chunk count
unique generated tokens
total processed tokens
recompute ratio
LLM/flow/acoustic/vocoder time
first_speech_token_ms
first_pcm_ms
first_audio_sent_ms
total_ms
RTF
VRAM peak
CPU/GPU utilization

驗收：

如果一週內不能把 D_hybrid 類路徑做到：

p95 TTFA <= 1500ms
p95 RTF <= 1.0
p95 total 不比 A/B 更差
無破音、無截斷、無重複
seam quality 可接受

那就停止產品化 BreezyVoice streaming。保留研究紀錄，產品走 static asset + fallback。

這不是放棄，是工程紀律。

### Sprint F：Field demo hardening，3-5 天

目標：從 prototype 變成可拿去展示的穩定 demo。

要做：

一鍵啟動：

pnpm dev:all
pnpm smoke:field-demo
pnpm live:check

provider status panel：

ASR ready
LLM ready
TTS ready
Wakeword ready
Redpanda ready
DB ready
Audio assets ready
Mic permission ready

UI 加：

最近一次聽到的文字
目前判斷答案
修改答案
改用觸控
工作人員協助
服務狀態提示

資料治理：

report token 加 expiry/revocation。
不要 raw token 長期存 DB；至少 field-demo 前要有風險註記。
tenant/kiosk 不要硬編 demo / kiosk_demo。
raw audio 預設不存；若要收音訊做 ASR eval，必須有 consent、retention、anonymization、dataset lineage。

## 8. 我認為你們還沒充分討論、但很重要的事

### 8.1 音質不是模型指標，是使用者信任指標

packet 裡 experiment_artifacts_no_audio 沒有 audio，所以我只能根據 log 判斷 latency，不能實際聽音質。

但健康艙裡，TTS 音質很重要。不是因為好不好聽，而是因為：

破音會降低信任。
截斷會造成誤解。
重複會讓使用者以為系統故障。
語速太快會影響高齡者理解。
語氣太像客服機器人會降低照護感。

所以要加 human audio review：

每個 prompt 至少 2 人聽。
檢查：清楚度、語速、截斷、重複、停頓、音量一致。
音檔一旦通過，就 frozen，除非文字變更。

### 8.2 你們現在最大的安全洞不是 LLM，而是 deterministic pipeline 的假信心

很多人會以為醫療 AI 風險在 LLM hallucination。你們這個 repo 目前比較大的風險其實不是 hallucination，而是：

ASR confidence 假
normalization 過度修正
mapping 太快 auto-fill
UI 沒讓使用者充分看見修正
audit event 以為自己記錄完整，但實際上信心來源不可靠

所以不要只管 LLM safety。要把 ASR -> normalization -> candidate mapping -> confirmation -> write 這條鏈當成安全關鍵鏈。

### 8.3 Reranker 不能修 ASR 錯誤

reranker 只是在候選裡重排。ASR 如果把語音轉成錯文字，reranker 會很有信心地排錯。

所以 reranker 只能做：

候選排序
歧義時輔助 confirmation
相似選項 disambiguation

不能做：

修復 ASR
替使用者回答
繞過 confirmation
直接寫入問卷

因此現在不該 promote reranker。

### 8.4 Redpanda 是 evidence/replay layer，不是產品核心

Redpanda outbox 是對的，但 MVP 不要讓它變成使用者流程的必要條件。

使用者完成問卷的 critical path 應該是：

Kiosk -> API -> DB transaction -> response/report

Redpanda 是之後 replay、audit、multi-consumer、analytics、staff review pipeline 的基礎。現在要確認 outbox 不會拖垮主流程。

### 8.5 文件 evidence chronology 要清乾淨

packet date 是 2026-06-26，但包內有一些 devlog/API/ERD/ops 類文件看起來有 6/29-7/10 的未來日期。這可能是預填模板、計畫文件、或生成文件時混入的 future-dated docs。

如果要給外部專家 review，這會造成證據鏈疑慮。建議加一份：

docs/evidence/EVIDENCE_CHRONOLOGY.md

明確標註：

實際完成日期
計畫日期
生成日期
實驗日期
文件最後修改日期
哪些是 plan，哪些是 actual evidence

不然專家可能會質疑 repo 的 evidence discipline。

## 9. 建議的 hard gates

### Product-level gates

Completion: 9 題可完成，失敗可 touch fallback
Safety: critical unsafe auto-write = 0
ASR: 已知混淆不得直接 commit
Confirmation: confidence unavailable 必須確認
Wakeword: 未通過真實場域前，不可當唯一入口
Latency: static prompt playback p95 < 300ms
Voice turn: p95 end-to-end turn latency 要量測並設門檻
Recovery: 使用者可修改上一題
Audit: 每次 mapping/write/fallback 都有 event
Privacy: raw audio default off；收集需 consent

### TTS research gates

TTFA: p95 <= 1500ms
RTF: p95 <= 1.0
Total latency: 不得比 A/B 更差
Audio: 無截斷、無重複、無破音
Streaming: 不可 fake streaming
Batch: serial fallback 不可稱 true batch
Cache: 要有 recompute ratio / stage metrics

## 10. 最短可執行任務清單

接下來我會這樣排：

1. 寫 product decision doc：TTS matrix 後的產品路線。
2. 將 PHQ-9 固定 prompt 全部預產生 audio assets。
3. Kiosk 加 VITE_AUDIO_PROMPT_MODE=static。
4. 測標準 PHQ-9 path /tts 呼叫次數必須是 0。
5. ASR confidence 改成不可偽裝；沒有真 confidence 就要求確認。
6. 加 完全沒用 confusion test，禁止 auto-commit。
7. PHQ-9 item 9 永遠 confirmation/staff-sensitive route。
8. 重構 voice state machine，不再 repeated ASR_DONE。
9. 建 physical-room voice loop experiment。
10. 用真實硬體、真實房間、真實人聲跑 full 9-question acceptance。
11. 產出 confusion matrix、latency report、failure taxonomy。
12. 只在這些數據通過後，才考慮 wakeword default-on。
13. BreezyVoice cache-aware streaming 另開 research branch，timebox，不阻塞 demo。
14. 修 report token / tenant / consent / raw audio governance。
15. 更新 runbook，讓 demo operator 知道何時 fallback touch。

## 最終建議

你們現在應該把專案切成兩條線。

產品線：
用最穩的方式完成健康艙問卷。也就是 touch-first、voice-assist、static audio、保守 ASR、可確認、可回退、可 audit。

研究線：
繼續探索 BreezyVoice cache-aware streaming、CosyVoice2-style streaming、PD hybrid、parallel TTS。但這些不能阻塞產品主線，也不能被包裝成已經可產品化。

真正的下一步不是「把 AI 做更炫」。
真正的下一步是：讓一個普通人在真實房間裡，用這套系統完成 PHQ-9，而且即使 ASR/TTS/wakeword 任一環節失誤，系統也不會錯填、不會卡死、不會失去信任。

這才是目前 repo 最該優化的地方。
```

## Follow-Up Files

- Product decision:
  `docs/decisions/2026-06-26-product-path-after-tts-matrix.md`
- Evidence chronology:
  `docs/evidence/EVIDENCE_CHRONOLOGY.md`
