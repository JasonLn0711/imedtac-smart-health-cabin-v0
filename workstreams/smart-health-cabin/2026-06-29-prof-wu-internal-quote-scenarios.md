---
id: 2026-06-29-prof-wu-internal-quote-scenarios
title: "2026-06-29 Prof. Wu Internal Quote Scenarios"
date: 2026-06-29
topic: smart-health-cabin
type: internal-quote-scenarios
status: draft
source:
  - ../../source/2026-06-29-johnny-line-open-measurement-station-budget-call/source.md
  - ./2026-06-29-johnny-call-budget-scope-note.md
  - ./four-module-mvp-sdd-prep-spec.md
  - ./mvp-questionnaire-system-architecture.md
  - ./module-a-vision-hearing-discovery.md
  - ./module-b-questionnaire-triage-discovery.md
  - ./module-c-avatar-interaction-discovery.md
audience:
  - Prof. Wu internal discussion
  - NYCU quote preparation
---

# 2026-06-29 Prof. Wu Internal Quote Scenarios

## Purpose

This internal note gives Prof. Wu a quote-preparation frame for the Smart
Health Cabin cooperation before NYCU shares any formal number with
慧誠智醫（imedtac Co., Ltd.）or the hospital side.

The quoteable NYCU scope has four modules:

1. vision module;
2. hearing module;
3. questionnaire module;
4. Avatar integration module.

The working commercial structure from Johnny's `2026-06-29` call is:

```text
imedtac provides or procures the open measurement-station hardware.
NYCU quotes software development, module integration, Avatar vendor interface,
testing, acceptance support, and hardware-minimum-spec guidance.
```

## Public Price Verification Boundary

Publicly available imedtac material confirms the product category but does not
confirm a public hardware price.

| Source | Publicly confirmed | Price finding |
| --- | --- | --- |
| imedtac iMVS / iMVS-AIO public product material | iMVS / iMVS-AIO is presented as a smart vital-sign measurement station / kiosk product family. Public material describes guided self-service measurement and vital-sign data flow. | No public list price was found during the `2026-06-29` check. |
| Public product-directory and marketplace references | The product appears as an imedtac smart vital-sign station / kiosk, with quotation-style sales routing. | Public pages route users toward vendor quotation or do not provide a reliable list price. |

Quote implication:

```text
The NTD 1,500,000 figure is an internal budget envelope for scenario planning.
It is not a verified imedtac public list price.
```

Before any external quote is sent, ask Johnny for one of the following:

- imedtac's formal one-station hardware quote;
- imedtac's formal two-station hardware quote;
- a written statement that station hardware and Avatar vendor cost are outside
  NYCU's quote.

## One-Page Decision Table For Prof. Wu

This is the shortest version to discuss first.

| Scenario for teacher discussion | Total budget envelope | Assumed imedtac hardware | Remaining room for NYCU modules | Decision meaning |
| --- | ---: | ---: | ---: | --- |
| 1 station inside `NTD 1,500,000` | `1,500,000` | `1,500,000` | `0` | Four NYCU modules cannot be included in the same envelope. NYCU must be additional, hardware must be discounted/provided, or scope must be cut. |
| 2 stations inside `NTD 1,500,000` | `1,500,000` | `1,500,000` | `0` | This is even tighter for integration because two physical stations create more acceptance/support load with no software budget left. |
| Hardware outside NYCU quote | To be set by hospital/imedtac | Outside NYCU quote | Use NYCU module quote below | Cleanest structure: imedtac owns station hardware; NYCU quotes software/integration. |
| Hardware partially subsidized by imedtac | `1,500,000` target | Unknown | `1,500,000 - hardware` | Feasible only after Johnny gives the real hardware number. |

Recommended teacher-facing position:

```text
We should not quote NYCU's four modules as if they fit inside NTD 1,500,000
when imedtac station hardware may already consume that envelope. The clean
proposal is to ask imedtac to provide the station hardware separately, then
NYCU quotes the software/integration modules.
```

## NYCU Module Cost Stack

These are internal development-cost anchors, not final external quote numbers.
They include design, implementation, integration, testing, acceptance support,
and project coordination appropriate for a first working deployment.

| Module | Recommended quote | Floor quote | What the module owns |
| --- | ---: | ---: | --- |
| Vision module | `NTD 250,000` | `NTD 180,000` | Self-screening flow, display/distance assumptions, conservative result wording, professional follow-up prompt, and report integration. |
| Hearing module | `NTD 250,000` | `NTD 180,000` | Self-screening flow, environment/device warning, conservative result wording, professional follow-up prompt, and report integration. |
| Questionnaire module | `NTD 350,000` | `NTD 250,000` | Source-backed questionnaire engine, versioned form seed, answer capture, report summary, QR/public report handoff, and admin/publish boundary. |
| Avatar integration module | `NTD 350,000` | `NTD 250,000` | Existing Avatar vendor interface, kiosk frontend integration, state/data handoff, fallback handling, and flow continuity. |
| Cross-module integration, acceptance, and PM | `NTD 300,000` | `NTD 200,000` | Module registry, shared report structure, integration testing, deployment notes, acceptance scripts, and quote/scope coordination. |
| **NYCU software/integration total** | **`NTD 1,500,000`** | **`NTD 1,060,000`** | Complete four-module software/integration package, excluding imedtac station hardware, Avatar vendor license/service fee, and AI mini PC procurement. |

Working interpretation:

```text
NTD 1,500,000 is a reasonable recommended quote for NYCU's complete
four-module software/integration package only when station hardware and Avatar
vendor fees are outside NYCU's quote.
```

## Reverse-Budget Options

Use these options if Prof. Wu wants to keep the total case near `NTD 1,500,000`.

| Option | Budget logic | NYCU quote | Included NYCU scope | Tradeoff |
| --- | --- | ---: | --- | --- |
| Option A: hardware provided separately | imedtac/hospital owns station hardware and Avatar vendor fee. | `NTD 1,500,000` recommended; `NTD 1,060,000` floor. | Full four-module software/integration package. | Best scope clarity. Requires imedtac hardware/vendor confirmation. |
| Option B: one station consumes part of envelope | imedtac gives real one-station cost below `NTD 1,500,000`; NYCU gets the remainder. | `1,500,000 - confirmed hardware cost`. | Fit module scope to remaining budget after hardware is confirmed. | Scope cannot be fixed until real hardware quote arrives. |
| Option C: two stations consume part of envelope | imedtac gives real two-station cost below `NTD 1,500,000`; NYCU gets the remainder. | `1,500,000 - confirmed two-station hardware cost`. | Usually only questionnaire/report and Avatar interface discovery unless hardware is heavily subsidized. | Two stations increase testing/support load while reducing software room. |
| Option D: hard cap includes all hardware | `NTD 1,500,000` must cover station hardware, mini PC, Avatar vendor, and NYCU work. | Not enough for four modules. | Prepare a small paid feasibility/spec package or cut to one core module. | This should be framed as a scope-cut decision, not a full four-module quote. |

## Minimum Scope If Budget Is Too Tight

If the total budget cannot separate hardware from NYCU software, keep the
software work honest and reduce scope explicitly.

| Available NYCU software room | Responsible scope |
| ---: | --- |
| `NTD 0-300,000` | Feasibility/spec package only: hardware minimum specification, Avatar vendor interface checklist, report wording boundary, and external quote draft. |
| `NTD 300,000-600,000` | Questionnaire/report/QR first slice plus Avatar interface discovery; vision/hearing stay as non-implemented planned modules. |
| `NTD 600,000-1,000,000` | Questionnaire/report/QR plus basic Avatar integration and very conservative vision/hearing self-screening placeholders. |
| `NTD 1,060,000+` | Floor version of four-module software/integration package. |
| `NTD 1,500,000+` | Recommended complete four-module software/integration package. |

## Hardware And Compute Policy

Keep hardware outside the NYCU base quote unless Prof. Wu explicitly decides
NYCU should include hardware procurement.

| Item | Working treatment |
| --- | --- |
| imedtac measurement station | Provided or procured by imedtac. Formal price is required from Johnny before any external quote uses a hardware number. |
| AI-capable compact computer | Separate optional procurement. The `NTD 120,000` class discussed with Johnny is a high-end compact-compute assumption, not a final required model. |
| Existing station computer | Assumed insufficient for local Avatar/AI workload until imedtac confirms specifications. |
| Avatar vendor cost | Separate line unless the vendor confirms it is bundled by imedtac. |
| Cloud/vendor-hosted Avatar path | Preferred if it reduces local GPU hardware, physical fit risk, and maintenance burden. |

## Recommended Message To Prof. Wu

Use this internal summary:

```text
我建議不要把 150 萬直接當成「健康量測站官方售價」或「四個模組全部包進去」
的報價。公開資料目前看不到 imedtac 量測站的公開定價，所以 150 萬只能先當作
總預算情境。若 imedtac 硬體吃掉 150 萬，NYCU 的視力、聽力、問卷、Avatar
四模組開發就必須另外報價或縮 scope。比較乾淨的作法是：imedtac 提供量測站
硬體與 Avatar vendor 成本，NYCU 報四模組軟體與整合，建議完整包抓 150 萬，
底線約 106 萬。
```

Recommended quote anchor:

```text
NYCU complete four-module software/integration package:
- recommended: NTD 1,500,000
- floor: NTD 1,060,000

Excluded unless separately confirmed:
- imedtac measurement-station hardware
- Avatar vendor license/service fee
- AI mini PC procurement
- long-term maintenance after acceptance
```

## External Quote Boundary

Do not send this file externally as-is. Before converting it into a formal
quote, confirm:

1. whether the hospital is funding one station or two stations;
2. whether `NTD 1,500,000` is hardware-only, total-project budget, or only an
   internal planning number;
3. whether imedtac or NYCU owns the Avatar vendor interface and vendor fee;
4. whether source code delivery is required;
5. whether maintenance/support after acceptance is included;
6. whether vision/hearing must be included in first release or can be
   conservative screening-support add-ons;
7. whether deployment is one physical site or multiple sites.

## Internal Follow-Up

| Action | Owner | Output |
| --- | --- | --- |
| Ask Johnny for formal imedtac hardware quote for one station and two stations. | Jason | Confirmed hardware-cost basis. |
| Ask Johnny for Avatar vendor integration model and cost owner. | Jason | API/interface and vendor-cost assumption. |
| Discuss with Prof. Wu whether NYCU quote should include hardware or only software/integration. | Jason / Prof. Wu | Quote boundary decision. |
| Prepare external one-page version after the above assumptions are locked. | Jason / NYCU | imedtac-facing quote summary. |
