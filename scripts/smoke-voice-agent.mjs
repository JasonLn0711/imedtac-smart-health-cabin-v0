const voiceAgentBaseUrl = process.env.VOICE_AGENT_SERVER_URL ?? "http://localhost:3004";

try {
  const response = await fetch(new URL("/healthz", voiceAgentBaseUrl));
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${voiceAgentBaseUrl}/healthz returned ${response.status}: ${text.slice(0, 240)}`);
  }
  const status = JSON.parse(text);
  console.log(
    JSON.stringify(
      {
        service: status.service,
        api: status.api,
        llm: status.llm
      },
      null,
      2
    )
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
