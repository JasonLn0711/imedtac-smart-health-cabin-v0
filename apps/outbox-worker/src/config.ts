export const databaseUrl =
  process.env.DATABASE_URL ??
  "postgres://smart_health_cabin:smart_health_cabin_dev@localhost:5432/smart_health_cabin";

export const redpandaBrokers = (process.env.REDPANDA_BROKERS ?? "localhost:9092").split(",");
export const redpandaClientId = process.env.REDPANDA_CLIENT_ID ?? "smart-health-cabin-outbox-worker";
export const outboxBatchSize = Number(process.env.OUTBOX_BATCH_SIZE ?? 25);
export const outboxMaxAttempts = Number(process.env.OUTBOX_MAX_ATTEMPTS ?? 10);
