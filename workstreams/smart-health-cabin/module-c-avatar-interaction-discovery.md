---
id: smart-health-cabin-module-c-avatar-interaction-discovery
title: "Module C Avatar Interaction Discovery"
date: 2026-06-23
topic: ai-triage
type: meeting-record
status: active
source:
  - ../../source/2026-06-23-imedtac-onsite-visit-smart-health-cabin/source.md
  - ./post-meeting-decision-log.md
---

# Module C Avatar Interaction Discovery

## Scope Statement

The `2026-06-23` onsite meeting added Avatar interaction as a fourth
user-facing Smart Health Cabin module, separate from hearing, vision, and the
questionnaire module.

The strongest first-release framing is:

```text
voice-enabled questionnaire guidance with fixed or reviewed prompts
```

The Avatar can ask questionnaire items, listen to the person's spoken answer,
and help input the answer. This should be treated as a guided interaction
surface over reviewed questionnaire content, not as autonomous clinical
conversation or diagnosis.

## Relationship To Questionnaire Module

Avatar interaction should sit on top of the questionnaire module:

- the questionnaire owns reviewed questions, option IDs, scoring, branching,
  export, and report fields;
- the Avatar owns presentation, voice prompt, answer capture, and interaction
  flow;
- the backend should preserve the exact questionnaire answer that was accepted
  by the user or operator;
- if voice capture fails, the user should still be able to answer through the
  standard questionnaire UI.

## First-Release Options

| Option | Description | Tradeoff |
| --- | --- | --- |
| Fixed-script show path | Avatar speaks a small prepared script and guides one fixed questionnaire path. | Best fit for September show / opening demo; lowest ASR/TTS risk. |
| Fixed-question voice I/O | Avatar reads approved questionnaire items and accepts constrained spoken answers such as yes/no or 1/2/3. | Useful product direction if microphone, noise, and latency are controlled. |
| Real-time ASR/TTS Avatar | Avatar generates or voices dynamic interaction in real time. | Higher GPU, latency, microphone, noise, and validation risk; should be later-phase unless explicitly required. |

## Technical Questions

1. Is Avatar required for the September show path, the durable product path, or
   both?
2. Does first release need real-time ASR/TTS, or is a fixed-script /
   fixed-question voice path enough?
3. What hardware is available for microphone capture inside the cabin?
4. Does the cabin environment provide enough noise isolation for speech input?
5. Can the kiosk hardware support Avatar animation, lip sync, TTS, and ASR
   locally, or does it need cloud / remote inference?
6. What fallback UI appears when speech recognition fails?
7. Which language and accent requirements apply first?
8. Who approves Avatar script, tone, visual style, and patient-facing wording?

## Product Questions

1. Which first questionnaire should the Avatar guide: dementia, depression, a
   public-health survey, or another hospital-approved form?
2. Is the goal public opening impact, longitudinal public-health data
   collection, clinic workflow support, or all three in staged order?
3. Should the Avatar collect only structured answers, or also free speech?
4. Should Avatar interaction be optional or the default entry path?
5. What data is stored from voice interaction: final structured answer only,
   transcript, audio, confidence score, or none?

## Risk Controls

- Keep first-release Avatar content tied to approved questionnaire items.
- Avoid open-ended clinical conversation unless a separate validation and
  review path exists.
- Do not store raw voice or transcript data unless privacy, consent, retention,
  and security ownership are explicit.
- Keep fixed-script or fixed-question fallback available for noisy public
  environments.
- Treat GPU, latency, and microphone requirements as delivery gates before
  committing to real-time Avatar behavior.

## First-Release Recommendation

For the first public-facing path, build a fixed-script or fixed-question Avatar
that demonstrates voice-enabled questionnaire support while preserving
structured answers, reviewed wording, and fallback touch input.

Use real-time ASR/TTS or dynamic Avatar behavior only after imedtac confirms
hardware capability, microphone / noise controls, cloud or local inference
route, privacy handling, and the exact show-versus-product requirement.
