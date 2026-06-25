import { z } from "zod";

export type ModuleStatus = "phase_1_core" | "phase_2_planned";

export interface ModuleManifest {
  module_id: string;
  module_version: string;
  display_name: string;
  status: ModuleStatus;
  enabled_by_default: boolean;
  can_run_standalone?: boolean;
  depends_on?: string[];
  input_contract?: string;
  output_contract?: string;
  public_report_section?: string;
}

export interface HealthzResponse {
  status: "ok";
  service: "api-server";
  version: "0.1.0";
}

export interface ActiveQuestionnaireResponse {
  questionnaire_code: "phq9";
  questionnaire_version: string;
  questionnaire_version_id?: string;
  title: string;
  surveyjs_json: unknown;
  surveyjs_json_path: string;
  public_scoring_config_path: string;
  scoring_config_code: "phq9_public_v1";
}

export type Phq9ItemKey =
  | "phq9_01"
  | "phq9_02"
  | "phq9_03"
  | "phq9_04"
  | "phq9_05"
  | "phq9_06"
  | "phq9_07"
  | "phq9_08"
  | "phq9_09";

export type Phq9RawAnswers = Record<Phq9ItemKey, number>;

export interface CompletedQuestionnaireRequest {
  session_id: string;
  questionnaire_code: string;
  questionnaire_version: string;
  raw_answers: Record<string, unknown>;
}

export interface InternalScore {
  total: number;
  item9: number;
  internal_band: "minimal_reference" | "staff_review_reference";
}

export interface SafetyFlags {
  requires_human_review: boolean;
  item9_positive: boolean;
}

export interface PublicSummary {
  public_status_code: "NORMAL_REFERENCE" | "CONSULT_STAFF";
  title: "健康問卷已完成";
  message: string;
}

export interface CompletedQuestionnaireResponse {
  response_id: string;
  session_id: string;
  questionnaire_code: "phq9";
  questionnaire_version: string;
  internal_score: InternalScore;
  safety_flags: SafetyFlags;
  public_summary: PublicSummary;
  public_report_token?: string;
  public_report_url?: string;
  qr_payload?: string;
}

export type QuestionnaireVersionStatus = "draft" | "published" | "archived";

export interface QuestionnaireTemplateSummary {
  id: string;
  code: "phq9";
  title: string;
  description: string;
  active_version_id: string | null;
  active_version: string | null;
  status: QuestionnaireVersionStatus | "none";
  updated_at: string;
}

export interface QuestionnaireVersionSummary {
  id: string;
  template_id: string;
  questionnaire_code: "phq9";
  version: string;
  status: QuestionnaireVersionStatus;
  is_active: boolean;
}

export interface AdminQuestionnaireTemplatesResponse {
  templates: QuestionnaireTemplateSummary[];
}

export interface CreateQuestionnaireTemplateRequest {
  code: "phq9";
  title: string;
  description: string;
}

export interface CreateQuestionnaireVersionRequest {
  template_id: string;
  version: string;
  surveyjs_json: unknown;
  scoring_config_code: "phq9_public_v1";
  status?: QuestionnaireVersionStatus;
}

export interface AdminQuestionnaireResponseSummary {
  response_id: string;
  session_id: string;
  questionnaire_code: "phq9";
  questionnaire_version: string;
  public_status_code: PublicSummary["public_status_code"];
  requires_human_review: boolean;
  public_report_token: string | null;
  public_report_url: string | null;
  created_at: string;
}

export interface AdminQuestionnaireResponsesResponse {
  responses: AdminQuestionnaireResponseSummary[];
}

export interface PublicReportSection {
  module_id: "questionnaire";
  title: PublicSummary["title"];
  public_status_code: PublicSummary["public_status_code"];
  summary: string;
  disclaimer: string;
}

export interface PublicReportResponse {
  report_id: string;
  token: string;
  sections: PublicReportSection[];
}

export const VoiceProviderModeSchema = z.enum(["mock", "live", "unavailable"]);
export type VoiceProviderMode = z.infer<typeof VoiceProviderModeSchema>;

export const AvatarStateSchema = z.enum([
  "idle_touch_ready",
  "wake_armed",
  "wake_detected",
  "recording_answer",
  "endpointing_wait",
  "transcribing",
  "normalizing_asr",
  "building_semantic_frame",
  "ranking_candidates",
  "confirming_candidate",
  "clarifying_ambiguous",
  "committed",
  "retry_or_touch",
  "voice_unavailable",
  "staff_review"
]);
export type AvatarState = z.infer<typeof AvatarStateSchema>;

export const ProviderRuntimeStatusSchema = z.object({
  provider: z.string(),
  model: z.string().optional(),
  mode: VoiceProviderModeSchema,
  ready: z.boolean(),
  healthy: z.boolean().optional(),
  acceptanceEligible: z.boolean().optional(),
  computeBackend: z.enum(["gpu", "cpu", "mixed", "unknown"]).optional(),
  gpuRequired: z.boolean().optional(),
  cpuOffload: z.boolean().optional(),
  cpuFallbackAllowed: z.boolean().optional(),
  endpoint: z.string().optional(),
  latencyMs: z.number().optional(),
  lastError: z.string().nullable().optional(),
  fallback: z.string().optional(),
  error_code: z.string().optional()
});
export type ProviderRuntimeStatus = z.infer<typeof ProviderRuntimeStatusSchema>;

export const ProviderStatusResponseSchema = z.object({
  asr: ProviderRuntimeStatusSchema,
  llm: ProviderRuntimeStatusSchema,
  tts: ProviderRuntimeStatusSchema,
  reranker: ProviderRuntimeStatusSchema.optional(),
  redpanda: ProviderRuntimeStatusSchema.optional(),
  providers: z
    .object({
      asr: ProviderRuntimeStatusSchema,
      llm: ProviderRuntimeStatusSchema,
      tts: ProviderRuntimeStatusSchema,
      reranker: ProviderRuntimeStatusSchema.optional(),
      redpanda: ProviderRuntimeStatusSchema
    })
    .optional(),
  sprint5Acceptance: z
    .object({
      allRequiredLive: z.boolean(),
      eligible: z.boolean()
    })
    .optional()
});
export type ProviderStatusResponse = z.infer<typeof ProviderStatusResponseSchema>;

export const ASRTranscribeRequestSchema = z.object({
  audio_base64: z.string().min(1),
  audio_format: z.string().default("wav"),
  language_hint: z.string().optional(),
  hotwords: z.array(z.string()).optional(),
  session_id: z.string().optional()
});
export type ASRTranscribeRequest = z.infer<typeof ASRTranscribeRequestSchema>;

export const ASRTranscribeResponseSchema = z.object({
  transcript: z.string(),
  confidence: z.number().optional(),
  language: z.string().optional(),
  duration_ms: z.number().optional()
});
export type ASRTranscribeResponse = z.infer<typeof ASRTranscribeResponseSchema>;

export const LLMGuidanceRequestSchema = z.object({
  question_name: z.string().optional(),
  prompt: z.string().min(1)
});
export type LLMGuidanceRequest = z.infer<typeof LLMGuidanceRequestSchema>;

export const LLMGuidanceResponseSchema = z.object({
  guidance: z.string()
});
export type LLMGuidanceResponse = z.infer<typeof LLMGuidanceResponseSchema>;

export const TTSSynthesizeRequestSchema = z
  .object({
    text: z.string().min(1),
    voice_id: z.literal("default").optional(),
    response_format: z.literal("wav").default("wav")
  })
  .strict();
export type TTSSynthesizeRequest = z.infer<typeof TTSSynthesizeRequestSchema>;

export const TTSSynthesizeResponseSchema = z.object({
  audio_base64: z.string(),
  mime_type: z.literal("audio/wav").default("audio/wav")
});
export type TTSSynthesizeResponse = z.infer<typeof TTSSynthesizeResponseSchema>;

export interface SurveyChoice {
  value: number;
  text: string;
}

export interface SurveyQuestionContext {
  name: Phq9ItemKey;
  title: string;
  choices: SurveyChoice[];
}

export interface AgentSessionResponse {
  agent_session_id: string;
  status: "created";
}

export interface AgentTurnResponse {
  agent_turn_id: string;
  provider: string;
  model?: string;
  transcript?: string;
  guidance?: string;
  audio_data_url?: string;
  audio_url?: string;
}

export interface VoiceAnswerCandidate {
  value: number;
  text: string;
  confidence: number;
  requires_confirmation: true;
  evidence_text?: string;
}

export interface VoiceAnswerMappingResponse {
  candidate: VoiceAnswerCandidate | null;
  transcript: string;
  normalized_transcript?: string;
  routing_decision?: VoiceRoutingDecision;
  confirmation_required?: boolean;
  semantic_frame?: VoiceSemanticFrame;
  voice_evidence_metadata?: VoiceEvidenceMetadata;
}

export const VoiceDomainTermCategorySchema = z.enum([
  "answer_option",
  "symptom",
  "measurement",
  "health_behavior",
  "disease_history",
  "module_command",
  "report_access",
  "safety"
]);
export type VoiceDomainTermCategory = z.infer<typeof VoiceDomainTermCategorySchema>;

export const VoiceDomainPackTermSchema = z.object({
  term: z.string(),
  category: VoiceDomainTermCategorySchema,
  aliases: z.array(z.string()).default([]),
  commonAsrErrors: z.array(z.string()).default([])
});
export type VoiceDomainPackTerm = z.infer<typeof VoiceDomainPackTermSchema>;

export const VoiceDomainAnswerAliasSchema = z.object({
  questionPattern: z.string().optional(),
  optionValue: z.union([z.string(), z.number(), z.boolean()]),
  optionText: z.string(),
  aliases: z.array(z.string()),
  ambiguousWith: z.array(z.union([z.string(), z.number(), z.boolean()])).optional(),
  confirmationRequired: z.literal(true)
});
export type VoiceDomainAnswerAlias = z.infer<typeof VoiceDomainAnswerAliasSchema>;

export const VoiceSafetyFlagSchema = z.enum(["self_harm", "chest_pain", "breathing_difficulty", "fall_risk", "none"]);
export type VoiceSafetyFlag = z.infer<typeof VoiceSafetyFlagSchema>;

export const VoiceDomainPackSchema = z.object({
  domainId: z.string(),
  version: z.string(),
  language: z.literal("zh-TW"),
  moduleId: z.enum(["questionnaire", "vision", "hearing", "avatar", "report", "kiosk"]).optional(),
  questionnaireCode: z.string().optional(),
  sourceFiles: z.array(z.string()),
  hotwords: z.array(z.string()),
  canonicalTerms: z.array(VoiceDomainPackTermSchema),
  answerAliases: z.array(VoiceDomainAnswerAliasSchema),
  semanticSlots: z.array(z.object({ slot: z.string(), examples: z.array(z.string()) })),
  safetyRules: z.array(
    z.object({
      flag: VoiceSafetyFlagSchema.exclude(["none"]),
      triggerTerms: z.array(z.string()),
      route: z.enum(["confirm", "staff_review"])
    })
  ),
  retrievalTemplates: z.array(z.object({ intent: z.string(), template: z.string() })),
  confirmationTemplates: z.object({
    singleCandidate: z.string(),
    multipleCandidates: z.string(),
    lowConfidence: z.string(),
    touchFallback: z.string()
  })
});
export type VoiceDomainPack = z.infer<typeof VoiceDomainPackSchema>;

export const AsrHypothesisSchema = z.object({
  text: z.string(),
  rank: z.number(),
  confidence: z.number().optional(),
  avgLogprob: z.number().optional(),
  source: z.enum(["provider_n_best", "provider_top1"])
});
export type AsrHypothesis = z.infer<typeof AsrHypothesisSchema>;

export const AsrHypothesisSetSchema = z.object({
  primaryText: z.string(),
  nBestAvailable: z.boolean(),
  hypotheses: z.array(AsrHypothesisSchema),
  hotwordsRequested: z.array(z.string()),
  hotwordsApplied: z.boolean()
});
export type AsrHypothesisSet = z.infer<typeof AsrHypothesisSetSchema>;

export const VoiceSemanticFrameSchema = z.object({
  rawText: z.string(),
  normalizedText: z.string(),
  language: z.literal("zh-TW"),
  intent: z.enum([
    "questionnaire_answer",
    "symptom_description",
    "measurement_value",
    "command_or_faq",
    "confirmation_response",
    "unclear",
    "other"
  ]),
  symptoms: z.array(z.string()),
  questionnaireAnswerCandidates: z.array(
    z.object({
      optionId: z.string().optional(),
      optionText: z.string(),
      confidence: z.number(),
      evidenceText: z.string()
    })
  ),
  temporalExpressions: z.array(z.string()),
  negations: z.array(z.string()),
  safetyFlags: z.array(VoiceSafetyFlagSchema),
  retrievalQuery: z.string().optional()
});
export type VoiceSemanticFrame = z.infer<typeof VoiceSemanticFrameSchema>;

export const VoiceRoutingDecisionSchema = z.enum([
  "high_confidence_clear_answer",
  "medium_confidence_needs_confirmation",
  "ambiguous_multiple_candidates",
  "low_confidence_retry",
  "no_speech_retry",
  "voice_unavailable_touch_fallback",
  "safety_sensitive_staff_review"
]);
export type VoiceRoutingDecision = z.infer<typeof VoiceRoutingDecisionSchema>;

export const VoiceEvidenceMetadataSchema = z.object({
  audioId: z.string(),
  rawAudioStored: z.literal(false),
  asrProvider: z.string(),
  asrModel: z.string(),
  activeDomainPackIds: z.array(z.string()),
  hotwordsRequested: z.array(z.string()),
  hotwordsApplied: z.boolean(),
  asrText: z.string(),
  normalizedText: z.string(),
  asrConfidence: z.number().optional(),
  vadConfidence: z.number().optional(),
  utteranceDurationMs: z.number(),
  endpointingMode: z.enum(["standard", "elder"]),
  segmentTimestamps: z.array(
    z.object({
      startMs: z.number(),
      endMs: z.number(),
      text: z.string(),
      avgLogprob: z.number().optional(),
      noSpeechProb: z.number().optional()
    })
  ),
  nBestAvailable: z.boolean(),
  nBestTranscripts: z.array(z.object({ text: z.string(), rank: z.number(), confidence: z.number().optional() })),
  semanticFrame: VoiceSemanticFrameSchema,
  routingDecision: VoiceRoutingDecisionSchema,
  confirmationRequired: z.boolean(),
  domainPackVersions: z.record(z.string(), z.string())
});
export type VoiceEvidenceMetadata = z.infer<typeof VoiceEvidenceMetadataSchema>;

export const VoiceCandidateConfirmationSchema = z.object({
  transcript: z.string(),
  normalizedTranscript: z.string(),
  candidate: z.object({
    optionId: z.string().optional(),
    optionText: z.string(),
    confidence: z.number(),
    evidenceText: z.string()
  }),
  routingDecision: VoiceRoutingDecisionSchema,
  confirmationRequired: z.literal(true)
});
export type VoiceCandidateConfirmation = z.infer<typeof VoiceCandidateConfirmationSchema>;

export const RerankDocumentSchema = z.object({
  id: z.string(),
  text: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional()
});
export type RerankDocument = z.infer<typeof RerankDocumentSchema>;

export const RerankRequestSchema = z.object({
  query: z.string(),
  documents: z.array(RerankDocumentSchema),
  topK: z.number().optional(),
  instruction: z.string().optional()
});
export type RerankRequest = z.infer<typeof RerankRequestSchema>;

export const RerankResultSchema = z.object({
  id: z.string(),
  score: z.number(),
  rank: z.number(),
  metadata: z.record(z.string(), z.unknown()).optional()
});
export type RerankResult = z.infer<typeof RerankResultSchema>;

export const RerankResponseSchema = z.object({
  provider: z.string(),
  model: z.string(),
  results: z.array(RerankResultSchema)
});
export type RerankResponse = z.infer<typeof RerankResponseSchema>;

export const RerankOptionsRequestSchema = z.object({
  query: z.string(),
  questionId: z.string(),
  options: z.array(z.object({ optionId: z.string(), text: z.string() })),
  topK: z.number().optional()
});
export type RerankOptionsRequest = z.infer<typeof RerankOptionsRequestSchema>;

export const RerankOptionsResponseSchema = z.object({
  candidateOptions: z.array(
    z.object({
      optionId: z.string(),
      text: z.string(),
      score: z.number(),
      rank: z.number()
    })
  ),
  confirmationRequired: z.literal(true)
});
export type RerankOptionsResponse = z.infer<typeof RerankOptionsResponseSchema>;

export type ShcEventType =
  | "shc.questionnaire.response.completed.v1"
  | "shc.agent.turn.created.v1"
  | "shc.report.created.v1"
  | "shc.audit.event.created.v1";

export interface ShcEventEnvelope {
  specversion: "1.0";
  id: string;
  source: string;
  type: ShcEventType;
  subject: string;
  time: string;
  tenant_id: "tenant_demo";
  kiosk_id: "kiosk_demo";
  session_id?: string;
  data: Record<string, unknown>;
}

export const SHC_EVENT_TOPICS: Record<ShcEventType, string> = {
  "shc.questionnaire.response.completed.v1": "shc.questionnaire.responses.v1",
  "shc.agent.turn.created.v1": "shc.agent.turns.v1",
  "shc.report.created.v1": "shc.report.events.v1",
  "shc.audit.event.created.v1": "shc.audit.events.v1"
};

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
  };
}
