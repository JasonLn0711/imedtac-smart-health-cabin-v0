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
  questionnaire_version: "0.1.0";
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
  questionnaire_version: "0.1.0";
  internal_score: InternalScore;
  safety_flags: SafetyFlags;
  public_summary: PublicSummary;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
  };
}
