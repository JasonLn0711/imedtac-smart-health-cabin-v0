# Local Development

## Install

```bash
pnpm install
```

If the `pnpm` shim is not on PATH, use Corepack:

```bash
corepack pnpm install
```

## PostgreSQL

```bash
docker compose -f infra/docker-compose.yml up -d postgres
pnpm --filter @shc/api-server migrate
```

Default local database URL:

```text
postgres://smart_health_cabin:smart_health_cabin_dev@localhost:5432/smart_health_cabin
```

## API

```bash
pnpm --filter @shc/api-server dev
```

Verify:

```bash
curl -fsS http://localhost:3000/healthz
curl -fsS http://localhost:3000/api/v1/questionnaires/active
curl -fsS -X POST http://localhost:3000/api/v1/questionnaire-responses \
  -H 'content-type: application/json' \
  --data @samples/phq9-response-low-risk.json
```

## Kiosk

```bash
pnpm --filter @shc/kiosk-web dev
```

Open:

```text
http://localhost:5173
```

The kiosk fetches the active questionnaire from the API when available and
falls back to the local PHQ-9 SurveyJS seed during frontend-only checks.

## Admin

```bash
pnpm --filter @shc/admin-web dev
```

Open:

```text
http://localhost:5174
```

Admin CMS / versioning is active in Sprint 2. Use it to validate SurveyJS JSON,
preview PHQ-9, create a draft version, and publish one active questionnaire
version.

## Redpanda / Outbox Worker

```bash
docker compose -f infra/docker-compose.yml up -d redpanda redpanda-console
pnpm --filter @shc/outbox-worker start
```

Redpanda Console:

```text
http://localhost:8080
```

The API writes outbox rows inside PostgreSQL transactions. The worker publishes
pending rows asynchronously; Redpanda is not required for kiosk questionnaire
completion or public report creation.

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test
pnpm validate:json
docker compose -f infra/docker-compose.yml config
git diff --check
```

## Scope

- Sprint 0: monorepo, module registry, API skeleton, PostgreSQL migration,
  PHQ-9 seed path, local dev docs, CI skeleton, and closeout devlog.
- Sprint 1: PHQ-9 SurveyJS render, touch answer capture, API submit,
  PostgreSQL persistence, server-side score, item-9 safety flag, and
  non-diagnostic public summary.
- Sprint 2: questionnaire CMS / versioning / public report token.
- Sprint 3: mock ASR / LLM / TTS voice Agent seam and agent turn log.
- Sprint 4: Avatar UI and Redpanda outbox publishing.
- Phase 2: vision and hearing implementation.
