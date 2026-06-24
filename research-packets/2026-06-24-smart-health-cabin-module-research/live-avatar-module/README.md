# Live Avatar Interaction Module Research Packet

## Module Identity

- Module: live Avatar interaction
- Packet role: evaluate open-source candidates for realtime Avatar guidance,
  education, navigation, and module-completion support.
- Smart Health Cabin relationship: optional customer-selectable interaction
  layer that can guide hearing, vision, questionnaire, or standalone education
  flows.

## Project Context

The Avatar module should make the cabin easier to use. It should guide users,
explain steps, support education, and record interaction state. It should not
own clinical logic for hearing, vision, or questionnaire modules.

This module should connect to:

- `../hearing-module/README.md` for hearing instructions and retry prompts;
- `../vision-module/README.md` for vision setup and instruction prompts;
- `../questionnaire-module/README.md` for question presentation and completion
  state;
- `../module-event-layer/README.md` for interaction events and report
  completion state.

## Research Question

Can an open-source GitHub project provide a useful baseline for live Avatar UI,
speech interaction, prompt scripting, text-to-speech, animation, session state,
or guided kiosk interaction?

## Output Contract Draft

| Field | Purpose |
| --- | --- |
| `module_id=live_avatar` | Identifies this module |
| `avatar_session_id` | Links Avatar events in one cabin session |
| `guided_module_id` | Records which module the Avatar is guiding |
| `prompt_id` | Versioned prompt or script step |
| `interaction_state` | Started, instruction_given, retry, completed, handed_off |
| `user_response_summary` | Structured response or completion signal |
| `handoff_note` | Staff-review or next-step note when needed |
| `quality_flag` | Records usable, fallback_text_only, skipped, or needs_review |
| `module_version` | Preserves Avatar / prompt version |

## Candidate Table

| Candidate repo | License | Useful part | Adaptation needed | Fit | Decision |
| --- | --- | --- | --- | --- | --- |
| pending | pending | pending | pending | pending | pending |

## Fit Criteria

- Avatar can run as an optional module.
- Prompt scripts are versionable and reviewable.
- The module can degrade to text-only guidance.
- It can consume enabled-module state without owning the module logic.
- It can record structured interaction events.
- It avoids unreviewed medical advice and stays in guidance / education scope.

## Scope Controls

This module supports live guidance, education, navigation, and completion
support. It does not provide autonomous diagnosis, treatment advice, medical
triage, or independent clinical decision-making.

## Relationship To Other Packets

| Other packet | Relationship |
| --- | --- |
| Hearing | Avatar can guide instructions, retries, and completion |
| Vision | Avatar can guide setup, distance, instructions, and retries |
| Questionnaire | Avatar can present questions and explain completion state |
| Module event layer | Receives Avatar interaction events and exposes them to report assembly |

## Next Gate

Append candidate GitHub repos, then choose one of:

- adapt;
- reference only;
- reject;
- text-first custom guide module.
