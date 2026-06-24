# Questionnaire Module Research Packet

## Module Identity

- Module: questionnaire
- Packet role: evaluate open-source candidates for public-health questionnaire,
  branching, scoring, versioning, and report-generation support.
- Smart Health Cabin relationship: optional customer-selectable module that can
  run alone or combine with hearing, vision, and Avatar guidance.

## Project Context

The questionnaire module should become the structured public-health
self-assessment backbone. It should support reviewed forms, versioned questions,
branching, answer capture, and report-ready prompts while staying inside
self-assessment / staff-review scope.

The current design direction is to use HPA adult preventive health form fields
and WHO STEPS-style public-health references after source review, not to invent
an ungrounded medical questionnaire.

This module should connect to:

- `../hearing-module/README.md` when sensory results should appear in the report;
- `../vision-module/README.md` when sensory results should appear in the report;
- `../live-avatar-module/README.md` when Avatar guides question flow;
- `../module-event-layer/README.md` for answer and report events.

## Research Question

Can an open-source GitHub project provide a useful baseline for questionnaire
definition, branching, scoring, answer storage, versioning, localization,
review workflow, or report generation?

## Output Contract Draft

| Field | Purpose |
| --- | --- |
| `module_id=questionnaire` | Identifies this module |
| `questionnaire_session_id` | Links answers in one cabin session |
| `form_id` | Identifies HPA / WHO / customer form |
| `form_version` | Preserves question and scoring version |
| `answers` | Structured answer list |
| `score_trace` | Optional score/rule trace when used |
| `risk_factor_summary` | Non-diagnostic public-health summary |
| `follow_up_prompt` | Staff-review or healthcare-professional follow-up prompt |
| `quality_flag` | Records complete, incomplete, skipped, or needs_review |
| `reviewer_state` | Tracks draft / staff-reviewed / published |

## Candidate Table

| Candidate repo | License | Useful part | Adaptation needed | Fit | Decision |
| --- | --- | --- | --- | --- | --- |
| pending | pending | pending | pending | pending | pending |

## Fit Criteria

- Form definitions are versionable and reviewable.
- Branching and scoring are transparent.
- Commercial adaptation and deployment obligations are clear.
- Output can become structured event/report payloads.
- The module can run without hearing, vision, or Avatar.
- Avatar can consume the current question state when enabled.

## Scope Controls

This module supports public-health questionnaire, risk-factor self-assessment,
health education prompts, and staff-review workflow. It does not provide
autonomous diagnosis, treatment advice, or unreviewed medical triage.

## Relationship To Other Packets

| Other packet | Relationship |
| --- | --- |
| Hearing | Hearing results can be included as structured report context |
| Vision | Vision results can be included as structured report context |
| Live Avatar | Avatar can present questions and clarify completion state |
| Module event layer | Receives answer, score, and report events |

## Next Gate

Append candidate GitHub repos, then choose one of:

- adapt;
- reference only;
- reject;
- custom minimal questionnaire engine.
