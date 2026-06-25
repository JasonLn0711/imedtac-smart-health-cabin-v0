import { useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";

interface SurveyJsQuestionnaireRendererProps {
  surveyJson: unknown;
  onComplete: (rawAnswers: Record<string, unknown>) => void;
  renderSidecar?: (model: Model) => ReactNode;
}

export function SurveyJsQuestionnaireRenderer({
  surveyJson,
  onComplete,
  renderSidecar
}: SurveyJsQuestionnaireRendererProps) {
  const model = useMemo(() => {
    const survey = new Model(surveyJson);
    survey.showCompletedPage = false;
    survey.focusFirstQuestionAutomatic = false;
    survey.completeText = "送出問卷";
    return survey;
  }, [surveyJson]);

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
    <>
      {renderSidecar?.(model)}
      <Survey model={model} />
    </>
  );
}
