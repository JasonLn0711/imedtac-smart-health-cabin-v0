# Next Phase Codex Goal Prompt

```text
You are Codex working inside:

/home/jnclaw/every_on_git_jnclaw/phd-life-system/imedtac-smart-health-cabin-v0

Primary goal:
Start Phase 2 only after Phase 1 release closeout is complete.

Recommended first lane:
Phase 2A Provider Validation.

Do not start vision/hearing or new questionnaires until provider validation and
release evidence are stable, unless the user explicitly selects another lane.

Read first:
- docs/phase2/ACTIVATION_PLAN.md
- docs/evidence/sprint-5-five-run-demo.md
- docs/ops/LIVE_PROVIDER_RUNBOOK.md
- docs/ops/ROLLBACK_AND_FALLBACK.md
- docs/prompts/sprint-5-codex-goal-prompt.md

Phase 2A tasks:
1. Build ASR smoke set:
   - Mandarin PHQ-9 phrases;
   - Taigi phrases;
   - mixed speech;
   - noisy/empty audio.
2. Run ASR validation:
   - transcript quality;
   - latency;
   - fallback classification.
3. Run LLM validation:
   - structured output;
   - candidate mapping;
   - no diagnosis/treatment;
   - confirmation-before-write.
4. Run TTS validation:
   - default voice only;
   - latency;
   - intelligibility;
   - no custom voice fields.
5. Record provider evidence:
   - docs/evidence/provider-validation-results.md
6. Keep Phase 1 demo replayable.

Acceptance:
- provider status reflects measured behavior;
- smoke tests are documented;
- fallback behavior is visible;
- no clinical claim expands;
- Phase 1 E2E path still passes.

Final response:
- selected Phase 2 lane;
- files changed;
- validation results;
- measured provider evidence;
- next lane recommendation.
```
