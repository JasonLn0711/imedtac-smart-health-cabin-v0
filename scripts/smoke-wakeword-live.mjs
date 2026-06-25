const wakeWordBaseUrl = process.env.WAKE_WORD_SERVICE_URL ?? "http://localhost:8013";
const timeoutMs = Number(process.env.WAKE_WORD_LIVE_WAIT_MS ?? 15000);

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

function assertLiveReady(status) {
  const failures = [];
  if (status.mode !== "live") failures.push(`mode=${status.mode}`);
  if (status.ready !== true) failures.push(`ready=${status.ready}`);
  if (status.listening !== true) failures.push(`listening=${status.listening}`);
  if (status.last_error !== null) failures.push(`last_error=${status.last_error}`);
  if (failures.length > 0) {
    throw new Error(`Wake word live readiness failed: ${failures.join(", ")}`);
  }
}

async function waitForWakeDetected() {
  const socket = new WebSocket(wakeSocketUrl(wakeWordBaseUrl));

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      socket.close();
      reject(
        new Error(
          `Timed out waiting for real wake.detected from ${trimSlash(wakeWordBaseUrl)}/events after ${timeoutMs}ms`
        )
      );
    }, timeoutMs);

    socket.addEventListener("message", (event) => {
      const payload = JSON.parse(event.data);
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
  const status = await readJson("/status");
  assertLiveReady(status);
  console.error(`Wake word live listener is ready. Speak the selected wake phrase within ${timeoutMs}ms.`);
  const event = await waitForWakeDetected();

  console.log(
    JSON.stringify(
      {
        liveReady: true,
        provider: status.provider,
        model: status.model,
        mic_index: status.mic_index,
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
