const wakeWordBaseUrl = process.env.WAKE_WORD_SERVICE_URL ?? "http://localhost:8013";

function trimSlash(value) {
  return value.replace(/\/$/, "");
}

function wakeSocketUrl(baseUrl) {
  const url = new URL(baseUrl);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/events";
  return url.toString();
}

async function readJson(path) {
  const response = await fetch(new URL(path, wakeWordBaseUrl));
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${wakeWordBaseUrl}${path} returned ${response.status}: ${text.slice(0, 240)}`);
  }
  return JSON.parse(text);
}

async function postJson(path, body) {
  const response = await fetch(new URL(path, wakeWordBaseUrl), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${wakeWordBaseUrl}${path} returned ${response.status}: ${text.slice(0, 240)}`);
  }
  return JSON.parse(text);
}

async function waitForSimulatedWake() {
  const timeoutMs = Number(process.env.WAKE_WORD_SMOKE_TIMEOUT_MS ?? 5000);
  const socket = new WebSocket(wakeSocketUrl(wakeWordBaseUrl));

  return new Promise((resolve, reject) => {
    let simulated = false;
    const timeout = setTimeout(() => {
      socket.close();
      reject(new Error(`Timed out waiting for wake.detected from ${trimSlash(wakeWordBaseUrl)}/events`));
    }, timeoutMs);

    socket.addEventListener("message", (event) => {
      const payload = JSON.parse(event.data);
      if (payload.type === "wake.status" && !simulated) {
        simulated = true;
        postJson("/simulate-wake", { score: 0.82 }).catch(reject);
      }
      if (payload.type === "wake.detected") {
        clearTimeout(timeout);
        socket.close();
        resolve(payload);
      }
    });
    socket.addEventListener("error", () => {
      clearTimeout(timeout);
      reject(new Error(`Could not connect to ${wakeSocketUrl(wakeWordBaseUrl)}`));
    });
  });
}

try {
  const health = await readJson("/healthz");
  const status = await readJson("/status");
  const event = await waitForSimulatedWake();

  console.log(
    JSON.stringify(
      {
        service: health.service,
        provider: status.provider,
        mode: status.mode,
        ready: status.ready,
        event
      },
      null,
      2
    )
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
