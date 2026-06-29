---
id: 2026-06-29-johnny-call-budget-scope-note
title: "2026-06-29 Johnny Call - Budget, Open Measurement Station, and Quote Scope Note"
date: 2026-06-29
topic: smart-health-cabin
type: call-note
status: active
source:
  - ../../source/2026-06-29-johnny-line-open-measurement-station-budget-call/source.md
  - ./post-meeting-decision-log.md
  - ./feasibility-response-outline.md
  - ./module-a-vision-hearing-discovery.md
  - ./module-c-avatar-interaction-discovery.md
audience:
  - NYCU internal planning
  - Prof. Wu discussion prep
  - imedtac quote-scope alignment
---

# 2026-06-29 Johnny Call - Budget, Open Measurement Station, and Quote Scope Note

## Purpose

This note converts the `2026-06-29` LINE call with Johnny into a working
planning record for Smart Health Cabin scope, quotation input, hardware
assumptions, and next decisions.

The complete cleaned transcript is preserved at:

```text
../../source/2026-06-29-johnny-line-open-measurement-station-budget-call/source.md
```

## Confirmed Working Signals

| Topic | Working signal | Source |
| --- | --- | --- |
| Hardware presentation | The hospital-side direction has shifted from a closed health-cabin body to an open measurement station similar to the demo station. | Johnny call, `2026-06-29` |
| Quote need | Johnny needs NYCU's plan and quotation range so imedtac can discuss total budget with the hospital side. | Johnny call, `2026-06-29` |
| Budget uncertainty | Prof. Wu's earlier signal was around `NTD 2,000,000`, possibly reduced to `60-70%`, or about `NTD 1,200,000-1,500,000`; Johnny noted this may have been cabin-based and may change when the form factor changes. | Jason / Johnny call, `2026-06-29` |
| First deployment count | Johnny's current understanding is one measurement station first, likely for a city-government clinic; the earlier `12`-station concept appears to belong to a later-year track. | Johnny call, `2026-06-29` |
| Vision/hearing scope | Vision/hearing remain hospital-requested functions, but the practical first framing should be public-health style self-screening or checking with clear disclaimer and professional follow-up wording. | Johnny call, `2026-06-29` |
| Avatar sourcing | Avatar should likely integrate an existing related vendor service rather than requiring NYCU to build a full Avatar product from zero. NYCU may own frontend/module integration and define the data/interface handoff with the vendor. | Johnny call, `2026-06-29` |
| Compute constraint | The existing measurement-station computer likely cannot support the Avatar/AI workload, so a separate small computer or alternate compute path needs discussion. | Johnny call, `2026-06-29` |
| Hardware cost concern | One compact NVIDIA-class option was discussed around `NTD 120,000`; Johnny considered it expensive and needing discussion with Mr. Miao / internal imedtac stakeholders. | Johnny call, `2026-06-29` |
| Physical fit | A Mac-mini-like or smaller mini PC may fit in the measurement-station structure; a traditional desktop tower likely does not. Johnny described shallow depth around `10 cm` and taller internal space in part of the structure. | Johnny call, `2026-06-29` |
| Collaboration model | Johnny's working model is similar to imedtac receiving the hospital case and subcontracting the relevant module scope to NYCU, but the exact cooperation form remains variable. | Johnny call, `2026-06-29` |

## Quote Scope To Prepare

Prepare the quote as a total-budget reverse calculation rather than one fixed
all-in promise.

| Budget question | Working treatment | Use |
| --- | --- | --- |
| `NTD 1,500,000 / one station` | Treat as an internal budget envelope until Johnny confirms formal hardware pricing. If hardware consumes the full amount, NYCU software/integration must be additional or scope-cut. | Teacher discussion anchor. |
| `NTD 1,500,000 / two stations` | Treat as an even tighter scenario because two stations increase acceptance/support work while leaving no software budget if hardware consumes the envelope. | Budget-risk explanation. |
| Hardware outside NYCU quote | imedtac/hospital owns the station hardware and Avatar vendor fee; NYCU quotes software/integration. | Cleanest quote structure. |
| Remaining budget after confirmed hardware | NYCU quote equals the remaining software room, with scope reduced according to available budget. | Fallback if the hospital insists on one total cap. |

The internal four-module software/integration anchor is preserved in
`2026-06-29-prof-wu-internal-quote-scenarios.md`: `NTD 1,500,000`
recommended, `NTD 1,060,000` floor, excluding station hardware, Avatar vendor
fees, AI mini PC procurement, and long-term maintenance.

## Hardware Guidance To Draft

The next hardware note should give Johnny:

1. minimum compute requirements for the chosen Avatar/AI path;
2. recommended compact form-factor options;
3. price bands, including the `NTD 120,000` class option and lower alternatives
   if acceptable;
4. physical-envelope assumptions for the open measurement station;
5. whether cloud/vendor-hosted Avatar can reduce local GPU needs;
6. what performance tradeoff follows from lower-cost hardware.

## Decision Points

| Decision | Owner | Needed for |
| --- | --- | --- |
| Confirm whether the hospital scope is one open measurement station or multiple units. | imedtac / hospital side | budget and deployment count |
| Confirm whether vision/hearing remain in first quotation or are presented as conservative screening add-ons. | imedtac / hospital clinical owner / NYCU | module scope and wording |
| Confirm Avatar vendor interface, data format, latency, deployment mode, and cost model. | imedtac / Avatar vendor / NYCU | integration estimate |
| Confirm hardware procurement owner and whether hardware cost sits inside or outside NYCU's quote. | imedtac / NYCU / Prof. Wu | proposal budget structure |
| Confirm whether NYCU quote is a subcontracted work package, sponsored collaboration, or another cooperation form. | Prof. Wu / imedtac | cost basis and responsibility |

## Next Actions

| Action | Owner | Due |
| --- | --- | --- |
| Send Johnny candidate small-computer models or minimum hardware specification. | Jason / NYCU | next message |
| Discuss software-development manpower and quote basis with Prof. Wu. | Jason / Prof. Wu | before imedtac quote response |
| Prepare two to three scope/budget versions instead of one fixed price. | Jason / NYCU | before quote conversation |
| Ask Johnny for the current imedtac total-flow proposal once ready. | Jason / Johnny | next alignment |
| Treat source disagreement as an explicit alignment risk: Prof. Wu may still have cabin-form-factor information while Johnny has newer open-station information. | Jason / NYCU / imedtac | immediate planning control |

## Working Framing

Use this affirmative framing in the next internal or imedtac-facing draft:

```text
The Smart Health Cabin cooperation can be scoped as an open measurement-station
software and integration module. NYCU can provide a source-backed module plan,
software-development cost range, Avatar integration boundary, and hardware
minimum specification. Vision and hearing can remain in a conservative
screening-support role with clear report wording and professional follow-up
guidance while the questionnaire and Avatar workflow form the core demo path.
```
