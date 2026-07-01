---
id: 2026-07-01-prof-wu-quote-meeting-deep-analysis
title: "2026-07-01 Prof. Wu Quote Meeting Deep Analysis"
date: 2026-07-01
topic: smart-health-cabin
type: deep-analysis
status: source-backed-internal
source:
  - ../../source/2026-06-30-expert-quote-method-update/transcript-corrected.md
  - ../../source/2026-06-30-expert-quote-method-update/source.md
  - ../../source/2026-07-01-tomi-line-quote-alignment-scheduling/source.md
  - ./2026-06-29-prof-wu-internal-quote-scenarios.md
audience:
  - Jason
  - Prof. Wu
  - Tomi alignment
---

# 2026-07-01 Prof. Wu Quote Meeting Deep Analysis

## FIRST PRINCIPLE

The scarce resource is response trust: 慧誠智醫 needs a fast answer, Prof. Wu
needs a defensible quotation story, Tomi needs to review the commercial logic,
and Jason needs a scope path that does not turn a demo cooperation into an
unbounded delivery promise.

Canonical ownership:

- `source/2026-06-30-expert-quote-method-update/transcript-corrected.md`
  preserves the corrected meeting transcript.
- This analysis owns interpretation, quote logic, risk controls, and next
  gates.
- Planning repo day notes should keep only locator, status, urgency, and next
  action.

## Meeting Thesis

The meeting changes the quote frame from a two-station reverse-budget package
into a one-station / one-system first-build quotation. The useful external
story is not "NYCU charges a high software fee per station." The useful story
is:

```text
This first case pays for system build-out. Later deployments should use a
separate license, maintenance, and small-customization model.
```

That distinction protects the relationship with 慧誠智醫. It lets the first
北市聯醫 case cover the real build cost while keeping future co-selling
economics credible.

## Accepted Decisions

| Decision | Interpretation | Next use |
| --- | --- | --- |
| Use one station / one system as the main calculation basis. | The earlier two-station all-in `NTD 1,500,000` frame is still useful as a constrained scenario, but it should not be the primary quote story. | Revise the quote package around one set first. |
| Avoid writing NYCU as the external delivery entity. | Prof. Wu explicitly corrected the external subject: school is not the right commercial delivery body. | Use 智德萬 or the confirmed company subject after Tomi / Prof. Wu clears the naming. |
| Treat `NTD 400,000` as a safer hardware placeholder than `NTD 300,000`. | It is still not a verified imedtac hardware quote. | Mark as provisional until Johnny / 慧誠 gives a formal station number. |
| Keep `NTD 900,000` and `NTD 1,100,000` as first-build software ranges. | `NTD 900,000` comes from the earlier two-station remainder; `NTD 1,100,000` follows one station at `NTD 400,000` inside a `NTD 1,500,000` total frame. | Present as build-cost options, not future per-unit license fees. |
| Split first-build fee from future license / maintenance / small customization. | This is the main commercial correction in the transcript. | Tomi should review the `NTD 150,000 / set` license hypothesis and the wording. |
| Add person-week logic to every quote line. | Prof. Wu wants item costs tied to people, weeks, and a defensible `NTD 180,000 / person-month` anchor. | Update quote tables with role, headcount, weeks, and deliverable. |
| Keep low-price tender analogs, but classify them correctly. | Low tender prices may represent existing-product license or small customization, not first-build cost. | Use them to explain future license/small-customization economics, not to cut first-build cost. |

## Quote Architecture

### First-Build Package

The first-build package should include the work that makes the solution real:

- requirement lock and acceptance wording;
- kiosk flow and shared session/data contract;
- questionnaire system and configurable form path;
- Avatar interface and fallback path;
- vision and hearing self-screening support wording;
- report / QR Code output;
- deployment scripts, test cases, and handoff documentation.

This package can be defended with TISSA person-month anchors. A simple working
anchor from the transcript is:

```text
NTD 180,000 / person-month
NTD 45,000 / person-week
2 people x 1 week ~= NTD 90,000
2 people x 2 weeks ~= NTD 180,000
```

Each quote item should read as an operating package: role, people, weeks,
deliverable, and acceptance artifact.

### Future Deployment Package

Future deployments should not reuse the first-build fee. They should be split
into:

- software license fee;
- maintenance fee;
- questionnaire / report template adjustment fee;
- onsite deployment support fee;
- new custom module fee if a hospital asks for materially new workflow;
- separate hardware, vendor Avatar, AI computer, and HIS integration lines.

The meeting uses `NTD 150,000 / set` as a discussion hypothesis for future
license economics. That number is not accepted as final. It is a Tomi review
input.

## Tomi Alignment Brief

### Scheduling Source

Jason's `2026-07-01 09:19-11:13` LINE conversation with Tomi confirms the same-day
review path: Jason asked for quotation advice, Tomi offered evening or night
availability, Jason proposed `22:00` for a fast `30` minute discussion with 多寶,
and Tomi accepted.

### Message Goal

Tomi should not be asked only "is this patent-safe?" The meeting asks Tomi to
review the business wording and price structure:

```text
這次 90-110 萬是第一套建置費，不是未來每套授權費。北市聯醫案如果能 cover
建置成本，後續慧誠要帶去其他院所銷售，可以另談每套 license、維護與小幅
客製。請 Tomi 幫忙看這個金額、談法、公司主體與授權結構是否合理。
```

### Questions For Tomi

| Question | Why it matters |
| --- | --- |
| `NTD 900,000-1,100,000` as first-build software/integration fee: defensible or too aggressive? | Sets the first reply to 慧誠 and the hospital-side budget story. |
| `NTD 150,000 / set` as future license discussion anchor: too low, reasonable, or should be a percentage / royalty? | Determines whether future co-selling economics are worth the first-build work. |
| Should the external subject be 智德萬, another company vehicle, or a joint cooperation wording? | Avoids NYCU-as-vendor ambiguity. |
| How should IP / source-code / know-how be stated in the quote? | Prevents accidental full transfer. |
| Does Tomi prefer build-fee + license, revenue share, maintenance retainer, or per-site deployment fee? | Converts one-time project work into a repeatable cooperation model. |

## Quote Revision Rules

| Area | Required revision |
| --- | --- |
| Title | Move from "兩台部署四模組 MVP" to "一套首次建置 + 後續授權另議" as the main story. |
| Entity | Replace NYCU-facing delivery wording with company-subject wording after name confirmation. |
| Hardware | Keep hardware as provisional and require 慧誠 formal quote. |
| Cost lines | Add people x weeks x `NTD 180,000 / person-month` logic. |
| Software | Use `NTD 900,000` and `NTD 1,100,000` as build-cost scenarios. |
| Future sales | State that future per-set fee is license / maintenance / small customization, not full rebuild. |
| Module scope | Keep vision/hearing in self-screening support language. |
| Questionnaire | Make configurability visible: future hospitals can edit forms without rebuilding core software. |
| Exclusions | Keep Avatar vendor fee, AI mini PC, formal HIS integration, medical-device validation, source-code transfer, and long-term maintenance as separate activation items. |

## Delivery And Staffing Analysis

The transcript surfaces a real implementation risk: Codex acceleration does not
remove validation, integration, and onsite acceptance work. Jason can build
questionnaire and Avatar spine quickly, but vision/hearing, testing, and
deployment still need human review.

Operational staffing path:

| Work area | Likely owner path | Risk control |
| --- | --- | --- |
| Questionnaire / Avatar spine | Jason primary, with existing implementation evidence. | Keep scope to configurable questionnaire, report, QR, Avatar guidance, and fallback. |
| Vision / hearing support modules | 多寶 or helper support if Phase 1 includes them. | Keep as conservative self-screening; avoid medical-device claims. |
| Validation / QA / device check | Additional student or assistant needed. | Assign repeatable test scripts and evidence capture. |
| Quote package / Tomi alignment | Jason prepares, Tomi reviews, Prof. Wu approves. | Do not send to 慧誠 before Tomi sees build/license split. |
| Future ASR / Taiwanese / microphone research | Later activation lane. | Do not block current quote reply on this research. |

Potential helper path from the meeting: 景深 may be useful for summer support
because he can self-learn with GPT and build app-like artifacts. That is a
staffing option, not a confirmed resource.

## Company Strategy Implication

Prof. Wu frames a three-unit company direction:

1. certified / leaseable product unit;
2. non-certified AI / LLM / software unit, potentially led by Jason's work;
3. certification-support unit.

Smart Health Cabin belongs most naturally in the second unit, with security
and privacy capability as a differentiator. ISO/IEC 27001 and ISO/IEC 27701
are strategic positioning references, not immediate deliverables in this quote.

The right quotation language should therefore present Jason's side as a
software, workflow, AI, and integration capability layer that can become a
repeatable module, not as ad hoc student labor.

## Technical Scope Implications

| Technical topic | Analysis |
| --- | --- |
| Questionnaire configurability | This is the cost-control core. If customers can configure forms and mappings, future deployments are license/support work instead of rebuilds. |
| Vision / hearing | Keep first release in self-screening and result-support wording. Full diagnostic or medical-device-grade validation is an activation gate. |
| Avatar | Treat as existing vendor interface integration unless a separate build decision exists. |
| ASR / LLM / Taiwanese | Useful future capability. Requires corpus licensing and hardware/noise testing. It should not expand the immediate quotation unless explicitly activated. |
| Microphone / anti-noise equipment | Should become Phase 2 / voice-quality research input, not a prerequisite for the quote reply. |
| Security | Mention privacy/security operating controls; formal ISO certification work is a separate organizational path. |

## Risk Register

| Risk | Severity | Control |
| --- | --- | --- |
| 慧誠 sees the first-build fee as per-unit fee and rejects cooperation economics. | high | Lead with build fee vs future license split. |
| Quote names NYCU as delivery vendor and creates institutional mismatch. | high | Use company subject after confirmation. |
| Hardware price remains oral and changes the budget envelope. | high | Require 慧誠 formal hardware number before final external quote. |
| Low-price tenders are used to pressure first-build cost. | medium | Classify low tenders as existing product license / small customization unless evidence proves otherwise. |
| Vision/hearing are read as clinical diagnostic modules. | medium | Use self-screening support and human-review language. |
| Scope expands into ASR/Taiwanese training before first reply. | medium | Park as later activation gate with licensing requirement. |
| Jason overloads on implementation and validation. | high | Add helper path and split validation tasks. |

## Action Plan

| Priority | Action | Owner | Output |
| --- | --- | --- | --- |
| P0 | Revise quote main version to one station / one system. | Jason | Updated internal quote and executive decision packet. |
| P0 | Ask Tomi to review build fee, future license, company subject, and IP / source-code wording. | Jason | Tomi review notes. |
| P0 | Explain urgency to Tomi: 慧誠 wanted an answer by `2026-07-01` Wednesday end of day. | Jason | Same-day `22:00` alignment with Tomi / 多寶 or explicit blocker. |
| P1 | Add people x weeks x role logic to every quote item. | Jason | Person-week cost table. |
| P1 | Keep public tender references but label their use. | Jason | Tender reference table with use boundary. |
| P1 | Ask 慧誠 for formal hardware quote and whether Avatar vendor fee is inside or outside their scope. | Jason / Johnny | Hardware/vendor assumption lock. |
| P2 | Investigate Taiwanese corpus / 廖元甫 route only if voice/Taiwanese becomes an activated module. | Jason | Later research note. |
| P2 | Confirm helper availability for validation and vision/hearing support. | Prof. Wu / Jason | Staffing plan. |

## Recommended Immediate Text To Tomi

```text
Tomi，我想請你幫忙看慧誠智醫健康量測站這案子的報價談法。吳老師昨天晚上
跟我討論後，建議不要把 90-110 萬講成未來每套都要收的軟體費，而是講成
第一套建置費：需求、系統架構、問卷、Avatar 介面、視力/聽力自我篩檢、
報告/QR、部署驗收都要先建起來。後續如果慧誠帶去其他醫院賣，應該另談
每套 license、維護費或小幅客製費，例如十幾萬一套這種方向。慧誠希望週三
下班前有回覆，所以我想先跟你快速對齊金額、公司主體、授權/IP 說法。
```

## Decision State

Status: `source preserved and interpreted`.

The meeting supports a quotation revision and Tomi alignment. It does not yet
authorize an external quote, final license price, hardware price, source-code
transfer, or delivery commitment.
