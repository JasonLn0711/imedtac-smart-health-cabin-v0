---
id: smart-health-cabin-post-meeting-decision-log
title: "Smart Health Cabin Post-Meeting Decision Log"
date: 2026-06-17
topic: smart-health-cabin
type: decision-log
status: active
source:
  - ./2026-06-23-onsite-discovery-plan.md
  - ./README.md
  - ../../source/2026-06-23-imedtac-onsite-visit-smart-health-cabin/source.md
  - ../../source/2026-06-23-wu-line-hpa-adult-preventive-health-form/source.md
  - ../../source/2026-06-23-expert-mvp-questionnaire-narrowdown-note/source.md
  - ../../source/2026-06-23-expert-four-module-sdd-prep-note/source.md
  - ./hpa-adult-preventive-health-questionnaire-mvp-design-note.md
  - ./mvp-questionnaire-system-architecture.md
  - ./four-module-mvp-sdd-prep-spec.md
  - ../../source/2026-06-17-smart-health-cabin-expert-tutorial-note/source.md
  - ./external-authority-verification.md
  - ../../docs/devlog/2026-06-25.md
  - ../../source/2026-06-25-duobao-line-questionnaire-avatar-mvp/source.md
  - ./2026-06-25-questionnaire-avatar-mvp-pivot.md
  - ../../source/2026-06-29-johnny-line-open-measurement-station-budget-call/source.md
  - ./2026-06-29-johnny-call-budget-scope-note.md
  - ../../source/2026-06-30-expert-quote-method-update/transcript-corrected.md
  - ../../source/2026-07-01-tomi-line-quote-alignment-scheduling/source.md
  - ../../source/2026-07-01-expert-backend-integration-quote-revision/source.md
  - ./2026-07-01-prof-wu-quote-meeting-deep-analysis.md
  - ../../handoff/2026-06-30_smart-health-station_quote-decision-v2.md
---

# Smart Health Cabin Post-Meeting Decision Log

## Meeting Metadata

| Field | Value |
| --- | --- |
| Meeting date | `2026-06-23` |
| Location | 慧誠智醫 onsite visit |
| Attendees | TBD |
| Meeting purpose | AI Triage equipment review and Smart Health Cabin discovery |
| Source package | `source/2026-06-23-imedtac-onsite-visit-smart-health-cabin/` |
| Preserved transcript | `2026-06-23-imedtac-onsite-visit-smart-health-cabin-transcript-corrected-verified-agent-readable.md` |

## FIRST PRINCIPLE Capture Rule

This log owns the interpreted record after the `2026-06-23` visit. It should
capture what the meeting establishes, what remains open, who owns the next
answer, and which evidence path supports each decision.

Use the following split:

- confirmed equipment, workflow, browser, network, audio, camera, device, and
  reporting facts go in `Confirmed Facts`;
- explicit scope, owner, repository, schedule, or standards choices go in
  `Decisions`;
- missing clinical-content ownership, validation path, CMS scope, report / QR
  privacy, HIS-ready level, and feasibility-response assumptions go in
  `Open Questions`;
- raw screenshots, transcripts, copied external messages, or meeting exports
  stay in a dated `source/2026-06-23-.../` folder;
- planning mirrors only the locator, status, capacity boundary, and next gate.

The done condition is a source-backed post-meeting split that lets NYCU answer
which Smart Health Cabin scope should enter feasibility, quotation, prototype,
or implementation planning.

## Confirmed Facts

| Topic | Fact | Source / speaker |
| --- | --- | --- |
| Overall module split | The post-meeting software scope is four user-facing modules: hearing, vision, questionnaire, and Avatar interaction. Data integration remains a cross-module layer. | `2026-06-23` corrected transcript; user-provided meeting note |
| Four-module architecture strategy | The four user-facing modules should be selectable and independently testable, but the MVP should use a modular monolith with microservice-ready boundaries rather than four separately deployed microservices. | `four-module-mvp-sdd-prep-spec.md` |
| Hearing module | Hearing remains a self-screening / preliminary support problem because the cabin concept uses speakers rather than headphones, and left/right isolation plus cabin noise need hardware validation. | `2026-06-23` corrected transcript |
| Vision module | Vision should stay in self-screening / reference language; the meeting favored simpler first scope such as visual acuity and color vision before stronger measurement claims. | `2026-06-23` corrected transcript |
| Questionnaire module | The questionnaire module needs frontend and backend support, with backend form publishing / management. A first feasible path is fixed or limited screening forms such as dementia or depression questionnaires, mostly choice-based. | `2026-06-23` corrected transcript |
| Prof. Wu adult preventive health form source | Prof. Wu sent the Health Promotion Administration adult preventive health service examination record / result form as an agent-readable Markdown source. It includes user-facing, staff/clinician, measurement, lab, counseling, result/advice, and signature fields. | `source/2026-06-23-wu-line-hpa-adult-preventive-health-form/source.md` |
| Expert questionnaire source strategy | The expert recommendation is to avoid inventing questionnaires: use the HPA adult preventive health form as the Taiwan backbone, WHO STEPS as the international public-health backbone, and add standardized modules by age and service context. | `hpa-adult-preventive-health-questionnaire-mvp-design-note.md` |
| Narrowed MVP questionnaire architecture | The MVP questionnaire system is fixed as an anonymous or semi-anonymous public-sector self-service flow: HPA red-box fields, WHO STEPS-lite fields, PHQ-2, height, weight, waist, blood pressure, vision, and simple hearing measurement, with staff-only physical-exam and lab fields disabled. | `mvp-questionnaire-system-architecture.md` |
| Avatar interaction module | Avatar interaction is a fourth user-facing module. It can sit on top of the questionnaire flow, ask fixed questionnaire items, listen to spoken answers, and help input the answer. | `2026-06-23` corrected transcript; user-provided meeting note |
| CMS / backend | Generic self-service questionnaire CMS remains a larger scope. The near-term path should clarify whether forms are fixed, limited, or truly user-configurable before committing to CMS breadth. | `2026-06-23` corrected transcript |
| Report / QR Code | Integrated report and QR Code remain cross-module presentation needs so users can view or carry results after the session. | `2026-06-23` corrected transcript |
| HIS-ready data | HIS/API/JSON and report integration remain cross-module data questions. The transcript contains tension between self-screening report needs and whether any values enter HIS fields. | `2026-06-23` corrected transcript |
| Schedule | The meeting discussed a tight first-release path: July architecture / MVP direction, August adjustment and completion, and late-August or early-September readiness before September presentation / trial operation. | `2026-06-23` corrected transcript |
| Fast-march reference schedule | A `2026-06-24` planning exercise compresses Sprint 0-4 into a `10` working-day thin-slice MVP path from `2026-06-24` to `2026-07-07`. It is a reference plan for system-spine validation, not a full-product delivery commitment. | `docs/specs/MVP-FAST-MARCH-SPRINT-PLAN.md` |
| Daily sprint closeout route | The fast-march plan now uses `docs/devlog/YYYY-MM-DD.md` for actual sprint outcomes, validation evidence, blockers, and next handoff. Planning mirrors only status, capacity, blocker, and next gate. | `docs/devlog/2026-06-25.md` |
| 2026-06-25 MVP pivot | 多寶 and Jason aligned that Phase 1 should prioritize an open questionnaire system plus real-time voice Avatar Agent. Vision and hearing remain planned modules but move to Phase 2 after the questionnaire + Avatar path works. | `source/2026-06-25-duobao-line-questionnaire-avatar-mvp/source.md`; `2026-06-25-questionnaire-avatar-mvp-pivot.md` |
| PHQ-9 first seed | PHQ-9 is the first implemented questionnaire seed. The PDF and agent-readable copy are preserved in source and copied into `modules/questionnaire/source/`; SurveyJS and scoring seed files live under `modules/questionnaire/seed/` and `modules/questionnaire/scoring/`. | `modules/questionnaire/seed/phq9.zh-TW.surveyjs.json`; `modules/questionnaire/scoring/phq9.public-scoring-config.json` |
| 2026-06-29 open-station clarification | Johnny clarified that the hospital-side hardware direction has shifted from a closed cabin body to an open measurement station similar to the demo station. | `source/2026-06-29-johnny-line-open-measurement-station-budget-call/source.md` |
| 2026-06-29 quote need | imedtac needs NYCU's module plan and quote range to discuss the total budget with the hospital side. | `2026-06-29-johnny-call-budget-scope-note.md` |
| 2026-06-29 Avatar vendor integration | Avatar should likely integrate an existing related vendor service; NYCU's likely role is frontend/module integration and interface definition rather than building a complete Avatar product from zero. | `2026-06-29-johnny-call-budget-scope-note.md` |
| 2026-06-29 compute question | The existing measurement-station computer likely cannot support the new Avatar/AI workload; compact local compute or an alternate vendor/cloud path needs a minimum-spec decision. | `2026-06-29-johnny-call-budget-scope-note.md` |
| 2026-06-30 Prof. Wu quote meeting | The quote frame should lead with one station / one system, not the earlier two-station all-in version. First-build software/integration cost and future per-set license / maintenance / small-customization fees must be separated. | `source/2026-06-30-expert-quote-method-update/transcript-corrected.md`; `2026-07-01-prof-wu-quote-meeting-deep-analysis.md` |
| Tomi review gate | Prof. Wu explicitly asks Jason to let Tomi review the money logic and talking path, including `NTD 900,000-1,100,000` first-build cost and future `NTD 150,000 / set` license hypothesis. | `source/2026-06-30-expert-quote-method-update/transcript-corrected.md` |
| Company subject | External quotation wording should not present NYCU as the delivery / bidding subject; the company subject must be confirmed before external release. | `source/2026-06-30-expert-quote-method-update/transcript-corrected.md` |
| Person-week quote basis | Quote lines should be backed by people, time, role, and a defensible `NTD 180,000 / person-month` anchor, with simple person-week equivalents. | `source/2026-06-30-expert-quote-method-update/transcript-corrected.md` |
| Quote-decision v2 | The active internal quote decision now uses one-station / one-system first-build framing, `NTD 900,000-1,100,000` software build range, later `NTD 150,000 / set` license hypothesis, and Tomi review before any external HCT reply. | `handoff/2026-06-30_smart-health-station_quote-decision-v2.md` |
| Tomi alignment scheduling | Jason asked Tomi for same-day quotation advice; Tomi accepted a late discussion path, with Jason proposing `22:00` for a fast `30` minute discussion with 多寶. | `source/2026-07-01-tomi-line-quote-alignment-scheduling/source.md` |
| Backend / frontend responsibility split | If 慧誠 owns UI/UX and frontend, 智德萬 should keep product flow, ICD, API/data contract, session state, report/QR, integration, QA, deployment, acceptance scripts, and privacy/security boundaries. | `source/2026-07-01-expert-backend-integration-quote-revision/source.md` |

## Decisions

| Decision | Owner | Date | Follow-up |
| --- | --- | --- | --- |
| Repository strategy: use `imedtac-smart-health-cabin-v0` as the standalone Smart Health Cabin workspace | Jason / NYCU | `2026-06-23` | Keep active Smart Health Cabin source and workstream material here; keep `../imedtac-ai-triage-kiosk-v0` focused on the English AI triage kiosk demo. |
| Module split: four user-facing modules are hearing, vision, questionnaire, and Avatar interaction | NYCU / imedtac | `2026-06-23` | Keep data integration as cross-module layer, not a fifth user-facing module. |
| Architecture strategy: modular monolith first, microservice-ready boundaries later | NYCU | `2026-06-23` | Use one backend, one database, one deployment path, and module packages for MVP; preserve contracts so modules can be extracted later. |
| Module contract: every user-facing module outputs `StandardModuleResult` | NYCU | `2026-06-23` | Use `four-module-mvp-sdd-prep-spec.md` as the SDD-prep source for module manifest, runtime state, result levels, and acceptance criteria. |
| Hearing and vision positioning: first-release wording should stay in self-screening / preliminary support language | NYCU / imedtac / hospital clinical owner | `2026-06-23` | Confirm exact wording with imedtac and hospital owners before external material. |
| Questionnaire first path: favor fixed or limited reviewed forms before generic CMS breadth | NYCU / imedtac | `2026-06-23` | Identify the first forms and their owner, scoring, export, and report behavior. |
| Official-form handling: classify each field before turning it into questionnaire UI or CMS schema | NYCU / imedtac / hospital clinical owner | `2026-06-23` | Use the adult preventive health form as a source example; separate user intake, staff/clinician entry, measured/lab data, counseling, result/advice, and signatures. |
| MVP questionnaire stack: HPA red-box fields + WHO STEPS core + PHQ-2 + basic measurements | NYCU | `2026-06-23` | Use `mvp-questionnaire-system-architecture.md` as the current field registry; keep output as health measurement summary and public-health risk self-assessment, not diagnosis. |
| MVP deployment boundary: no hospital system connection | NYCU | `2026-06-23` | The self-service MVP does not connect to HIS, write medical records, issue physician-signed health-check documents, or present formal diagnoses. |
| Avatar first path: pair Avatar with questionnaire interaction rather than autonomous open clinical conversation | NYCU / imedtac | `2026-06-23` | Decide fixed-script, fixed-question voice I/O, or real-time ASR/TTS scope. |
| SDD preparation path | NYCU | `2026-06-23` | Expand the SDD from module contracts, API draft, ERD seed, test cases, risk matrix, security/privacy notes, and architecture decision records. |
| Report / QR privacy model | TBD | TBD | TBD |
| Future HIS-ready level: out of MVP | TBD | later phase | Keep any custom JSON, FHIR/TW Core mapping, or live integration discussion outside the anonymous self-service MVP. |
| Standards / regulatory validation path | TBD | TBD | TBD |
| Standards scope: internal background, design controls, formal deliverables, or out of scope | TBD | TBD | TBD |
| September MVP tier: narrow anonymous self-service questionnaire + measurement report | NYCU | `2026-06-23` | Build the source-backed MVP first; move generic CMS breadth, HIS integration, and formal clinical workflows to later decisions. |
| September MVP tier: narrow, expanded, or deferred | TBD | TBD | TBD |
| Fast-march Sprint 0-4 plan as an internal reference schedule | NYCU | `2026-06-24` | Use `docs/specs/MVP-FAST-MARCH-SPRINT-PLAN.md` for thin-slice planning; confirm owners, staffing, and scope before using it as a delivery commitment. |
| Daily / weekly planning sync route | NYCU / planning repo | `2026-06-25` | Keep implementation detail in this repo; mirror W26/W27/W28 dates, capacity, validation, blocker, and next action in `../planning-everything-track`. |
| Phase 1 MVP delivery priority: questionnaire + Avatar Agent | NYCU / Jason / 多寶 | `2026-06-25` | Use `docs/specs/MVP-QUESTIONNAIRE-AVATAR-SPRINT-PLAN.md` as the active sprint plan; keep `MVP-FAST-MARCH-SPRINT-PLAN.md` as superseded historical context. |
| Vision and hearing are Phase 2 planned modules | NYCU / Jason / 多寶 | `2026-06-25` | Keep manifests as `phase_2_planned`; do not schedule their implementation before the questionnaire + Avatar path is validated. |
| Open measurement station is the current hardware presentation assumption | imedtac / hospital side | `2026-06-29` | Prepare quote and hardware assumptions around the open station while explicitly flagging that Prof. Wu may still have older cabin-form-factor information. |
| Quote should be prepared through total-budget reverse calculation | NYCU / Jason | `2026-06-29` | Treat `NTD 1,500,000` as an internal budget envelope rather than verified hardware price; show one-station/two-station remaining room, then quote NYCU software/integration separately with recommended and floor numbers. |
| Quote should now lead with one-station / one-system first-build framing | Jason / Prof. Wu | `2026-07-01` | Revise the earlier two-station framing; keep hardware provisional and separate first-build fee from later license / maintenance / small-customization economics. |
| Tomi must review the commercial talking path before external reply | Jason / Tomi | `2026-07-01` | Ask Tomi to review build cost, future license hypothesis, company subject, source-code / IP wording, and whether the cooperation should use license, maintenance, revenue share, or per-site deployment fee. |
| Tomi same-day alignment was scheduled | Jason / Tomi / 多寶 | `2026-07-01` | Use the `22:00` fast discussion to review the quotation path before any external HCT reply. |
| Future deployments should not be priced as full rebuilds by default | Jason / Prof. Wu | `2026-07-01` | Treat the first 北市聯醫 case as build-out; later sales should use license, maintenance, and bounded customization unless new modules or major integration are requested. |
| Quote-decision v2 is the active internal packet | Jason | `2026-07-01` | Use `handoff/2026-06-30_smart-health-station_quote-decision-v2.md` for Tomi / Prof. Wu review; keep the earlier two-station packet as historical context. |
| 慧誠 frontend split requires ICD first | Jason / Tomi / 慧誠 | `2026-07-01` | If 慧誠 handles UI/UX and frontend, use ICD, mock API, acceptance scripts, API freeze, and change-control gates before implementation; discuss 智德萬 backend/integration pricing around `NTD 750,000-850,000`未稅. |

## Open Questions

| Question | Owner | Needed by | Why it matters |
| --- | --- | --- | --- |
| Who is accountable for clinical content and wording sign-off? | TBD | TBD | Required before report and questionnaire guidance can be considered stable. |
| Who owns CMS build, hosting, review workflow, and maintenance? | TBD | TBD | Determines implementation scope, budget, and source-code boundary. |
| Can the cabin support credible fixed-speaker hearing screening? | TBD | TBD | Determines whether Module A can use hearing output beyond guided interaction. |
| What exact equipment/browser/network constraints apply onsite? | TBD | TBD | Determines feasible frontend, API, and deployment architecture. |
| Which questionnaire forms are first-release scope? | imedtac / hospital clinical owner | immediate | The transcript suggests dementia and depression scales as better questionnaire-shaped candidates, but the actual hospital requirement needs confirmation. |
| What is the approved public report wording and staff-review path for PHQ-9 item 9? | NYCU / hospital clinical owner | immediate | The first seed is PHQ-9; item 9 needs a clear human-review route before public demo use. |
| Which portions of the adult preventive health service form are actually patient-fillable inside a cabin? | imedtac / hospital clinical owner | immediate | The form includes clinician, lab, institution, result, and advice sections that should not be treated as ordinary patient questionnaire fields. |
| Is Avatar required for the September show path, the durable product path, or both? | imedtac / NYCU | immediate | Avatar scope drives ASR/TTS/GPU/microphone/design schedule and whether fixed-script interaction is enough. |
| Is voice input/output real-time or fixed-script for first release? | NYCU / imedtac engineering | immediate | Real-time ASR/TTS and lip-sync carry GPU, latency, microphone, and noise risks; fixed-script voice is a smaller first-release path. |
| What should the post-meeting response become? | TBD | TBD | Determines whether to write feasibility memo, proposal, quotation input, or design spec. |
| Which verified standards should appear in external material? | TBD | TBD | Determines whether FDA/IMDRF/ISO/FHIR/TW Core references remain internal background or become proposal commitments. |
| Is the hospital budget still based on the original cabin concept or the newer open measurement-station concept? | imedtac / hospital side / Prof. Wu | immediate | Determines whether the `NTD 1,200,000-1,500,000` planning range remains useful. |
| Does the Avatar vendor provide cloud service, local SDK, iframe/web component, API, or full frontend package? | imedtac / Avatar vendor / NYCU | immediate | Determines integration effort, hardware requirement, latency, and quote scope. |
| Does hardware cost sit inside NYCU's quote, imedtac's station cost, or a separate procurement line? | imedtac / NYCU / Prof. Wu | immediate | Prevents software manpower, hardware procurement, and station cost from being mixed into one unclear number. |
| What company subject should appear in the external quote? | Prof. Wu / Tomi / Jason | immediate | The transcript rejects NYCU as the delivery subject but does not finalize the external company name. |
| Is `NTD 150,000 / set` the right future license anchor, or should the model use revenue share, maintenance retainer, or per-site deployment fee? | Tomi / Prof. Wu / Jason | immediate | Determines whether the first-build cost can become a repeatable cooperation model with 慧誠智醫. |
| Who can support validation and implementation if the quote becomes a live delivery project? | Prof. Wu / Jason | immediate | Codex acceleration does not replace human validation, device checks, and acceptance support before September. |

## Implementation Decision

| Criterion | Met? | Evidence |
| --- | --- | --- |
| Standalone workspace needed | yes | User correction on `2026-06-23`: Smart Health Cabin is another cooperation project and should be separated from kiosk v0. |
| Formal feasibility response requested | TBD | TBD |
| Quotation or schedule requested | TBD | TBD |
| Implementation or prototype requested | TBD | TBD |
| Source-code delivery requested | TBD | TBD |
| Hospital-facing material requested | TBD | TBD |

Decision:

```text
Use this workspace as the Smart Health Cabin project home. Decide later whether
the scope enters formal feasibility, quotation, prototype, or implementation.
```

## Next Action

| Action | Owner | Due |
| --- | --- | --- |
| Prepare a four-module feasibility recap: hearing, vision, questionnaire, Avatar, plus cross-module report / QR / HIS/API/CMS layer | NYCU | TBD |
| Map the adult preventive health service form into field classes before using it as questionnaire or report scope | NYCU | TBD |
| Build the MVP questionnaire source registry: HPA red-box fields, WHO STEPS core, PHQ-2, and basic measurement output rules | NYCU | TBD |
| Confirm first-release questionnaire forms and scoring/report ownership | imedtac / hospital owner | TBD |
| Confirm SurveyJS Form Library package location and implementation route | NYCU engineering | `2026-06-26` |
| Replace old Sprint 0-4 planning mirrors with the questionnaire + Avatar MVP plan | NYCU / planning repo | `2026-06-25` |
| Confirm whether Avatar uses fixed-script voice interaction or real-time ASR/TTS in first release | NYCU / imedtac | TBD |
| Turn `four-module-mvp-sdd-prep-spec.md` into an SDD draft once implementation scope is approved | NYCU | TBD |
| Close Sprint 0 with questionnaire skeleton, PHQ-9 seed, module registry, and migration plan before marking implementation complete | NYCU engineering | `2026-06-26` |
| Send Johnny candidate compact-computer models or a minimum hardware specification. | Jason / NYCU | immediate |
| Prepare a total-budget reverse-calculation quote note for Prof. Wu, then convert it into an external one-page quote only after Johnny confirms hardware and Avatar vendor assumptions. | Jason / NYCU | immediate |
| Revise the quote package around one station / one system, first-build fee, and future license economics. | Jason | immediate |
| Send Tomi the commercial review ask and make the `2026-07-01` end-of-day HCT urgency explicit. | Jason | immediate |
| Hold the `2026-07-01 22:00` Tomi / 多寶 fast alignment and record the review result after the discussion. | Jason / Tomi / 多寶 | same day |
| Convert v2 into an external one-page HCT reply after Tomi / Prof. Wu confirm company subject, build/license pricing, and IP wording. | Jason | after Tomi review |
| If 慧誠 confirms frontend ownership, convert the v2 packet into an ICD-first backend/system-integration quote instead of a full frontend + backend build quote. | Jason / Tomi | after Tomi review |
