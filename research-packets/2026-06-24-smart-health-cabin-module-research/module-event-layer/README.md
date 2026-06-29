# Module Event Layer Research Packet

## Module Identity

- Module: module event layer / small Kafka-like structure
- Packet role: define how hearing, vision, questionnaire, and live Avatar
  modules exchange structured information and contribute to the integrated
  report.
- Smart Health Cabin relationship: shared infrastructure layer, not a
  customer-facing module by itself.

## Project Context

The four user-facing modules need a common data structure so customers can
enable any module combination without breaking the report, QR access, export,
or future HIS-ready path.

The default recommendation is a small module event/report layer first. Kafka or
Kafka-like infrastructure becomes useful only when real deployment needs
multiple consumers, replay, ordering, event fan-out, or cross-service scale.

## Research Question

What is the smallest shared structure that preserves module independence and
future growth without overbuilding the first delivery?

## Minimum Event Envelope

| Field | Purpose |
| --- | --- |
| `session_id` | Connects all module events in one cabin session |
| `module_id` | Identifies hearing, vision, questionnaire, or live Avatar |
| `event_type` | Records started, completed, result_generated, report_added, review_changed |
| `payload_version` | Keeps result schema version explicit |
| `payload` | Stores module-specific structured result |
| `source_module_version` | Preserves module release / model / question / prompt version |
| `quality_flag` | Records usable, noisy, incomplete, skipped, or needs_review |
| `reviewer_state` | Records draft, staff_reviewed, published, or rejected |
| `created_at` | Supports ordering and audit |

## Candidate Technical Shapes

| Shape | Best for | Cost | Decision gate |
| --- | --- | --- | --- |
| Append-only database table | MVP report assembly and audit trail | Low | Default first choice if one backend owns report assembly |
| JSONL event log | Local demo / simple traceability | Low | Useful for prototype and source-backed research |
| Simple queue | Module tasks and async processing | Medium | Use when modules need background processing |
| Kafka / Redpanda / NATS-class streaming | Multi-consumer, replay, ordering, realtime fan-out | Higher | Use only after deployment need is confirmed |

## Output Contract Draft

| Field | Purpose |
| --- | --- |
| `cabin_session_id` | Top-level session record |
| `enabled_modules` | Customer-selected module list |
| `events` | Append-only module events |
| `report_sections` | Generated report contribution per module |
| `qr_report_state` | Draft, available, expired, revoked |
| `export_state` | Not requested, generated, delivered, failed |
| `reviewer_state` | Draft, staff-reviewed, published |

## Relationship To Other Packets

| Other packet | Relationship |
| --- | --- |
| Hearing | Receives hearing result and quality events |
| Vision | Receives vision result and quality events |
| Questionnaire | Receives answer, scoring, and report events |
| Live Avatar | Receives guidance and interaction events |

## Scope Controls

The event layer structures and routes module outputs. It does not create
clinical claims, replace reviewer judgment, or require a full Kafka deployment
before the architecture has proven need.

## Next Gate

After module candidate research is added, choose:

- append-only table;
- JSONL prototype log;
- simple queue;
- Kafka-like streaming proof-of-concept.

## Related Architecture Note

The MVP monorepo / Redpanda reference design is recorded in:

```text
../../../workstreams/smart-health-cabin/2026-06-24-mvp-monorepo-redpanda-architecture-note.md
```

That note keeps Redpanda as reference architecture, not an external delivery
commitment. It recommends one repo, modular monolith boundaries, PostgreSQL for
query/report stability, event contracts for future separability, and service
splitting only after ownership, scaling, security, or deployment pressure
appears.
