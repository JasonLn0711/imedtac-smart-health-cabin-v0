# Outbox Worker

Sprint 4 implements the first outbox worker for Redpanda publishing.

- polling `outbox_events`;
- publishing questionnaire, report, agent, and audit events to Redpanda;
- recording publish result metadata.

Scope control: Redpanda must stay outside the kiosk completion path. A Redpanda
failure must not block PHQ-9 questionnaire completion.

Run one batch:

```bash
pnpm --filter @shc/outbox-worker start
```

Topics:

```text
shc.questionnaire.responses.v1
shc.agent.turns.v1
shc.report.events.v1
shc.audit.events.v1
```
