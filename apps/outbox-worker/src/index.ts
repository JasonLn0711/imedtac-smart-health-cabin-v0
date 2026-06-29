import { outboxBatchSize } from "./config";
import { PostgresOutboxRepository, runOutboxBatch } from "./outboxWorker";
import { RedpandaPublisher } from "./redpandaPublisher";

const repository = new PostgresOutboxRepository();
const publisher = new RedpandaPublisher();

try {
  const result = await runOutboxBatch(repository, publisher, outboxBatchSize);
  console.log(JSON.stringify(result));
} finally {
  await publisher.disconnect();
  await repository.close();
}
