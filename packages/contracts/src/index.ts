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
  "confirming_candidate",
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
  redpanda: ProviderRuntimeStatusSchema.optional(),
  providers: z
    .object({
      asr: ProviderRuntimeStatusSchema,
      llm: ProviderRuntimeStatusSchema,
      tts: ProviderRuntimeStatusSchema,
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
}

export interface VoiceAnswerMappingResponse {
  candidate: VoiceAnswerCandidate | null;
  transcript: string;
}

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
