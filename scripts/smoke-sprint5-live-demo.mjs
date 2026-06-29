import { readFile } from "node:fs/promises";

const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:3000";
const voiceAgentBaseUrl = process.env.VOICE_AGENT_SERVER_URL ?? "http://localhost:3004";
const runCount = Number(process.env.SPRINT5_DEMO_RUNS ?? 5);
const questionName = process.env.SPRINT5_DEMO_QUESTION ?? "phq9_01";
const answerText = process.env.SPRINT5_DEMO_ANSWER_TEXT ?? "幾乎每天";
const seedPath = new URL("../modules/questionnaire/seed/phq9.zh-TW.surveyjs.json", import.meta.url);

function byteLengthFromDataUrl(dataUrl) {
  return Buffer.from(dataUrl.split(",")[1] ?? "", "base64").length;
}

async function readJson(baseUrl, path) {
  const response = await fetch(new URL(path, baseUrl));
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}: ${text.slice(0, 240)}`);
  }
  return JSON.parse(text);
}

async function postJson(baseUrl, path, body) {
  const response = await fetch(new URL(path, baseUrl), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}: ${text.slice(0, 240)}`);
  }
  return JSON.parse(text);
}

async function publishPhq9() {
  const templates = await readJson(apiBaseUrl, "/api/v1/admin/questionnaire-templates");
  const template = templates.templates.find((item) => item.code === "phq9");
  if (!template) {
    throw new Error("PHQ-9 template is not available");
  }
  const surveyjsJson = JSON.parse(await readFile(seedPath, "utf8"));
  const draft = await postJson(apiBaseUrl, "/api/v1/admin/questionnaire-versions", {
    template_id: template.id,
    version: `0.2.${Date.now()}`,
    surveyjs_json: surveyjsJson,
    scoring_config_code: "phq9_public_v1",
    status: "draft"
  });
  return postJson(apiBaseUrl, `/api/v1/admin/questionnaire-versions/${draft.id}/publish`, {});
}

function buildAnswers(candidateValue, runIndex) {
  return {
    phq9_01: candidateValue,
    phq9_02: runIndex % 2,
    phq9_03: 0,
    phq9_04: 1,
    phq9_05: 0,
    phq9_06: 0,
    phq9_07: 1,
    phq9_08: 0,
    phq9_09: runIndex === runCount ? 1 : 0
  };
}

function assertPublicReportScope(report) {
  const serialized = JSON.stringify(report);
  if (/phq9_0[1-9]|raw_answers|internal_score|憂鬱症|中度憂鬱|重度憂鬱|診斷|治療建議/.test(serialized)) {
    throw new Error("Public report exposed raw answers or diagnostic labels");
  }
}

async function runDemo(index, activeQuestionnaire) {
  const sessionId = `sess_sprint5_live_${Date.now()}_${index}`;
  const agentSession = await postJson(apiBaseUrl, "/api/v1/agent-sessions", { session_id: sessionId });
  const guidance = await postJson(voiceAgentBaseUrl, "/api/v1/agent-turns/respond", {
    agent_session_id: agentSession.agent_session_id,
    session_id: sessionId,
    question_name: questionName
  });
  const questionAudio = await postJson(voiceAgentBaseUrl, "/api/v1/agent-turns/tts", {
    agent_session_id: agentSession.agent_session_id,
    session_id: sessionId,
    question_name: questionName,
    text: guidance.guidance
  });
  const answerAudio = await postJson(voiceAgentBaseUrl, "/api/v1/agent-turns/tts", {
    agent_session_id: agentSession.agent_session_id,
    session_id: sessionId,
    question_name: questionName,
    text: answerText
  });
  const asr = await postJson(voiceAgentBaseUrl, "/api/v1/agent-turns/asr", {
    agent_session_id: agentSession.agent_session_id,
    session_id: sessionId,
    question_name: questionName,
    audio_base64: answerAudio.audio_data_url.split(",")[1],
    audio_format: "wav"
  });
  const mapped = await postJson(voiceAgentBaseUrl, "/api/v1/agent-turns/map-answer", {
    agent_session_id: agentSession.agent_session_id,
    session_id: sessionId,
    question_name: questionName,
    transcript: asr.transcript
  });
  if (mapped.candidate?.requires_confirmation !== true) {
    throw new Error(`Run ${index} did not require answer confirmation`);
  }
  const response = await postJson(apiBaseUrl, "/api/v1/questionnaire-responses", {
    session_id: sessionId,
    questionnaire_code: activeQuestionnaire.questionnaire_code,
    questionnaire_version: activeQuestionnaire.questionnaire_version,
    raw_answers: buildAnswers(mapped.candidate.value, index)
  });
  const publicReport = await readJson(apiBaseUrl, `/api/v1/reports/${response.public_report_token}/public`);
  assertPublicReportScope(publicReport);

  return {
    run: index,
    session_id: sessionId,
    questionnaire_version: activeQuestionnaire.questionnaire_version,
    llm_provider: guidance.provider,
    tts_provider: questionAudio.provider,
    asr_provider: asr.provider,
    transcript: asr.transcript,
    candidate: mapped.candidate,
    question_tts_bytes: byteLengthFromDataUrl(questionAudio.audio_data_url),
    answer_tts_bytes: byteLengthFromDataUrl(answerAudio.audio_data_url),
    response_id: response.response_id,
    public_report_token: response.public_report_token,
    public_status_code: response.public_summary.public_status_code,
    requires_human_review: response.safety_flags.requires_human_review
  };
}

try {
  const beforeStatus = await readJson(apiBaseUrl, "/api/v1/providers/status");
  if (beforeStatus.sprint5Acceptance?.eligible !== true) {
    throw new Error("Provider status is not Sprint 5 eligible");
  }
  const published = await publishPhq9();
  const activeQuestionnaire = await readJson(apiBaseUrl, "/api/v1/questionnaires/active");
  const runs = [];
  for (let index = 1; index <= runCount; index += 1) {
    runs.push(await runDemo(index, activeQuestionnaire));
  }
  const afterStatus = await readJson(apiBaseUrl, "/api/v1/providers/status");
  console.log(
    JSON.stringify(
      {
        eligible: afterStatus.sprint5Acceptance?.eligible === true,
        published_version: published.version,
        active_version: activeQuestionnaire.questionnaire_version,
        provider_summary: afterStatus.providers,
        runs
      },
      null,
      2
    )
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
