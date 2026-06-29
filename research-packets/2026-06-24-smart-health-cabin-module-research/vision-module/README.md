# Vision Module Research Packet

## Module Identity

- Module: vision
- Packet role: evaluate open-source candidates for guided vision self-check /
  screening-support workflow.
- Smart Health Cabin relationship: optional customer-selectable module that can
  run alone or contribute to a combined cabin report.

## Project Context

The vision module should provide a clear, structured self-check flow that
records test context, result, quality state, and report-ready text. It should be
deployable as one module inside the Smart Health Cabin, not as a dependency that
forces the rest of the system to exist.

The module should connect to:

- `../hearing-module/README.md` for combined sensory screening;
- `../questionnaire-module/README.md` for questionnaire context;
- `../live-avatar-module/README.md` for guided instructions;
- `../module-event-layer/README.md` for structured event/report output.

## Research Question

Can an open-source GitHub project provide a useful baseline for vision chart
display, response capture, calibration prompts, accessibility, or result
formatting?

## Output Contract Draft

| Field | Purpose |
| --- | --- |
| `module_id=vision` | Identifies this module |
| `vision_session_id` | Links vision events in one cabin session |
| `test_type` | Records chart / color / contrast / other supported mode |
| `display_context` | Records screen size, distance assumption, or calibration note |
| `response_summary` | Captures user response structure |
| `quality_flag` | Records usable, incomplete, skipped, or needs_review |
| `report_text` | Adds non-diagnostic report wording |
| `module_version` | Preserves release trace |
| `reviewer_state` | Tracks draft / staff-reviewed / published |

## Candidate Table

| Candidate repo | License | Useful part | Adaptation needed | Fit | Decision |
| --- | --- | --- | --- | --- | --- |
| pending | pending | pending | pending | pending | pending |

## Fit Criteria

- Vision test flow can be adapted to kiosk screen and distance constraints.
- Output can be represented as structured screening-support data.
- The module can run without hearing, questionnaire, or Avatar.
- Calibration and environment assumptions are explicit.
- The report contribution stays within self-check / staff-review scope.

## Scope Controls

This module supports guided vision self-check and report contribution. It does
not claim formal ophthalmology diagnosis, validated visual acuity measurement,
or medical-device-grade screening unless a separate validation path is approved.

## Relationship To Other Packets

| Other packet | Relationship |
| --- | --- |
| Hearing | Parallel sensory module and shared report section pattern |
| Questionnaire | Vision result can inform follow-up prompts or public-health report context |
| Live Avatar | Avatar can guide setup, distance, instructions, and retry prompts |
| Module event layer | Receives vision result events and exposes them to report assembly |

## Next Gate

Append candidate GitHub repos, then choose one of:

- adapt;
- reference only;
- reject;
- custom minimal module.
