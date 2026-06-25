const apiBaseUrl = process.env.API_BASE_URL ?? process.env.VITE_API_BASE_URL ?? "http://localhost:3000";
const voiceAgentBaseUrl = process.env.VOICE_AGENT_SERVER_URL ?? "http://localhost:3004";
const statusUrl = new URL("/api/v1/providers/status", apiBaseUrl);
const requiredProviders = ["asr", "llm", "tts", "redpanda"];
const requiredGpuProviders = ["asr", "llm", "tts"];

function isGpuOnly(provider) {
  return (
    provider?.gpuRequired === true &&
    provider?.computeBackend === "gpu" &&
    provider?.cpuOffload === false &&
    provider?.cpuFallbackAllowed === false
  );
}

async function readJson(url) {
  const response = await fetch(url);
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}: ${text.slice(0, 240)}`);
  }
  return JSON.parse(text);
}

try {
  const status = await readJson(statusUrl);
  const providers = status.providers ?? {
    asr: status.asr,
    llm: status.llm,
    tts: status.tts,
    redpanda: status.redpanda
  };
  const failures = requiredProviders
    .map((name) => [name, providers?.[name]])
    .filter(([, provider]) => provider?.mode !== "live" || provider?.ready !== true || provider?.acceptanceEligible !== true)
    .map(([name, provider]) => ({ name, provider }));
  const gpuFailures = requiredGpuProviders
    .map((name) => [name, providers?.[name]])
    .filter(([, provider]) => !isGpuOnly(provider))
    .map(([name, provider]) => ({ name: `${name}-gpu-only`, provider }));
  failures.push(...gpuFailures);
  const voiceAgent = await readJson(new URL("/readyz", voiceAgentBaseUrl)).catch((error) => ({
    ready: false,
    acceptanceEligible: false,
    error_code: error instanceof Error ? error.message : "VOICE_AGENT_UNAVAILABLE"
  }));
  if (voiceAgent?.llm?.acceptanceEligible !== true || voiceAgent?.api?.ready !== true || !isGpuOnly(voiceAgent?.llm)) {
    failures.push({ name: "voice-agent-server", provider: voiceAgent });
  }
  const eligible = status.sprint5Acceptance?.eligible === true && failures.length === 0;

  if (!eligible) {
    console.error(
      JSON.stringify(
        {
          eligible: false,
          sprint5Acceptance: status.sprint5Acceptance ?? null,
          voiceAgent,
          failures
        },
        null,
        2
      )
    );
    process.exit(1);
  }

  console.log(JSON.stringify({ eligible: true, providers, voiceAgent }, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
