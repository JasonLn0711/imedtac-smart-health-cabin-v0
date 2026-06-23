---
id: smart-health-cabin-external-authority-verification
title: "External Authority Verification For Smart Health Cabin Expert Note"
date: 2026-06-17
topic: smart-health-cabin
type: source-verification
status: active
source:
  - ../../source/2026-06-17-smart-health-cabin-expert-tutorial-note/source.md
  - ../../source/2026-06-17-imedtac-smart-health-cabin-requirements/source.md
---

# External Authority Verification For Smart Health Cabin Expert Note

## Verification Scope

This note verifies the external-source claims in the preserved expert tutorial
note for the Smart Health Cabin discovery workspace. It uses official or
authoritative sources where available, then records factual corrections and
meeting-preparation implications.

Verification date: `2026-06-17`.

This file does not make the Smart Health Cabin a regulated medical device
project. It defines which background facts are reliable enough to guide the
`2026-06-23` discovery meeting and which claims still require imedtac /
hospital intended-use decisions.

## Executive Corrections

| Topic | Correction |
| --- | --- |
| IMDRF SaMD key definitions | The official key-definitions document is `IMDRF/SaMD WG/N10FINAL:2013`, published `2013-12-18`, not `N12`. |
| FDA CDS | FDA's official CDS guidance page is now `Clinical Decision Support Software ... January 2026`, content current as of `2026-01-29`; do not treat 2022-era CDS wording as current without refreshing it. |
| IEC 62304 | The current ISO page lists `IEC 62304:2006`, last reviewed/confirmed in `2021`, with one amendment from `2015`; cite as `IEC 62304:2006 + Amd 1:2015` when precision matters. |
| IEC 62366-1 | The current ISO page lists `IEC 62366-1:2015`, confirmed in `2021`, with one amendment; it is about usability engineering related to safety, correct use, and use errors. |
| ISO 14971 | The current ISO page lists `ISO 14971:2019`, confirmed in `2025`; it covers medical-device risk management including SaMD and IVDs. |
| ISO 13485 | The current ISO page lists `ISO 13485:2016`, confirmed in `2025`; it is a QMS standard for medical devices, not a discovery-phase requirement by itself. |
| Visual acuity | ISO 8596:2017 is about Landolt ring optotypes and distance visual acuity under photopic conditions for certification/licensing; ISO itself says it is not intended as a clinical-measurement or blindness-certification standard. |
| Hearing / audiometry | ISO 8253-1:2010 covers pure-tone air and bone conduction threshold audiometry; for screening it specifies only pure-tone air-conduction methods and explicitly does not specify loudspeaker-source procedures. Fixed-speaker, no-headphone cabin hearing cannot be treated as standard pure-tone threshold audiometry without a separate validated method. |
| FHIR / HIS-ready | HL7 FHIR R5 is current published FHIR, but TW Core IG v1.0.0 is based on FHIR R4. For Taiwan hospital exchange, do not assume R5; ask imedtac / hospital IT whether the target is custom JSON, FHIR R4/TW Core, or live HIS integration. |
| Browser audio | Web Audio API and `getUserMedia()` support browser audio control and permissioned media capture, but they do not provide medical calibration or clinical validity by themselves. |
| Technology stack | Next.js, FastAPI, Strapi, Prisma, Zod, XState, and PostgreSQL remain viable options, not commitments. Select after kiosk runtime, hosting, CMS ownership, and source-code handoff terms are known. |

## Verified Reference Facts

### 1. SaMD And Intended Use

Official source:

- IMDRF, "Software as a Medical Device (SaMD): Key Definitions":
  <https://www.imdrf.org/documents/software-medical-device-samd-key-definitions>

Verified facts:

- The official IMDRF page lists the code as `IMDRF/SaMD WG/N10`.
- It lists publication date `18 December 2013`.
- It lists status `Final`.
- The page labels the document as `IMDRF/SaMD WG/N10FINAL:2013`.

Correction and use:

- Correct the expert note's implicit `N12` / SaMD-key-definition reference to
  `N10FINAL:2013`.
- Use SaMD language only as intended-use vocabulary. Do not claim this project
  is or is not SaMD until imedtac / hospital defines intended medical purpose,
  user role, output use, and jurisdiction.

### 2. FDA Clinical Decision Support Software

Official source:

- FDA, "Clinical Decision Support Software Guidance for Industry and Food and
  Drug Administration Staff January 2026":
  <https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software>

Verified facts:

- FDA's official page labels the guidance as `January 2026`.
- It is marked `Final`.
- The page is current as of `2026-01-29`.
- FDA states that Section 3060(a) of the 21st Century Cures Act excluded
  certain medical software functions, including certain decision-support
  software, from the device definition.
- FDA states the guidance clarifies the criteria for non-device CDS and that
  existing digital-health policies still apply to software functions that meet
  the definition of a device, including patient- or caregiver-facing functions.

Correction and use:

- Do not cite the 2022 FDA CDS guidance as current. Use the January 2026 page
  as the current official FDA CDS reference.
- For Smart Health Cabin, FDA CDS is background only unless the project targets
  the U.S. market or uses FDA framing for design control. It still usefully
  reinforces the discovery question: is the output device software, non-device
  CDS, screening support, staff-review support, or something else?

### 3. Medical-Device Risk, Software Lifecycle, Usability, And QMS Standards

Official sources:

- ISO 14971:2019:
  <https://www.iso.org/standard/72704.html>
- IEC 62304:2006:
  <https://www.iso.org/standard/38421.html>
- IEC 62366-1:2015:
  <https://www.iso.org/standard/63179.html>
- ISO 13485:2016:
  <https://www.iso.org/standard/59752.html>

Verified facts:

- ISO 14971:2019 is the current international standard for medical-device risk
  management, confirmed in 2025. ISO describes it as specifying terminology,
  principles, and process for risk management of medical devices, including
  SaMD and IVDs.
- IEC 62304:2006 is current on the ISO page, confirmed in 2021, and defines
  medical-device software lifecycle requirements. The ISO page also records one
  amendment, `IEC 62304:2006/Amd 1:2015`.
- IEC 62366-1:2015 is current on the ISO page, confirmed in 2021. ISO describes
  it as a usability engineering process for medical-device safety, including
  correct use and use errors in normal use.
- ISO 13485:2016 is current on the ISO page, confirmed in 2025. ISO describes
  it as the internationally recognized QMS standard for design and manufacture
  of medical devices.

Correction and use:

- These standards are valid background references, but they are not automatic
  Smart Health Cabin commitments during discovery.
- If the project remains screening-support / feasibility discovery, use them as
  design discipline: intended use, risk register, usability risks, change
  control, evidence, and traceability.
- If imedtac asks for stronger medical-device deliverables, formal validation,
  regulated source-code package, or production governance, these standards
  become candidates for a separate design-control and quality-system discussion.

### 4. Vision Measurement

Official source:

- ISO 8596:2017:
  <https://www.iso.org/standard/69042.html>

Verified facts:

- ISO 8596:2017 specifies Landolt ring optotypes and a method for measuring
  distance visual acuity under photopic conditions for certification or
  licensing.
- ISO states that ISO 8596:2017 is not intended as a clinical-measurement
  standard or for blindness / partial-sight certification.

Correction and use:

- The expert note is correct that screen geometry, optotype, distance, and
  lighting matter.
- Strengthen the boundary: ISO 8596 is not enough to claim clinical-grade
  vision measurement in this project.
- For `2026-06-23`, ask imedtac whether Module A is only self-guided screening
  support, a reference self-test, or a stronger measurement workflow requiring
  ophthalmology/optometry validation.

### 5. Hearing Screening And Audiometry

Official sources:

- ISO 8253-1:2010:
  <https://www.iso.org/standard/43601.html>
- ISO 389-1:2017:
  <https://www.iso.org/standard/69855.html>
- WHO, "Hearing screening: considerations for implementation":
  <https://www.who.int/publications/i/item/9789240032767>

Verified facts:

- ISO 8253-1:2010 covers pure-tone air and bone conduction threshold
  audiometry.
- For screening, ISO 8253-1:2010 specifies only pure-tone air-conduction
  audiometric test methods.
- ISO 8253-1:2010 says speech audiometry, electrophysiological audiometry, and
  loudspeaker-source procedures are not specified in that part.
- ISO 389-1:2017 defines reference zero for the hearing threshold scale
  applicable to pure-tone air-conduction audiometers.
- WHO provides technical guidance for evidence-based hearing screening
  programmes across newborns/infants, schoolchildren, and older people.

Correction and use:

- The expert note's warning about no-headphone hearing is strongly supported.
- Do not express fixed-speaker output as `dB HL` or pure-tone threshold
  audiometry unless imedtac provides calibrated hardware, suitable method,
  environmental controls, and clinical validation route.
- For a September MVP, fixed-speaker hearing should be framed as guided
  interaction, screening-support exploration, or measurement-quality-dependent
  reference unless clinical/device owners approve stronger wording.

### 6. FHIR, TW Core, And HIS-Ready Claims

Official / authoritative sources:

- HL7 FHIR R5 Observation:
  <https://fhir.hl7.org/fhir/observation.html>
- HL7 FHIR R5 DiagnosticReport:
  <https://fhir.hl7.org/fhir/diagnosticreport.html>
- Taiwan Core IG v1.0.0:
  <https://twcore.mohw.gov.tw/ig/twcore/1.0.0/ImplementationGuide-tw.gov.mohw.twcore.html>

Verified facts:

- HL7's FHIR R5 Observation page describes Observation as measurements and
  simple assertions about a patient, device, or other subject.
- HL7 states that DiagnosticReport gives clinical or workflow context for a set
  of Observations.
- HL7 states Observation should not be used to record a clinical diagnosis
  normally captured as Condition or ClinicalImpression.
- TW Core IG v1.0.0 is based on HL7 FHIR R4 and is listed as the current
  published version in its permanent home.

Correction and use:

- The expert note is directionally correct that Observation and
  DiagnosticReport are relevant to future data modeling.
- Correct the implementation assumption: Taiwan hospital exchange should not
  default to FHIR R5. If imedtac / hospital asks for Taiwan FHIR alignment,
  first ask whether TW Core v1.0.0 / FHIR R4 is the expected base.
- "HIS-ready" should be split into at least three levels:
  1. custom JSON / ERD only;
  2. FHIR mapping draft, likely FHIR R4 / TW Core if Taiwan hospital exchange
     is in scope;
  3. live HIS integration with authentication, patient matching, test endpoint,
     retry/error handling, audit log, and hospital IT acceptance.

### 7. Taiwan Privacy Context

Official source:

- Personal Data Protection Commission, Taiwan:
  <https://www.pdpc.gov.tw/en/News_Html/165/>

Verified facts:

- The PDPC page states that data related to medical records, healthcare,
  genetics, sex life, physical examination, and criminal records shall not be
  collected, processed, or used except under statutory conditions.

Correction and use:

- This is a Taiwan-specific official source, not an international standard, but
  it is directly relevant if the Smart Health Cabin handles identifiable
  health-report or screening data in Taiwan.
- QR report design should avoid identifiers in URLs/tokens, define expiry and
  deletion, log access, and separate anonymous demo mode from any real-patient
  handling.

### 8. Browser Audio And Media APIs

Authoritative sources:

- MDN Web Audio API:
  <https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API>
- MDN `MediaDevices.getUserMedia()`:
  <https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia>

Verified facts:

- MDN describes Web Audio API as a system for controlling audio on the web.
- MDN describes `getUserMedia()` as prompting the user for permission to use
  media inputs and returning a `MediaStream`.

Correction and use:

- The expert note is correct that browser APIs can support interactive
  prototype workflows.
- Browser audio/media capability does not validate clinical sound pressure,
  left/right ear isolation, environmental noise suitability, or medical
  measurement claims.

### 9. Software Stack Examples

Official technology sources:

- Next.js App Router:
  <https://nextjs.org/docs/app>
- FastAPI features:
  <https://fastapi.tiangolo.com/features/>
- Strapi:
  <https://strapi.io/>
- Prisma ORM:
  <https://www.prisma.io/orm>

Verified facts:

- Next.js App Router is file-system based and uses React features such as
  Server Components, Suspense, and Server Functions.
- FastAPI provides OpenAPI-based automatic docs with Swagger UI and ReDoc.
- Strapi positions itself as a headless CMS with REST and GraphQL content APIs.
- Prisma ORM supports data modeling, migrations, and type-safety across common
  databases.

Correction and use:

- These tools are technically plausible, but no tool choice should enter an
  imedtac-facing commitment before the runtime, hosting, data ownership, CMS
  ownership, deployment path, and source-code/license boundary are decided.

## Corrections Applied To Active Workstream

| File | Applied correction | Status |
| --- | --- | --- |
| `README.md` | Added this verification note as the fact baseline before citing standards, regulatory, browser-media, interoperability, or stack references. | completed |
| `expert-note-integration-review.md` | Replaced generic "needs verification" wording with a pointer to this verified source note and the specific factual corrections. | completed |
| `2026-06-23-onsite-discovery-plan.md` | Added this verification note to pre-read and clarified that verified standards are meeting background, not automatic deliverables. | completed |
| `module-a-vision-hearing-discovery.md` | Added ISO 8596 / ISO 8253 / ISO 389 implications: vision/hearing output remains screening-support unless validated; fixed-speaker no-headphone hearing is not ISO 8253-1 threshold audiometry. | completed |
| `module-b-questionnaire-triage-discovery.md` | Added FDA/FHIR correction: questionnaire guidance should be rule-based/reviewable for MVP; FHIR does not mean diagnosis or live HIS. | completed |
| `feasibility-response-outline.md` | Added verified-reference appendix and correction that January 2026 FDA CDS is current, standards are background until intended use is decided, and TW Core is FHIR R4. | completed |
| `meeting-question-bank.md` | Added questions asking imedtac / hospital which standards are required instead of assuming FDA/ISO/FHIR scope. | completed |
| `post-meeting-decision-log.md` | Added a decision point for whether verified standards are internal background, design controls, formal deliverables, or out of scope. | completed |
| `docs/source-index.md` | Indexed this file as the formal source-correction record for the Smart Health Cabin discovery workspace. | completed |

## Decision

The expert note's systems-engineering advice remains sound after verification.

The factual corrections are:

1. IMDRF SaMD Key Definitions should cite `N10FINAL:2013`.
2. FDA CDS should cite January 2026 current guidance, not old 2022 framing.
3. IEC 62304 should be cited with its current 2006 + 2015 amendment status.
4. ISO 8596 should not be used as clinical-vision validation.
5. ISO 8253-1 does not cover loudspeaker-source hearing procedures.
6. TW Core v1.0.0 is FHIR R4-based; do not assume FHIR R5 for Taiwan
   hospital exchange.
7. Browser audio APIs enable interaction, not calibrated medical measurement.

These corrections strengthen the current workspace strategy: the next step is
feasibility and intended-use discovery before quotation, implementation, or
formal product claims.
