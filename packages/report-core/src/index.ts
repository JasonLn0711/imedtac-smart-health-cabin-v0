import type { InternalScore, PublicReportSection, PublicSummary, SafetyFlags } from "@shc/contracts";

export const DIAGNOSTIC_PUBLIC_WORDS = ["憂鬱症", "中度憂鬱", "重度憂鬱", "診斷", "治療建議"];
export const PUBLIC_REPORT_DISCLAIMER =
  "本結果僅供健康自我檢測與現場人員參考，不能替代醫護人員評估。";

export function buildPhq9PublicSummary(
  internalScore: InternalScore,
  safetyFlags: SafetyFlags
): PublicSummary {
  if (safetyFlags.item9_positive) {
    return {
      public_status_code: "CONSULT_STAFF",
      title: "健康問卷已完成",
      message: "您有填答到需要進一步關心的項目，建議洽詢現場人員或醫護人員協助。"
    };
  }

  if (internalScore.total <= 9) {
    return {
      public_status_code: "NORMAL_REFERENCE",
      title: "健康問卷已完成",
      message: "本次問卷結果可作為健康自我檢測參考，若有持續困擾，建議洽詢現場人員或醫護人員。"
    };
  }

  return {
    public_status_code: "CONSULT_STAFF",
    title: "健康問卷已完成",
    message: "本次填答結果顯示有部分狀況值得進一步關心，建議洽詢現場人員或醫護人員。"
  };
}

export function assertPublicSummaryIsNonDiagnostic(summary: PublicSummary): void {
  for (const word of DIAGNOSTIC_PUBLIC_WORDS) {
    if (summary.message.includes(word) || summary.title.includes(word)) {
      throw new Error(`Public summary contains disallowed diagnostic wording: ${word}`);
    }
  }
}

export function buildPublicReportSection(summary: PublicSummary): PublicReportSection {
  assertPublicSummaryIsNonDiagnostic(summary);
  if (DIAGNOSTIC_PUBLIC_WORDS.some((word) => PUBLIC_REPORT_DISCLAIMER.includes(word))) {
    throw new Error("Public report disclaimer contains disallowed diagnostic wording");
  }

  return {
    module_id: "questionnaire",
    title: summary.title,
    public_status_code: summary.public_status_code,
    summary: summary.message,
    disclaimer: PUBLIC_REPORT_DISCLAIMER
  };
}
