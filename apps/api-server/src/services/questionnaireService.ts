import type {
  ActiveQuestionnaireResponse,
  AdminQuestionnaireResponsesResponse,
  AdminQuestionnaireTemplatesResponse,
  AgentSessionResponse,
  AgentTurnResponse,
  CompletedQuestionnaireRequest,
  CompletedQuestionnaireResponse,
  CreateQuestionnaireTemplateRequest,
  CreateQuestionnaireVersionRequest,
  ProviderStatusResponse,
  PublicReportResponse,
  VoiceAnswerMappingResponse
} from "@shc/contracts";
import {
  getSurveyQuestionContexts,
  QuestionnaireValidationError,
  scoreQuestionnaire,
  validateSurveyJsQuestionnaire
} from "@shc/questionnaire-core";
import { assertPublicSummaryIsNonDiagnostic, buildPhq9PublicSummary } from "@shc/report-core";
import { collectHotwords, getDomainPacks, processVoiceEvidence } from "@shc/voice-safety-core";
import type { QuestionnaireRepository } from "../repositories/questionnaireRepository";

const seedPath = "modules/questionnaire/seed/phq9.zh-TW.surveyjs.json";
const scoringConfigPath = "modules/questionnaire/scoring/phq9.public-scoring-config.json";
const mockWav =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=";
const defaultAsrProvider = "faster_whisper_breeze_asr_26";
const defaultAsrModel = "Breeze-ASR-26-CT2-int8";
const defaultLlmProvider = "ollama_native";
const defaultLlmModel = "gemma4:e4b";
const defaultTtsProvider = "breezyvoice_default";
const defaultTtsModel = "/models/breezyvoice";
const defaultTtsVoice = "default";
const defaultRerankerProvider = "qwen3_reranker_0_6b";
const defaultRerankerModel = "Qwen3-Reranker-0.6B";
const forbiddenTtsFields = [
  "reference_audio",
  "reference_audio_base64",
  "speaker_embedding",
  "speaker_sample",
  "speaker_prompt_audio",
  "speaker_prompt_text",
  "custom_voice_id",
  "voice_clone",
  "customized_voice"
];
type ComputeBackend = "gpu" | "cpu" | "mixed" | "unknown";

function voiceModelMode(): "mock" | "live" {
  return process.env.VOICE_MODEL_MODE === "real" || process.env.VOICE_PROVIDER_MODE === "live" ? "live" : "mock";
}

function voiceModelTimeoutMs(): number {
  return Number(
    process.env.VOICE_MODEL_TIMEOUT_MS ??
      process.env.ASR_REQUEST_TIMEOUT_MS ??
      process.env.LLM_REQUEST_TIMEOUT_MS ??
      process.env.TTS_REQUEST_TIMEOUT_MS ??
      30000
  );
}

function env(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

function trimSlash(value: string): string {
  return value.replace(/\/$/, "");
}

function joinUrl(baseUrl: string, path: string): string {
  return `${trimSlash(baseUrl)}${path.startsWith("/") ? path : `/${path}`}`;
}

function llmBaseUrl(): string {
  const provider = env("LLM_PROVIDER", defaultLlmProvider);
  if (process.env.LLM_BASE_URL) {
    return process.env.LLM_BASE_URL;
  }
  if (provider === "ollama_native") {
    return process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
  }
  if (provider === "ollama_openai_compatible" && process.env.OLLAMA_BASE_URL) {
    return `${trimSlash(process.env.OLLAMA_BASE_URL)}/v1`;
  }
  if (provider === "vllm_openai_compatible" && process.env.VLLM_BASE_URL) {
    return process.env.VLLM_BASE_URL;
  }
  return provider === "vllm_openai_compatible" ? "http://localhost:8000/v1" : "http://localhost:11434/v1";
}

function llmModel(): string {
  const provider = env("LLM_PROVIDER", defaultLlmProvider);
  return (
    process.env.LLM_MODEL ??
    (provider === "vllm_openai_compatible" ? process.env.VLLM_MODEL : process.env.OLLAMA_MODEL) ??
    (provider === "vllm_openai_compatible" ? "gemma-4-e4b" : defaultLlmModel)
  );
}

function llmTemperature(): number {
  return Number(process.env.LLM_TEMPERATURE ?? 0.3);
}

function llmMaxTokens(): number {
  return Number(process.env.LLM_MAX_TOKENS ?? process.env.LLM_NUM_PREDICT ?? 80);
}

function ollamaThink(): boolean {
  const value = (process.env.OLLAMA_THINK ?? process.env.LLM_THINKING_MODE ?? "false").toLowerCase();
  return value === "1" || value === "true" || value === "yes" || value === "on";
}

function asrLanguageHint(): string {
  return process.env.ASR_LANGUAGE ?? process.env.ASR_LANGUAGE_HINT ?? "zh";
}

function ttsVoiceId(): string {
  return process.env.TTS_VOICE ?? process.env.BREEZYVOICE_VOICE_ID ?? defaultTtsVoice;
}

function allowedLlmProviders(): string[] {
  return (process.env.SPRINT5_ALLOWED_LLM_PROVIDERS ?? "ollama_native,ollama_openai_compatible,vllm_openai_compatible")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function llmProviderAllowed(provider: string): boolean {
  return allowedLlmProviders().includes(provider);
}

function firstEnv(names: string[]): string | undefined {
  return names.map((name) => process.env[name]).find((value): value is string => value !== undefined && value !== "");
}

function booleanEnv(names: string[]): boolean {
  const value = firstEnv(names)?.toLowerCase();
  return value === "1" || value === "true" || value === "yes" || value === "on";
}

function positiveNumberEnv(names: string[]): boolean {
  return names.some((name) => Number(process.env[name] ?? 0) > 0);
}

function normalizeComputeBackend(value?: string): ComputeBackend {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) {
    return "unknown";
  }
  if (["cuda", "gpu", "nvidia", "cuda:0"].includes(normalized)) {
    return "gpu";
  }
  if (["cpu"].includes(normalized)) {
    return "cpu";
  }
  if (["mixed", "hybrid", "gpu+cpu", "cuda+cpu"].includes(normalized)) {
    return "mixed";
  }
  return "unknown";
}

function modelRuntimeScope(input: {
  backendEnv: string[];
  cpuOffloadEnv: string[];
  cpuFallbackEnv: string[];
}) {
  return {
    computeBackend: normalizeComputeBackend(firstEnv(input.backendEnv)),
    gpuRequired: true,
    cpuOffload: booleanEnv(input.cpuOffloadEnv) || positiveNumberEnv(input.cpuOffloadEnv),
    cpuFallbackAllowed: booleanEnv(input.cpuFallbackEnv)
  };
}

function gpuOnlyEligible(input: {
  gpuRequired?: boolean;
  computeBackend?: ComputeBackend;
  cpuOffload?: boolean;
  cpuFallbackAllowed?: boolean;
}) {
  return (
    input.gpuRequired !== true ||
    (input.computeBackend === "gpu" && input.cpuOffload === false && input.cpuFallbackAllowed === false)
  );
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), voiceModelTimeoutMs());
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`${url} returned ${response.status}: ${text.slice(0, 240)}`);
    }
    return JSON.parse(text) as T;
  } finally {
    clearTimeout(timeout);
  }
}

async function getProviderReady(url: string): Promise<{ ready: boolean; healthy: boolean; latencyMs: number; lastError: string | null; error_code?: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), voiceModelTimeoutMs());
  const startedAt = Date.now();
  try {
    const response = await fetch(url, { signal: controller.signal });
    const latencyMs = Date.now() - startedAt;
    return response.ok
      ? { ready: true, healthy: true, latencyMs, lastError: null }
      : {
          ready: false,
          healthy: false,
          latencyMs,
          lastError: `HTTP_${response.status}`,
          error_code: `HTTP_${response.status}`
        };
  } catch (error) {
    const errorCode = error instanceof Error ? error.name : "PROVIDER_UNAVAILABLE";
    return {
      ready: false,
      healthy: false,
      latencyMs: Date.now() - startedAt,
      lastError: errorCode,
      error_code: errorCode
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function postProviderReady(url: string, body: unknown): Promise<{ ready: boolean; healthy: boolean; latencyMs: number; lastError: string | null; error_code?: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), voiceModelTimeoutMs());
  const startedAt = Date.now();
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    const latencyMs = Date.now() - startedAt;
    return response.ok
      ? { ready: true, healthy: true, latencyMs, lastError: null }
      : {
          ready: false,
          healthy: false,
          latencyMs,
          lastError: `HTTP_${response.status}`,
          error_code: `HTTP_${response.status}`
        };
  } catch (error) {
    const errorCode = error instanceof Error ? error.name : "PROVIDER_UNAVAILABLE";
    return {
      ready: false,
      healthy: false,
      latencyMs: Date.now() - startedAt,
      lastError: errorCode,
      error_code: errorCode
    };
  } finally {
    clearTimeout(timeout);
  }
}

function withAcceptance(input: {
  provider: string;
  model?: string;
  mode: "mock" | "live" | "unavailable";
  ready: boolean;
  healthy?: boolean;
  endpoint?: string;
  latencyMs?: number;
  lastError?: string | null;
  fallback: string;
  error_code?: string;
  acceptanceEligible?: boolean;
  computeBackend?: ComputeBackend;
  gpuRequired?: boolean;
  cpuOffload?: boolean;
  cpuFallbackAllowed?: boolean;
}) {
  const runtimeEligible = input.mode === "live" && input.ready && (input.healthy ?? input.ready);
  const gpuControlError = input.mode === "live" && !gpuOnlyEligible(input) ? "GPU_ONLY_REQUIRED" : undefined;
  return {
    ...input,
    healthy: input.healthy ?? input.ready,
    acceptanceEligible: (input.acceptanceEligible ?? runtimeEligible) && !gpuControlError,
    lastError: gpuControlError ?? input.lastError ?? null,
    error_code: gpuControlError ?? input.error_code
  };
}

async function postAudio(url: string, body: unknown): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), voiceModelTimeoutMs());
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    if (!response.ok) {
      throw new Error(`${url} returned ${response.status}: ${(await response.text()).slice(0, 240)}`);
    }
    return Buffer.from(await response.arrayBuffer()).toString("base64");
  } finally {
    clearTimeout(timeout);
  }
}

function buildQuestionGuidance(surveyjsJson: unknown, questionName?: string): string {
  const question = getSurveyQuestionContexts(surveyjsJson).find((item) => item.name === questionName);
  return question
    ? `請依照過去兩週的狀況回答：「${question.title}」。選項是：${question.choices
        .map((choice) => choice.text)
        .join("、")}。`
    : "請依照畫面上的問卷題目作答，也可以隨時改用觸控填答。";
}

function isUsableGuidance(value: string): boolean {
  return /[\u4e00-\u9fff]/.test(value);
}

export interface ASRAdapter {
  transcribe(input: {
    audioBase64: string;
    audioFormat: string;
    agentSessionId?: string;
  }): Promise<{ provider: string; model: string; transcript: string; payload: Record<string, unknown> }>;
}

export interface LLMAdapter {
  guide(fallbackGuidance: string): Promise<{ provider: string; model: string; guidance: string; payload: Record<string, unknown> }>;
}

export interface TTSAdapter {
  synthesize(text: string): Promise<{ provider: string; model: string; audioDataUrl: string; payload: Record<string, unknown> }>;
}

export class ProviderStatusService {
  async getStatus(): Promise<ProviderStatusResponse> {
    const asrRuntimeScope = modelRuntimeScope({
      backendEnv: ["ASR_COMPUTE_BACKEND", "ASR_DEVICE"],
      cpuOffloadEnv: ["ASR_CPU_OFFLOAD", "ASR_CPU_OFFLOAD_GB"],
      cpuFallbackEnv: ["ASR_ALLOW_CPU_FALLBACK"]
    });
    const llmRuntimeScope = modelRuntimeScope({
      backendEnv: ["LLM_COMPUTE_BACKEND", "LLM_DEVICE", "VLLM_DEVICE"],
      cpuOffloadEnv: ["LLM_CPU_OFFLOAD", "LLM_CPU_OFFLOAD_GB", "VLLM_CPU_OFFLOAD", "VLLM_CPU_OFFLOAD_GB"],
      cpuFallbackEnv: ["LLM_ALLOW_CPU_FALLBACK", "VLLM_ALLOW_CPU_FALLBACK"]
    });
    const ttsRuntimeScope = modelRuntimeScope({
      backendEnv: ["TTS_COMPUTE_BACKEND", "TTS_DEVICE", "BREEZYVOICE_DEVICE"],
      cpuOffloadEnv: ["TTS_CPU_OFFLOAD", "TTS_CPU_OFFLOAD_GB", "BREEZYVOICE_CPU_OFFLOAD", "BREEZYVOICE_CPU_OFFLOAD_GB"],
      cpuFallbackEnv: ["TTS_ALLOW_CPU_FALLBACK", "BREEZYVOICE_ALLOW_CPU_FALLBACK"]
    });
    const rerankerRuntimeScope = modelRuntimeScope({
      backendEnv: ["RERANKER_COMPUTE_BACKEND", "RERANKER_DEVICE"],
      cpuOffloadEnv: ["RERANKER_CPU_OFFLOAD", "RERANKER_CPU_OFFLOAD_GB"],
      cpuFallbackEnv: ["RERANKER_ALLOW_CPU_FALLBACK"]
    });

    if (voiceModelMode() === "mock") {
      const asr = withAcceptance({
        provider: env("ASR_PROVIDER", defaultAsrProvider),
        model: env("ASR_MODEL", defaultAsrModel),
        mode: "mock",
        ready: true,
        endpoint: env("ASR_SERVICE_URL", "http://localhost:8011"),
        fallback: "touch input",
        ...asrRuntimeScope
      });
      const llm = withAcceptance({
        provider: env("LLM_PROVIDER", defaultLlmProvider),
        model: llmModel(),
        mode: "mock",
        ready: true,
        endpoint: llmBaseUrl(),
        fallback: "deterministic rejection / touch input",
        ...llmRuntimeScope
      });
      const tts = withAcceptance({
        provider: env("TTS_PROVIDER", defaultTtsProvider),
        model: env("TTS_MODEL_PATH", defaultTtsModel),
        mode: "mock",
        ready: true,
        endpoint: env("TTS_SERVICE_URL", "http://localhost:8012"),
        fallback: "text-only question display",
        ...ttsRuntimeScope
      });
      const redpanda = withAcceptance({
        provider: "redpanda",
        mode: "mock",
        ready: true,
        endpoint: env("REDPANDA_BROKERS", "localhost:9092"),
        fallback: "outbox rows remain pending and retryable"
      });
      const reranker = withAcceptance({
        provider: env("RERANKER_PROVIDER", defaultRerankerProvider),
        model: env("RERANKER_MODEL", defaultRerankerModel),
        mode: "mock",
        ready: true,
        endpoint: env("RERANKER_SERVICE_URL", "http://localhost:8014"),
        fallback: "deterministic mapping + confirmation / touch fallback",
        ...rerankerRuntimeScope
      });

      return {
        asr,
        llm,
        tts,
        reranker,
        redpanda,
        providers: { asr, llm, tts, reranker, redpanda },
        sprint5Acceptance: { allRequiredLive: false, eligible: false }
      };
    }

    const asrEndpoint = env("ASR_SERVICE_URL", "http://localhost:8011");
    const asrProbe = await getProviderReady(joinUrl(asrEndpoint, env("ASR_HEALTH_PATH", "/healthz")));
    const llmEndpoint = llmBaseUrl();
    const llmProvider = env("LLM_PROVIDER", defaultLlmProvider);
    const llmProbe =
      llmProvider === "ollama_native"
        ? await postProviderReady(joinUrl(llmEndpoint, "/api/chat"), {
            model: llmModel(),
            messages: [{ role: "user", content: "Reply OK only." }],
            stream: false,
            think: false,
            options: { num_predict: 4, temperature: 0 }
          })
        : await postProviderReady(joinUrl(llmEndpoint, "/chat/completions"), {
            model: llmModel(),
            messages: [{ role: "user", content: "Reply OK only." }],
            max_tokens: 4,
            temperature: 0
          });
    const ttsBaseUrl = process.env.BREEZYVOICE_BASE_URL ?? env("TTS_SERVICE_URL", "http://localhost:8012");
    const ttsHealthPath = process.env.BREEZYVOICE_BASE_URL ? "/models" : env("TTS_HEALTH_PATH", "/healthz");
    const ttsProbe = await getProviderReady(joinUrl(ttsBaseUrl, ttsHealthPath));
    const redpandaEndpoint = env("REDPANDA_ADMIN_URL", "http://localhost:9644");
    const redpandaProbe = await getProviderReady(joinUrl(redpandaEndpoint, env("REDPANDA_READY_PATH", "/v1/status/ready")));
    const rerankerEndpoint = env("RERANKER_SERVICE_URL", "http://localhost:8014");
    const rerankerProbe = await getProviderReady(joinUrl(rerankerEndpoint, env("RERANKER_HEALTH_PATH", "/healthz")));

    const asr = withAcceptance({
      provider: env("ASR_PROVIDER", defaultAsrProvider),
      model: env("ASR_MODEL", defaultAsrModel),
      mode: asrProbe.ready ? "live" : "unavailable",
      endpoint: asrEndpoint,
      fallback: "touch input",
      ...asrProbe,
      ...asrRuntimeScope
    });
    const llm = withAcceptance({
      provider: env("LLM_PROVIDER", defaultLlmProvider),
      model: llmModel(),
      mode: llmProbe.ready ? "live" : "unavailable",
      endpoint: llmEndpoint,
      fallback: "deterministic rejection / touch input",
      ...llmProbe,
      ...llmRuntimeScope,
      acceptanceEligible:
        llmProbe.ready && llmProbe.healthy && llmProviderAllowed(env("LLM_PROVIDER", defaultLlmProvider)),
      lastError: llmProbe.ready && !llmProviderAllowed(env("LLM_PROVIDER", defaultLlmProvider)) ? "LLM_PROVIDER_NOT_ALLOWED" : llmProbe.lastError,
      error_code: llmProbe.ready && !llmProviderAllowed(env("LLM_PROVIDER", defaultLlmProvider)) ? "LLM_PROVIDER_NOT_ALLOWED" : llmProbe.error_code
    });
    const tts = withAcceptance({
      provider: env("TTS_PROVIDER", defaultTtsProvider),
      model: process.env.BREEZYVOICE_MODEL ?? env("TTS_MODEL_PATH", defaultTtsModel),
      mode: ttsProbe.ready ? "live" : "unavailable",
      endpoint: ttsBaseUrl,
      fallback: "text-only question display",
      ...ttsProbe,
      ...ttsRuntimeScope
    });
    const redpanda = withAcceptance({
      provider: "redpanda",
      mode: redpandaProbe.ready ? "live" : "unavailable",
      endpoint: redpandaEndpoint,
      fallback: "outbox rows remain pending and retryable",
      ...redpandaProbe
    });
    const reranker = withAcceptance({
      provider: env("RERANKER_PROVIDER", defaultRerankerProvider),
      model: env("RERANKER_MODEL", defaultRerankerModel),
      mode: rerankerProbe.ready ? "live" : "unavailable",
      endpoint: rerankerEndpoint,
      fallback: "deterministic mapping + confirmation / touch fallback",
      ...rerankerProbe,
      ...rerankerRuntimeScope
    });
    const requiredProviders = [asr, llm, tts, redpanda];
    const allRequiredLive = requiredProviders.every((provider) => provider.mode === "live");
    const eligible = requiredProviders.every((provider) => provider.acceptanceEligible);

    return {
      asr,
      llm,
      tts,
      reranker,
      redpanda,
      providers: { asr, llm, tts, reranker, redpanda },
      sprint5Acceptance: { allRequiredLive, eligible }
    };
  }
}

const liveAsrAdapter: ASRAdapter = {
  async transcribe(input) {
    const hotwords = collectHotwords(getDomainPacks(["phq9_zh_tw", "smart_cabin_measurement"]));
    const asr = await postJson<{
      transcript?: string;
      text?: string;
      confidence?: number;
      duration_ms?: number;
      durationMs?: number;
      segments?: unknown[];
    }>(joinUrl(env("ASR_SERVICE_URL", "http://localhost:8011"), env("ASR_TRANSCRIBE_PATH", "/v1/asr/transcribe")), {
      audio_format: input.audioFormat,
      audio_base64: input.audioBase64,
      language_hint: asrLanguageHint(),
      hotwords,
      turn_id: input.agentSessionId
    });
    const transcript = asr.transcript ?? asr.text ?? "";
    const provider = env("ASR_PROVIDER", defaultAsrProvider);
    const model = env("ASR_MODEL", defaultAsrModel);
    return { provider, model, transcript, payload: { provider, model, transcript, ...asr } };
  }
};

const liveLlmAdapter: LLMAdapter = {
  async guide(fallbackGuidance) {
    const provider = env("LLM_PROVIDER", defaultLlmProvider);
    const model = llmModel();
    const messages = [
      {
        role: "system",
        content:
          "你是 Smart Health Cabin 的問卷語音導引。只用繁體中文，回答 1 到 5 句話。你要協助使用者理解題目、回想時間範圍、知道如何在畫面選項中作答，不得診斷、不得改變問卷分數、不得替使用者作答。若題目提到「不如死掉」或「傷害自己」，第一句要說：這題需要現場人員關心與協助，您可以請現場人員一起完成。接著再提醒使用者依照過去兩週的頻率從畫面選項作答。"
      },
      {
        role: "user",
        content: fallbackGuidance
      }
    ];
    const llm: { choices?: Array<{ message?: { content?: string } }>; message?: { content?: string } } =
      provider === "ollama_native"
        ? await postJson(joinUrl(llmBaseUrl(), "/api/chat"), {
            model,
            messages,
            stream: false,
            think: ollamaThink(),
            options: { temperature: llmTemperature(), num_predict: llmMaxTokens() }
          })
        : await postJson<{ choices?: Array<{ message?: { content?: string } }>; message?: { content?: string } }>(
            joinUrl(llmBaseUrl(), "/chat/completions"),
            {
              model,
              messages,
              stream: false,
              temperature: llmTemperature(),
              max_tokens: llmMaxTokens()
            }
          );
    const generatedGuidance = llm.choices?.[0]?.message?.content?.trim() || llm.message?.content?.trim() || "";
    const guidance = isUsableGuidance(generatedGuidance) ? generatedGuidance : fallbackGuidance;
    return { provider, model, guidance, payload: { provider, model, guidance } };
  }
};

const liveTtsAdapter: TTSAdapter = {
  async synthesize(text) {
    const provider = env("TTS_PROVIDER", defaultTtsProvider);
    const model = process.env.BREEZYVOICE_MODEL ?? env("TTS_MODEL_PATH", defaultTtsModel);
    let audioBase64: string;
    const voice = ttsVoiceId();
    if (voice !== defaultTtsVoice) {
      throw new QuestionnaireValidationError("Only BreezyVoice default voice is accepted");
    }

    if (process.env.BREEZYVOICE_BASE_URL || process.env.TTS_REQUEST_STYLE === "openai") {
      audioBase64 = await postAudio(joinUrl(env("BREEZYVOICE_BASE_URL", "http://localhost:9003/v1"), "/audio/speech"), {
        model,
        voice,
        input: text,
        response_format: "wav",
        speed: 1
      });
    } else {
      const tts = await postJson<{ audio_base64: string; mime_type?: string }>(
        joinUrl(env("TTS_SERVICE_URL", "http://localhost:8012"), env("TTS_SYNTHESIZE_PATH", "/v1/tts/synthesize")),
        {
          text,
          voice_id: defaultTtsVoice,
          response_format: "wav"
        }
      );
      audioBase64 = tts.audio_base64;
    }

    const audioDataUrl = `data:audio/wav;base64,${audioBase64}`;
    return {
      provider,
      model,
      audioDataUrl,
      payload: {
        provider,
        model,
        voice,
        customized_voice: false,
        text,
        audio_data_url: audioDataUrl
      }
    };
  }
};

const providerStatusService = new ProviderStatusService();

export class QuestionnaireService {
  constructor(private readonly repository: QuestionnaireRepository) {}

  async getActiveQuestionnaire(): Promise<ActiveQuestionnaireResponse> {
    const active = await this.repository.getActiveQuestionnaire();

    return {
      questionnaire_code: active.questionnaireCode,
      questionnaire_version: active.version,
      questionnaire_version_id: active.id,
      title: active.title,
      surveyjs_json: active.surveyjsJson,
      surveyjs_json_path: seedPath,
      public_scoring_config_path: scoringConfigPath,
      scoring_config_code: "phq9_public_v1"
    };
  }

  async submitResponse(request: CompletedQuestionnaireRequest): Promise<CompletedQuestionnaireResponse> {
    if (!request.session_id || typeof request.session_id !== "string") {
      throw new QuestionnaireValidationError("session_id is required");
    }

    if (request.questionnaire_code !== "phq9") {
      throw new QuestionnaireValidationError("Only phq9 is supported");
    }

    if (!request.raw_answers || typeof request.raw_answers !== "object") {
      throw new QuestionnaireValidationError("raw_answers is required");
    }

    const active = await this.repository.getActiveQuestionnaire();
    if (request.questionnaire_version !== active.version) {
      throw new QuestionnaireValidationError("questionnaire_version must match the active published version");
    }

    const scored = scoreQuestionnaire(request.questionnaire_code, request.raw_answers);
    const publicSummary = buildPhq9PublicSummary(scored.internalScore, scored.safetyFlags);
    assertPublicSummaryIsNonDiagnostic(publicSummary);

    return this.repository.saveQuestionnaireResponse({
      sessionId: request.session_id,
      questionnaireVersion: active,
      rawAnswers: scored.normalizedAnswers,
      internalScore: scored.internalScore,
      safetyFlags: scored.safetyFlags,
      publicSummary
    });
  }

  async listTemplates(): Promise<AdminQuestionnaireTemplatesResponse> {
    return { templates: await this.repository.listTemplates() };
  }

  async createTemplate(request: CreateQuestionnaireTemplateRequest) {
    if (request.code !== "phq9") {
      throw new QuestionnaireValidationError("Only phq9 templates are supported in the MVP");
    }
    if (!request.title || !request.description) {
      throw new QuestionnaireValidationError("title and description are required");
    }
    return this.repository.createTemplate(request);
  }

  async createVersion(request: CreateQuestionnaireVersionRequest) {
    if (!request.template_id || !request.version) {
      throw new QuestionnaireValidationError("template_id and version are required");
    }
    if (request.scoring_config_code !== "phq9_public_v1") {
      throw new QuestionnaireValidationError("Only phq9_public_v1 scoring is supported");
    }
    validateSurveyJsQuestionnaire(request.surveyjs_json);
    return this.repository.createVersion({
      templateId: request.template_id,
      version: request.version,
      surveyjsJson: request.surveyjs_json,
      scoringConfigCode: request.scoring_config_code,
      status: request.status ?? "draft"
    });
  }

  async publishVersion(versionId: string) {
    if (!versionId) {
      throw new QuestionnaireValidationError("version id is required");
    }
    return this.repository.publishVersion(versionId);
  }

  async listResponses(): Promise<AdminQuestionnaireResponsesResponse> {
    return { responses: await this.repository.listResponses() };
  }

  async getPublicReport(token: string): Promise<PublicReportResponse | null> {
    if (!token) {
      throw new QuestionnaireValidationError("report token is required");
    }
    return this.repository.getPublicReport(token);
  }

  async createAgentSession(sessionId?: string): Promise<AgentSessionResponse> {
    return {
      agent_session_id: await this.repository.createAgentSession(sessionId),
      status: "created"
    };
  }

  async getProviderStatus(): Promise<ProviderStatusResponse> {
    return providerStatusService.getStatus();
  }

  async runAsr(input: {
    agent_session_id?: string;
    session_id?: string;
    question_name?: string;
    audio_text?: string;
    audio_base64?: string;
    audio_format?: string;
    transcript?: string;
  }): Promise<AgentTurnResponse> {
    let provider = "mock";
    let model = "mock";
    let transcript = input.transcript ?? input.audio_text ?? "";
    let payload: Record<string, unknown> = { provider, transcript };

    if (voiceModelMode() === "live") {
      const audioBase64 = input.audio_base64 ?? (transcript ? `text:${transcript}` : "");
      if (!audioBase64) {
        throw new QuestionnaireValidationError("audio_base64 or transcript/audio_text is required for ASR");
      }
      const asr = await liveAsrAdapter.transcribe({
        audioBase64,
        audioFormat: input.audio_format ?? (audioBase64.startsWith("text:") ? "mock" : "wav"),
        agentSessionId: input.agent_session_id
      });
      ({ provider, model, transcript, payload } = asr);
    }

    const turnId = await this.repository.saveAgentTurn({
      agentSessionId: input.agent_session_id,
      sessionId: input.session_id,
      turnType: "asr",
      questionName: input.question_name,
      transcript,
      payload
    });
    return { agent_turn_id: turnId, provider, model, transcript };
  }

  async buildGuidance(input: {
    agent_session_id?: string;
    session_id?: string;
    question_name?: string;
  }): Promise<AgentTurnResponse> {
    const active = await this.repository.getActiveQuestionnaire();
    const fallbackGuidance = buildQuestionGuidance(active.surveyjsJson, input.question_name);
    let provider = "mock";
    let model = "mock";
    let guidance = fallbackGuidance;
    let payload: Record<string, unknown> = { provider, guidance };

    if (voiceModelMode() === "live") {
      const llm = await liveLlmAdapter.guide(fallbackGuidance);
      ({ provider, model, guidance, payload } = llm);
    }

    const turnId = await this.repository.saveAgentTurn({
      agentSessionId: input.agent_session_id,
      sessionId: input.session_id,
      turnType: "respond",
      questionName: input.question_name,
      payload
    });
    return { agent_turn_id: turnId, provider, model, guidance };
  }

  async runTts(input: {
    agent_session_id?: string;
    session_id?: string;
    question_name?: string;
    text?: string;
    [key: string]: unknown;
  }): Promise<AgentTurnResponse> {
    for (const field of forbiddenTtsFields) {
      if (Object.hasOwn(input, field)) {
        throw new QuestionnaireValidationError(`Custom TTS voice field is not accepted: ${field}`);
      }
    }

    let provider = "mock";
    let model = "mock";
    let audioDataUrl = mockWav;
    let payload: Record<string, unknown> = { provider, text: input.text ?? "", audio_data_url: audioDataUrl };

    if (voiceModelMode() === "live") {
      const tts = await liveTtsAdapter.synthesize(input.text ?? "");
      provider = tts.provider;
      model = tts.model;
      audioDataUrl = tts.audioDataUrl;
      payload = tts.payload;
    }

    const turnId = await this.repository.saveAgentTurn({
      agentSessionId: input.agent_session_id,
      sessionId: input.session_id,
      turnType: "tts",
      questionName: input.question_name,
      payload
    });
    return { agent_turn_id: turnId, provider, model, audio_data_url: audioDataUrl };
  }

  async mapVoiceAnswer(input: {
    agent_session_id?: string;
    session_id?: string;
    question_name: string;
    transcript: string;
    asr_confidence?: number;
  }): Promise<VoiceAnswerMappingResponse> {
    const active = await this.repository.getActiveQuestionnaire();
    const question = getSurveyQuestionContexts(active.surveyjsJson).find(
      (item) => item.name === input.question_name
    );
    if (!question) {
      throw new QuestionnaireValidationError(`Unknown question_name: ${input.question_name}`);
    }
    const safety = processVoiceEvidence({
      rawText: input.transcript,
      asrProvider: env("ASR_PROVIDER", defaultAsrProvider),
      asrModel: env("ASR_MODEL", defaultAsrModel),
      asrConfidence: input.asr_confidence ?? 1,
      questionName: question.name,
      questionTitle: question.title,
      choices: question.choices,
      domainPackIds: ["phq9_zh_tw", "smart_cabin_measurement"]
    });
    const safetyCandidate = safety.semanticFrame.questionnaireAnswerCandidates[0];
    const candidate = safetyCandidate
      ? {
          value: Number(safetyCandidate.optionId),
          text: safetyCandidate.optionText,
          confidence: safetyCandidate.confidence,
          requires_confirmation: true as const,
          evidence_text: safetyCandidate.evidenceText
        }
      : null;
    await this.repository.saveAgentTurn({
      agentSessionId: input.agent_session_id,
      sessionId: input.session_id,
      turnType: "map_answer",
      questionName: input.question_name,
      transcript: input.transcript,
      payload: {
        candidate,
        normalized_transcript: safety.normalizedText,
        routing_decision: safety.routingDecision,
        semantic_frame: safety.semanticFrame,
        voice_evidence_metadata: safety.metadata
      }
    });
    return {
      candidate,
      transcript: input.transcript,
      normalized_transcript: safety.normalizedText,
      routing_decision: safety.routingDecision,
      confirmation_required: safety.confirmationRequired,
      semantic_frame: safety.semanticFrame,
      voice_evidence_metadata: safety.metadata
    };
  }
}
