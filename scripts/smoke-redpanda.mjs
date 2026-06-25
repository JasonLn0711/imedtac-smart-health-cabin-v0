const redpandaBaseUrl = process.env.REDPANDA_ADMIN_URL ?? "http://localhost:9644";
const readyPath = process.env.REDPANDA_READY_PATH ?? "/v1/status/ready";
const readyUrl = new URL(readyPath, redpandaBaseUrl);

try {
  const response = await fetch(readyUrl);
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${readyUrl} returned ${response.status}: ${text.slice(0, 240)}`);
  }
  console.log(text || JSON.stringify({ ready: true }));
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
