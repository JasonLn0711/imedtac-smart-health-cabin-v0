import { useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";

interface SurveyJsQuestionnaireRendererProps {
  surveyJson: unknown;
  onComplete: (rawAnswers: Record<string, unknown>) => void;
  renderSidecar?: (model: Model) => ReactNode;
  touchCollapsed?: boolean;
}

export function createKioskSurveyModel(surveyJson: unknown): Model {
  const survey = new Model({
    ...(typeof surveyJson === "object" && surveyJson !== null ? surveyJson : {}),
    questionsOnPageMode: "questionPerPage",
    goNextPageAutomatic: true,
    allowCompleteSurveyAutomatic: false,
    showProgressBar: true,
    progressBarLocation: "top"
  });
  survey.showCompletedPage = false;
  survey.focusFirstQuestionAutomatic = false;
  survey.completeText = "送出問卷";
  survey.pageNextText = "下一題";
  survey.pagePrevText = "上一題";
  return survey;
}

export function SurveyJsQuestionnaireRenderer({
  surveyJson,
  onComplete,
  renderSidecar,
  touchCollapsed = false
}: SurveyJsQuestionnaireRendererProps) {
  const model = useMemo(() => createKioskSurveyModel(surveyJson), [surveyJson]);

  useEffect(() => {
    const handler = (sender: Model) => {
      onComplete({ ...sender.data });
    };

    model.onComplete.add(handler);
    return () => {
      model.onComplete.remove(handler);
    };
  }, [model, onComplete]);

  return (
    <div className={`survey-experience${touchCollapsed ? " survey-experience-touch-collapsed" : ""}`}>
      {renderSidecar && <div className="survey-avatar-rail">{renderSidecar(model)}</div>}
      <div className="survey-question-stage">
        <Survey model={model} />
      </div>
    </div>
  );
}
