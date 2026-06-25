# Voice Domain Packs

Domain packs are the extension boundary for Smart Health Cabin voice safety.
They let a questionnaire or module add ASR hotwords, common recognition
repairs, bounded answer aliases, semantic slots, safety flags, retrieval
templates, and confirmation wording without changing the core six-layer
pipeline.

## Current Packs

- `phq9_zh_tw`: MVP PHQ-9 questionnaire and self-harm staff-review routing.
- `hpa_adult_preventive_zh_tw`: adult preventive health form vocabulary from
  the current source package.
- `smart_cabin_measurement`: shared measurement, report, retry, staff, and
  touch-fallback vocabulary.
- `kiosk_faq`: operational questions such as repeat, restart, report access,
  privacy preference, and touch fallback.
- `vision_screening_phase2`: future vision-screening hotwords and slot names.
- `hearing_screening_phase2`: future hearing-screening hotwords and slot names.

## Extension Contract

Add a new pack when a new questionnaire, measurement module, or FAQ domain has
its own vocabulary or bounded answer set.

Each pack should define:

- `domainId`: stable ID used by API routing and environment variables.
- `sourceFiles`: canonical repo files that justify the vocabulary.
- `hotwords`: ASR biasing hints; these never create answers by themselves.
- `canonicalTerms`: normalized terms, aliases, and common ASR errors.
- `answerAliases`: bounded option mappings for the active SurveyJS choices.
- `semanticSlots`: fields that describe what the normalized transcript means.
- `safetyRules`: terms that route to confirmation or staff review.
- `retrievalTemplates`: normalized query templates for RAG/reranker candidates.
- `confirmationTemplates`: zh-TW wording for safe confirmation/fallback.

## Operating Rules

- Do not fabricate N-best alternatives in a domain pack.
- Do not add diagnosis, treatment, or triage conclusions.
- Do not create answer aliases that are not present in the active
  questionnaire choices.
- Prefer questionnaire-specific packs over adding every term to a global list.
- Keep hotwords short and concrete: symptom, option, measurement, command, or
  report-access phrases.
- Use `VOICE_DEFAULT_DOMAIN_PACKS` only for deployment overrides; the default
  runtime should select packs from questionnaire code or question name.
