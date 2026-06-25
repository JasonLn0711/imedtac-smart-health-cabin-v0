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
| `docs/prompts/sprint-0-codex-goal-prompt.md` | Codex execution prompt for updated Sprint 0: monorepo skeleton, module registry, API skeleton, DB migration skeleton, PHQ-9 seed path, local dev docs, CI skeleton, and closeout devlog. |
| `docs/prompts/sprint-1-codex-goal-prompt.md` | Codex execution prompt for updated Sprint 1: PHQ-9 SurveyJS render, answer persistence, backend scoring, item-9 safety flag, non-diagnostic public summary, and validation evidence. |
| `docs/prompts/sprint-2-codex-goal-prompt.md` | Codex execution prompt for updated Sprint 2: questionnaire CMS, version publish, report section, public token / QR route, admin response list, audit trail, and Sprint 0/1 baseline protection. |
| `docs/prompts/sprint-3-codex-goal-prompt.md` | Codex execution prompt for updated Sprint 3: ASR / LLM / TTS voice Agent MVP, agent session/turn logs, PHQ-9 question and option reading from SurveyJS, answer confirmation, safety boundary, and touch fallback. |
| `docs/prompts/sprint-4-codex-goal-prompt.md` | Codex execution prompt for updated Sprint 4: Avatar UI states, voice-confirmed PHQ-9 answers, public report / QR continuity, outbox events, Redpanda publishing, failure isolation, and E2E demo evidence. |
| `docs/devlog/README.md` | Daily sprint closeout convention for actual implementation results, validation evidence, blockers, and next handoff. |
| `docs/devlog/2026-06-25.md` | Pivot/source devlog for the questionnaire + Avatar MVP route, PHQ-9 seed, and planning-repo coordination. |
| `docs/devlog/2026-06-26.md` | Sprint 0 D2 closeout for monorepo, app/API/storage skeleton, local dev, CI, and validation evidence. |
| `docs/devlog/2026-06-29.md` | Sprint 1 D1 closeout for PHQ-9 SurveyJS kiosk render and browser fill/submit evidence. |
| `docs/devlog/2026-06-30.md` | Sprint 1 D2 closeout for PostgreSQL persistence, backend scoring, item-9 safety flag, and public summary. |
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
