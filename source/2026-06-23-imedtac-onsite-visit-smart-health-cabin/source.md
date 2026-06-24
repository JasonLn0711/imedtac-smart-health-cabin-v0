---
id: 2026-06-23-imedtac-onsite-visit-smart-health-cabin
title: "2026-06-23 imedtac Onsite Visit And Smart Health Cabin Meeting"
date: 2026-06-23
topic: ai-triage
type: source
status: preserved
source_owner: user-provided
meeting_time: "14:59 Asia/Taipei"
channel: onsite meeting
participants:
  - 慧誠智醫（imedtac Co., Ltd.）
  - NYCU / Jason
  - 多寶
raw_files:
  - 2026-06-23-imedtac-onsite-visit-smart-health-cabin-transcript-corrected-verified-agent-readable.md
related:
  - ../../workstreams/smart-health-cabin/README.md
  - ../../workstreams/smart-health-cabin/post-meeting-decision-log.md
  - ../../workstreams/smart-health-cabin/2026-06-23-onsite-discovery-plan.md
  - ../2026-06-17-imedtac-smart-health-cabin-requirements/source.md
  - ../2026-06-19-wu-tomi-ai-triage-smart-health-cabin-ip-sync/source.md
---

# 2026-06-23 imedtac Onsite Visit And Smart Health Cabin Meeting

## Source Boundary

This source bundle preserves the user-provided corrected and verified Markdown
transcript for the `2026-06-23 14:59` onsite 慧誠智醫（imedtac Co., Ltd.）
visit and Smart Health Cabin meeting.

The transcript is copied source evidence for internal analysis and future agent
reading. It is not an external handoff, final feasibility response, quotation,
clinical validation plan, medical-device claim, hospital-facing commitment, or
approval to change the existing AI Triage two-endpoint demo API.

## Preserved File

| Local file | Original source path | SHA-256 |
| --- | --- | --- |
| `2026-06-23-imedtac-onsite-visit-smart-health-cabin-transcript-corrected-verified-agent-readable.md` | `/Users/iKev/Downloads/transcript_260623_1459_慧誠智醫_參訪與會議_corrected_verified.md` | `f557b74f0a48b0c04a3b446cc1a7f29fc3cbdb5165ec5e2bfbd12f9f73663aa9` |

Original Downloads SHA-256 before repo whitespace normalization:
`3e55f93252d1b0633323aedf6ba36371ae7052460e137206b6928a09877be11c`.

The repo copy removes Markdown trailing spaces so `git diff --check` remains
clean; the original Downloads file is unchanged.

## Agent Reading Notes

- Treat this transcript as source evidence with explicit correction limits:
  the file states that the original audio was not available for acoustic
  re-listening, and uncertain terms remain marked for audio confirmation.
- Start derived work from
  `../../workstreams/smart-health-cabin/post-meeting-decision-log.md` after
  checking this source.
- Preserve the post-meeting scope split: the four user-facing modules are
  hearing, vision, questionnaire, and Avatar interaction.
- Treat data integration, integrated reports, QR Code, HIS/API/JSON, database,
  and CMS as cross-module integration layers, not as a fifth user-facing module.
- Keep the current AI Triage API contract unchanged unless a separate recorded
  imedtac change-control discussion starts.
- Keep patient-facing and company-facing wording inside demo, screening
  support, workflow support, and human-review boundaries.

## Core Source Reading

The corrected transcript states that the meeting scope should be understood as
four user-facing modules:

1. hearing module;
2. vision module;
3. questionnaire module;
4. Avatar interaction module.

The Avatar module is described as a voice-enabled interaction surface over the
questionnaire flow: the person can speak with the computer Avatar, the Avatar
can ask questionnaire items, listen to the person's answer, and help input the
answer.

The corrected transcript also keeps data integration and presentation as a
cross-module layer: integrated health report, QR Code, HIS/API/JSON, database,
and CMS connection.
