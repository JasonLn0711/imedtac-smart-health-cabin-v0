---
id: 2026-06-24-smart-health-cabin-mvp-monorepo-redpanda-architecture-note
title: "2026-06-24 Smart Health Cabin MVP Monorepo And Redpanda Architecture Note"
date: 2026-06-24
topic: smart-health-cabin
type: architecture-reference-note
status: reference
source:
  - ./README.md
  - ./reuse-from-ai-triage.md
  - ../../docs/repo-relationships.md
  - ../../../imedtac-ai-triage-kiosk-v0/docs/architecture-insertion-and-clinical-grounding.md
  - ../../../imedtac-ai-triage-kiosk-v0/docs/smart-health-cabin-project-moved.md
  - ../../../planning-everything-track/data/projects/2026-06-imedtac-smart-health-cabin.md
---

# 2026-06-24 Smart Health Cabin MVP Monorepo And Redpanda Architecture Note

## Record Purpose

This note preserves today's architecture thinking for the Smart Health Cabin
software lane. It is a reference design, not a delivery commitment. Future
implementation can reuse these concepts while still changing folder names,
module names, infrastructure choices, or deployment details after scope, budget,
ownership, and delivery path are confirmed.

## 中文讀法與結論

這份紀錄保存今天對「四個模組加上 Redpanda，MVP 階段要不要拆成多個
repo」的思考、提問、理解與回答。它是架構參考，不是已經承諾給
慧誠智醫（imedtac Co., Ltd.）的交付規格，也不代表一定要照著這些名稱
或目錄執行。

目前最穩的 MVP 預設是：

```text
一個 Smart Health Cabin monorepo
清楚的模組邊界
modular monolith backend
PostgreSQL 作為主要查詢與報告資料庫
Redpanda 作為事件與 worker 消費基礎設施
Docker Compose 作為第一階段部署方式
```

核心判斷是：先做「可拆的單體」，不要一開始做「拆碎的分散式系統」。
真正重要的是 module boundary、schema contract、event envelope、測試、
部署與除錯流程，而不是 repo 數量本身。

今天的可參考架構原則：

- 四個使用者模組先放在同一個 repo，同一個 backend 內分資料夾。
- 每個模組保留自己的 `router.py`、`service.py`、`schema.py`、測試與資料契約。
- 每個模組完成後先寫入 PostgreSQL，再發布事件到 Redpanda。
- Redpanda 是 infra，不是業務模組；MVP 不需要獨立 `redpanda-service` repo。
- 先固定 event envelope，比先拆 repo 更關鍵。
- report assembler 可以先成為同 repo 裡的獨立 worker process。
- Avatar 最可能成為未來第一個拆出去的模組，但前提是 ASR/TTS/LLM/GPU
  或獨立擴充需求真的出現。
- 多 repo 是後期 activation gate，條件是團隊、部署頻率、技術棧、權限、
  scaling、CI/CD、observability 都成熟。

這個紀錄和相關檔案的關係是：

```text
Smart Health Cabin repo = 完整架構參考與未來 implementation home
AI Triage repo = 可重用 API/schema/report/source-governance discipline
planning repo = locator、status、capacity、next gate
```

The recommendation is:

```text
MVP = one repo / monorepo
     + modular monolith backend
     + clear module boundaries
     + PostgreSQL as the main query/report database
     + Redpanda as messaging infrastructure
     + Docker Compose for first deployment
```

The design thesis is:

```text
Build a separable system before building a distributed system.
```

## Original Question

Jason's question:

> 我第一次參預大型軟體開發，請問依照軟體工程以及系統工程，以及資深軟體工程師的角度，你認為四個模組加上 Redpanda，都要寫在不同的獨立的 repo 當中嗎？還是寫進同一個 repo 就好呢？以 mvp 版本來說，怎麼樣迭代以及快速部署，在這個階段會最方便呢？

## Short Answer

For the MVP stage, use the same repo: a monorepo.

Do not begin by splitting the hearing module, vision module, questionnaire
module, Avatar interaction module, Redpanda consumer, admin surface, report
assembler, and shared contracts into separate repositories. That would move the
project from product validation into distributed-system maintenance before the
workflow is proven.

The stronger MVP architecture is:

```text
same repo
clear internal layers
independent module folders
independent interfaces
independent schemas
small tests per module
Redpanda as messaging infrastructure
PostgreSQL as main query and report database
```

Working name:

```text
modular monolith + event-driven boundary
```

## Repo Count Is Not Modularity

The key system question is not how many repos exist. The key system questions
are:

- Are module boundaries clear?
- Are data schemas stable enough to connect independently?
- Do modules communicate through explicit interfaces?
- Can each module be tested without the full system?
- Can a module be split out later without rewriting the product?
- Can the MVP be deployed and debugged quickly?

An over-split first design would look like this:

```text
vision-service repo
hearing-service repo
questionnaire-service repo
avatar-service repo
report-service repo
redpanda-infra repo
frontend repo
admin repo
shared-types repo
```

That structure can be valid later, but it creates unnecessary MVP cost:

- several CI/CD pipelines;
- cross-repo schema coordination;
- version dependency churn;
- harder local development;
- cross-service log tracing;
- deployment ordering issues;
- more infrastructure work before the product workflow is proven.

The immediate product goal is to prove that four modules can generate data,
converge into a report, support staff/human review, and run in a demo or pilot
environment.

## Recommended MVP Repo Shape

A fuller monorepo structure can be:

```text
smart-health-cabin/
  apps/
    api/
      app/
        main.py
        routes/
          vision.py
          hearing.py
          questionnaire.py
          avatar.py
          sessions.py
          reports.py
        services/
          vision_service.py
          hearing_service.py
          questionnaire_service.py
          avatar_service.py
          report_service.py
        events/
          publisher.py
          schemas.py
          topics.py
        db/
          models.py
          repositories.py
          migrations/
        workers/
          report_assembler.py

    kiosk-web/
      src/
        pages/
        components/
        api-client/

    admin-web/
      src/

  packages/
    contracts/
      event_envelope.schema.json
      vision_result.schema.json
      hearing_result.schema.json
      questionnaire_result.schema.json
      avatar_turn.schema.json

    shared/
      ids.py
      time.py
      validation.py

  infra/
    docker-compose.yml
    redpanda/
      topics.sh
    postgres/
      init.sql

  tests/
    unit/
    integration/
    e2e/

  docs/
    architecture.md
    event-contracts.md
    deployment.md
```

A smaller first pass can be:

```text
smart-health-cabin/
  backend/
    app/
      modules/
        vision/
        hearing/
        questionnaire/
        avatar/
      events/
      reports/
      db/
      workers/
  frontend/
  infra/
  docs/
  tests/
```

The important MVP principle is:

```text
one repo
one Docker Compose stack
one CI path
one schema-contract set
one local startup flow
```

## Redpanda Boundary

Redpanda should not be a separate business repo in the MVP.

It is infrastructure. The repo only needs to own how the infrastructure is
started, how topics are created, how the backend publishes events, how workers
consume events, and how event schemas are versioned.

Minimal file ownership:

```text
infra/docker-compose.yml
infra/redpanda/topics.sh
apps/api/app/events/publisher.py
apps/api/app/workers/report_assembler.py
packages/contracts/*.schema.json
```

Create a separate Redpanda/event-platform repo only if the project later builds
a real event gateway, connector layer, schema registry service, or shared
platform capability across multiple delivery teams.

## Four Module Backend Shape

Each user-facing module can live inside the same backend while preserving its
own boundary:

```text
modules/
  vision/
    router.py
    service.py
    schema.py
    tests.py

  hearing/
    router.py
    service.py
    schema.py
    tests.py

  questionnaire/
    router.py
    service.py
    schema.py
    tests.py

  avatar/
    router.py
    service.py
    schema.py
    tests.py
```

Possible first API surface:

```text
POST /sessions
POST /sessions/{session_id}/vision/result
POST /sessions/{session_id}/hearing/result
POST /sessions/{session_id}/questionnaire/answer
POST /sessions/{session_id}/avatar/turn
GET  /sessions/{session_id}/report
```

Each module completion should do two things:

```text
1. write the result to PostgreSQL
2. publish a module event to Redpanda
```

Example:

```text
hearing_result saved to PostgreSQL
hearing.test.completed event published to Redpanda
```

This gives the MVP both query/report stability and future separability.

## Event Contract Comes Before Repo Splitting

The most important early architecture artifact is the event contract, not the
repo split.

All modules should publish through one event envelope:

```json
{
  "event_id": "evt_001",
  "event_type": "hearing.test.completed",
  "event_version": 1,
  "occurred_at": "2026-06-24T16:30:00+08:00",
  "tenant_id": "taipei-city",
  "site_id": "health-center-001",
  "kiosk_id": "cabin-001",
  "session_id": "sess_001",
  "module": "hearing",
  "payload": {},
  "trace": {
    "request_id": "req_001",
    "module_run_id": "run_001"
  }
}
```

If this contract stays stable, a future `hearing` service can move out of the
monolith and keep publishing the same event shape. The rest of the system can
continue to work with minimal change.

## MVP Deployment

The recommended first deployment is Docker Compose on one host.

First runtime stack:

```text
api
frontend
worker-report-assembler
postgres
redpanda
redpanda-console
```

System flow:

```text
[frontend] ---> [api] ---> [PostgreSQL]
                    |
                    v
                [Redpanda]
                    |
                    v
          [report-assembler worker]
                    |
                    v
              [PostgreSQL]
```

This stage should skip Kubernetes, service mesh, multi-repo CI/CD, and plugin
marketplace abstractions. The MVP needs a stable demo/pilot workflow first.

## Recommended Iteration Order

Stage 1: end-to-end flow.

```text
create session
complete questionnaire
submit vision result
submit hearing result
record one Avatar interaction
assemble simple report
let admin/staff view report
```

At this stage Redpanda only needs to record module events and let the report
worker consume those events.

Stage 2: module activation.

```json
{
  "enabled_modules": ["vision", "hearing", "questionnaire", "avatar"]
}
```

Customer-specific activation can look like:

```json
{
  "enabled_modules": ["questionnaire", "vision"]
}
```

The API should use this configuration to decide which workflow steps are active.

Stage 3: observability.

```text
request_id
session_id
event_id
module_run_id
error_code
event publish status
worker consume status
```

Stage 4: separate worker process.

```text
api process
worker process
same repo
same codebase
different container command
```

Stage 5: split services only when needed. The Avatar module is the most likely
first split candidate if it becomes a voice-streaming, ASR, TTS, LLM-agent, or
GPU-dependent service.

## When Multi-Repo Becomes Worth It

Split modules into separate repos only when several of these become true:

- different teams own different modules;
- modules require independent deployment frequency;
- a module needs a different technology stack;
- a module needs independent security review or vendor handoff;
- a module has a clearly different scaling profile;
- event contracts are stable and not changing daily;
- CI/CD is mature;
- production observability exists.

MVP assessment:

| Module | MVP independent repo? | Reason |
| --- | ---: | --- |
| Questionnaire | No | Stable CRUD/schema/content workflow. |
| Vision | No | MVP likely starts as web-based test and result capture. |
| Hearing | No | MVP can start with WebAudio or speaker-based screening support. |
| Avatar | Not yet | Most likely future split if ASR/TTS/LLM/GPU scope becomes real. |
| Report assembler | No separate repo | Good candidate for a separate worker process in the same repo. |
| Redpanda | No | Infrastructure, not a business module. |

## Recommended MVP Form

Best current shape:

```text
Monorepo
Modular monolith backend
Independent frontend app
One report worker
PostgreSQL
Redpanda
Docker Compose deployment
```

Convenient repo skeleton:

```text
smart-health-cabin/
  apps/api
  apps/kiosk-web
  apps/admin-web
  apps/report-worker
  packages/contracts
  infra/docker-compose.yml
```

Developer commands can stay simple:

```text
docker compose up -d
make dev
make test
make smoke
```

## Senior-Engineer Evaluation Questions

A senior software engineer would not start with "microservices or not." The
better questions are:

- What changes most often?
- Who maintains each module?
- How will the team debug a failed report?
- How will the team deploy safely?
- Who breaks when a schema changes?
- How does the system recover on site?
- Is each result traceable?
- Can reports be rebuilt?
- Can events be replayed?
- Can a customer buy only two modules and still run a coherent workflow?

The resulting principle:

```text
Use monorepo to keep development fast.
Use module boundaries to keep architecture clear.
Use event contracts to keep future splitting possible.
Use Redpanda for replay and module decoupling when it earns its place.
Use PostgreSQL for stable reporting and query paths.
```

One-line synthesis:

```text
MVP first builds a separable monolith, not a prematurely fragmented distributed system.
```

## Connection Map

| File | Connection |
| --- | --- |
| `workstreams/smart-health-cabin/README.md` | Keeps this as Smart Health Cabin work, not AI Triage implementation. |
| `workstreams/smart-health-cabin/reuse-from-ai-triage.md` | Reuses AI Triage architecture discipline and report/questionnaire patterns without changing the AI Triage API. |
| `workstreams/smart-health-cabin/post-meeting-decision-log.md` | Future decisions can promote or reject this reference architecture after owner confirmation. |
| `docs/repo-relationships.md` | Confirms this repo is the Smart Health Cabin execution workspace. |
| `../imedtac-ai-triage-kiosk-v0/docs/architecture-insertion-and-clinical-grounding.md` | Provides measured-context-first and staff-review workflow lessons. |
| `../imedtac-ai-triage-kiosk-v0/docs/smart-health-cabin-project-moved.md` | Confirms Smart Health Cabin material should live here, with AI Triage as adjacent context only. |
| `../planning-everything-track/data/projects/2026-06-imedtac-smart-health-cabin.md` | Planning locator should link here for status and next gate without copying implementation detail. |

## Scope Control

This note does not decide the final API, final folder names, production
infrastructure, clinical validation path, or external commitment to imedtac.
It records a strong MVP default: keep one repo, define module boundaries, define
event contracts early, deploy simply, and split only after real ownership,
scaling, security, or deployment pressure appears.
