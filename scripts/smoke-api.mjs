const apiBaseUrl = process.env.API_BASE_URL ?? process.env.VITE_API_BASE_URL ?? "http://localhost:3000";

async function readJson(path) {
  const url = new URL(path, apiBaseUrl);
  const response = await fetch(url);
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}: ${text.slice(0, 240)}`);
  }
  return JSON.parse(text);
}

try {
  const health = await readJson("/healthz");
  const activeQuestionnaire = await readJson("/api/v1/questionnaires/active");
  const providers = await readJson("/api/v1/providers/status");

  if (health.status !== "ok") {
    throw new Error(`API health status is ${health.status}`);
  }
  if (activeQuestionnaire.questionnaire_code !== "phq9") {
    throw new Error(`Unexpected active questionnaire: ${activeQuestionnaire.questionnaire_code}`);
  }

  console.log(
    JSON.stringify(
      {
        health,
        questionnaire: {
          code: activeQuestionnaire.questionnaire_code,
          version: activeQuestionnaire.questionnaire_version
        },
        sprint5Acceptance: providers.sprint5Acceptance ?? null
      },
      null,
      2
    )
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
