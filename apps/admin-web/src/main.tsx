import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import "survey-core/defaultV2.min.css";
import type { AdminQuestionnaireTemplatesResponse, QuestionnaireVersionSummary } from "@shc/contracts";
import phq9Seed from "../../../modules/questionnaire/seed/phq9.zh-TW.surveyjs.json";
import "./styles.css";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {})
    }
  });
  const body = (await response.json()) as T;
  if (!response.ok) {
    throw new Error((body as { error?: { message?: string } }).error?.message ?? `Request failed: ${response.status}`);
  }
  return body;
}

function SurveyPreview({ surveyJson }: { surveyJson: unknown }) {
  const model = useMemo(() => {
    const survey = new Model(surveyJson);
    survey.mode = "display";
    survey.showCompletedPage = false;
    return survey;
  }, [surveyJson]);

  return <Survey model={model} />;
}

function AdminApp() {
  const [templates, setTemplates] = useState<AdminQuestionnaireTemplatesResponse["templates"]>([]);
  const [jsonText, setJsonText] = useState(JSON.stringify(phq9Seed, null, 2));
  const [previewJson, setPreviewJson] = useState<unknown>(phq9Seed);
  const [draftVersion, setDraftVersion] = useState<QuestionnaireVersionSummary | null>(null);
  const [message, setMessage] = useState("載入 template list 中");
  const [error, setError] = useState<string | null>(null);

  async function loadTemplates() {
    const response = await requestJson<AdminQuestionnaireTemplatesResponse>("/api/v1/admin/questionnaire-templates");
    setTemplates(response.templates);
    setMessage("Template list ready");
  }

  useEffect(() => {
    loadTemplates().catch((loadError: unknown) => {
      setError(loadError instanceof Error ? loadError.message : "Admin API unavailable");
      setMessage("Admin API unavailable; preview still works locally");
    });
  }, []);

  function validatePreview() {
    try {
      const parsed = JSON.parse(jsonText) as unknown;
      setPreviewJson(parsed);
      setError(null);
      setMessage("JSON valid; preview updated");
    } catch (parseError) {
      setError(parseError instanceof Error ? parseError.message : "Invalid JSON");
    }
  }

  async function createDraft() {
    const parsed = JSON.parse(jsonText) as unknown;
    const response = await requestJson<QuestionnaireVersionSummary>("/api/v1/admin/questionnaire-versions", {
      method: "POST",
      body: JSON.stringify({
        template_id: templates[0]?.id ?? "qtpl_phq9",
        version: `0.1.${Date.now()}`,
        surveyjs_json: parsed,
        scoring_config_code: "phq9_public_v1",
        status: "draft"
      })
    });
    setDraftVersion(response);
    setMessage(`Draft created: ${response.version}`);
  }

  async function publishDraft() {
    if (!draftVersion) {
      setError("Create a draft before publishing");
      return;
    }
    const response = await requestJson<QuestionnaireVersionSummary>(
      `/api/v1/admin/questionnaire-versions/${draftVersion.id}/publish`,
      { method: "POST", body: JSON.stringify({}) }
    );
    setDraftVersion(response);
    setMessage(`Published active version: ${response.version}`);
    await loadTemplates();
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <h1>Smart Health Cabin Admin</h1>
          <p>Questionnaire CMS / versioning / publish</p>
        </div>
        <strong>{message}</strong>
      </header>

      <section className="admin-grid">
        <div className="admin-panel">
          <h2>Templates</h2>
          <ul className="template-list">
            {templates.map((template) => (
              <li key={template.id}>
                <span>{template.title}</span>
                <strong>{template.active_version ?? "no active version"}</strong>
              </li>
            ))}
          </ul>
        </div>

        <div className="admin-panel editor-panel">
          <h2>SurveyJS JSON</h2>
          <textarea value={jsonText} onChange={(event) => setJsonText(event.target.value)} />
          {error && <p className="admin-error">{error}</p>}
          <div className="button-row">
            <button type="button" onClick={validatePreview}>
              Validate / Preview
            </button>
            <button type="button" onClick={() => createDraft().catch((err: unknown) => setError(String(err)))}>
              Create Draft
            </button>
            <button type="button" onClick={() => publishDraft().catch((err: unknown) => setError(String(err)))}>
              Publish Active
            </button>
          </div>
        </div>

        <div className="admin-panel preview-panel">
          <h2>Preview</h2>
          <SurveyPreview surveyJson={previewJson} />
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AdminApp />
  </React.StrictMode>
);
