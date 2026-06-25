# Voice ASR Safety Six-Layer Pipeline

Smart Health Cabin treats ASR text as evidence, not truth. The voice path now
has an implementation boundary in `packages/voice-safety-core` that prevents a
misheard transcript from directly becoming questionnaire state or RAG context.

## Six Layers

1. ASR confidence routing: low-confidence, empty, or safety-sensitive speech
   routes to retry, confirmation, touch fallback, or staff review.
2. N-best / beam capability interface: the contract supports provider N-best,
   but top-1 providers report `nBestAvailable=false`; no fake alternatives are
   produced.
3. Domain lexicon normalization: versioned domain packs repair known zh-TW ASR
   confusions such as `機天 -> 幾天` and `心情滴落 -> 心情低落`.
4. Semantic frame: normalized transcript becomes intent, answer candidates,
   symptoms, temporal expressions, safety flags, and optional retrieval query.
5. Evidence metadata: ASR text, normalized text, domain pack versions,
   hotword capability, N-best capability, semantic frame, and routing decision
   are kept as metadata; raw audio remains off by default.
6. Confirmation / touch fallback: questionnaire writes still require explicit
   confirmation. Reranker output is never a state writer.

## Domain Packs

Domain packs live under:

```text
packages/voice-safety-core/domain-packs/
```

Current packs:

- `phq9_zh_tw`: PHQ-9 frequency options and self-harm staff-review flag.
- `hpa_adult_preventive_zh_tw`: adult preventive health behavior, disease
  history, measurement, and lab vocabulary.
- `smart_cabin_measurement`: shared measurement and kiosk command vocabulary.
- `kiosk_faq`: repeat, restart, touch fallback, report access, privacy
  preference, and staff-help commands.
- `vision_screening_phase2`: future vision-screening vocabulary for eye side,
  visual-acuity values, blurry vision, glasses, and retest commands.
- `hearing_screening_phase2`: future hearing-screening vocabulary for ear side,
  heard/not-heard answers, background noise, hearing aid, and retest commands.

The default MVP context selects PHQ-9, measurement, and kiosk FAQ packs. Adult
preventive, vision, and hearing packs are available as extension packs and can
be selected by questionnaire code, question-name prefix, or
`VOICE_DEFAULT_DOMAIN_PACKS`.

## Hotword Strategy

Hotwords are ASR biasing hints and normalization hints. They support recognition
for terms the cabin already expects, such as:

- PHQ-9 answers: `完全沒有`, `幾天`, `一半以上的天數`, `幾乎每天`.
- PHQ-9 content: `心情低落`, `睡不好`, `疲倦`, `食慾`, `不如死掉`,
  `傷害自己`.
- Adult preventive form terms: `高血壓`, `糖尿病`, `吸菸`, `喝酒`,
  `檳榔`, `咳嗽超過二週`, `血壓`, `血糖`, `膽固醇`.
- Kiosk operations: `重複題目`, `改用觸控`, `找工作人員`, `查看報告`,
  `QR code`, `不想錄音`.
- Future modules: `右眼`, `左眼`, `裸眼視力`, `矯正視力`, `右耳`,
  `左耳`, `聽得到`, `聽不到`.

Hotwords never create questionnaire answers. The write path still requires an
active SurveyJS option, a mapped candidate, and user confirmation.

## Extension Workflow

When adding a new domain questionnaire or Q&A surface:

1. Add or update the canonical source file in `source/`, `modules/`, or `docs/`.
2. Add a domain pack JSON under `packages/voice-safety-core/domain-packs/`.
3. Add the pack to `domain-pack-loader.ts`.
4. Map the questionnaire code or question-name prefix in
   `domainPackIdsForContext`.
5. Add unit tests for hotwords, ASR repairs, bounded answer aliases, semantic
   slots, safety flags, and low-confidence routing.
6. Confirm kiosk UI still receives a candidate draft only and writes only after
   explicit user confirmation.

This keeps the six-layer safety pipeline stable while allowing each future
questionnaire, measurement module, or kiosk FAQ domain to carry its own
vocabulary and confirmation language.

## MVP Rules

- Raw ASR text is never questionnaire truth.
- Domain packs cannot create answers outside the active SurveyJS choices.
- Low-confidence ASR does not retrieve, rerank, generate, or write as if it
  were reliable.
- Safety-sensitive speech routes to confirmation or staff review.
- Touch questionnaire remains complete when ASR, LLM, TTS, reranker, or
  Redpanda is unavailable.
