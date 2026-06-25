import { afterEach, describe, expect, it, vi } from "vitest";
import type { CompletedQuestionnaireResponse } from "@shc/contracts";
import phq9Seed from "../../../../modules/questionnaire/seed/phq9.zh-TW.surveyjs.json";
import type {
  CreateTemplateInput,
  CreateVersionInput,
  QuestionnaireRepository,
  QuestionnaireVersionRecord,
  SaveAgentTurnInput,
  SaveQuestionnaireResponseInput
} from "../repositories/questionnaireRepository";
import { QuestionnaireService } from "./questionnaireService";

class InMemoryQuestionnaireRepository implements QuestionnaireRepository {
  saved?: SaveQuestionnaireResponseInput;
  savedTurns: SaveAgentTurnInput[] = [];

  async ensurePhq9Seed(): Promise<void> {}

  async getActiveQuestionnaire(): Promise<QuestionnaireVersionRecord> {
    return {
      id: "qv_demo",
      templateId: "qtpl_phq9",
      questionnaireCode: "phq9",
      version: "0.1.0",
      title: "病人健康狀況問卷-9（PHQ-9）",
      surveyjsJson: phq9Seed,
      scoringConfig: {}
    };
  }

  async saveQuestionnaireResponse(
    input: SaveQuestionnaireResponseInput
  ): Promise<CompletedQuestionnaireResponse> {
    this.saved = input;
    return {
      response_id: "qres_demo",
      session_id: input.sessionId,
      questionnaire_code: "phq9",
      questionnaire_version: "0.1.0",
      internal_score: input.internalScore,
      safety_flags: input.safetyFlags,
      public_summary: input.publicSummary,
      public_report_token: "rpt_demo",
      public_report_url: "http://localhost:5173/reports/rpt_demo",
      qr_payload: "http://localhost:5173/reports/rpt_demo"
    };
  }

  async listTemplates() {
    return [
      {
        id: "qtpl_phq9",
        code: "phq9" as const,
        title: "病人健康狀況問卷-9（PHQ-9）",
        description: "健康自我檢測問卷",
        active_version_id: "qv_demo",
        active_version: "0.1.0",
        status: "published" as const,
        updated_at: new Date(0).toISOString()
      }
    ];
  }

  async createTemplate(input: CreateTemplateInput) {
    return {
      id: `qtpl_${input.code}`,
      code: input.code,
      title: input.title,
      description: input.description,
      active_version_id: null,
      active_version: null,
      status: "none" as const,
      updated_at: new Date(0).toISOString()
    };
  }

  async createVersion(input: CreateVersionInput) {
    return {
      id: "qv_new",
      template_id: input.templateId,
      questionnaire_code: "phq9" as const,
      version: input.version,
      status: input.status,
      is_active: false
    };
  }

  async publishVersion(versionId: string) {
    return {
      id: versionId,
      template_id: "qtpl_phq9",
      questionnaire_code: "phq9" as const,
      version: "0.2.0",
      status: "published" as const,
      is_active: true
    };
  }

  async listResponses() {
    return [];
  }

  async getPublicReport() {
    return null;
  }

  async createAgentSession() {
    return "agent_sess_demo";
  }

  async saveAgentTurn(input: SaveAgentTurnInput) {
    this.savedTurns.push(input);
    return "turn_demo";
  }

  async close(): Promise<void> {}
}

const validAnswers = {
  phq9_01: 0,
  phq9_02: 1,
  phq9_03: 0,
  phq9_04: 1,
  phq9_05: 0,
  phq9_06: 0,
  phq9_07: 1,
  phq9_08: 0,
  phq9_09: 0
};

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.VOICE_MODEL_MODE;
  delete process.env.VOICE_PROVIDER_MODE;
  delete process.env.ASR_SERVICE_URL;
  delete process.env.ASR_PROVIDER;
  delete process.env.ASR_MODEL;
  delete process.env.ASR_COMPUTE_BACKEND;
  delete process.env.ASR_DEVICE;
  delete process.env.ASR_CPU_OFFLOAD;
  delete process.env.ASR_CPU_OFFLOAD_GB;
  delete process.env.ASR_ALLOW_CPU_FALLBACK;
  delete process.env.ASR_LANGUAGE;
  delete process.env.ASR_TRANSCRIBE_PATH;
  delete process.env.ASR_HEALTH_PATH;
  delete process.env.LLM_PROVIDER;
  delete process.env.LLM_COMPUTE_BACKEND;
  delete process.env.LLM_DEVICE;
  delete process.env.LLM_CPU_OFFLOAD;
  delete process.env.LLM_CPU_OFFLOAD_GB;
  delete process.env.LLM_ALLOW_CPU_FALLBACK;
  delete process.env.VLLM_BASE_URL;
  delete process.env.VLLM_MODEL;
  delete process.env.VLLM_DEVICE;
  delete process.env.VLLM_CPU_OFFLOAD;
  delete process.env.VLLM_CPU_OFFLOAD_GB;
  delete process.env.VLLM_ALLOW_CPU_FALLBACK;
  delete process.env.LLM_BASE_URL;
  delete process.env.LLM_MODEL;
  delete process.env.LLM_MODELS_PATH;
  delete process.env.LLM_REQUEST_TIMEOUT_MS;
  delete process.env.LLM_TEMPERATURE;
  delete process.env.LLM_MAX_TOKENS;
  delete process.env.LLM_NUM_PREDICT;
  delete process.env.LLM_THINKING_MODE;
  delete process.env.OLLAMA_THINK;
  delete process.env.OLLAMA_BASE_URL;
  delete process.env.OLLAMA_MODEL;
  delete process.env.TTS_PROVIDER;
  delete process.env.TTS_COMPUTE_BACKEND;
  delete process.env.TTS_DEVICE;
  delete process.env.TTS_CPU_OFFLOAD;
  delete process.env.TTS_CPU_OFFLOAD_GB;
  delete process.env.TTS_ALLOW_CPU_FALLBACK;
  delete process.env.TTS_SERVICE_URL;
  delete process.env.TTS_MODEL_PATH;
  delete process.env.TTS_VOICE;
  delete process.env.TTS_SYNTHESIZE_PATH;
  delete process.env.TTS_HEALTH_PATH;
  delete process.env.TTS_REQUEST_TIMEOUT_MS;
  delete process.env.TTS_REQUEST_STYLE;
  delete process.env.RERANKER_PROVIDER;
  delete process.env.RERANKER_MODEL;
  delete process.env.RERANKER_ENABLED;
  delete process.env.RERANKER_SERVICE_URL;
  delete process.env.RERANKER_HEALTH_PATH;
  delete process.env.RERANKER_STATUS_PATH;
  delete process.env.RERANKER_COMPUTE_BACKEND;
  delete process.env.RERANKER_DEVICE;
  delete process.env.RERANKER_CPU_OFFLOAD;
  delete process.env.RERANKER_CPU_OFFLOAD_GB;
  delete process.env.RERANKER_ALLOW_CPU_FALLBACK;
  delete process.env.RERANKER_TOP_K;
  delete process.env.RERANKER_TIMEOUT_MS;
  delete process.env.RERANKER_REQUIRED_FOR_LIVE_ACCEPTANCE;
  delete process.env.BREEZYVOICE_BASE_URL;
  delete process.env.BREEZYVOICE_MODEL;
  delete process.env.BREEZYVOICE_VOICE_ID;
  delete process.env.BREEZYVOICE_DEVICE;
  delete process.env.BREEZYVOICE_CPU_OFFLOAD;
  delete process.env.BREEZYVOICE_CPU_OFFLOAD_GB;
  delete process.env.BREEZYVOICE_ALLOW_CPU_FALLBACK;
  delete process.env.REDPANDA_ADMIN_URL;
  delete process.env.REDPANDA_READY_PATH;
  delete process.env.SPRINT5_ALLOWED_LLM_PROVIDERS;
});

describe("QuestionnaireService", () => {
  it("submits a low-risk PHQ-9 response", async () => {
    const repository = new InMemoryQuestionnaireRepository();
    const service = new QuestionnaireService(repository);

    const response = await service.submitResponse({
      session_id: "sess_demo_low_risk",
      questionnaire_code: "phq9",
      questionnaire_version: "0.1.0",
      raw_answers: validAnswers
    });

    expect(response.internal_score.total).toBe(3);
    expect(response.safety_flags.requires_human_review).toBe(false);
    expect(response.public_summary.public_status_code).toBe("NORMAL_REFERENCE");
    expect(response.public_report_url).toContain("/reports/");
    expect(repository.saved?.rawAnswers).toEqual(validAnswers);
  });

  it("routes item 9 positive responses to staff review", async () => {
    const service = new QuestionnaireService(new InMemoryQuestionnaireRepository());

    const response = await service.submitResponse({
      session_id: "sess_demo_item9_positive",
      questionnaire_code: "phq9",
      questionnaire_version: "0.1.0",
      raw_answers: { ...validAnswers, phq9_09: 1 }
    });

    expect(response.safety_flags.item9_positive).toBe(true);
    expect(response.safety_flags.requires_human_review).toBe(true);
    expect(response.public_summary.public_status_code).toBe("CONSULT_STAFF");
    expect(response.public_summary.message).not.toMatch(/憂鬱症|中度憂鬱|重度憂鬱|診斷|治療建議/);
  });

  it("rejects response versions that are not the active published version", async () => {
    const service = new QuestionnaireService(new InMemoryQuestionnaireRepository());

    await expect(
      service.submitResponse({
        session_id: "sess_demo_wrong_version",
        questionnaire_code: "phq9",
        questionnaire_version: "0.2.0",
        raw_answers: validAnswers
      })
    ).rejects.toThrow("active published version");
  });

  it("validates and creates a questionnaire version draft", async () => {
    const service = new QuestionnaireService(new InMemoryQuestionnaireRepository());

    const response = await service.createVersion({
      template_id: "qtpl_phq9",
      version: "0.2.0",
      surveyjs_json: phq9Seed,
      scoring_config_code: "phq9_public_v1",
      status: "draft"
    });

    expect(response.status).toBe("draft");
  });

  it("rejects invalid SurveyJS JSON with a stable validation error", async () => {
    const service = new QuestionnaireService(new InMemoryQuestionnaireRepository());

    await expect(
      service.createVersion({
        template_id: "qtpl_phq9",
        version: "0.2.0",
        surveyjs_json: { title: "bad", pages: [{ elements: [] }] },
        scoring_config_code: "phq9_public_v1"
      })
    ).rejects.toThrow("phq9_01");
  });

  it("maps voice answers through active SurveyJS choices", async () => {
    const service = new QuestionnaireService(new InMemoryQuestionnaireRepository());

    const mapped = await service.mapVoiceAnswer({
      question_name: "phq9_01",
      transcript: "幾乎每天"
    });

    expect(mapped.candidate).toMatchObject({
      value: 3,
      requires_confirmation: true,
      evidence_text: "幾乎每天"
    });
    expect(mapped).toMatchObject({
      normalized_transcript: "幾乎每天",
      routing_decision: "high_confidence_clear_answer",
      confirmation_required: true
    });
    expect(mapped.semantic_frame?.questionnaireAnswerCandidates[0]).toMatchObject({
      optionId: "3",
      optionText: "幾乎每天"
    });
  });

  it("normalizes ASR text before mapping voice answers", async () => {
    const service = new QuestionnaireService(new InMemoryQuestionnaireRepository());

    const mapped = await service.mapVoiceAnswer({
      question_name: "phq9_01",
      transcript: "機天"
    });

    expect(mapped).toMatchObject({
      normalized_transcript: "幾天",
      routing_decision: "high_confidence_clear_answer"
    });
    expect(mapped.candidate).toMatchObject({ value: 1, text: "幾天" });
  });

  it("routes safety-sensitive speech to staff review in voice evidence metadata", async () => {
    const service = new QuestionnaireService(new InMemoryQuestionnaireRepository());

    const mapped = await service.mapVoiceAnswer({
      question_name: "phq9_09",
      transcript: "我不想活了幾天"
    });

    expect(mapped.candidate).toMatchObject({ value: 1, text: "幾天" });
    expect(mapped.routing_decision).toBe("safety_sensitive_staff_review");
    expect(mapped.semantic_frame?.safetyFlags).toContain("self_harm");
    expect(mapped.voice_evidence_metadata?.rawAudioStored).toBe(false);
  });

  it("routes low-confidence mapped speech to retry instead of treating it as answer truth", async () => {
    const service = new QuestionnaireService(new InMemoryQuestionnaireRepository());

    const mapped = await service.mapVoiceAnswer({
      question_name: "phq9_01",
      transcript: "幾乎每天",
      asr_confidence: 0.4
    });

    expect(mapped.candidate).toMatchObject({ value: 3 });
    expect(mapped.routing_decision).toBe("low_confidence_retry");
    expect(mapped.confirmation_required).toBe(true);
  });

  it("stores reranker option trace without letting reranker choose the answer", async () => {
    process.env.RERANKER_ENABLED = "true";
    process.env.RERANKER_SERVICE_URL = "http://reranker.local";
    const fetchMock = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          candidateOptions: [{ optionId: "3", text: "幾乎每天", score: 0.99, rank: 1 }],
          confirmationRequired: true
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      );
    });
    vi.stubGlobal("fetch", fetchMock);
    const repository = new InMemoryQuestionnaireRepository();
    const service = new QuestionnaireService(repository);

    const mapped = await service.mapVoiceAnswer({
      question_name: "phq9_01",
      transcript: "完全沒有"
    });

    expect(mapped.candidate).toMatchObject({ value: 0, text: "完全沒有" });
    expect(mapped.reranker_trace).toMatchObject({
      provider: "qwen3_reranker_0_6b",
      model: "Qwen3-Reranker-0.6B",
      mode: "mock",
      candidate_options: [{ optionId: "3", text: "幾乎每天", score: 0.99, rank: 1 }],
      confirmation_required: true
    });
    expect(repository.savedTurns[0]?.payload).toMatchObject({
      candidate: { value: 0 },
      reranker_trace: { candidate_options: [{ optionId: "3" }] }
    });
  });

  it("keeps deterministic voice mapping when reranker options are unavailable", async () => {
    process.env.RERANKER_ENABLED = "true";
    process.env.RERANKER_SERVICE_URL = "http://reranker.local";
    vi.stubGlobal("fetch", vi.fn(async () => new Response("down", { status: 503 })));
    const service = new QuestionnaireService(new InMemoryQuestionnaireRepository());

    const mapped = await service.mapVoiceAnswer({
      question_name: "phq9_01",
      transcript: "幾天"
    });

    expect(mapped.candidate).toMatchObject({ value: 1, text: "幾天" });
    expect(mapped.reranker_trace).toMatchObject({
      mode: "unavailable",
      candidate_options: [],
      confirmation_required: true,
      error_code: "Error"
    });
  });

  it("calls the configured faster-whisper Breeze ASR adapter in real mode", async () => {
    process.env.VOICE_MODEL_MODE = "real";
    process.env.ASR_SERVICE_URL = "http://asr.local";
    const fetchMock = vi.fn(async () => {
      return new Response(JSON.stringify({ text: "幾乎每天", confidence: 0.91, durationMs: 42 }), {
        status: 200,
        headers: { "content-type": "application/json" }
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const service = new QuestionnaireService(new InMemoryQuestionnaireRepository());
    const response = await service.runAsr({
      audio_base64: "UklGRg==",
      audio_format: "wav",
      question_name: "phq9_01"
    });

    expect(response).toMatchObject({
      provider: "faster_whisper_breeze_asr_26",
      model: "Breeze-ASR-26-CT2-int8",
      transcript: "幾乎每天"
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://asr.local/v1/asr/transcribe",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('"audio_format":"wav"')
      })
    );
  });

  it("calls local Gemma 4 E4B through native Ollama with thinking disabled in real mode", async () => {
    process.env.VOICE_MODEL_MODE = "real";
    process.env.LLM_BASE_URL = "http://ollama.local";
    process.env.LLM_MODEL = "gemma4:e4b";
    const fetchMock = vi.fn<typeof fetch>(async () => {
      return new Response(JSON.stringify({ message: { content: "請依照題目選一個最接近的頻率。" } }), {
        status: 200,
        headers: { "content-type": "application/json" }
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const service = new QuestionnaireService(new InMemoryQuestionnaireRepository());
    const response = await service.buildGuidance({ question_name: "phq9_01" });

    expect(response).toMatchObject({
      provider: "ollama_native",
      model: "gemma4:e4b",
      guidance: "請依照題目選一個最接近的頻率。"
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://ollama.local/api/chat",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('"think":false')
      })
    );
    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
    expect(body.messages[0].content).toContain("回答 1 到 5 句話");
    expect(body.messages[0].content).toContain("這題需要現場人員關心與協助");
    expect(body.options.temperature).toBe(0.3);
    expect(body.options.num_predict).toBe(80);
  });

  it("builds a wake greeting guidance turn before question recording", async () => {
    const service = new QuestionnaireService(new InMemoryQuestionnaireRepository());
    const response = await service.buildGuidance({ purpose: "wake_greeting" });

    const guidance = response.guidance ?? "";
    expect(guidance).toContain("慧誠智醫健康互動助理");
    expect(guidance.split("。").filter(Boolean).length).toBeLessThanOrEqual(3);
  });

  it("falls back to deterministic guidance when live LLM guidance is unusable", async () => {
    process.env.VOICE_MODEL_MODE = "real";
    process.env.LLM_BASE_URL = "http://ollama.local";
    process.env.LLM_MODEL = "gemma4:e4b";
    const fetchMock = vi.fn(async () => {
      return new Response(JSON.stringify({ message: { content: "ering ering ering" } }), {
        status: 200,
        headers: { "content-type": "application/json" }
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const service = new QuestionnaireService(new InMemoryQuestionnaireRepository());
    const response = await service.buildGuidance({ question_name: "phq9_01" });

    expect(response.guidance ?? "").toContain("做事時提不起勁或沒有樂趣");
    expect(response).toMatchObject({
      provider: "ollama_native",
      model: "gemma4:e4b"
    });
  });

  it("can raise native Ollama output budget when thinking mode is explicitly enabled", async () => {
    process.env.VOICE_MODEL_MODE = "real";
    process.env.LLM_BASE_URL = "http://ollama.local";
    process.env.LLM_MODEL = "gemma4:e4b";
    process.env.OLLAMA_THINK = "true";
    process.env.LLM_MAX_TOKENS = "768";
    const fetchMock = vi.fn<typeof fetch>(async () => {
      return new Response(JSON.stringify({ message: { content: "請依照題目選擇最符合的頻率。" } }), {
        status: 200,
        headers: { "content-type": "application/json" }
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const service = new QuestionnaireService(new InMemoryQuestionnaireRepository());
    await service.buildGuidance({ question_name: "phq9_01" });

    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
    expect(body).toMatchObject({
      think: true,
      options: { num_predict: 768 }
    });
  });

  it("calls BreezyVoice without a customized voice in real mode", async () => {
    process.env.VOICE_MODEL_MODE = "real";
    process.env.BREEZYVOICE_BASE_URL = "http://breezy.local/v1";
    process.env.BREEZYVOICE_MODEL = "MediaTek-Research/BreezyVoice";
    process.env.BREEZYVOICE_VOICE_ID = "default";
    const fetchMock = vi.fn(async () => {
      return new Response(new Uint8Array([1, 2, 3]), {
        status: 200,
        headers: { "content-type": "audio/wav" }
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const repository = new InMemoryQuestionnaireRepository();
    const service = new QuestionnaireService(repository);
    const response = await service.runTts({ text: "請依照題目回答。" });

    expect(response).toMatchObject({
      provider: "breezyvoice_default",
      model: "MediaTek-Research/BreezyVoice",
      audio_data_url: "data:audio/wav;base64,AQID"
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://breezy.local/v1/audio/speech",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('"voice":"default"')
      })
    );
    expect(repository.savedTurns[0]?.payload).toMatchObject({
      voice: "default",
      customized_voice: false
    });
  });

  it("rejects a configured customized BreezyVoice voice", async () => {
    process.env.VOICE_MODEL_MODE = "real";
    process.env.BREEZYVOICE_BASE_URL = "http://breezy.local/v1";
    process.env.TTS_VOICE = "jason-custom";

    const service = new QuestionnaireService(new InMemoryQuestionnaireRepository());

    await expect(service.runTts({ text: "請依照題目回答。" })).rejects.toThrow(
      "Only BreezyVoice default voice is accepted"
    );
  });

  it("rejects customized TTS voice request fields", async () => {
    const service = new QuestionnaireService(new InMemoryQuestionnaireRepository());

    await expect(
      service.runTts({
        text: "請依照題目回答。",
        reference_audio_base64: "custom"
      })
    ).rejects.toThrow("Custom TTS voice field is not accepted");
  });

  it("reports mock provider status without probing live services", async () => {
    const service = new QuestionnaireService(new InMemoryQuestionnaireRepository());

    await expect(service.getProviderStatus()).resolves.toMatchObject({
      asr: { provider: "faster_whisper_breeze_asr_26", mode: "mock", ready: true, acceptanceEligible: false },
      llm: { provider: "ollama_native", model: "gemma4:e4b", mode: "mock", ready: true, acceptanceEligible: false },
      tts: { provider: "breezyvoice_default", mode: "mock", ready: true, acceptanceEligible: false },
      redpanda: { provider: "redpanda", mode: "mock", ready: true, acceptanceEligible: false },
      sprint5Acceptance: { allRequiredLive: false, eligible: false }
    });
  });

  it("reports Sprint 5 eligible provider status only when all live probes pass", async () => {
    process.env.VOICE_MODEL_MODE = "real";
    process.env.ASR_SERVICE_URL = "http://asr.local";
    process.env.ASR_DEVICE = "cuda";
    process.env.LLM_BASE_URL = "http://ollama.local";
    process.env.LLM_MODEL = "gemma4:e4b";
    process.env.LLM_DEVICE = "cuda";
    process.env.TTS_SERVICE_URL = "http://tts.local";
    process.env.TTS_DEVICE = "cuda";
    process.env.RERANKER_SERVICE_URL = "http://reranker.local";
    process.env.RERANKER_DEVICE = "cuda";
    process.env.REDPANDA_ADMIN_URL = "http://redpanda.local";
    const fetchMock = vi.fn(async () => {
      return new Response(JSON.stringify({ status: "ok" }), {
        status: 200,
        headers: { "content-type": "application/json" }
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const service = new QuestionnaireService(new InMemoryQuestionnaireRepository());

    await expect(service.getProviderStatus()).resolves.toMatchObject({
      providers: {
        asr: { mode: "live", ready: true, acceptanceEligible: true, computeBackend: "gpu", cpuOffload: false },
        llm: { mode: "live", model: "gemma4:e4b", ready: true, acceptanceEligible: true, computeBackend: "gpu", cpuOffload: false },
        tts: { mode: "live", ready: true, acceptanceEligible: true, computeBackend: "gpu", cpuOffload: false },
        reranker: { mode: "live", ready: true, acceptanceEligible: true, computeBackend: "gpu", cpuOffload: false },
        redpanda: { mode: "live", ready: true, acceptanceEligible: true }
      },
      sprint5Acceptance: { allRequiredLive: true, eligible: true }
    });
    expect(fetchMock).toHaveBeenCalledWith("http://asr.local/healthz", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://ollama.local/api/chat", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://tts.local/healthz", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://reranker.local/status", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://redpanda.local/v1/status/ready", expect.any(Object));
  });

  it("does not count mock reranker as live when reranker is required", async () => {
    process.env.VOICE_MODEL_MODE = "real";
    process.env.ASR_DEVICE = "cuda";
    process.env.LLM_DEVICE = "cuda";
    process.env.TTS_DEVICE = "cuda";
    process.env.RERANKER_DEVICE = "cuda";
    process.env.RERANKER_REQUIRED_FOR_LIVE_ACCEPTANCE = "true";
    process.env.RERANKER_SERVICE_URL = "http://reranker.local";
    const fetchMock = vi.fn(async (url: string | URL | Request) => {
      const requestUrl = String(url);
      const body = requestUrl === "http://reranker.local/status" ? { mode: "mock" } : { status: "ok" };
      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { "content-type": "application/json" }
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const service = new QuestionnaireService(new InMemoryQuestionnaireRepository());

    await expect(service.getProviderStatus()).resolves.toMatchObject({
      providers: {
        reranker: { mode: "mock", ready: true, acceptanceEligible: false }
      },
      sprint5Acceptance: { allRequiredLive: false, eligible: false }
    });
  });

  it("accepts native Ollama Gemma endpoint for strict Sprint 5 eligibility", async () => {
    process.env.VOICE_MODEL_MODE = "real";
    process.env.ASR_DEVICE = "cuda";
    process.env.LLM_DEVICE = "cuda";
    process.env.TTS_DEVICE = "cuda";
    process.env.RERANKER_DEVICE = "cuda";
    process.env.LLM_PROVIDER = "ollama_native";
    process.env.LLM_BASE_URL = "http://ollama.local";
    process.env.LLM_MODEL = "gemma4:e4b";
    const fetchMock = vi.fn(async () => {
      return new Response(JSON.stringify({ status: "ok" }), {
        status: 200,
        headers: { "content-type": "application/json" }
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const service = new QuestionnaireService(new InMemoryQuestionnaireRepository());

    await expect(service.getProviderStatus()).resolves.toMatchObject({
      providers: {
        llm: {
          provider: "ollama_native",
          model: "gemma4:e4b",
          mode: "live",
          ready: true,
          acceptanceEligible: true,
          error_code: undefined
        }
      },
      sprint5Acceptance: { allRequiredLive: true, eligible: true }
    });
  });

  it("rejects an LLM provider outside the strict Sprint 5 allowlist", async () => {
    process.env.VOICE_MODEL_MODE = "real";
    process.env.ASR_DEVICE = "cuda";
    process.env.LLM_DEVICE = "cuda";
    process.env.TTS_DEVICE = "cuda";
    process.env.RERANKER_DEVICE = "cuda";
    process.env.LLM_PROVIDER = "experimental_llm";
    process.env.LLM_BASE_URL = "http://experimental.local/v1";
    process.env.LLM_MODEL = "gemma-experimental";
    const fetchMock = vi.fn(async () => {
      return new Response(JSON.stringify({ status: "ok" }), {
        status: 200,
        headers: { "content-type": "application/json" }
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const service = new QuestionnaireService(new InMemoryQuestionnaireRepository());

    await expect(service.getProviderStatus()).resolves.toMatchObject({
      providers: {
        llm: {
          provider: "experimental_llm",
          mode: "live",
          ready: true,
          acceptanceEligible: false,
          error_code: "LLM_PROVIDER_NOT_ALLOWED"
        }
      },
      sprint5Acceptance: { allRequiredLive: true, eligible: false }
    });
  });

  it("requires GPU-only AI model runtime for Sprint 5 eligibility", async () => {
    process.env.VOICE_MODEL_MODE = "real";
    process.env.ASR_DEVICE = "cpu";
    process.env.LLM_DEVICE = "cuda";
    process.env.VLLM_CPU_OFFLOAD_GB = "3";
    process.env.TTS_COMPUTE_BACKEND = "mixed";
    const fetchMock = vi.fn(async () => {
      return new Response(JSON.stringify({ status: "ok" }), {
        status: 200,
        headers: { "content-type": "application/json" }
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const service = new QuestionnaireService(new InMemoryQuestionnaireRepository());

    await expect(service.getProviderStatus()).resolves.toMatchObject({
      providers: {
        asr: {
          mode: "live",
          ready: true,
          acceptanceEligible: false,
          computeBackend: "cpu",
          error_code: "GPU_ONLY_REQUIRED"
        },
        llm: {
          mode: "live",
          ready: true,
          acceptanceEligible: false,
          computeBackend: "gpu",
          cpuOffload: true,
          error_code: "GPU_ONLY_REQUIRED"
        },
        tts: {
          mode: "live",
          ready: true,
          acceptanceEligible: false,
          computeBackend: "mixed",
          error_code: "GPU_ONLY_REQUIRED"
        }
      },
      sprint5Acceptance: { allRequiredLive: true, eligible: false }
    });
  });

  it("reports unavailable provider status when live probes fail", async () => {
    process.env.VOICE_MODEL_MODE = "real";
    const fetchMock = vi.fn(async () => new Response("down", { status: 503 }));
    vi.stubGlobal("fetch", fetchMock);

    const service = new QuestionnaireService(new InMemoryQuestionnaireRepository());

    await expect(service.getProviderStatus()).resolves.toMatchObject({
      asr: { mode: "unavailable", ready: false, error_code: "HTTP_503" },
      llm: { mode: "unavailable", ready: false, error_code: "HTTP_503" },
      tts: { mode: "unavailable", ready: false, error_code: "HTTP_503" },
      redpanda: { mode: "unavailable", ready: false, error_code: "HTTP_503" },
      sprint5Acceptance: { allRequiredLive: false, eligible: false }
    });
  });
});
