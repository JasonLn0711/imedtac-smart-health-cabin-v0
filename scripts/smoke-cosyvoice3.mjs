const baseUrl = process.env.COSYVOICE3_BASE_URL ?? process.env.TTS_SERVICE_URL ?? "http://localhost:8015";

async function readJson(path) {
  const response = await fetch(new URL(path, baseUrl));
  const text = await response.text();
  let payload = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { text };
  }
  return { ok: response.ok, status: response.status, payload };
}

const health = await readJson("/healthz").catch((error) => ({
  ok: false,
  status: 0,
  payload: { error: error instanceof Error ? error.message : String(error) }
}));
const ready = await readJson("/readyz").catch((error) => ({
  ok: false,
  status: 0,
  payload: { error: error instanceof Error ? error.message : String(error) }
}));

const result = {
  baseUrl,
  health,
  ready,
  eligible: health.ok && ready.ok && ready.payload?.ready === true && ready.payload?.streaming_ready === true
};

console.log(JSON.stringify(result, null, 2));

if (!result.eligible) {
  process.exit(1);
}
