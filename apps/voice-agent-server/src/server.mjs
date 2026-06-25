import { createServer as createHttpServer } from "node:http";

const jsonHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "content-type",
  "content-type": "application/json; charset=utf-8"
};

function trimSlash(value) {
  return value.replace(/\/$/, "");
}

function joinUrl(baseUrl, path) {
  return `${trimSlash(baseUrl)}${path.startsWith("/") ? path : `/${path}`}`;
}

function firstEnv(env, names) {
  return names.map((name) => env[name]).find((value) => value !== undefined && value !== "");
}

function booleanEnv(env, names) {
  const value = firstEnv(env, names)?.toLowerCase();
  return value === "1" || value === "true" || value === "yes" || value === "on";
}

function positiveNumberEnv(env, names) {
  return names.some((name) => Number(env[name] ?? 0) > 0);
}

function normalizeComputeBackend(value) {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) {
    return "unknown";
  }
  if (["cuda", "gpu", "nvidia", "cuda:0"].includes(normalized)) {
    return "gpu";
  }
  if (normalized === "cpu") {
    return "cpu";
  }
  if (["mixed", "hybrid", "gpu+cpu", "cuda+cpu"].includes(normalized)) {
    return "mixed";
  }
  return "unknown";
}

function llmRuntimeScope(env) {
  return {
    computeBackend: normalizeComputeBackend(firstEnv(env, ["LLM_COMPUTE_BACKEND", "LLM_DEVICE", "VLLM_DEVICE"])),
    gpuRequired: true,
    cpuOffload:
      booleanEnv(env, ["LLM_CPU_OFFLOAD", "VLLM_CPU_OFFLOAD"]) ||
      positiveNumberEnv(env, ["LLM_CPU_OFFLOAD_GB", "VLLM_CPU_OFFLOAD_GB"]),
    cpuFallbackAllowed: booleanEnv(env, ["LLM_ALLOW_CPU_FALLBACK", "VLLM_ALLOW_CPU_FALLBACK"])
  };
}

function gpuOnlyEligible(scope) {
  return scope.computeBackend === "gpu" && scope.cpuOffload === false && scope.cpuFallbackAllowed === false;
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function postJson(url, body, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    const text = await response.text();
    return { ok: response.ok, status: response.status, text };
  } finally {
    clearTimeout(timeout);
  }
}

async function getReady(url, timeoutMs) {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return {
      ready: response.ok,
      healthy: response.ok,
      latencyMs: Date.now() - startedAt,
      error_code: response.ok ? null : `HTTP_${response.status}`
    };
  } catch (error) {
    return {
      ready: false,
      healthy: false,
      latencyMs: Date.now() - startedAt,
      error_code: error instanceof Error ? error.name : "PROVIDER_UNAVAILABLE"
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function llmReady(env) {
  const provider = env.LLM_PROVIDER ?? "ollama_native";
  const baseUrl =
    env.LLM_BASE_URL ??
    (provider === "ollama_native"
      ? env.OLLAMA_BASE_URL ?? "http://localhost:11434"
      : provider === "vllm_openai_compatible"
      ? env.VLLM_BASE_URL ?? "http://localhost:8000/v1"
      : env.OLLAMA_BASE_URL
        ? `${trimSlash(env.OLLAMA_BASE_URL)}/v1`
        : "http://localhost:11434/v1");
  const model =
    env.LLM_MODEL ??
    (provider === "vllm_openai_compatible" ? env.VLLM_MODEL ?? "gemma-4-e4b" : env.OLLAMA_MODEL ?? "gemma4:e4b");
  const timeoutMs = Number(env.LLM_REQUEST_TIMEOUT_MS ?? env.VOICE_MODEL_TIMEOUT_MS ?? 30000);
  const response = await postJson(
    joinUrl(baseUrl, provider === "ollama_native" ? "/api/chat" : "/chat/completions"),
    provider === "ollama_native"
      ? {
          model,
          messages: [{ role: "user", content: "Reply OK only." }],
          stream: false,
          think: false,
          options: { num_predict: 4, temperature: 0 }
        }
      : {
          model,
          messages: [{ role: "user", content: "Reply OK only." }],
          max_tokens: 4,
          temperature: 0
        },
    timeoutMs
  ).catch((error) => ({
    ok: false,
    status: 0,
    text: error instanceof Error ? error.name : "PROVIDER_UNAVAILABLE"
  }));
  const allowedProviders = (env.SPRINT5_ALLOWED_LLM_PROVIDERS ?? "ollama_native,ollama_openai_compatible,vllm_openai_compatible")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const providerEligible = allowedProviders.includes(provider);
  const runtimeScope = llmRuntimeScope(env);
  const gpuEligible = gpuOnlyEligible(runtimeScope);
  const errorCode = response.ok
    ? !providerEligible
      ? "LLM_PROVIDER_NOT_ALLOWED"
      : !gpuEligible
        ? "GPU_ONLY_REQUIRED"
        : null
    : `HTTP_${response.status || "UNAVAILABLE"}`;

  return {
    provider,
    model,
    mode: response.ok ? "live" : "unavailable",
    endpoint: baseUrl,
    ready: response.ok,
    healthy: response.ok,
    ...runtimeScope,
    acceptanceEligible: response.ok && providerEligible && gpuEligible,
    error_code: errorCode
  };
}

async function buildStatus(env) {
  const apiBaseUrl = env.API_BASE_URL ?? "http://localhost:3000";
  const api = await getReady(joinUrl(apiBaseUrl, "/healthz"), Number(env.API_REQUEST_TIMEOUT_MS ?? 10000));
  const llm = await llmReady(env);

  return {
    status: "ok",
    service: "voice-agent-server",
    api: {
      endpoint: apiBaseUrl,
      ...api
    },
    llm
  };
}

async function proxyToApi(request, response, env) {
  const apiBaseUrl = env.API_BASE_URL ?? "http://localhost:3000";
  const body = await readBody(request);
  const upstream = await fetch(joinUrl(apiBaseUrl, request.url), {
    method: request.method,
    headers: { "content-type": request.headers["content-type"] ?? "application/json" },
    body
  });
  response.writeHead(upstream.status, {
    ...jsonHeaders,
    "content-type": upstream.headers.get("content-type") ?? jsonHeaders["content-type"]
  });
  response.end(await upstream.text());
}

export function createVoiceAgentServer(env = process.env) {
  return createHttpServer(async (request, response) => {
    try {
      if (request.method === "OPTIONS") {
        response.writeHead(204, jsonHeaders);
        response.end();
        return;
      }

      if (request.method === "GET" && (request.url === "/healthz" || request.url === "/readyz")) {
        const status = await buildStatus(env);
        const ready = status.api.ready && status.llm.acceptanceEligible;
        response.writeHead(request.url === "/readyz" && !ready ? 503 : 200, jsonHeaders);
        response.end(JSON.stringify(status));
        return;
      }

      if (request.method === "POST" && request.url?.startsWith("/api/v1/agent-turns/")) {
        await proxyToApi(request, response, env);
        return;
      }

      response.writeHead(404, jsonHeaders);
      response.end(JSON.stringify({ error: { code: "VOICE_AGENT_ROUTE_NOT_FOUND", message: "Route not found" } }));
    } catch (error) {
      response.writeHead(500, jsonHeaders);
      response.end(
        JSON.stringify({
          error: {
            code: "VOICE_AGENT_SERVER_ERROR",
            message: error instanceof Error ? error.message : "Unexpected voice-agent-server error"
          }
        })
      );
    }
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.VOICE_AGENT_PORT ?? 3004);
  createVoiceAgentServer().listen(port, "0.0.0.0", () => {
    console.log(JSON.stringify({ status: "ok", service: "voice-agent-server", port }));
  });
}
