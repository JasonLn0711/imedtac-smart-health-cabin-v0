import { describe, expect, it } from "vitest";
import {
  assertPublicSummaryIsNonDiagnostic,
  buildPhq9PublicSummary,
  buildPublicReportSection,
  DIAGNOSTIC_PUBLIC_WORDS
} from ".";

describe("PHQ-9 public summary", () => {
  it("maps low scores to normal reference wording", () => {
    const summary = buildPhq9PublicSummary(
      { total: 3, item9: 0, internal_band: "minimal_reference" },
      { item9_positive: false, requires_human_review: false }
    );

    expect(summary.public_status_code).toBe("NORMAL_REFERENCE");
    expect(() => assertPublicSummaryIsNonDiagnostic(summary)).not.toThrow();
  });

  it("maps total >= 10 to staff consultation without diagnostic wording", () => {
    const summary = buildPhq9PublicSummary(
      { total: 12, item9: 0, internal_band: "staff_review_reference" },
      { item9_positive: false, requires_human_review: false }
    );

    expect(summary.public_status_code).toBe("CONSULT_STAFF");
    expect(() => assertPublicSummaryIsNonDiagnostic(summary)).not.toThrow();
  });

  it("maps item 9 positive to human review", () => {
    const summary = buildPhq9PublicSummary(
      { total: 1, item9: 1, internal_band: "minimal_reference" },
      { item9_positive: true, requires_human_review: true }
    );

    expect(summary.public_status_code).toBe("CONSULT_STAFF");
    expect(summary.message).toContain("現場人員或醫護人員");
  });

  it("keeps all configured public messages free of diagnostic terms", () => {
    const messages = [
      buildPhq9PublicSummary(
        { total: 3, item9: 0, internal_band: "minimal_reference" },
        { item9_positive: false, requires_human_review: false }
      ),
      buildPhq9PublicSummary(
        { total: 12, item9: 0, internal_band: "staff_review_reference" },
        { item9_positive: false, requires_human_review: false }
      ),
      buildPhq9PublicSummary(
        { total: 1, item9: 1, internal_band: "minimal_reference" },
        { item9_positive: true, requires_human_review: true }
      )
    ];

    for (const summary of messages) {
      expect(DIAGNOSTIC_PUBLIC_WORDS.some((word) => summary.message.includes(word))).toBe(false);
    }
  });

  it("builds a filtered public report section", () => {
    const summary = buildPhq9PublicSummary(
      { total: 3, item9: 0, internal_band: "minimal_reference" },
      { item9_positive: false, requires_human_review: false }
    );
    const section = buildPublicReportSection(summary);

    expect(section).toMatchObject({
      module_id: "questionnaire",
      public_status_code: "NORMAL_REFERENCE"
    });
    expect(JSON.stringify(section)).not.toMatch(/raw_answers|internal_score|internal_band|憂鬱症|診斷|治療建議/);
  });
});
