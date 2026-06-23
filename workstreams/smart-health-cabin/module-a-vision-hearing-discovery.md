---
id: smart-health-cabin-module-a-vision-hearing-discovery
title: "Module A Vision And Hearing Discovery"
date: 2026-06-17
topic: ai-triage
type: meeting-prep
status: active
source:
  - ../../source/2026-06-17-imedtac-smart-health-cabin-requirements/source.md
  - ../../source/2026-06-23-imedtac-onsite-visit-smart-health-cabin/source.md
  - ../../source/2026-06-17-smart-health-cabin-expert-tutorial-note/source.md
  - ./external-authority-verification.md
---

# Module A Vision And Hearing Discovery

## Scope Statement

Module A is a self-guided vision and hearing measurement workflow inside the
Smart Health Cabin. It is a device/software workflow problem, not only a UI
problem.

After the `2026-06-23` onsite meeting, hearing and vision should be tracked as
two distinct user-facing modules even though this discovery note keeps their
shared device and screening constraints together.

The strongest first-release framing is:

```text
self-guided screening support with structured result capture and report display
```

Use stronger medical measurement language only after calibration, validation,
and clinical ownership are confirmed.

## What To Inspect Onsite

| Area | Facts to collect |
| --- | --- |
| Screen | size, resolution, brightness, mounting height, fixed user distance, touch accuracy |
| Cabin geometry | user standing/sitting position, distance markers, lighting, privacy, accessibility |
| Operating environment | OS, browser, kiosk mode, audio permissions, offline/online mode |
| Audio | speaker count, placement, volume control, frequency response, max/min output |
| Noise | cabin dB after insulation, ambient noise during clinic operations, measurement method |
| Device data | whether existing devices expose API/SDK/logs, result format, timestamps |
| Operator flow | whether staff can help, restart, override, or confirm failed tests |

## Source-To-Engineering Translation

The email and requirements PDF describe vision and hearing measurement features.
For engineering purposes, those features should be treated as device- and
environment-dependent workflows until the following facts are collected:

- exact screen geometry and expected viewing distance;
- whether user posture and eye occlusion can be controlled;
- speaker/headphone availability and left/right isolation method;
- whether audio output can be calibrated, locked, and verified;
- cabin noise level during real clinic operation;
- allowed result wording and clinical review owner.

The first meeting goal is not to decide an implementation stack. It is to
decide what measurement claims are supportable from the actual cabin setup.

## Verified Standards Implications

Use these verified facts as internal meeting preparation:

- ISO 8596:2017 supports discussion of optotypes, viewing distance, and
  photopic test conditions, but ISO itself states it is not intended as a
  clinical-measurement standard. It should not be used as validation for a
  Smart Health Cabin clinical vision claim.
- ISO 8253-1:2010 covers pure-tone air and bone conduction threshold
  audiometry. For screening, it specifies pure-tone air-conduction methods and
  does not specify procedures where loudspeakers are used as the sound source.
  A fixed-speaker, no-headphone cabin workflow is therefore not ISO 8253-1
  threshold audiometry by default.
- ISO 389-1:2017 defines reference zero for pure-tone air-conduction
  audiometers. Any `dB HL`-style output requires a calibrated audiometer or a
  separately validated equivalent method.
- WHO hearing-screening guidance supports evidence-based hearing-screening
  programme design, not ad hoc clinical claims from browser audio playback.
- Web Audio API and browser media APIs can support prototype interaction, but
  they do not validate sound pressure level, ear isolation, ambient noise, or
  medical measurement accuracy.

Meeting implication: Module A should stay in `self-guided screening support`
language unless imedtac / hospital confirms intended use, hardware calibration,
environmental controls, clinical owner, and validation route.

## Vision-Specific Questions

1. What screen size and fixed viewing distance should the vision chart assume?
2. Can the cabin enforce or guide the correct user distance?
3. Does imedtac expect clinical-grade vision measurement or preliminary
   screening support?
4. Which checks are required for first release:
   - visual acuity;
   - contrast vision;
   - color vision;
   - astigmatism;
   - visual field?
5. Who approves the chart style, result wording, and cutoff interpretation?
6. How should failed, uncertain, or incomplete responses be recorded?
7. Should results be numeric, categorical, charted, or only summarized?

## Hearing-Specific Questions

1. How many fixed speakers are available, and where are they placed?
2. How can left/right hearing be tested without headphones?
3. What is the expected dB range and frequency range?
4. Can the software reliably control volume and frequency in the kiosk browser?
5. What is the cabin's measured noise level after insulation?
6. Does imedtac expect hearing screening support or formal hearing test output?
7. What result categories should appear in the integrated report?

## Browser / Device Feasibility Questions

1. Is the kiosk frontend expected to run in a browser, native shell, or
   imedtac-controlled runtime?
2. Can the runtime use Web Audio API or another audio API for frequency and
   channel control?
3. Can OS-level or hardware-level volume be locked during the test?
4. Can the runtime access a microphone or sound-level sensor for environment
   checks?
5. Can imedtac provide calibration data or a repeatable calibration procedure?
6. If the test uses fixed speakers, what design prevents the user from hearing
   the left-channel signal with the right ear or vice versa?

## Main Risks To Surface

- Vision accuracy depends on screen geometry, distance, brightness, and user
  position.
- No-headphone hearing testing has a left/right isolation challenge.
- Browser audio output may not provide calibrated dB control without hardware
  measurement.
- ISO 8253-1 does not specify loudspeaker-source procedures, so fixed-speaker
  no-headphone hearing needs a separate method and wording path.
- If outputs are presented as medical conclusions, clinical validation and
  claim control become first-order requirements.
- A browser can implement interaction and audio playback, but browser
  capability is not evidence of clinical measurement validity.
- A report can safely carry device-context and measurement-quality fields before
  it carries stronger medical interpretation.

## Result-Wording Control

Prefer first-release language such as:

```text
self-guided screening support
preliminary screening reference
staff-review support
measurement quality pending device validation
```

Avoid stronger wording such as clinical diagnosis, formal hearing threshold,
validated acuity result, or medical examination result unless imedtac /
hospital clinical owners confirm intended use, validation route, and wording
authority.

## First-Release Recommendation

Recommend a staged approach:

1. define cabin geometry and device facts;
2. build guided prototype screens;
3. measure calibration feasibility;
4. label first-release output as preliminary screening support;
5. include results in the report with clear source and measurement quality
   fields;
6. defer stronger medical interpretation until validation is designed.
