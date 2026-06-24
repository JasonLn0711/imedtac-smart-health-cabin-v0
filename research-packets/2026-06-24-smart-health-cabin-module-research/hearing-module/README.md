# Hearing Module Research Packet

## Module Identity

- Module: hearing
- Packet role: evaluate open-source candidates for guided hearing self-check /
  screening-support workflow.
- Smart Health Cabin relationship: optional customer-selectable module that can
  run alone or contribute to a combined cabin report.

## Project Context

The Smart Health Cabin project is a modular system. The hearing module should
support guided interaction, structured result capture, quality flags, and
report-ready output without forcing the customer to enable vision,
questionnaire, or Avatar modules.

The module should connect to:

- `../vision-module/README.md` when combined sensory screening is enabled;
- `../questionnaire-module/README.md` when questionnaire answers need hearing
  context;
- `../live-avatar-module/README.md` when the Avatar guides the user through
  hearing instructions;
- `../module-event-layer/README.md` for structured event/report output.

## Research Question

Can an open-source GitHub project provide a safe, adaptable baseline for hearing
workflow, browser audio control, response capture, calibration notes, or result
visualization?

## Output Contract Draft

| Field | Purpose |
| --- | --- |
| `module_id=hearing` | Identifies this module |
| `hearing_session_id` | Links hearing events in one cabin session |
| `test_mode` | Records screening-support mode, not diagnostic audiometry |
| `stimulus_profile` | Records frequency/volume/script profile when available |
| `response_summary` | Captures user response structure |
| `environment_quality_flag` | Records noisy, incomplete, skipped, or usable |
| `report_text` | Adds non-diagnostic report wording |
| `module_version` | Preserves release trace |
| `reviewer_state` | Tracks draft / staff-reviewed / published |

## Candidate Table

| Candidate repo | License | Useful part | Adaptation needed | Fit | Decision |
| --- | --- | --- | --- | --- | --- |
| pending | pending | pending | pending | pending | pending |

## Fit Criteria

- Browser or device audio workflow is inspectable and adaptable.
- Output can be reduced to structured screening-support results.
- Wording avoids formal medical-grade hearing diagnosis unless validation is
  separately approved.
- The module can operate without questionnaire or Avatar.
- The module can be guided by Avatar when enabled.
- The module can produce event payloads for the shared event layer.

## Scope Controls

This module supports guided hearing self-check and staff-review reporting. It
does not claim formal pure-tone audiometry, medical diagnosis, or clinical
hearing-loss classification without a separate validation path.

## Relationship To Other Packets

| Other packet | Relationship |
| --- | --- |
| Vision | Parallel sensory module; can share report layout and quality-flag language |
| Questionnaire | Can provide context for public-health or accessibility prompts |
| Live Avatar | Avatar can deliver instructions and retry prompts |
| Module event layer | Receives hearing result events and exposes them to report assembly |

## Next Gate

Append candidate GitHub repos, then choose one of:

- adapt;
- reference only;
- reject;
- custom minimal module.
