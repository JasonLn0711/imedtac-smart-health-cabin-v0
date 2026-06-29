---
id: 2026-06-23-expert-four-module-sdd-prep-note
title: "2026-06-23 Expert Planning - Four Module MVP And SDD Preparation"
date: 2026-06-23
topic: smart-health-cabin
type: source
status: preserved
source_owner: user-provided
language: zh-TW
related:
  - ../../workstreams/smart-health-cabin/four-module-mvp-sdd-prep-spec.md
  - ../../workstreams/smart-health-cabin/post-meeting-decision-log.md
  - ../../workstreams/smart-health-cabin/module-a-vision-hearing-discovery.md
  - ../../workstreams/smart-health-cabin/module-b-questionnaire-triage-discovery.md
  - ../../workstreams/smart-health-cabin/module-c-avatar-interaction-discovery.md
  - ../../workstreams/smart-health-cabin/mvp-questionnaire-system-architecture.md
---

# 2026-06-23 Expert Planning - Four Module MVP And SDD Preparation

## Source Boundary

This file preserves the user-provided planning direction for the Smart Health
Cabin four-module MVP and SDD preparation. It is an internal source record for
architecture scoping, module contracts, staged delivery, product packaging,
API/ERD planning, risk management, and acceptance-test framing.

This source is not a final SDD, production architecture approval, deployment
commitment, clinical-validation package, medical-device claim, hospital
integration contract, or source-code delivery commitment. The derived
workstream specification converts the planning content into an actionable
pre-SDD scope while preserving MVP boundaries.

## Preserved Planning Direction

The Smart Health Cabin should be designed around four selectable user-facing
modules:

1. 聽力模組 Hearing Module
2. 視力模組 Vision Module
3. 問卷模組 Questionnaire Module
4. Avatar 互動模組 Avatar Interaction Module

The Avatar module supports voice interaction with an on-screen avatar. It can
ask questionnaire items, listen to the resident's answer, normalize the answer
into allowed options, and submit the answer into the questionnaire workflow.

The four modules should be independently selectable according to customer need
or deployment scenario. The product direction resembles a microservice concept
from a product and contract-boundary point of view, but the MVP should not be
implemented as four independently deployed microservices. The recommended
architecture is:

```text
modular monolith first
microservice-ready boundaries later
```

The MVP should use one backend, one database, one deployment path, and module
packages with strong contracts. Each module should be independently enabled,
disabled, tested, accepted, replaced, quoted, and later extracted into a
service if the product reaches multi-site or multi-customer scale.

Data integration, QR Code report access, API/JSON export, future HIS-ready
mapping, CMS, sessions, consent, report generation, audit logs, and
observability are platform services. They are not a fifth user-facing module.

## Decisions To Preserve

1. Four user-facing modules are hearing, vision, questionnaire, and Avatar.
2. Report, QR Code, Session, API, CMS, storage, audit, and integration adapters
   are platform layers.
3. MVP uses a modular monolith, not true microservices.
4. Every module outputs a Standard Module Result.
5. Avatar is a controlled questionnaire interaction host, not an open clinical
   chatbot.
6. Questionnaire MVP supports fixed or limited reviewed forms before generic
   CMS breadth.
7. Vision MVP starts with direction recognition and color-vision support; it
   does not implement the full five-item professional vision workflow in one
   release.
8. Hearing MVP supports left/right sound recognition and basic self-screening;
   it does not claim formal hearing thresholds.
9. Report wording uses "需留意" and "建議諮詢專業人員"; it does not diagnose.
10. HIS is reserved as JSON/API export or mapping; September MVP does not
    perform live HIS writeback.
11. QR Code carries a short-lived token, not embedded health data.
12. SDD should expand from module contracts, APIs, ERD, test cases, risk
    matrix, security/privacy notes, and architecture decision records.

## MVP Delivery Shape

The target MVP keeps scope small enough for fast delivery:

- Kiosk Shell creates a session, collects consent, loads site config, displays
  enabled modules, and routes the user through selected flows.
- Hearing Module provides fixed-speaker self-screening support with conservative
  language.
- Vision Module provides touch-based self-screening support with conservative
  language.
- Questionnaire Module provides versioned structured questionnaires and source
  provenance.
- Avatar Module provides fixed-script or fixed-question voice support over the
  questionnaire module with touch fallback.
- Report Service combines module results into a non-diagnostic user report and
  a short-lived QR report token.
- Integration Adapter preserves future JSON/API export shape without live HIS
  writeback.

## SDD Preparation Direction

The SDD should contain:

```text
1. Introduction
2. Scope and Non-Scope
3. Stakeholders and RACI
4. System Context
5. Architecture Overview
6. Module Architecture
   6.1 Hearing Module
   6.2 Vision Module
   6.3 Questionnaire Module
   6.4 Avatar Interaction Module
7. Platform Services
8. Data Model / ERD
9. API Design
10. UI/UX Flow
11. Security and Privacy
12. Deployment Architecture
13. Observability and Logging
14. Error Handling
15. Test Plan
16. Acceptance Criteria
17. Risk and Compliance Notes
18. Future Extensions
19. Architecture Decision Records
```

The operating spirit is:

```text
small-step delivery
module independence
data structure first
conservative claims
extractable architecture
testable acceptance
```
