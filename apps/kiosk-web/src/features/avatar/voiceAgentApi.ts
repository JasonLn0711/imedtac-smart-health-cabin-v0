import type { AgentSessionResponse, AgentTurnResponse, VoiceAnswerMappingResponse } from "@shc/contracts";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

async function postJson<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  const payload = (await response.json()) as unknown;

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null && "error" in payload
        ? String((payload as { error?: { message?: string } }).error?.message)
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}

export async function createAgentSession(sessionId: string): Promise<AgentSessionResponse> {
  return postJson<AgentSessionResponse>("/api/v1/agent-sessions", { session_id: sessionId });
}

export async function runAsrTurn(input: {
  agentSessionId: string;
  questionName?: string;
  audioBase64: string;
  audioFormat: string;
  fallbackTranscript?: string;
}): Promise<AgentTurnResponse> {
  return postJson<AgentTurnResponse>("/api/v1/agent-turns/asr", {
    agent_session_id: input.agentSessionId,
    question_name: input.questionName,
    audio_base64: input.audioBase64,
    audio_format: input.audioFormat,
    transcript: input.fallbackTranscript
  });
}

export async function mapVoiceAnswerTurn(input: {
  agentSessionId: string;
  questionName: string;
  transcript: string;
  asrConfidence?: number;
  voiceMode?: string;
  touchVisible?: boolean;
}): Promise<VoiceAnswerMappingResponse> {
  return postJson<VoiceAnswerMappingResponse>("/api/v1/agent-turns/map-answer", {
    agent_session_id: input.agentSessionId,
    question_name: input.questionName,
    transcript: input.transcript,
    asr_confidence: input.asrConfidence,
    voice_mode: input.voiceMode,
    touch_visible: input.touchVisible
  });
}

export async function buildGuidanceTurn(input: {
  agentSessionId: string;
  questionName?: string;
  nextQuestionName?: string;
  transcript?: string;
  answerText?: string;
  purpose?: "wake_greeting" | "answer_followup";
}): Promise<AgentTurnResponse> {
  return postJson<AgentTurnResponse>("/api/v1/agent-turns/respond", {
    agent_session_id: input.agentSessionId,
    question_name: input.questionName,
    next_question_name: input.nextQuestionName,
    transcript: input.transcript,
    answer_text: input.answerText,
    purpose: input.purpose
  });
}

export async function synthesizeTtsTurn(input: {
  agentSessionId: string;
  questionName?: string;
  text: string;
}): Promise<AgentTurnResponse> {
  return postJson<AgentTurnResponse>("/api/v1/agent-turns/tts", {
    agent_session_id: input.agentSessionId,
    question_name: input.questionName,
    text: input.text
  });
}

export async function describeTtsStreamTurn(input: {
  agentSessionId: string;
  questionName?: string;
  text: string;
}): Promise<AgentTurnResponse> {
  return postJson<AgentTurnResponse>("/api/v1/agent-turns/tts/stream", {
    agent_session_id: input.agentSessionId,
    question_name: input.questionName,
    text: input.text
  });
}

export function audioFormatFromBlob(blob: Blob): string {
  if (blob.type.includes("wav")) return "wav";
  if (blob.type.includes("ogg")) return "ogg";
  if (blob.type.includes("mp4")) return "mp4";
  return "webm";
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read recorded audio"));
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const commaIndex = result.indexOf(",");
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
    };
    reader.readAsDataURL(blob);
  });
}

export function playAudioDataUrl(audioDataUrl?: string): Promise<void> {
  if (!audioDataUrl) return Promise.resolve();
  const audio = new Audio(audioDataUrl);

  return new Promise((resolve, reject) => {
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error("Could not play TTS audio"));
    void audio.play().catch(reject);
  });
}
