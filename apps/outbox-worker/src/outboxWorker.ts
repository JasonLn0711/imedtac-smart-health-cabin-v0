import pg from "pg";
import { databaseUrl, outboxMaxAttempts } from "./config";
import type { EventPublisher } from "./redpandaPublisher";
import { topicForEventType } from "./topicMap";

const { Pool } = pg;

export interface OutboxEventRecord {
  id: string;
  aggregate_id: string;
  event_type: string;
  topic: string | null;
  payload: unknown;
  attempts: number;
}

export interface OutboxRepository {
  findPending(limit: number): Promise<OutboxEventRecord[]>;
  markProcessing(id: string): Promise<void>;
  markPublished(id: string): Promise<void>;
  markFailed(id: string, error: string, nextAttemptAt: Date): Promise<void>;
}

export class PostgresOutboxRepository implements OutboxRepository {
  private readonly pool = new Pool({ connectionString: databaseUrl });

  async findPending(limit: number): Promise<OutboxEventRecord[]> {
    const result = await this.pool.query<OutboxEventRecord>(
      `
        select id, aggregate_id, event_type, topic, payload, attempts
        from outbox_events
        where status in ('pending', 'failed')
          and attempts < $1
          and (next_attempt_at is null or next_attempt_at <= now())
        order by created_at
        limit $2
      `,
      [outboxMaxAttempts, limit]
    );
    return result.rows;
  }

  async markProcessing(id: string): Promise<void> {
    await this.pool.query(
      "update outbox_events set status = 'processing', updated_at = now() where id = $1",
      [id]
    );
  }

  async markPublished(id: string): Promise<void> {
    await this.pool.query(
      "update outbox_events set status = 'published', published_at = now(), updated_at = now() where id = $1",
      [id]
    );
  }

  async markFailed(id: string, error: string, nextAttemptAt: Date): Promise<void> {
    await this.pool.query(
      `
        update outbox_events
        set status = 'failed',
            attempts = attempts + 1,
            next_attempt_at = $2,
            last_error = $3,
            updated_at = now()
        where id = $1
      `,
      [id, nextAttemptAt, error]
    );
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export async function runOutboxBatch(
  repository: OutboxRepository,
  publisher: EventPublisher,
  limit: number
): Promise<{ published: number; failed: number }> {
  const events = await repository.findPending(limit);
  let published = 0;
  let failed = 0;

  for (const event of events) {
    await repository.markProcessing(event.id);
    try {
      const topic = event.topic ?? topicForEventType(event.event_type);
      await publisher.publish(topic, event.aggregate_id, event.payload);
      await repository.markPublished(event.id);
      published += 1;
    } catch (error) {
      const nextAttemptAt = new Date(Date.now() + Math.min(event.attempts + 1, 10) * 1000);
      await repository.markFailed(
        event.id,
        error instanceof Error ? error.message : "Unknown publish error",
        nextAttemptAt
      );
      failed += 1;
    }
  }

  return { published, failed };
}
