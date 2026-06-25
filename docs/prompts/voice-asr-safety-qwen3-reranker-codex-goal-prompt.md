---
id: smart-health-cabin-voice-asr-safety-qwen3-reranker-codex-goal-prompt
title: "Voice ASR Safety Six-Layer Pipeline + Qwen3 Reranker Codex Goal Prompt"
date: 2026-06-25
topic: smart-health-cabin
type: codex-goal-prompt
status: active
source:
  - ../specs/VOICE-ENTRY-TECH-SELECTION-SDD-DRAFT.md
  - ../handoff/sprint-5-to-last-sprint-next-phase-handoff.md
  - ./sprint-5-codex-goal-prompt.md
  - ./phase-2-next-phase-codex-goal-prompt.md
external_reference:
  - https://huggingface.co/Qwen/Qwen3-Reranker-0.6B
  - https://qwenlm.github.io/blog/qwen3-embedding/
---

# Codex Goal Prompt - Smart Health Cabin ASR Safety Layers + Qwen3 Reranker Integration

結論：Smart Health Cabin 不該只做 2-3 層語音防錯。健康艙應設計成
**六層完整架構**，但 MVP 驗收先把第 1、3、4、5、6 層列為必備；
第 2 層 N-best / beam candidates 做成可插拔 capability，不要硬假裝 ASR
已經能穩定輸出真正 N-best。

這份 prompt 對齊目前系統主線：

```text
Touch questionnaire remains a complete path.
Wake word only starts recording.
ASR produces evidence, not truth.
Mapping produces candidates, not state changes.
User confirmation creates questionnaire writes.
PostgreSQL is the source of truth.
Redpanda publishes events asynchronously and must not block completion.
Raw audio is not retained by default.
```

2026-06-25 查核：Qwen 官方 Hugging Face model card 將
`Qwen3-Reranker-0.6B` 標示為 text reranking model，Apache 2.0 license，
0.6B parameters，32k context，100+ languages，並列出 reranker 尺寸
0.6B、4B、8B。Qwen 官方 blog 也將 Qwen3 Embedding / Reranking 系列定位
為 embedding、retrieval、reranking 任務，並列出 reranking 評估表。
因此 MVP 預設採用 `Qwen3-Reranker-0.6B`，4B / 8B 保留為後續 benchmark
或更高資源部署選項。

## Why Reranker Cannot Fix Bad ASR

ASR 錯誤會沿著下列鏈條放大：

```text
ASR mishears user
-> transcript semantic meaning shifts
-> embedding retrieves wrong candidates
-> reranker precisely ranks wrong candidates
-> LLM answers from wrong context
-> questionnaire / report may become misleading
```

Reranker 只看文字候選與排序，不知道原始語音真正說了什麼。它可以改善
retrieval ranking，但不能可靠修復輸入語意錯誤。健康艙的正確工程策略是：

```text
Do not let wrong or uncertain transcripts directly enter RAG, reranker,
LLM guidance, or questionnaire writes.
```

## Recommended Architecture

```text
Audio
  ↓
VAD / noise check
  ↓
ASR with timestamps + confidence + N-best capability
  ↓
ASR normalizer / medical lexicon correction
  ↓
Intent + symptom slot extraction / semantic frame
  ↓
Confidence gate
  ├─ high confidence -> candidate confirmation -> write after user confirms
  └─ low confidence  -> confirmation question / retry / tap-to-select fallback
```

## How Many Layers This Project Needs

Implement the architecture as six layers, but phase validation like this:

```text
MVP mandatory:
  Layer 1 - ASR confidence routing
  Layer 3 - domain lexicon normalization
  Layer 4 - semantic frame / query rewriting
  Layer 5 - audio + ASR metadata preservation
  Layer 6 - confirmation / touch fallback

MVP capability interface:
  Layer 2 - N-best / beam candidates
```

Rationale:

```text
The health cabin's main risk is not imperfect retrieval ranking.
The main risk is silent state corruption from uncertain voice input.
Therefore confidence gating, normalization, bounded semantic framing,
metadata, and confirmation are mandatory.
N-best is valuable but should not block MVP if unavailable from the
selected ASR provider.
```

## Project-Tailored Domain Design

The six-layer design should use **versioned domain packs**, not one fixed
medical word list. Each questionnaire or module can add hotwords, answer
aliases, ASR confusion repairs, semantic slots, safety flags, retrieval
templates, and confirmation wording without changing the core voice pipeline.

Current domain packs should target:

```text
phq9_zh_tw:
  current MVP questionnaire; four bounded frequency options; item 9 human-review
  flag; mental-health self-check language only.

hpa_adult_preventive_zh_tw:
  likely near-term adult preventive health form; demographics, health behavior,
  disease history, medication, family history, cough over two weeks, depression
  screening, body measurements, blood pressure, blood sugar, lipid and liver /
  kidney lab terms.

smart_cabin_measurement:
  cross-module measurement terms; height, weight, BMI, pulse, waist, blood
  pressure, blood glucose, report, QR code, staff review, retake, skip, touch
  input.

vision_screening_phase2:
  future vision self-screening terms; right eye, left eye, naked vision,
  corrected vision, contrast, color vision, astigmatism, cannot see clearly.

hearing_screening_phase2:
  future hearing self-screening terms; left ear, right ear, tone heard, volume,
  noise, hearing aid, retest, cannot hear clearly.

kiosk_faq:
  operational user questions; how to answer, repeat question, start over, use
  touch screen, privacy, report access, QR code, ask staff.
```

Hotwords are ASR biasing hints when the ASR provider supports them and
normalization hints otherwise. They must improve recognition and routing only;
they must not create questionnaire answers, diagnoses, or report claims.

Domain-pack selection must be runtime-extensible:

```text
Default MVP:
  phq9_zh_tw
  smart_cabin_measurement
  kiosk_faq

Near-term questionnaire:
  hpa_adult_preventive_zh_tw

Phase-2 module packs:
  vision_screening_phase2
  hearing_screening_phase2
```

Use questionnaire code, question-name prefix, or `VOICE_DEFAULT_DOMAIN_PACKS`
to select packs. Adding a new questionnaire should require adding a new domain
pack and a small context mapping, not rewriting ASR routing, semantic-frame
logic, kiosk UI confirmation, or reranker contracts.

Each domain pack must own:

```text
sourceFiles
hotwords
canonicalTerms
commonAsrErrors
answerAliases
semanticSlots
safetyRules
retrievalTemplates
confirmationTemplates
```

Answer aliases are only candidate evidence. They are valid only when the active
SurveyJS question exposes the same bounded choice. They must never create a new
questionnaire answer category.

---

## Direct Codex Goal Prompt

```text
You are Codex working inside the Smart Health Cabin execution repo:

/home/jnclaw/every_on_git_jnclaw/phd-life-system/imedtac-smart-health-cabin-v0

Your goal is to implement and document two connected upgrades:

1. A six-layer ASR error-resilience architecture between voice input and
   downstream questionnaire / RAG / agent reasoning.
2. A local reranker service using Qwen3-Reranker-0.6B as the default reranking
   model for Traditional Chinese health-cabin retrieval and bounded candidate
   ranking.

This project is a Taiwan zh-TW enterprise health screening kiosk. Do not treat
voice recognition output as truth. Preserve the existing safety contract:

Touch questionnaire remains a complete path.
Wake word only starts recording.
ASR produces evidence, not truth.
Mapping produces candidates, not state changes.
User confirmation creates questionnaire writes.
PostgreSQL is the source of truth.
Redpanda publishes events asynchronously and must not block completion.
Raw audio is not retained by default.

Before coding, read the current system reference file if present:

smart-health-cabin-current-system-pipeline.md

If that exact file does not exist, inspect the current canonical files instead:

docs/specs/MVP-SYSTEM-SPEC.md
docs/specs/VOICE-ENTRY-TECH-SELECTION-SDD-DRAFT.md
docs/handoff/sprint-5-to-last-sprint-next-phase-handoff.md
docs/ops/LIVE_PROVIDER_RUNBOOK.md
docs/dev/LOCAL_DEV.md
docs/source-index.md
modules/questionnaire/seed/phq9.zh-TW.surveyjs.json
modules/questionnaire/scoring/phq9.public-scoring-config.json
modules/questionnaire/source/phq9.zh-TW.agent-readable.md
source/2026-06-23-wu-line-hpa-adult-preventive-health-form/2026-06-23-hpa-adult-preventive-health-service-check-record-result-form-agent-readable.md

Use the repo's current architecture, selected providers, ports, state
boundaries, fallback behavior, and acceptance criteria as source of truth.

Do not remove or weaken the existing touch-first fallback. Do not make voice,
ASR, LLM, TTS, wake word, reranker, or Redpanda mandatory for completing a
questionnaire.

## 0. Current System Context

The current system should be treated as this product spine unless the repo has
more recent files that refine names or ports:

Kiosk Web:
  React + Vite + SurveyJS
  Touch-first questionnaire
  XState-driven Avatar / voice interaction
  Wake word or tap-to-start voice entry

API Server:
  Fastify + TypeScript
  PostgreSQL persistence
  questionnaire responses
  report / QR token
  agent turns
  outbox events

ASR Sidecar:
  apps/model-sidecars/asr-service
  FastAPI
  faster-whisper
  Breeze-ASR-26-CT2-int8
  port 8011

TTS Sidecar:
  apps/model-sidecars/tts-service
  BreezyVoice default voice
  port 8012

Wake Word Sidecar:
  apps/model-sidecars/wakeword-service
  openWakeWord
  port 8013

Voice Agent:
  local Gemma 4 E4B through Ollama or the current local LLM provider configured
  in the repo
  short zh-TW questionnaire guidance

Database:
  PostgreSQL source of truth
  outbox_events for Redpanda publish

Event Layer:
  Redpanda through outbox worker
  nonblocking event publishing

## 1. Product Goal

Implement a robust voice-entry safety pipeline so ASR errors do not silently
corrupt questionnaire state or RAG context.

The critical failure chain is:

ASR mishears user
-> transcript semantic meaning shifts
-> embedding retrieves wrong candidates
-> reranker precisely ranks wrong candidates
-> LLM answers from wrong context
-> questionnaire / report may become misleading

The system must prevent this by inserting explicit safety, normalization,
routing, and confirmation layers between ASR output and downstream state
changes.

## 1A. Project-Specific Extensibility Requirement

Do not implement the six layers as one fixed PHQ-9-only word list.

Implement the voice safety core around versioned domain packs. A domain pack is
the replaceable vocabulary and routing unit for a questionnaire, module, or FAQ
area. The same core pipeline must work for:

phq9_zh_tw:
  the current MVP questionnaire; four bounded frequency answers; item 9
  staff-review flag; no diagnosis.

hpa_adult_preventive_zh_tw:
  likely near-term adult preventive health questionnaire/form; demographics,
  disease history, medication, family history, smoking, drinking, betel nut,
  exercise, cough over two weeks, depression screening, body measurements,
  blood pressure, blood sugar, lipid, liver, kidney, hepatitis terms.

smart_cabin_measurement:
  shared cabin measurements and operations; height, weight, BMI, pulse, waist,
  blood pressure, blood glucose, report, QR code, retake, skip, staff review,
  touch input.

vision_screening_phase2:
  future vision module; right eye, left eye, naked vision, corrected vision,
  contrast, color vision, astigmatism, cannot see clearly.

hearing_screening_phase2:
  future hearing module; left ear, right ear, tone heard, volume, ambient noise,
  hearing aid, retest, cannot hear clearly.

kiosk_faq:
  user-support questions; repeat question, explain options, start over, use
  touch screen, privacy, report access, QR code, ask staff.

Recommended type:

type VoiceDomainPack = {
  domainId: string;
  version: string;
  language: "zh-TW";
  moduleId?: "questionnaire" | "vision" | "hearing" | "avatar" | "report" | "kiosk";
  questionnaireCode?: string;
  sourceFiles: string[];
  hotwords: string[];
  canonicalTerms: Array<{
    term: string;
    category:
      | "answer_option"
      | "symptom"
      | "measurement"
      | "health_behavior"
      | "disease_history"
      | "module_command"
      | "report_access"
      | "safety";
    aliases: string[];
    commonAsrErrors: string[];
  }>;
  answerAliases: Array<{
    questionPattern?: string;
    optionValue: string | number | boolean;
    optionText: string;
    aliases: string[];
    ambiguousWith?: Array<string | number | boolean>;
    confirmationRequired: true;
  }>;
  semanticSlots: Array<{
    slot: string;
    examples: string[];
  }>;
  safetyRules: Array<{
    flag: "self_harm" | "chest_pain" | "breathing_difficulty" | "fall_risk" | "none";
    triggerTerms: string[];
    route: "confirm" | "staff_review";
  }>;
  retrievalTemplates: Array<{
    intent: string;
    template: string;
  }>;
  confirmationTemplates: {
    singleCandidate: string;
    multipleCandidates: string;
    lowConfidence: string;
    touchFallback: string;
  };
};

Domain packs are loaded from data files, not hard-coded across business logic.
Suggested path:

packages/voice-safety-core/domain-packs/*.json

The initial implementation should include at least:

packages/voice-safety-core/domain-packs/phq9_zh_tw.json
packages/voice-safety-core/domain-packs/hpa_adult_preventive_zh_tw.json
packages/voice-safety-core/domain-packs/smart_cabin_measurement.json

Future vision, hearing, and FAQ packs may be added without changing the core
router.

## 2. Required Six-Layer Architecture

Implement the following six conceptual layers.

### Layer 1 - ASR Confidence Routing

Purpose:

Do not route low-confidence ASR output directly into questionnaire write, RAG,
reranker, or LLM generation.

Required inputs:

asr_text
asr_provider
asr_model
active_domain_pack_ids
asr_hotwords_requested
asr_hotwords_applied
segment_timestamps
segment_avg_logprob
segment_no_speech_prob
segment_compression_ratio, if available
word_or_token_confidence, if available
vad_confidence
endpointing_mode
utterance_duration_ms

Required routing decisions:

high_confidence_clear_answer
medium_confidence_needs_confirmation
ambiguous_multiple_candidates
low_confidence_retry
no_speech_retry
voice_unavailable_touch_fallback
safety_sensitive_staff_review

Acceptance behavior:

High confidence + one clear bounded option:
  show candidate confirmation, then write only after user confirms.

Medium confidence:
  ask user to confirm or offer touch selection.

Low confidence:
  do not retrieve/rerank/generate as if transcript were reliable.
  ask retry or move to touch fallback.

No speech:
  no questionnaire write.

Safety-sensitive ambiguity:
  explicit confirmation or staff review.

### Layer 2 - N-best / Beam Candidate Support

Purpose:

Avoid depending entirely on ASR top-1 transcript.

Important implementation rule:

Do not fabricate fake N-best candidates in production.

Implement a capability-aware interface:

type AsrHypothesis = {
  text: string;
  rank: number;
  confidence?: number;
  avgLogprob?: number;
  source: "provider_n_best" | "provider_top1";
};

type AsrHypothesisSet = {
  primaryText: string;
  nBestAvailable: boolean;
  hypotheses: AsrHypothesis[];
  hotwordsRequested: string[];
  hotwordsApplied: boolean;
};

Hotwords:

If the ASR provider supports ASR hotword / phrase biasing, pass the active
domain pack hotwords into the ASR request and return hotwordsApplied=true.

If the ASR provider does not support hotword biasing, return
hotwordsApplied=false and still use the same hotwords for post-ASR
normalization and semantic framing.

Do not pretend hotwords were applied by ASR when they were only used after ASR.

N-best:

If the ASR provider can return real N-best / beam alternatives, expose them.

If the ASR provider cannot currently expose true alternatives:

Return only top-1.
Set nBestAvailable=false.
Do not pretend multi-hypothesis retrieval is active.
Keep the downstream interface ready for future N-best.

For retrieval/rerank fusion, implement the service boundary now:

for each ASR hypothesis:
  normalize
  build semantic frame
  retrieve candidates
  rerank candidates
  fuse results by hypothesis confidence and reranker score

Production behavior must degrade correctly when only top-1 is available.

### Layer 3 - Domain Lexicon Normalization

Purpose:

Correct common Mandarin / zh-TW health-domain ASR confusions before mapping or
retrieval.

Create a deterministic domain-pack-based lexicon and normalization module.

Suggested package:

packages/voice-safety-core

Suggested files:

packages/voice-safety-core/src/asr-confidence.ts
packages/voice-safety-core/src/domain-lexicon.ts
packages/voice-safety-core/src/domain-pack-loader.ts
packages/voice-safety-core/src/hotwords.ts
packages/voice-safety-core/src/normalization.ts
packages/voice-safety-core/src/semantic-frame.ts
packages/voice-safety-core/src/routing.ts
packages/voice-safety-core/src/types.ts
packages/voice-safety-core/src/index.ts

The current project lexicon should be split by domain pack.

PHQ-9 MVP hotwords and canonical terms:

失眠
睡不好
睡不安穩
睡眠過多
提不起勁
沒有樂趣
心情低落
沮喪
絕望
疲倦
沒有活力
食慾
憂鬱
專注困難
煩躁
坐立不安
動作變慢
說話變慢
輕生
自殺
傷害自己
不如死掉
完全沒有
幾天
有幾天
偶爾
一半以上的天數
超過一半
幾乎每天
每天

Adult preventive health / general cabin hotwords:

身高
體重
BMI
身體質量指數
腰圍
脈搏
血壓
血糖
心跳
抽菸
吸菸
喝酒
飲酒
檳榔
運動
一百五十分鐘
兩週
咳嗽
超過二週
高血壓
糖尿病
高血脂
心臟病
腦中風
腎臟病
B 型肝炎
C 型肝炎
精神疾病
長期服藥
家族史
膽固醇
三酸甘油脂
高密度脂蛋白
低密度脂蛋白
肝功能
腎功能

Kiosk FAQ / operation hotwords:

重複題目
請再說一次
重新開始
上一題
下一題
改用觸控
用螢幕選
找工作人員
查看報告
QR code
二維碼
隱私
不想錄音

Future vision-screening hotwords:

右眼
左眼
裸眼視力
矯正視力
近視
老花
散光
色盲
色弱
看不清楚
模糊
戴眼鏡
隱形眼鏡
重新測量

Future hearing-screening hotwords:

右耳
左耳
聽得到
聽不到
聲音太小
聲音太大
背景噪音
助聽器
耳鳴
重新測量

Domain-pack implementation rules:

- Keep `phq9_zh_tw`, `hpa_adult_preventive_zh_tw`,
  `smart_cabin_measurement`, `kiosk_faq`, `vision_screening_phase2`, and
  `hearing_screening_phase2` as separate packs.
- Select packs through questionnaire code, question-name prefix, or
  `VOICE_DEFAULT_DOMAIN_PACKS`.
- Send selected pack hotwords to ASR when the provider accepts hotword hints.
- Use the same selected packs for normalization, semantic-frame extraction,
  routing, and reranker-option ranking.
- Never use a hotword alone as a committed answer.
- Never let a domain pack add answer choices outside the active SurveyJS
  question.
肌酸酐
尿酸
尿蛋白
陽性
陰性
未執行

Common symptoms and safety-sensitive terms:

胸悶
胸口悶
胸痛
心悸
喘
走路會喘
呼吸困難
頭暈
發燒
疼痛
跌倒
站不穩

Future vision/hearing hotwords:

右眼
左眼
裸眼視力
矯正視力
看不清楚
對比
色覺
散光
右耳
左耳
聽得到
聽不清楚
助聽器
環境噪音

Kiosk command / FAQ hotwords:

請再說一次
重複題目
我不知道
跳過
上一題
下一題
重新錄音
改用觸控
找工作人員
報告
QR code
二維碼
隱私

Support normalization categories:

traditional Chinese normalization
full-width / half-width cleanup
Mandarin filler cleanup
common ASR homophone confusion
health symptom synonym mapping
PHQ-9 answer phrase mapping
number / frequency phrase mapping
yes/no answer mapping for adult preventive health questions
measurement unit normalization
kiosk command normalization

Project-specific common ASR repairs:

胸口們 -> 胸口悶
走路會穿 -> 走路會喘
心情滴落 -> 心情低落
沒有希望 -> 絕望, only when the active question is depression screening
水不好 -> 睡不好
半數以上 -> 一半以上的天數
機天 -> 幾天
集天 -> 幾天
完全美有 -> 完全沒有
抽煙 -> 吸菸
血糖值 -> 血糖
膽固存 -> 膽固醇
右耳朵 -> 右耳
左耳朵 -> 左耳

Do not use the lexicon to invent medical conclusions. It only normalizes
plausible transcript forms into controlled candidate terms.

Example:

Input:
  "我最近胸口們然後走路會穿"

Normalized:
  "我最近胸口悶，然後走路會喘"

Extracted terms:
  ["胸口悶", "走路會喘"]

Never output:
  "疑似心臟病"

### Layer 4 - Query Rewriting / Semantic Frame

Purpose:

Do not feed raw ASR text directly into retrieval, reranker, or LLM guidance.

Create a structured semantic frame from the normalized ASR transcript.

Suggested type:

type VoiceSemanticFrame = {
  rawText: string;
  normalizedText: string;
  language: "zh-TW";
  intent:
      | "questionnaire_answer"
      | "symptom_description"
      | "measurement_value"
      | "command_or_faq"
      | "confirmation_response"
      | "unclear"
      | "other";
  symptoms: string[];
  questionnaireAnswerCandidates: Array<{
    optionId?: string;
    optionText: string;
    confidence: number;
    evidenceText: string;
  }>;
  temporalExpressions: string[];
  negations: string[];
  safetyFlags: Array<
    "self_harm" | "chest_pain" | "breathing_difficulty" | "fall_risk" | "none"
  >;
  retrievalQuery?: string;
};

Examples:

Raw ASR:
  "我最近胸口們然後走路會穿"

Semantic frame:
  symptoms = ["胸口悶", "走路會喘"]
  intent = "symptom_description"
  temporalExpressions = ["最近"]
  safetyFlags = ["chest_pain", "breathing_difficulty"]
  retrievalQuery = "症狀：胸口悶、走路會喘；時間：最近；檢索意圖：胸悶、呼吸困難、健康篩檢問卷與人工覆核流程"

For questionnaire answer mapping, derive choices from the active SurveyJS
question. Do not maintain a second hard-coded questionnaire engine.

Questionnaire answer mapping must be active-question aware:

For PHQ-9 radiogroup questions, map only to the current four SurveyJS choices:
  0 完全沒有
  1 幾天
  2 一半以上的天數
  3 幾乎每天

For adult preventive yes/no questions, map only to the current displayed
choices, such as:
  否 / 是
  沒有 / 有
  不吸菸 / 偶爾或應酬 / 一包以下 / 一包以上
  不喝酒 / 偶爾喝酒 / 經常喝酒
  不嚼檳榔 / 偶爾會嚼 / 經常嚼

For measurement questions, extract value + unit candidates only:
  身高 170 公分
  體重 68 公斤
  血壓 120 / 80
  腰圍 82 公分

The extracted measurement remains a candidate until the user or staff confirms
it. Do not derive diagnosis or risk labels from a voice-only measurement.

For kiosk FAQ and operational utterances, set intent to command_or_faq and do
not write questionnaire state.

### Layer 5 - Audio and ASR Metadata Preservation

Purpose:

Preserve enough metadata to audit and route uncertain voice input without
retaining raw audio by default.

Store metadata in existing agent turn / voice event structures where
appropriate. If the current schema does not support it, add a backward-
compatible JSONB column or equivalent migration.

Do not store raw audio unless explicitly configured. Default must remain:

VOICE_AUDIO_RETENTION=none

Suggested metadata:

type VoiceEvidenceMetadata = {
  audioId: string;
  rawAudioStored: false;
  asrProvider: string;
  asrModel: string;
  activeDomainPackIds: string[];
  hotwordsRequested: string[];
  hotwordsApplied: boolean;
  asrText: string;
  normalizedText: string;
  asrConfidence?: number;
  vadConfidence?: number;
  utteranceDurationMs: number;
  endpointingMode: "standard" | "elder";
  segmentTimestamps: Array<{
    startMs: number;
    endMs: number;
    text: string;
    avgLogprob?: number;
    noSpeechProb?: number;
  }>;
  nBestAvailable: boolean;
  nBestTranscripts: Array<{
    text: string;
    rank: number;
    confidence?: number;
  }>;
  semanticFrame: VoiceSemanticFrame;
  routingDecision: string;
  confirmationRequired: boolean;
  domainPackVersions: Record<string, string>;
};

All writes must be privacy-aware and enterprise-friendly.

### Layer 6 - Low-Confidence Confirmation and Touch Fallback

Purpose:

When confidence is low or ambiguity is high, switch from free generation to
bounded confirmation.

Required UI behavior:

If one candidate is plausible:
  "我剛剛聽到的是「胸口悶、走路會喘」，請問我有聽對嗎？"
  Buttons:
    是
    不是，重新錄音
    改用觸控選擇

If multiple candidates are plausible:
  "請問你剛剛想表達的是哪一個？"
  Buttons:
    candidate A
    candidate B
    candidate C
    都不是，改用觸控

For PHQ-9 bounded answer:
  "你剛剛的回答是不是「幾天」？"
  Buttons:
    是
    不是
    改用觸控

For adult preventive yes/no questions:
  "我剛剛聽到的是「有」，請問有聽對嗎？"
  Buttons:
    是
    不是，重新選擇
    改用觸控

For measurement questions:
  "我剛剛聽到的是「血壓 120 / 80」，請問有聽對嗎？"
  Buttons:
    正確
    重新錄音
    改用觸控或請工作人員協助

For FAQ / command utterances:
  "我可以重複題目，也可以讓你改用螢幕點選。"
  Buttons:
    重複題目
    改用觸控
    找工作人員

Never let LLM free-form generation decide questionnaire state.

## 3. Reranker Integration Goal

Add a local reranker sidecar.

Default model:

Qwen3-Reranker-0.6B

Reason:

The project needs low latency, local-first deployment, good Chinese /
multilingual capability, and a model small enough to run on RTX 4090 Laptop
16GB alongside ASR / LLM / TTS.

Do not use 4B or 8B as the MVP default.

Add 4B only as a future evaluation option:

Qwen3-Reranker-4B:
  use only for offline benchmark comparison or future higher-accuracy deployment.

Qwen3-Reranker-8B:
  not recommended for the current kiosk MVP because system bottlenecks are ASR
  reliability, confirmation flow, and latency, not reranker ceiling quality.

## 4. Reranker Service Design

Create:

apps/model-sidecars/reranker-service

Runtime:

Python
FastAPI
Uvicorn
PyTorch / Transformers or sentence-transformers compatible implementation
CUDA-first
CPU fallback disabled for live acceptance unless explicitly configured

Default port:

8014

Required endpoints:

GET /healthz
GET /status
POST /rerank
POST /rerank-options

GET /healthz returns process health:

{
  "ok": true,
  "service": "reranker-service"
}

GET /status returns provider status:

{
  "provider": "qwen3_reranker_0_6b",
  "model": "Qwen3-Reranker-0.6B",
  "mode": "live",
  "device": "cuda",
  "port": 8014
}

Allowed modes:

live
mock
unavailable

Mock may be used only in deterministic tests. Live acceptance must use live
provider if SPRINT5_REQUIRE_LIVE_PROVIDERS=true or equivalent live-provider
gate is enabled.

POST /rerank input:

{
  "query": "症狀：胸口悶、走路會喘；時間：最近",
  "documents": [
    {
      "id": "doc_001",
      "text": "胸悶與呼吸困難健康篩檢流程...",
      "metadata": {
        "source": "medical_sop",
        "lang": "zh-TW"
      }
    }
  ],
  "topK": 5,
  "instruction": "請依照台灣繁體中文健康篩檢情境，判斷文件是否能支援問卷導引或人工覆核，不要診斷。"
}

POST /rerank output:

{
  "provider": "qwen3_reranker_0_6b",
  "model": "Qwen3-Reranker-0.6B",
  "results": [
    {
      "id": "doc_001",
      "score": 0.93,
      "rank": 1,
      "metadata": {
        "source": "medical_sop",
        "lang": "zh-TW"
      }
    }
  ]
}

POST /rerank-options purpose:

Rank bounded questionnaire options or clarification options.
This must never directly write state.

POST /rerank-options input:

{
  "query": "我這幾天睡不好",
  "questionId": "phq9_q3",
  "options": [
    {
      "optionId": "0",
      "text": "完全沒有"
    },
    {
      "optionId": "1",
      "text": "幾天"
    },
    {
      "optionId": "2",
      "text": "一半以上的天數"
    },
    {
      "optionId": "3",
      "text": "幾乎每天"
    }
  ],
  "topK": 3
}

POST /rerank-options output:

{
  "candidateOptions": [
    {
      "optionId": "1",
      "text": "幾天",
      "score": 0.88,
      "rank": 1
    }
  ],
  "confirmationRequired": true
}

Important:

/rerank-options can support candidate ranking.
It must not commit answers.
The API / questionnaire layer must still require explicit confirmation before
persistence.

## 5. Environment Variables

Add or document:

RERANKER_ENABLED=true
RERANKER_PROVIDER=qwen3_reranker_0_6b
RERANKER_SERVICE_URL=http://localhost:8014
RERANKER_MODEL=Qwen3-Reranker-0.6B
RERANKER_MODEL_PATH=/models/qwen3-reranker-0.6b
RERANKER_DEVICE=cuda
RERANKER_ALLOW_CPU_FALLBACK=false
RERANKER_MAX_CANDIDATES=50
RERANKER_TOP_K=5
RERANKER_TIMEOUT_MS=3000

Voice safety variables:

VOICE_ASR_CONFIDENCE_GATE_ENABLED=true
VOICE_MIN_ASR_CONFIDENCE=0.65
VOICE_MIN_OPTION_MARGIN=0.15
VOICE_ENABLE_DOMAIN_NORMALIZATION=true
VOICE_ENABLE_SEMANTIC_FRAME=true
VOICE_ENABLE_N_BEST_INTERFACE=true
VOICE_REQUIRE_CONFIRMATION_FOR_ASR=true
VOICE_SAFETY_SENSITIVE_CONFIRMATION=true
VOICE_AUDIO_RETENTION=none
VOICE_DOMAIN_PACK_DIR=packages/voice-safety-core/domain-packs
VOICE_DEFAULT_DOMAIN_PACKS=phq9_zh_tw,smart_cabin_measurement,kiosk_faq
VOICE_ENABLE_ASR_HOTWORDS=true
VOICE_MAX_HOTWORDS_PER_REQUEST=80

## 6. TypeScript Contract Updates

Update shared contracts in:

packages/contracts

Add Zod schemas for:

VoiceDomainPack
VoiceDomainPackTerm
VoiceDomainAnswerAlias
AsrHypothesis
AsrHypothesisSet
VoiceSemanticFrame
VoiceEvidenceMetadata
VoiceRoutingDecision
RerankDocument
RerankRequest
RerankResult
RerankResponse
RerankOptionsRequest
RerankOptionsResponse
VoiceCandidateConfirmation

Ensure these contracts are used across:

apps/api-server
apps/kiosk-web
apps/voice-agent-server
apps/model-sidecars/asr-service
apps/model-sidecars/reranker-service
packages/voice-safety-core

If Python sidecars need duplicate schema definitions, keep them minimal and
aligned with the TypeScript contract names.

## 7. API Server Updates

Update the API server so voice responses flow through the new safety pipeline.

Expected high-level function:

processVoiceEvidence(input) {
  read current SurveyJS question
  resolve active domain packs from questionnaireCode/module/session context
  collect active hotwords
  read ASR transcript and metadata
  build AsrHypothesisSet
  normalize transcript with active domain packs
  build VoiceSemanticFrame
  map to bounded options
  optionally call reranker for candidate ranking
  compute routing decision
  return confirmation payload or fallback route
}

Rules:

Never persist questionnaire answers from raw ASR output.
Never persist questionnaire answers from reranker score alone.
Never let LLM override SurveyJS scoring.
Never use a domain pack to create an option outside the active SurveyJS choices.
Never let reranker failure block touch questionnaire completion.
If reranker is unavailable, degrade to deterministic mapping + confirmation or
touch fallback.

Add provider status aggregation if the project already has provider health
checks.

Expected provider statuses:

asr
tts
wakeword
llm
reranker
redpanda
postgres

## 8. Kiosk UI / XState Updates

Update the kiosk voice state machine to include safety-specific states.

Current-like states should include or map to:

idle_touch_ready
wake_armed
wake_detected
recording_answer
endpointing_wait
transcribing
normalizing_asr
building_semantic_frame
ranking_candidates
confirming_candidate
clarifying_ambiguous
committed
retry_or_touch
voice_unavailable
staff_review

UI must clearly show:

recording active
transcribing
candidate heard
confidence / uncertainty state, user-friendly wording only
confirmation buttons
retry button
touch fallback button

Do not display technical confidence values to end users unless in
developer/debug mode.

Kiosk implementation rule:

```text
Recorded voice turn:
  ASR transcript
  -> /api/v1/agent-turns/map-answer
  -> safety metadata + candidate draft
  -> confirmation UI
  -> questionnaire write only after explicit user confirmation
```

Do not keep a browser-only raw transcript mapping path for live or continuous
voice. Local deterministic mapping helpers may exist for unit tests, but the
interactive kiosk voice flow must use the API safety pipeline before creating a
draft.

For enterprise demo, use user-friendly zh-TW language:

「我剛剛聽到的是『幾天』，請問我有聽對嗎？」
「我不太確定剛剛的回答，請重新說一次，或直接用螢幕選擇。」
「這題你也可以直接點選答案。」

## 9. Voice Agent / LLM Boundary

The LLM can help phrase clarification, but it must not decide state.

Allowed:

short zh-TW prompt rephrasing
friendly questionnaire guidance
clarification wording
explain touch fallback

Forbidden:

diagnosis
treatment advice
autonomous triage
overriding SurveyJS options
creating new answer categories
committing questionnaire answer

When semantic frame has safety flags such as:

self_harm
chest_pain
breathing_difficulty
fall_risk

the system must route to explicit confirmation, staff review, or configured
safety workflow. Do not generate diagnostic claims.

## 10. Database / Persistence

Inspect the existing schema first.

If current tables already have JSONB metadata fields, reuse them.

If not, add a migration to support voice evidence metadata.

Potential migration targets:

agent_turns.provider_metadata
agent_turns.voice_evidence_metadata
audit_events.metadata
outbox_events.payload

Do not create unnecessary tables unless the existing schema cannot support the
needed audit information.

Persist:

asr_text
normalized_text
semantic_frame
routing_decision
confirmation_required
confirmed_by_user
candidate_options
provider metadata
n_best_available
n_best_transcripts if available
reranker trace if used

Do not persist:

raw audio
unbounded medical diagnosis
LLM-generated questionnaire answer outside schema

## 11. Redpanda / Outbox Events

Add or extend events for voice safety and reranker usage.

Suggested event types:

voice.asr.completed.v1
voice.normalized.v1
voice.routing_decided.v1
voice.confirmation_required.v1
voice.answer_confirmed.v1
voice.answer_rejected.v1
voice.touch_fallback_selected.v1
reranker.rerank.completed.v1
reranker.unavailable.v1

Critical rule:

If Redpanda is unavailable, the questionnaire must still complete.
The outbox row remains retryable.

## 12. Testing Requirements

Add tests at the correct levels.

Unit tests for packages/voice-safety-core:

ASR confidence routing
domain pack loading and version selection
hotword extraction from active packs
domain lexicon normalization
PHQ-9 answer phrase mapping
adult preventive yes/no and behavior answer mapping
measurement candidate extraction
semantic frame extraction
safety flag detection
low-confidence route selection
multi-candidate ambiguity route
FAQ / command routing without questionnaire write

Test examples:

"胸口們" -> "胸口悶"
"走路會穿" -> "走路會喘"
"心情滴落" -> "心情低落"
"水不好" -> "睡不好"
"幾天" -> PHQ-9 option 1
"機天" -> PHQ-9 option 1 after normalization
"超過一半" -> PHQ-9 option 2
"完全沒有" -> PHQ-9 option 0
"我不想活了" -> safety flag self_harm
"不吸菸" -> adult preventive smoking option, when that SurveyJS question is active
"偶爾喝酒" -> adult preventive drinking option, when that SurveyJS question is active
"血壓一百二十比八十" -> measurement candidate blood_pressure 120/80, confirmation required
"請再說一次" -> command_or_faq, no questionnaire write
empty transcript + high no_speech_prob -> no_speech_retry
low confidence transcript -> retry_or_touch

API tests:

ASR transcript returns candidate only, not committed answer.
Candidate confirmation writes answer.
Rejected candidate does not write answer.
Low confidence routes to retry/touch.
Reranker unavailable does not block questionnaire.
N-best unavailable still works with top-1.
Safety-sensitive ambiguity routes to confirmation/staff review.
PHQ-9 aliases cannot map to adult preventive choices unless the active question
allows them.
Domain pack updates can add aliases without changing processVoiceEvidence.

Sidecar tests for reranker service:

GET /healthz
GET /status
POST /rerank
POST /rerank-options
timeout behavior
unavailable behavior

E2E / smoke tests:

pnpm live:check
pnpm smoke:voice-safety
pnpm smoke:reranker
pnpm smoke:sprint5-live-demo

Expected live demo path:

Start kiosk
Load active PHQ-9 zh-TW questionnaire
Tap-to-start or wake word
Record answer
ASR returns transcript
Voice safety pipeline normalizes and routes
Candidate confirmation appears
User confirms
Answer persists
Report still works
Reranker status appears in live provider check
Touch questionnaire still works if reranker is unavailable

## 13. Documentation Deliverables

Create or update:

docs/voice-asr-safety-six-layer-pipeline.md
docs/reranker-qwen3-0.6b-integration.md
docs/current-system-pipeline.md, if this is the existing canonical doc

The six-layer document must include:

the six layers
why each layer exists
what is mandatory for MVP
what is capability-only for MVP
the domain pack architecture
PHQ-9, adult preventive health, measurement, vision, hearing, and FAQ pack plan
hotword behavior and provider capability fallback
how ASR errors propagate into RAG/reranker/LLM
why reranker cannot fix wrong ASR input
how confirmation prevents silent state corruption
privacy rule: no raw audio retention by default

The reranker document must include:

why Qwen3-Reranker-0.6B is default
why 4B and 8B are not MVP defaults
service API
environment variables
failure behavior
how reranker interacts with bounded questionnaire mapping
how reranker must not write state

## 14. Acceptance Criteria

Architecture / safety:

Six-layer ASR safety architecture is implemented or explicitly represented.
Layer 1, 3, 4, 5, 6 are mandatory in the MVP flow.
Layer 2 exists as capability-aware interface.
No production fake N-best transcripts.
Domain packs are versioned and loaded from data files.
PHQ-9 and smart cabin measurement hotwords are represented.
Hotwords are capability-aware; ASR hotword support is not faked.
Raw ASR text is not directly used as questionnaire truth.
Raw ASR text is not directly used as final RAG query without normalization /
semantic frame.
Low-confidence voice input routes to confirmation, retry, touch fallback, or
staff review.

Reranker:

Qwen3-Reranker-0.6B is configured as the default reranker.
Reranker service exposes /healthz, /status, /rerank, /rerank-options.
Reranker service runs on port 8014 by default.
Reranker unavailable does not block questionnaire completion.
Reranker score alone never commits questionnaire answers.

Existing system contract:

Touch questionnaire remains fully usable.
Wake word only starts recording.
ASR only creates evidence/candidates.
Confirmation is required before questionnaire write.
PostgreSQL remains the source of truth.
Redpanda remains nonblocking.
TTS failure does not block questionnaire completion.
LLM failure does not block questionnaire completion.

Tests / validation:

pnpm lint passes
pnpm typecheck passes
pnpm test passes
pnpm build passes
pnpm live:check includes reranker provider status
pnpm smoke:voice-safety passes
pnpm smoke:reranker passes
existing smoke tests still pass

If some tests fail because the current repo has pre-existing unrelated issues,
document them clearly with file paths and exact errors. Do not hide failures.

## 15. Implementation Discipline

Use small, maintainable changes.

Prefer:

shared contracts
pure deterministic core functions
clear state machine transitions
explicit provider status
feature flags
defensive fallback behavior
typed metadata
testable route decisions

Avoid:

large untyped blobs
LLM deciding state
silent fallback to mock in live acceptance
hard-coded questionnaire copies outside SurveyJS source
direct writes from ASR/reranker
raw audio retention by default
overbuilding a medical diagnosis system

## 16. Final Response Required From Codex

When done, report:

1. What files were changed.
2. What six-layer controls were implemented.
3. What was implemented for Qwen3-Reranker-0.6B.
4. What remains capability-only or future work.
5. Exact commands run.
6. Test results.
7. Any failures or risks.
8. How to run the live stack.
9. How to verify that touch fallback still works.

Be precise. Do not claim live provider success unless the live check actually
passed.
```

## Source Links

- Qwen Hugging Face model card:
  <https://huggingface.co/Qwen/Qwen3-Reranker-0.6B>
- Qwen official blog:
  <https://qwenlm.github.io/blog/qwen3-embedding/>
