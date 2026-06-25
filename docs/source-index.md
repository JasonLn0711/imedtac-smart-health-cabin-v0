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
| `2026-06-25 10:44-11:06` | `source/2026-06-25-duobao-line-questionnaire-avatar-mvp/` | 多寶 / Jason LINE source that pivots Phase 1 from hearing/vision toward open questionnaire system plus ASR/LLM/TTS Avatar Agent. Includes PHQ-9 PDF and agent-readable copy for the first questionnaire seed. |

## Derived Workstreams

| File | Purpose |
| --- | --- |
| `workstreams/smart-health-cabin/README.md` | Workstream overview, boundaries, source bundle, and project-separation rule. |
| `workstreams/smart-health-cabin/post-meeting-decision-log.md` | Confirmed facts, decisions, open questions, and next actions from the 2026-06-23 meeting and follow-up sources. |
| `workstreams/smart-health-cabin/hpa-adult-preventive-health-questionnaire-mvp-design-note.md` | Expert MVP note: HPA form + WHO STEPS + standardized modules, with non-diagnostic report boundaries. |
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
| `docs/prompts/voice-asr-safety-qwen3-reranker-codex-goal-prompt.md` | Codex execution prompt for the six-layer ASR safety pipeline, versioned voice domain packs, hotword-capability routing, Qwen3-Reranker-0.6B integration, and confirmation-gated questionnaire/RAG protection. |
| `docs/voice-asr-safety-six-layer-pipeline.md` | Implemented six-layer ASR safety reference: confidence routing, N-best capability contract, domain-pack normalization, semantic frames, evidence metadata, confirmation, and touch fallback. |
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
| `docs/evidence/2026-06-25-wakeword-continuous-live-voice-loop-experiment-log.md` | Detailed wakeword continuous live voice loop experiment log covering workstation hardware, GPU/process inventory, provider ports/PIDs, live acceptance status, TTS-to-ASR probes, and one-turn plus two-turn browser validation. |
| `docs/evidence/2026-06-25-voice-safety-reranker-current-code-live-acceptance-log.md` | Current-code live acceptance evidence for the six-layer voice-safety / reranker path, including per-experiment date/time, hardware and GPU inventory, provider status, wakeword status, reranker status, and five-run Sprint 5 demo output. |
| `docs/evidence/raw/2026-06-25-llm-temperature-sweep-0.0-0.7.json` | Complete raw temperature-sweep artifact with 120 run-level rows, environment metadata, summaries, and full generated outputs. |
| `docs/devlog/README.md` | Daily sprint closeout convention for actual implementation results, validation evidence, blockers, and next handoff. |
| `docs/devlog/2026-06-25.md` | Pivot/source devlog for the questionnaire + Avatar MVP route, PHQ-9 seed, and planning-repo coordination. |
| `apps/model-sidecars/wakeword-service/README.md` | Sprint 5.6 wake word activation gate sidecar: sherpa-onnx KWS Zipformer zh-en 3M provider for `你好小慧`, status/event API, and test-only simulation route. |
| `apps/model-sidecars/wakeword-service/app.py` | FastAPI implementation for `/healthz`, `/status`, `/simulate-wake`, `WS /events`, and local live microphone readiness; wake word is activation-only and never writes questionnaire answers. |
| `docs/prompts/wakeword-sherpa-onnx-kws-goal-prompt.md` | Executable Codex goal prompt for installing the sherpa-onnx KWS Zipformer zh-en 3M model, generating the `你好小慧` keyword file, and running live wakeword acceptance. |
| `apps/kiosk-web/src/features/questionnaire/SurveyJsQuestionnaireRenderer.tsx` | Kiosk SurveyJS adapter for one-question-per-page rendering and Avatar/question layout shell. |
| `apps/kiosk-web/src/features/avatar/voiceQuestionnaireController.ts` | SurveyJS confirmation helper for applying already-confirmed voice candidates to the currently visible question; live voice mapping routes through the API safety pipeline first. |
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
