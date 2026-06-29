const apiBaseUrl = process.env.API_BASE_URL ?? process.env.VITE_API_BASE_URL ?? "http://localhost:3000";

async function jsonFetch(path, options = {}) {
  const response = await fetch(new URL(path, apiBaseUrl), options);
  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}: ${text.slice(0, 240)}`);
  }
  return payload;
}

try {
  const status = await jsonFetch("/api/v1/providers/status");
  const session = await jsonFetch("/api/v1/agent-sessions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ session_id: `voice_first_smoke_${Date.now()}` })
  });
  const stream = await jsonFetch("/api/v1/agent-turns/tts/stream", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      agent_session_id: session.agent_session_id,
      question_name: "phq9_01",
      text: "接下來請用語音回答第一題。"
    })
  });
  const eligible =
    status.tts?.provider === "cosyvoice3_streaming" &&
    status.tts?.streaming === true &&
    status.tts?.acceptanceEligible === true &&
    stream.audio_transport === "ws_pcm16" &&
    Boolean(stream.stream_url);
  console.log(JSON.stringify({ eligible, tts: status.tts, stream }, null, 2));
  if (!eligible) process.exit(1);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
