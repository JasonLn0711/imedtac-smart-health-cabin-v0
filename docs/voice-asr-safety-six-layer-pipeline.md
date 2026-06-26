# Voice ASR Safety Six-Layer Pipeline

Smart Health Cabin treats ASR text as evidence that moves through routing.
The voice path now has an implementation boundary in `packages/voice-safety-core`
that routes each transcript through normalization, semantic framing, and a
clear user or staff confirmation layer before questionnaire state or RAG context
is used.

## Six Layers

1. ASR confidence routing: uncertain, empty, or safety-sensitive speech routes
   to 重新錄音, confirmation, 觸控完成, or staff review.
2. N-best / beam capability interface: the contract supports provider N-best,
   and top-1 providers report `nBestAvailable=false` so capability stays
   explicit.
3. Domain lexicon normalization: versioned domain packs repair known zh-TW ASR
   confusions such as `機天 -> 幾天` and `心情滴落 -> 心情低落`.
4. Semantic frame: normalized transcript becomes intent, answer candidates,
   symptoms, temporal expressions, safety flags, and optional retrieval query.
5. Evidence metadata: ASR text, normalized text, domain pack versions,
   hotword capability, N-best capability, semantic frame, and routing decision
   are kept as metadata with metadata-first audio retention.
6. Auto-fill / touch completion: high-confidence single candidates can be
   written directly to the active SurveyJS question. Uncertain, ambiguous, or
   safety-sensitive speech routes to retry, touch completion, or staff review.
   Reranker output stays candidate-ranking evidence.

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

Hotwords support recognition and normalization. The write path uses an active
SurveyJS option, a mapped candidate, and user confirmation.

## Extension Workflow

When adding a new domain questionnaire or Q&A surface:

1. Add or update the canonical source file in `source/`, `modules/`, or `docs/`.
2. Add a domain pack JSON under `packages/voice-safety-core/domain-packs/`.
3. Add the pack to `domain-pack-loader.ts`.
4. Map the questionnaire code or question-name prefix in
   `domainPackIdsForContext`.
5. Add unit tests for hotwords, ASR repairs, bounded answer aliases, semantic
   slots, safety flags, and low-confidence routing.
6. Confirm kiosk UI receives a candidate draft and writes after explicit user
   confirmation.

This keeps the six-layer safety pipeline stable while allowing each future
questionnaire, measurement module, or kiosk FAQ domain to carry its own
vocabulary and confirmation language.

## MVP Rules

- ASR text is evidence that moves through routing.
- Domain packs map to active SurveyJS choices.
- High-confidence single-candidate ASR can auto-fill the active SurveyJS
  question and continue to the next TTS prompt.
- Uncertain ASR routes to 重新錄音, 觸控完成, or staff review.
- Safety-sensitive speech routes to staff review.
- Touch questionnaire remains a complete path across ASR, LLM, TTS, reranker,
  and Redpanda service states.

## Operational Events

The voice-safety path now emits retryable outbox evidence for the same
confirmation-controlled workflow:

- `voice.asr.completed.v1` records completed ASR turns.
- `voice.routing_decided.v1` records deterministic routing when the reranker is
  not part of the turn.
- `voice.confirmation_required.v1` records turns that need explicit user or
  staff confirmation before questionnaire state is written.
- `reranker.rerank.completed.v1` records bounded option-ranking evidence.
- `reranker.unavailable.v1` records the deterministic fallback path when the
  reranker boundary is unavailable.

These events publish to `shc.voice.safety.v1` and `shc.reranker.events.v1`
through the Redpanda outbox worker. The questionnaire write remains governed by
the active SurveyJS option, mapped candidate, and confirmation layer.
