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
  mapTranscriptToSurveyChoice,
  QuestionnaireValidationError,
  scoreQuestionnaire,
  validateSurveyJsQuestionnaire
} from "@shc/questionnaire-core";
import { assertPublicSummaryIsNonDiagnostic, buildPhq9PublicSummary } from "@shc/report-core";
import type { QuestionnaireRepository } from "../repositories/questionnaireRepository";

const seedPath = "modules/questionnaire/seed/phq9.zh-TW.surveyjs.json";
const scoringConfigPath = "modules/questionnaire/scoring/phq9.public-scoring-config.json";
const mockWav =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=";
const defaultAsrProvider = "faster_whisper_breeze_asr_26";
const defaultAsrModel = "Breeze-ASR-26-CT2-int8";
const defaultLlmProvider = "vllm_openai_compatible";
const defaultLlmModel = "gemma-4-e4b";
const defaultTtsProvider = "breezyvoice_default";
const defaultTtsModel = "/models/breezyvoice";
const defaultTtsVoice = "default";
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
  if (process.env.VLLM_BASE_URL) {
    return process.env.VLLM_BASE_URL;
  }
  if (process.env.LLM_BASE_URL) {
    return process.env.LLM_BASE_URL;
  }
  if (process.env.OLLAMA_BASE_URL) {
    return `${trimSlash(process.env.OLLAMA_BASE_URL)}/v1`;
  }
  return "http://localhost:8000/v1";
}

function llmModel(): string {
  return process.env.VLLM_MODEL ?? process.env.LLM_MODEL ?? process.env.OLLAMA_MODEL ?? defaultLlmModel;
}

function llmTemperature(): number {
  return Number(process.env.LLM_TEMPERATURE ?? 0.2);
}

function asrLanguageHint(): string {
  return process.env.ASR_LANGUAGE ?? process.env.ASR_LANGUAGE_HINT ?? "zh";
}

function ttsVoiceId(): string {
  return process.env.TTS_VOICE ?? process.env.BREEZYVOICE_VOICE_ID ?? defaultTtsVoice;
}

function sprint5RequiresVllm(): boolean {
  return process.env.SPRINT5_REQUIRE_VLLM !== "false";
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
}) {
  const runtimeEligible = input.mode === "live" && input.ready && (input.healthy ?? input.ready);
  return {
    ...input,
    healthy: input.healthy ?? input.ready,
    acceptanceEligible: input.acceptanceEligible ?? runtimeEligible,
    lastError: input.lastError ?? null
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
    if (voiceModelMode() === "mock") {
      const asr = withAcceptance({
        provider: env("ASR_PROVIDER", defaultAsrProvider),
        model: env("ASR_MODEL", defaultAsrModel),
        mode: "mock",
        ready: true,
        endpoint: env("ASR_SERVICE_URL", "http://localhost:8011"),
        fallback: "touch input"
      });
      const llm = withAcceptance({
        provider: env("LLM_PROVIDER", defaultLlmProvider),
        model: llmModel(),
        mode: "mock",
        ready: true,
        endpoint: llmBaseUrl(),
        fallback: "deterministic rejection / touch input"
      });
      const tts = withAcceptance({
        provider: env("TTS_PROVIDER", defaultTtsProvider),
        model: env("TTS_MODEL_PATH", defaultTtsModel),
        mode: "mock",
        ready: true,
        endpoint: env("TTS_SERVICE_URL", "http://localhost:8012"),
        fallback: "text-only question display"
      });
      const redpanda = withAcceptance({
        provider: "redpanda",
        mode: "mock",
        ready: true,
        endpoint: env("REDPANDA_BROKERS", "localhost:9092"),
        fallback: "outbox rows remain pending and retryable"
      });

      return {
        asr,
        llm,
        tts,
        redpanda,
        providers: { asr, llm, tts, redpanda },
        sprint5Acceptance: { allRequiredLive: false, eligible: false }
      };
    }

    const asrEndpoint = env("ASR_SERVICE_URL", "http://localhost:8011");
    const asrProbe = await getProviderReady(joinUrl(asrEndpoint, env("ASR_HEALTH_PATH", "/healthz")));
    const llmEndpoint = llmBaseUrl();
    const llmProbe = await postProviderReady(joinUrl(llmEndpoint, "/chat/completions"), {
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

    const asr = withAcceptance({
      provider: env("ASR_PROVIDER", defaultAsrProvider),
      model: env("ASR_MODEL", defaultAsrModel),
      mode: asrProbe.ready ? "live" : "unavailable",
      endpoint: asrEndpoint,
      fallback: "touch input",
      ...asrProbe
    });
    const llm = withAcceptance({
      provider: env("LLM_PROVIDER", defaultLlmProvider),
      model: llmModel(),
      mode: llmProbe.ready ? "live" : "unavailable",
      endpoint: llmEndpoint,
      fallback: "deterministic rejection / touch input",
      ...llmProbe,
      acceptanceEligible:
        llmProbe.ready &&
        llmProbe.healthy &&
        (!sprint5RequiresVllm() || env("LLM_PROVIDER", defaultLlmProvider) === defaultLlmProvider),
      lastError:
        llmProbe.ready && sprint5RequiresVllm() && env("LLM_PROVIDER", defaultLlmProvider) !== defaultLlmProvider
          ? "LLM_PROVIDER_NOT_VLLM"
          : llmProbe.lastError,
      error_code:
        llmProbe.ready && sprint5RequiresVllm() && env("LLM_PROVIDER", defaultLlmProvider) !== defaultLlmProvider
          ? "LLM_PROVIDER_NOT_VLLM"
          : llmProbe.error_code
    });
    const tts = withAcceptance({
      provider: env("TTS_PROVIDER", defaultTtsProvider),
      model: process.env.BREEZYVOICE_MODEL ?? env("TTS_MODEL_PATH", defaultTtsModel),
      mode: ttsProbe.ready ? "live" : "unavailable",
      endpoint: ttsBaseUrl,
      fallback: "text-only question display",
      ...ttsProbe
    });
    const redpanda = withAcceptance({
      provider: "redpanda",
      mode: redpandaProbe.ready ? "live" : "unavailable",
      endpoint: redpandaEndpoint,
      fallback: "outbox rows remain pending and retryable",
      ...redpandaProbe
    });
    const allRequiredLive = [asr, llm, tts, redpanda].every((provider) => provider.mode === "live");
    const eligible = [asr, llm, tts, redpanda].every((provider) => provider.acceptanceEligible);

    return {
      asr,
      llm,
      tts,
      redpanda,
      providers: { asr, llm, tts, redpanda },
      sprint5Acceptance: { allRequiredLive, eligible }
    };
  }
}

const liveAsrAdapter: ASRAdapter = {
  async transcribe(input) {
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
    const llm = await postJson<{ choices?: Array<{ message?: { content?: string } }>; message?: { content?: string } }>(
      joinUrl(llmBaseUrl(), "/chat/completions"),
      {
        model: llmModel(),
        messages: [
          {
            role: "system",
            content:
              "你是 Smart Health Cabin 的問卷語音導引。只用繁體中文，回答一句，協助使用者理解題目與選項。不得診斷、不得改變問卷分數、不得替使用者作答。"
          },
          {
            role: "user",
            content: fallbackGuidance
          }
        ],
        stream: false,
        temperature: llmTemperature(),
        max_tokens: 80
      }
    );
    const guidance = llm.choices?.[0]?.message?.content?.trim() || llm.message?.content?.trim() || fallbackGuidance;
    const provider = env("LLM_PROVIDER", defaultLlmProvider);
    const model = llmModel();
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
  }): Promise<VoiceAnswerMappingResponse> {
    const active = await this.repository.getActiveQuestionnaire();
    const question = getSurveyQuestionContexts(active.surveyjsJson).find(
      (item) => item.name === input.question_name
    );
    if (!question) {
      throw new QuestionnaireValidationError(`Unknown question_name: ${input.question_name}`);
    }
    const candidate = mapTranscriptToSurveyChoice(input.transcript, question.choices);
    await this.repository.saveAgentTurn({
      agentSessionId: input.agent_session_id,
      sessionId: input.session_id,
      turnType: "map_answer",
      questionName: input.question_name,
      transcript: input.transcript,
      payload: { candidate }
    });
    return { candidate, transcript: input.transcript };
  }
}
