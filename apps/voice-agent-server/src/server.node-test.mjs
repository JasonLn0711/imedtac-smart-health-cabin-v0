import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import test from "node:test";
import { createVoiceAgentServer } from "./server.mjs";

async function listen(server) {
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  return `http://127.0.0.1:${address.port}`;
}

test("reports strict LLM readiness and proxies agent turns", async () => {
  const api = createServer((request, response) => {
    if (request.url === "/healthz") {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ status: "ok" }));
      return;
    }
    if (request.url === "/api/v1/agent-turns/respond") {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ provider: "ollama_native", guidance: "請依照題目回答。" }));
      return;
    }
    response.writeHead(404).end();
  });
  const llm = createServer((request, response) => {
    if (request.url === "/api/chat") {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ message: { content: "OK" } }));
      return;
    }
    response.writeHead(404).end();
  });
  const apiBaseUrl = await listen(api);
  const llmBaseUrl = await listen(llm);
  const server = createVoiceAgentServer({
    API_BASE_URL: apiBaseUrl,
    OLLAMA_BASE_URL: llmBaseUrl,
    OLLAMA_MODEL: "gemma4:e4b",
    LLM_PROVIDER: "ollama_native",
    LLM_DEVICE: "cuda"
  });
  const serverBaseUrl = await listen(server);

  try {
    const health = await fetch(`${serverBaseUrl}/healthz`).then((response) => response.json());
    assert.equal(health.api.ready, true);
    assert.equal(health.llm.acceptanceEligible, true);

    const proxied = await fetch(`${serverBaseUrl}/api/v1/agent-turns/respond`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question_name: "phq9_01" })
    }).then((response) => response.json());
    assert.equal(proxied.provider, "ollama_native");
  } finally {
    server.close();
    api.close();
    llm.close();
  }
});
