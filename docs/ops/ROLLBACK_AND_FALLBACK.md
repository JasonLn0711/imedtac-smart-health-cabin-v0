---
id: smart-health-cabin-rollback-and-fallback
title: "Rollback And Fallback"
date: 2026-07-10
topic: smart-health-cabin
type: ops-runbook
status: active
---

# Rollback And Fallback

Smart Health Cabin keeps the live voice layer as an operator-controlled
capability. The questionnaire, scoring, public report, and outbox rows remain
the stable product spine.

## Runtime Fallback

| Layer | Fallback | Acceptance meaning |
| --- | --- | --- |
| ASR | Touch input remains available. | Useful for continuity, not Sprint 5 live proof. |
| LLM | Deterministic guidance / rejection and touch input remain available. | Useful for safety, not Sprint 5 live proof. |
| TTS | BreezyVoice default voice / cached fixed prompts / text-only display remain available. | Useful for continuity and reference, not CosyVoice3 live proof. |
| Redpanda | Outbox rows remain pending and retryable. | Useful for recovery, not publish proof. |

Current product path: CosyVoice3 streaming is the next production TTS
candidate. BreezyVoice remains the operational fallback, regression baseline,
research lane, and Taiwan Mandarin quality reference until CosyVoice3 passes
live provider and real-room voice acceptance gates.

To rollback TTS while preserving the voice-first questionnaire code path:

```bash
TTS_PROVIDER=breezyvoice_default
TTS_SERVICE_URL=http://localhost:8012
TTS_SYNTHESIZE_PATH=/v1/tts/synthesize
```

This rollback is continuity behavior, not CosyVoice3 live acceptance evidence.

## Rollback Path

1. Set `VOICE_PROVIDER_MODE=mock` to restore deterministic local testing.
2. Keep `ALLOW_MOCK_PROVIDERS=false` when preparing acceptance evidence.
3. Restart API after changing provider env.
4. Confirm provider status at `/api/v1/providers/status`.
5. Run `corepack pnpm smoke:api`; run `corepack pnpm live:check` only for live
   acceptance.

Rollback preserves questionnaire submission, server-side PHQ-9 scoring, item 9
human-review routing, public report filtering, and outbox retry ownership.
