import React from "react";
import { createRoot } from "react-dom/client";
import "survey-core/defaultV2.min.css";
import "./styles/app.css";
import { QuestionnairePage } from "./features/questionnaire/QuestionnairePage";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QuestionnairePage />
  </React.StrictMode>
);
