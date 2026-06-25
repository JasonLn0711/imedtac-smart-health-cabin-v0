---
id: smart-health-cabin-phase2-activation-plan
title: "Phase 2 Activation Plan"
date: 2026-07-10
topic: smart-health-cabin
type: activation-plan
status: active
---

# Phase 2 Activation Plan

Phase 2 begins after Sprint 5 evidence freezes the live questionnaire + static
Avatar + voice-provider + report + outbox path.

## Activation Order

1. Provider validation: stabilize the selected Gemma 4 E4B runtime
   (currently Ollama, with vLLM kept as an alternative), Breeze-ASR-26 int8,
   and BreezyVoice default voice under repeatable startup scripts.
2. Questionnaire expansion: add new validated questionnaire packages through
   the CMS/versioning path, not hard-coded forms.
3. Vision and hearing activation: keep each module standalone with explicit
   input, output, report section, and calibration controls.
4. Integration governance: add HIS/FHIR-ready export only after the report and
   event contracts are stable.

## Entry Gates

- Live provider status passes `corepack pnpm live:check`.
- Five-run demo evidence exists with live provider IDs and Redpanda publish
  confirmation.
- Public report continues to hide raw answers and diagnostic labels.
- Customized TTS voice remains outside the Phase 1 and Phase 2 default path
  until a separate consent, validation, and governance layer exists.
