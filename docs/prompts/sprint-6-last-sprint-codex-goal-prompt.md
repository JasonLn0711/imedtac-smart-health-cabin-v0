# Last Sprint Codex Goal Prompt

```text
You are Codex working inside:

/home/jnclaw/every_on_git_jnclaw/phd-life-system/imedtac-smart-health-cabin-v0

Primary goal:
Close Phase 1 after Sprint 0-5 by freezing release evidence and preparing
stakeholder handoff.

This is not a feature sprint. Do not add new modules unless they repair a
documented release blocker.

Read first:
- docs/prompts/sprint-5-codex-goal-prompt.md
- docs/handoff/sprint-0-4-to-sprint-5-plus-handoff.md
- docs/devlog/README.md
- docs/dev/LOCAL_DEV.md

Tasks:
1. Confirm Sprint 5 evidence:
   - five-run demo evidence;
   - provider live acceptance matrix;
   - public report safety evidence;
   - item 9 support route evidence;
   - outbox/Redpanda evidence;
   - fallback/rollback evidence.
2. Write or update:
   - docs/evidence/sprint-5-five-run-demo.md
   - docs/ops/LIVE_PROVIDER_RUNBOOK.md
   - docs/ops/ROLLBACK_AND_FALLBACK.md
   - docs/api/API_SUMMARY.md
   - docs/db/ERD_SUMMARY.md
   - docs/phase2/ACTIVATION_PLAN.md
3. Write stakeholder handoff:
   - capability;
   - evidence;
   - scope controls;
   - next validation layer.
4. Run validation:
   - corepack pnpm validate:json
   - corepack pnpm lint
   - corepack pnpm typecheck
   - corepack pnpm build
   - corepack pnpm test
   - git diff --check
5. Write closeout devlog:
   - docs/devlog/<date>-phase-1-release-closeout.md
   or the repo's existing daily devlog convention.

Definition of done:
- Phase 1 evidence is discoverable;
- stakeholder can understand current capability without scanning the repo;
- Phase 2 lanes are explicit;
- no Phase 2 implementation is mixed into release closeout;
- blockers are exact if release cannot close.

Final response:
- status: complete / partial / blocked
- evidence files changed
- validation commands/results
- stakeholder handoff summary
- Phase 2 recommended first lane
- exact blockers
```

