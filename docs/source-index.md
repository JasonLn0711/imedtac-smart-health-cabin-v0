# Source Index

This folder preserves source and derived analysis for the 慧誠智醫（imedtac
Co., Ltd.）Smart Health Cabin collaboration project.

## Sources

| Date | Source | Why it matters |
| --- | --- | --- |
| `2026-06-17` | `source/2026-06-17-imedtac-smart-health-cabin-requirements/` | Johnny Fang's Smart Health Cabin requirements package and the `2026-06-15` requirements PDF. Defines the initial cooperation ask around vision/hearing self-measurement, questionnaire-guided triage, report, QR Code, CMS, ERD, API/JSON, and HIS-ready planning. |
| `2026-06-17` | `source/2026-06-17-smart-health-cabin-expert-tutorial-note/` | Preserved expert tutorial note for workspace setup and discovery discipline. Use selectively as internal preparation, not as external commitment. |
| `2026-06-19` | `source/2026-06-19-wu-tomi-ai-triage-smart-health-cabin-ip-sync/` | Prof. Wu / Tomi / 多寶 / Jason internal source bundle about Smart Health Cabin, AI Triage adjacency, patent/IP, measured-context workflow, and cooperation boundaries. |
| `2026-06-23 14:59` | `source/2026-06-23-imedtac-onsite-visit-smart-health-cabin/` | Corrected onsite meeting transcript. Establishes four user-facing modules: hearing, vision, questionnaire, and Avatar interaction. Keeps report/QR/HIS/API/CMS as cross-module integration layer. |
| `2026-06-23` | `source/2026-06-23-wu-line-hpa-adult-preventive-health-form/` | Prof. Wu LINE source containing the HPA adult preventive health service examination record / result form. Supports questionnaire field classification and MVP source strategy. |
| `2026-06-23` | `source/2026-06-23-expert-questionnaire-authority-note/` | Full preserved expert opinion on authoritative questionnaire sources for Smart Health Cabin: HPA adult preventive health form, WHO STEPS, NHIS, BRFSS, NHANES, PHQ, AUDIT, GPAQ/IPAQ, ICOPE, STEADI, SARC-F, My Plate, PRAPARE/AHC-HRSN, and non-diagnostic report boundaries. |
| `2026-06-23` | `source/2026-06-23-expert-mvp-questionnaire-narrowdown-note/` | Full preserved expert narrowdown for the MVP questionnaire system: anonymous public-sector self-service positioning, HPA + WHO STEPS + PHQ-2 field stack, options, disabled clinical fields, report rules, and minimum data tables. |
| `2026-06-23` | `source/2026-06-23-expert-four-module-sdd-prep-note/` | Full preserved planning direction for the four selectable modules, modular-monolith MVP architecture, module contracts, platform services, API/ERD/test/risk seeds, and SDD preparation. |
| `2026-06-25 10:44-11:06` | `source/2026-06-25-duobao-line-questionnaire-avatar-mvp/` | 多寶 / Jason LINE source that pivots Phase 1 from hearing/vision toward open questionnaire system plus ASR/LLM/TTS Avatar Agent. Includes PHQ-9 PDF and agent-readable copy for the first questionnaire seed. |
| `2026-06-29` | `source/2026-06-29-johnny-line-open-measurement-station-budget-call/` | Johnny LINE call source confirming the open measurement-station direction, quote need, uncertain budget basis, Avatar vendor-integration assumption, compact-compute question, and next hardware/scope actions. |
| `2026-06-30 23:34-2026-07-01 00:20` | `source/2026-06-30-expert-quote-method-update/transcript-corrected.md` | Corrected Prof. Wu online meeting transcript for Smart Health Cabin quotation strategy. Establishes one-station quote framing, first-build fee vs future license split, company-subject wording, TISSA person-week cost logic, Tomi review gate, staffing risk, and later ASR/Taiwanese-corpus activation path. |

## Derived Workstreams

| File | Purpose |
| --- | --- |
| `workstreams/smart-health-cabin/README.md` | Workstream overview, boundaries, source bundle, and project-separation rule. |
| `workstreams/smart-health-cabin/post-meeting-decision-log.md` | Confirmed facts, decisions, open questions, and next actions from the 2026-06-23 meeting and follow-up sources. |
| `workstreams/smart-health-cabin/hpa-adult-preventive-health-questionnaire-mvp-design-note.md` | Expert MVP note: HPA form + WHO STEPS + standardized modules, with non-diagnostic report boundaries. |
| `workstreams/smart-health-cabin/mvp-questionnaire-system-architecture.md` | Implementable MVP questionnaire architecture and field registry for anonymous public-sector self-service deployment. |
| `workstreams/smart-health-cabin/four-module-mvp-sdd-prep-spec.md` | Four-module MVP and SDD-prep specification: modular monolith, module contracts, hearing/vision/questionnaire/Avatar scope, platform services, APIs, ERD seed, test plan, and risk matrix. |
| `workstreams/smart-health-cabin/2026-06-29-johnny-call-budget-scope-note.md` | Working call note for the open measurement-station pivot, quote-scope versions, hardware guidance, and next decisions from Johnny's 2026-06-29 LINE call. |
| `workstreams/smart-health-cabin/2026-06-29-prof-wu-internal-quote-scenarios.md` | Internal quote-scenario note for Prof. Wu: public hardware-price verification boundary, total-budget reverse calculation, three-tier NYCU module quote, and external-quote assumptions. |
| `workstreams/smart-health-cabin/2026-07-01-prof-wu-quote-meeting-deep-analysis.md` | Deep analysis of the Prof. Wu quotation meeting: accepted decisions, quote architecture, Tomi alignment brief, first-build vs future license split, staffing risks, company strategy, and immediate action plan. |
| `docs/specs/MVP-SYSTEM-SPEC.md` | Full-system MVP reference spec covering monorepo strategy, module registry, module specs, PostgreSQL, Redpanda, API, deployment, versioning, testing, and acceptance gates. |
| `docs/specs/MVP-FAST-MARCH-SPRINT-PLAN.md` | Superseded fast-march Sprint 0-4 schedule for the earlier four-module path. |
| `docs/specs/MVP-QUESTIONNAIRE-AVATAR-SPRINT-PLAN.md` | Active revised sprint plan for open questionnaire system plus ASR/LLM/TTS Avatar Agent, with vision/hearing deferred to Phase 2. |
| `docs/specs/VOICE-ENTRY-TECH-SELECTION-SDD-DRAFT.md` | Draft voice-entry technology selection note for recording gates, VAD, endpointing, ASR confidence routing, confirmation policy, and enterprise deployment controls. |
| `docs/prompts/sprint-0-codex-goal-prompt.md` | Codex execution prompt for updated Sprint 0: monorepo skeleton, module registry, API skeleton, DB migration skeleton, PHQ-9 seed path, local dev docs, CI skeleton, and closeout devlog. |
| `docs/prompts/sprint-1-codex-goal-prompt.md` | Codex execution prompt for updated Sprint 1: PHQ-9 SurveyJS render, answer persistence, backend scoring, item-9 safety flag, non-diagnostic public summary, and validation evidence. |
| `docs/prompts/sprint-2-codex-goal-prompt.md` | Codex execution prompt for updated Sprint 2: questionnaire CMS, version publish, report section, public token / QR route, admin response list, audit trail, and Sprint 0/1 baseline protection. |
| `docs/prompts/sprint-3-codex-goal-prompt.md` | Codex execution prompt for updated Sprint 3: ASR / LLM / TTS voice Agent MVP, agent session/turn logs, PHQ-9 question and option reading from SurveyJS, answer confirmation, safety boundary, and touch fallback. |
| `docs/prompts/sprint-4-codex-goal-prompt.md` | Codex execution prompt for updated Sprint 4: Avatar UI states, voice-confirmed PHQ-9 answers, public report / QR continuity, outbox events, Redpanda publishing, failure isolation, and E2E demo evidence. |
| `docs/prompts/sprint-4.5-codex-goal-prompt.md` | Codex execution prompt for Sprint 4.5 technical selection freeze: faster-whisper Breeze-ASR-26, local Gemma via vLLM, BreezyVoice default voice, static image Avatar, xstate, provider status, mock/live fallback, and local-first model sidecars. |
| `docs/prompts/sprint-5-codex-goal-prompt.md` | Codex execution prompt for Sprint 5 live acceptance hardening: all Phase 1 services must run live for acceptance, mock is limited to tests/fallback, provider status must expose acceptance eligibility, and five-run E2E evidence is required. |
| `docs/prompts/sprint-6-last-sprint-codex-goal-prompt.md` | Codex execution prompt for the last Phase 1 closeout sprint: freeze evidence, complete stakeholder handoff, preserve safety proof, and prepare Phase 2 entry without adding features. |
| `docs/prompts/phase-2-next-phase-codex-goal-prompt.md` | Codex execution prompt for the next activation phase after Phase 1: provider validation first, then questionnaire expansion, vision/hearing activation, and integration governance. |
| `docs/prompts/voice-asr-safety-qwen3-reranker-codex-goal-prompt.md` | Codex execution prompt for the six-layer ASR safety pipeline, versioned voice domain packs, hotword-capability routing, Qwen3-Reranker-0.6B integration, high-confidence auto-fill, and bounded retry/touch/staff-review fallback. |
| `docs/prompts/breezyvoice-streaming-2x2-factorial-experiment-codex-goal-prompt.md` | Codex execution prompt for the extensible BreezyVoice 2x2 streaming experiment: original, segment streaming, token/audio streaming, and hybrid modes with timestamped logs, hardware evidence, Taiwan zh-TW corpus design, and final decision gates. |
| `docs/prompts/breezyvoice-streaming-2x2-live-all-variant-experiment-codex-goal-prompt.md` | Codex execution prompt for the live all-variant BreezyVoice run: A/B live synthesis, C/D true token/audio streaming investigation, source-level blocker completion path, and final default-mode decision. |
| `docs/prompts/breezyvoice-unblock-cd-true-streaming-runtime-codex-goal-prompt.md` | Codex execution prompt for the runtime unblock sprint: port or implement true C/D token/audio streaming first, prove it with `streaming_runtime_probe.py`, and run ABCD only after C/D validity passes. |
| `docs/prompts/breezyvoice-batch-tts-2x2-batch-size-2-3-codex-goal-prompt.md` | Codex execution prompt for extending the BreezyVoice streaming matrix with batch TTS groups 5-8 at batch size 2 and groups 9-12 at batch size 3, including batch fairness, queue wait, throughput, and C/D streaming dependency gates. |
| `docs/prompts/breezyvoice-true-parallel-segment-batch-runtime-codex-goal-prompt.md` | Codex execution prompt for replacing batch harness-only work with true parallel segment runtime: prove `true_model_batch` or `true_parallel_workers` with a runtime probe before running batch2/batch3 live experiments. |
| `docs/prompts/voice-first-cosyvoice3-streaming-tts-codex-goal-prompt.md` | Codex execution prompt for moving the product mainline to voice-first questionnaire conversation with CosyVoice3 streaming TTS, while preserving BreezyVoice fallback/research and touch/staff recovery paths. |
| `docs/decisions/2026-06-26-product-path-after-tts-matrix.md` | Superseded product-path decision after the first expert review of the voice-loop, TTS, PD hybrid, and ASR evidence. Preserved for decision history. |
| `docs/decisions/2026-06-26-voice-first-cosyvoice3-product-path.md` | Current accepted product-path decision: `VOICE_CONVERSATION_PRIMARY`, CosyVoice3 streaming as production TTS candidate, BreezyVoice as fallback/research/baseline, deterministic answer mapping, and touch/staff recovery retained. |
| `apps/kiosk-web/src/features/avatar/StreamingAudioPlayer.ts` | Kiosk playback adapter for completed WAV fallback and CosyVoice WebSocket PCM16 chunk playback. Uses native Web Audio; AudioWorklet is deferred until measured jitter requires it. |
| `apps/kiosk-web/src/features/avatar/VoiceConversationController.ts` | Voice-first questionnaire command helper for retry, touch fallback, staff assist, and answer utterance routing. |
| `apps/model-sidecars/cosyvoice-service/` | CosyVoice3 streaming sidecar boundary for `/healthz`, `/readyz`, `/v1/audio/speech`, `WS /v1/audio/stream`, Taiwan healthcare normalization, and prompt profile handling. It reports unavailable until a real CosyVoice3 backend is configured. |
| `apps/model-sidecars/cosyvoice-service/test_streaming.py` | Stdlib smoke checks for sidecar WebSocket event metadata and PCM16 chunk-duration calculation. |
| `scripts/smoke-cosyvoice3.mjs` | Live-readiness smoke for the CosyVoice3 sidecar; requires `/readyz` and streaming readiness, so unavailable backends fail honestly. |
| `scripts/smoke-voice-conversation-live.mjs` | Voice-first API smoke that checks provider status and the `/api/v1/agent-turns/tts/stream` descriptor. |
| `scripts/tts-benchmark/run_tts_provider_matrix.py` | Provider matrix runner for BreezyVoice, CosyVoice2, and CosyVoice3 variants using `experiments/manifests/tts_provider_eval_manifest.jsonl`. |
| `scripts/voice-room/run_voice_first_phq9_room_test.py` | Manual room-test template generator and filled-CSV validator for voice-first PHQ-9 field acceptance gates. |
| `scripts/tts-benchmark/` | Stdlib BreezyVoice 2x2 benchmark utilities: manifest generation, deterministic/live A/B runner, environment capture, analysis reports, hard-gate table, weighted score, and evidence-log generation. |
| `experiments/manifests/tts_eval_manifest.jsonl` | Versioned synthetic TTS evaluation manifest for PHQ-9, Smart Cabin measurement, kiosk FAQ, and Taiwan zh-TW stress samples. |
| `experiments/manifests/tts_provider_eval_manifest.jsonl` | Synthetic non-PHI provider benchmark manifest for CosyVoice3 streaming candidate, BreezyVoice fallback, Taiwan healthcare terms, answer acknowledgements, and recovery prompts. |
| `experiments/manifests/parallel_segment_tts_eval_manifest.jsonl` | Synthetic non-PHI manifest for true parallel segment batch TTS, covering 2-sentence, 3-sentence, no-punctuation, punctuation-heavy, numeric, code-switching, Taiwan Mandarin, and polyphone-sensitive samples. |
| `experiments/manifests/dialogue_manifest.jsonl` | Controlled dialogue manifest for future Avatar scheduling and dialogue-fluency comparison. |
| `experiments/manifests/human_eval_manifest.jsonl` | Blind-packet manifest for future internal listener evaluation. |
| `docs/voice-asr-safety-six-layer-pipeline.md` | Implemented six-layer ASR safety reference: confidence routing, N-best capability contract, domain-pack normalization, semantic frames, evidence metadata, high-confidence auto-fill, and touch fallback. |
| `docs/reranker-qwen3-0.6b-integration.md` | Local Qwen3-Reranker-0.6B sidecar reference, endpoints, env vars, failure behavior, and bounded option-ranking scope. |
| `packages/voice-safety-core/` | Deterministic ASR safety core with versioned domain packs for PHQ-9, HPA adult preventive health, Smart Cabin measurements, kiosk FAQ, phase-2 vision/hearing vocabulary, hotwords, normalization, semantic frames, and routing decisions. |
| `packages/voice-safety-core/domain-packs/README.md` | Domain-pack extension contract for adding future questionnaire, measurement, vision, hearing, or kiosk FAQ vocabulary without rewriting the six-layer safety pipeline. |
| `apps/model-sidecars/reranker-service/` | FastAPI reranker boundary on port `8014` exposing `/healthz`, `/status`, `/rerank`, and `/rerank-options` for Qwen3-Reranker-0.6B-compatible ranking. |
| `docs/handoff/sprint-4.5-model-selection.md` | Sprint 4.5 handoff for frozen provider choices, provider modes, default-voice boundary, static Avatar, sidecar paths, and deferred animation/custom-voice scope. |
| `docs/handoff/sprint-0-4-to-sprint-5-plus-handoff.md` | Sprint 0-4.5 capability map and revised Sprint 5+ continuation guide: provider-mode entry gate, static Avatar scope, repeatable demo hardening, Phase 1 exit definition, and post-Sprint 5 activation lanes. |
| `docs/handoff/sprint-5-to-last-sprint-next-phase-handoff.md` | Sprint 5 to final closeout handoff: Phase 1 evidence-freeze work order, Phase 1 exit claim, and Phase 2 entry gate. |
| `docs/phase2/activation-roadmap.md` | Phase 2 activation roadmap for provider validation, questionnaire expansion, vision/hearing activation, and integration/governance sequencing. |
| `docs/phase2/ACTIVATION_PLAN.md` | Phase 2 activation gates after Sprint 5: provider validation, questionnaire expansion, vision/hearing activation, and integration governance. |
| `docs/ops/LIVE_PROVIDER_RUNBOOK.md` | Sprint 5 live-provider startup and checks for Breeze-ASR-26 int8, Gemma 4 E4B, BreezyVoice default voice, Redpanda, and provider status. |
| `docs/ops/ROLLBACK_AND_FALLBACK.md` | Runtime fallback and rollback controls that preserve questionnaire/report/outbox continuity without counting mock behavior as Sprint 5 acceptance. |
| `docs/api/API_SUMMARY.md` | API endpoint summary for questionnaire, report, admin CMS, voice-agent turns, and provider status. |
| `docs/db/ERD_SUMMARY.md` | PostgreSQL entity relationship summary for questionnaire versions, responses, reports, agent turns, and outbox events. |
| `docs/evidence/sprint-5-five-run-demo.md` | Sprint 5 five-run evidence file with current provider smoke and remaining strict live acceptance gates. |
| `docs/evidence/2026-06-25-llm-thinking-mode-provider-log.md` | LLM provider experiment log showing why OpenAI-compatible Gemma returned empty visible guidance content and why native Ollama with `think:false` is the current LLM path. |
| `docs/evidence/2026-06-25-llm-one-to-five-guidance-experiment-log.md` | LLM questionnaire-guidance experiment log proving the move from one sentence to 1-5 sentences, selecting the staff-first prompt, and keeping `LLM_MAX_TOKENS=80` as the operating default. |
| `docs/evidence/2026-06-25-llm-temperature-sweep-experiment-log.md` | LLM temperature sweep summary for `0.0` through `0.7`, selecting `LLM_TEMPERATURE=0.3` as the flexible questionnaire-guidance default while keeping `0` as the stability baseline. |
| `docs/evidence/2026-06-25-wakeword-continuous-live-voice-loop-experiment-log.md` | Detailed wakeword continuous live voice loop experiment log covering workstation hardware, GPU/process inventory, provider ports/PIDs, live acceptance status, TTS-to-ASR probes, one-turn / two-turn browser validation, and the 2026-06-26 voice-answer auto-fill without confirmation check. |
| `docs/evidence/2026-06-26-breezyvoice-streaming-2x2-experiment-log.md` | BreezyVoice 2x2 streaming experiment smoke evidence covering A original, B segment, capability-disabled C token / D hybrid flags, manifest counts, environment snapshot, hard gates, weighted score, and next live A/B validation gate. |
| `docs/evidence/2026-06-26-breezyvoice-streaming-2x2-live-experiment-log.md` | Live BreezyVoice 2x2 pilot evidence: A original and B segment produced live audio, C token and D hybrid are source-blocked with exact BreezyVoice/CosyVoice file-function evidence, and no variant qualifies as a new production default under the TTFA hard gate. |
| `docs/evidence/2026-06-26-breezyvoice-true-streaming-runtime-unblock-log.md` | Runtime unblock and minimum live matrix evidence showing strict BreezyVoice C/D now emit real speech-token and PCM chunk events through a conservative prefix/window streaming adapter, with `strict_breezyvoice_streaming_runtime_probe_v2`, `strict_breezyvoice_abcd_matrix_pilot_v2`, and `strict_breezyvoice_abcd_matrix_minimum` results. |
| `docs/evidence/2026-06-26-breezyvoice-batch-tts-2x2-experiment-log.md` | Batch TTS 2x2 evidence for groups 5-12: batch-size 2 and 3 harness pilots, `serial_fallback` runtime-mode blocker, batch/per-item timing fields, C/D batch dependency status, and next runner/probe wiring for the experimental true-parallel batch endpoint. |
| `docs/evidence/2026-06-26-breezyvoice-true-parallel-segment-batch-experiment-log.md` | True parallel segment and PD hybrid batch runtime evidence: live concurrent segment dispatch, strict BreezyVoice `D_hybrid` token/audio streaming inside parallel segment workers, per-segment WAV files, ordered reconstruction, runtime validity, latency, and final batch status. |
| `docs/evidence/2026-06-26-expert-review-product-path-analysis.md` | First complete expert review log for the current Smart Health Cabin work stage; superseded as product default by the later voice-first/CosyVoice3 expert update. |
| `docs/evidence/2026-06-26-expert-review-voice-first-cosyvoice3-update.md` | Latest complete expert review update adopting the voice-first questionnaire product mainline, CosyVoice3 real-time streaming TTS candidate, BreezyVoice fallback/research role, physical-room acceptance, ASR confusion testing, and human TTS review. |
| `docs/evidence/cosyvoice3-streaming-provider-validation.md` | CosyVoice3 provider validation evidence scaffold: implemented boundaries, live validation gates, known backend blocker, commands, and provider recommendation. |
| `docs/evidence/voice-first-room-acceptance-plan.md` | Physical-room voice-first PHQ-9 acceptance protocol covering real wakeword, microphone, spoken answers, recovery commands, item 9, required fields, and hard gates. |
| `docs/evidence/EVIDENCE_CHRONOLOGY.md` | Evidence chronology and interpretation policy separating actual experiment logs from planning/reference/future-dated docs, with required fields for future evidence. |
| `docs/evidence/2026-06-25-voice-safety-reranker-current-code-live-acceptance-log.md` | Current-code live acceptance evidence for the six-layer voice-safety / reranker path, including per-experiment date/time, hardware and GPU inventory, provider status, wakeword status, reranker status, and five-run Sprint 5 demo output. |
| `docs/evidence/raw/2026-06-25-llm-temperature-sweep-0.0-0.7.json` | Complete raw temperature-sweep artifact with 120 run-level rows, environment metadata, summaries, and full generated outputs. |
| `docs/devlog/README.md` | Daily sprint closeout convention for actual implementation results, validation evidence, blockers, and next handoff. |
| `docs/devlog/2026-06-25.md` | Pivot/source devlog for the questionnaire + Avatar MVP route, PHQ-9 seed, and planning-repo coordination. |
| `apps/model-sidecars/wakeword-service/README.md` | Sprint 5.6 wake word activation gate sidecar: sherpa-onnx KWS Zipformer zh-en 3M provider for `你好小慧`, status/event API, and test-only simulation route. |
| `apps/model-sidecars/wakeword-service/app.py` | FastAPI implementation for `/healthz`, `/status`, `/simulate-wake`, `WS /events`, and local live microphone readiness; wake word is activation-only and never writes questionnaire answers. |
| `docs/prompts/wakeword-sherpa-onnx-kws-goal-prompt.md` | Executable Codex goal prompt for installing the sherpa-onnx KWS Zipformer zh-en 3M model, generating the `你好小慧` keyword file, and running live wakeword acceptance. |
| `apps/kiosk-web/src/features/questionnaire/SurveyJsQuestionnaireRenderer.tsx` | Kiosk SurveyJS adapter for one-question-per-page rendering and Avatar/question layout shell. |
| `apps/kiosk-web/src/features/avatar/voiceQuestionnaireController.ts` | SurveyJS voice-answer helper that applies high-confidence API-mapped candidates to the currently visible question; live voice mapping routes through the API safety pipeline first. |
| `apps/kiosk-web/src/styles/app.css` | Kiosk layout rules for replaceable Avatar rail, active-question stage, desktop 1:2 columns, and mobile stacked fallback. |
| `docs/devlog/2026-06-26.md` | Sprint 0 D2 closeout for monorepo, app/API/storage skeleton, local dev, CI, and validation evidence. |
| `docs/devlog/2026-06-29.md` | Sprint 1 D1 closeout for PHQ-9 SurveyJS kiosk render and browser fill/submit evidence. |
| `docs/devlog/2026-06-30.md` | Sprint 1 D2 closeout for PostgreSQL persistence, backend scoring, item-9 safety flag, and public summary. |
| `docs/devlog/2026-07-01.md` | Sprint 2 D1 closeout for admin CMS, SurveyJS validation/preview, active publish, and audit. |
| `docs/devlog/2026-07-02.md` | Sprint 2 D2 closeout for report section, public token / QR URL, admin response list, and public report filtering. |
| `docs/devlog/2026-07-03.md` | Sprint 3 D1 closeout for mock ASR/respond/TTS endpoints, agent session, and turn logging. |
| `docs/devlog/2026-07-06.md` | Sprint 3 D2 closeout for SurveyJS-derived voice mapping, confirmation boundary, and touch fallback. |
| `docs/devlog/2026-07-07.md` | Sprint 4 D1 closeout for Avatar state UI and 3 voice-confirmed PHQ-9 answers. |
| `docs/devlog/2026-07-08.md` | Sprint 4 D2 closeout for outbox-worker, Redpanda topics, published events, and failure isolation. |
| `docs/devlog/2026-07-09.md` | Sprint 4.5 closeout for provider selection, status route, Zod contracts, static Avatar path, MediaRecorder capture, sidecar scaffolds, and fallback status. |
| `docs/devlog/2026-07-10.md` | Sprint 5 live-hardening closeout for provider acceptance status, live-check scripts, local provider smoke, strict GPU-only evidence, and native Ollama thinking-mode provider comparison. |
| `docs/dev/LOCAL_DEV.md` | Local install, PostgreSQL, API, kiosk, admin, and validation commands. |
| `workstreams/smart-health-cabin/2026-06-25-questionnaire-avatar-mvp-pivot.md` | Decision record for the Phase 1 MVP pivot based on the 2026-06-25 LINE discussion. |
| `modules/questionnaire/seed/phq9.zh-TW.surveyjs.json` | SurveyJS PHQ-9 seed used as the first questionnaire-system demo form. |
| `modules/questionnaire/scoring/phq9.public-scoring-config.json` | PHQ-9 public status and human-review scoring configuration. |
| `workstreams/smart-health-cabin/module-a-vision-hearing-discovery.md` | Vision/hearing device, calibration, and wording controls. |
| `workstreams/smart-health-cabin/module-b-questionnaire-triage-discovery.md` | Questionnaire, CMS, field classification, and source-governance design questions. |
| `workstreams/smart-health-cabin/module-c-avatar-interaction-discovery.md` | Avatar voice interaction scope and implementation gates. |
| `workstreams/smart-health-cabin/2026-06-24-open-source-module-research-plan.md` | Open-source module adaptation research plan for hearing, vision, questionnaire, Avatar, and the small shared event/report layer. |
| `workstreams/smart-health-cabin/2026-06-24-mvp-monorepo-redpanda-architecture-note.md` | Reference architecture note for MVP monorepo, modular monolith boundaries, PostgreSQL, Redpanda, event contracts, and repo-splitting gates. |
| `research-packets/2026-06-24-smart-health-cabin-module-research/README.md` | Packetized module research set with independent module packets and cross-packet relationship map. |
| `workstreams/smart-health-cabin/external-authority-verification.md` | Verification notes for standards, regulatory, measurement, interoperability, browser, and stack references. |

## Source Rules

- Treat `source/` files as copied evidence and meeting context.
- Keep raw source separate from feasibility conclusions and implementation
  scope.
- Do not treat adult preventive health forms, questionnaire sources, or expert
  notes as approval to collect real patient data or connect to production HIS.
- Use workstream notes for interpreted scope, MVP decisions, and next gates.
