import { Kafka } from "kafkajs";
import { redpandaBrokers, redpandaClientId } from "./config";

export interface EventPublisher {
  publish(topic: string, key: string, payload: unknown): Promise<void>;
}

export class RedpandaPublisher implements EventPublisher {
  private readonly producer = new Kafka({
    clientId: redpandaClientId,
    brokers: redpandaBrokers
  }).producer();
  private connected = false;

  async publish(topic: string, key: string, payload: unknown): Promise<void> {
    if (!this.connected) {
      await this.producer.connect();
      this.connected = true;
    }

    await this.producer.send({
      topic,
      messages: [
        {
          key,
          value: JSON.stringify(payload)
        }
      ]
    });
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.producer.disconnect();
      this.connected = false;
    }
  }
}
