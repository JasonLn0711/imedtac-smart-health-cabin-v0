# Outbox Worker Placeholder

Sprint 0 keeps this as a future event-publishing placeholder only.

Sprint 4 activation owns:

- polling `outbox_events`;
- publishing questionnaire, report, agent, and audit events to Redpanda;
- recording publish result metadata.

Scope control: Redpanda must stay outside the kiosk completion path. A Redpanda
failure must not block PHQ-9 questionnaire completion.
