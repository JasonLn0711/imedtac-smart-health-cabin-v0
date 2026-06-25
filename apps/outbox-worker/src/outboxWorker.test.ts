import { describe, expect, it } from "vitest";
import type { OutboxEventRecord, OutboxRepository } from "./outboxWorker";
import { runOutboxBatch } from "./outboxWorker";
import type { EventPublisher } from "./redpandaPublisher";
import { topicForEventType } from "./topicMap";

class FakeRepository implements OutboxRepository {
  failed?: { id: string; error: string; nextAttemptAt: Date };
  processing: string[] = [];
  published: string[] = [];

  constructor(private readonly events: OutboxEventRecord[]) {}

  async findPending(): Promise<OutboxEventRecord[]> {
    return this.events;
  }

  async markProcessing(id: string): Promise<void> {
    this.processing.push(id);
  }

  async markPublished(id: string): Promise<void> {
    this.published.push(id);
  }

  async markFailed(id: string, error: string, nextAttemptAt: Date): Promise<void> {
    this.failed = { id, error, nextAttemptAt };
  }
}

class FakePublisher implements EventPublisher {
  published: Array<{ topic: string; key: string; payload: unknown }> = [];

  constructor(private readonly shouldFail = false) {}

  async publish(topic: string, key: string, payload: unknown): Promise<void> {
    if (this.shouldFail) {
      throw new Error("redpanda unavailable");
    }
    this.published.push({ topic, key, payload });
  }
}

const event: OutboxEventRecord = {
  id: "evt_1",
  aggregate_id: "qres_1",
  event_type: "shc.questionnaire.response.completed.v1",
  topic: null,
  attempts: 0,
  payload: {
    specversion: "1.0",
    data: {
      questionnaire_code: "phq9",
      public_status_code: "NORMAL_REFERENCE"
    }
  }
};

describe("outbox worker", () => {
  it("publishes pending events and marks them published", async () => {
    const repository = new FakeRepository([event]);
    const publisher = new FakePublisher();

    const result = await runOutboxBatch(repository, publisher, 25);

    expect(result).toEqual({ published: 1, failed: 0 });
    expect(repository.processing).toEqual(["evt_1"]);
    expect(repository.published).toEqual(["evt_1"]);
    expect(publisher.published[0]?.topic).toBe("shc.questionnaire.responses.v1");
  });

  it("leaves failed publish retryable", async () => {
    const repository = new FakeRepository([event]);
    const result = await runOutboxBatch(repository, new FakePublisher(true), 25);

    expect(result).toEqual({ published: 0, failed: 1 });
    expect(repository.failed?.id).toBe("evt_1");
    expect(repository.failed?.error).toContain("redpanda unavailable");
    expect(repository.failed?.nextAttemptAt).toBeInstanceOf(Date);
  });

  it("maps all required event topics", () => {
    expect(topicForEventType("shc.questionnaire.response.completed.v1")).toBe("shc.questionnaire.responses.v1");
    expect(topicForEventType("shc.agent.turn.created.v1")).toBe("shc.agent.turns.v1");
    expect(topicForEventType("shc.report.created.v1")).toBe("shc.report.events.v1");
    expect(topicForEventType("shc.audit.event.created.v1")).toBe("shc.audit.events.v1");
    expect(topicForEventType("voice.asr.completed.v1")).toBe("shc.voice.safety.v1");
    expect(topicForEventType("voice.confirmation_required.v1")).toBe("shc.voice.safety.v1");
    expect(topicForEventType("reranker.rerank.completed.v1")).toBe("shc.reranker.events.v1");
    expect(topicForEventType("reranker.unavailable.v1")).toBe("shc.reranker.events.v1");
    expect(topicForEventType("questionnaire_response.completed.v1")).toBe("shc.questionnaire.responses.v1");
  });

  it("keeps public event payload free of raw PHQ-9 answers", () => {
    expect(JSON.stringify(event.payload)).not.toMatch(/raw_answers|phq9_01|phq9_09|internal_score/);
  });
});
