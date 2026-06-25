import { useCallback, useEffect, useState } from "react";
import type { ActiveQuestionnaireResponse, PublicSummary } from "@shc/contracts";
import { fetchActiveQuestionnaire, submitQuestionnaireResponse } from "./questionnaireApi";
import { SurveyJsQuestionnaireRenderer } from "./SurveyJsQuestionnaireRenderer";

type LoadState = "loading" | "ready" | "submitting" | "complete" | "error";

export function QuestionnairePage() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [questionnaire, setQuestionnaire] = useState<ActiveQuestionnaireResponse | null>(null);
  const [publicSummary, setPublicSummary] = useState<PublicSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    fetchActiveQuestionnaire()
      .then((active) => {
        if (!alive) {
          return;
        }
        setQuestionnaire(active);
        setLoadState("ready");
      })
      .catch((error: unknown) => {
        if (!alive) {
          return;
        }
        setErrorMessage(error instanceof Error ? error.message : "問卷載入失敗");
        setLoadState("error");
      });

    return () => {
      alive = false;
    };
  }, []);

  const handleComplete = useCallback(async (rawAnswers: Record<string, unknown>) => {
    setLoadState("submitting");
    setErrorMessage(null);

    try {
      const response = await submitQuestionnaireResponse(rawAnswers);
      setPublicSummary(response.public_summary);
      setLoadState("complete");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "問卷送出失敗");
      setLoadState("error");
    }
  }, []);

  return (
    <main className="kiosk-shell">
      <section className="kiosk-header">
        <div>
          <h1>Smart Health Cabin Kiosk</h1>
          <p>Phase 1：Questionnaire + Avatar</p>
        </div>
        <div className="status-block">
          <span>PHQ-9</span>
          <strong>健康自我檢測參考</strong>
        </div>
      </section>

      <section className="questionnaire-panel" aria-live="polite">
        {loadState === "loading" && <p className="state-text">問卷載入中...</p>}

        {loadState === "ready" && questionnaire && (
          <>
            <div className="questionnaire-title">
              <h2>{questionnaire.title}</h2>
              <p>請依照過去兩個星期的狀況填答。完成後只會顯示非診斷式公共摘要。</p>
            </div>
            <SurveyJsQuestionnaireRenderer
              surveyJson={questionnaire.surveyjs_json}
              onComplete={handleComplete}
            />
          </>
        )}

        {loadState === "submitting" && <p className="state-text">正在整理問卷結果...</p>}

        {loadState === "complete" && publicSummary && (
          <div className="public-summary">
            <h2>{publicSummary.title}</h2>
            <p>{publicSummary.message}</p>
          </div>
        )}

        {loadState === "error" && (
          <div className="error-panel">
            <h2>目前無法完成問卷</h2>
            <p>{errorMessage}</p>
          </div>
        )}
      </section>
    </main>
  );
}
