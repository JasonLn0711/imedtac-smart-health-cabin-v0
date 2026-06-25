import { useEffect, useMemo, useRef, useState } from "react";
import type { Model } from "survey-core";
import { useMachine } from "@xstate/react";
import { AvatarImage } from "./AvatarImage";
import { avatarStateLabel, avatarStateMachine } from "./avatarStateMachine";
import type { AvatarState, VoiceAnswerDraft } from "./avatarTypes";
import { candidateFromTranscript, confirmVoiceAnswer, getCurrentSurveyQuestion } from "./voiceQuestionnaireController";

interface AvatarPanelProps {
  model: Model;
}

type StopReason = "VAD_END_SILENCE" | "MAX_UTTERANCE_REACHED" | "NO_SPEECH_TIMEOUT";

const wakeWordServiceUrl = import.meta.env.VITE_WAKE_WORD_SERVICE_URL ?? "http://localhost:8013";
const wakeWordEnabled = import.meta.env.VITE_WAKE_WORD_ENABLED !== "false";
const showWakeSimulation = import.meta.env.DEV;
const endpointMode = import.meta.env.VITE_VOICE_ENDPOINT_MODE ?? "standard";
const prerollMs = Number(import.meta.env.VITE_VOICE_PREROLL_MS ?? 300);
const minSpeechMs = Number(import.meta.env.VITE_VOICE_MIN_SPEECH_MS ?? (endpointMode === "elder" ? 300 : 250));
const endSilenceMs = Number(import.meta.env.VITE_VOICE_END_SILENCE_MS ?? (endpointMode === "elder" ? 1500 : 900));
const maxUtteranceMs = Number(
  import.meta.env.VITE_VOICE_MAX_UTTERANCE_MS ?? (endpointMode === "elder" ? 30000 : 20000)
);
const noSpeechTimeoutMs = Number(import.meta.env.VITE_VOICE_NO_SPEECH_TIMEOUT_MS ?? 5000);

function toWakeSocketUrl(baseUrl: string): string {
  const url = new URL(baseUrl);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/events";
  return url.toString();
}

function speechRms(data: Uint8Array): number {
  let sum = 0;
  for (const value of data) {
    const normalized = (value - 128) / 128;
    sum += normalized * normalized;
  }
  return Math.sqrt(sum / data.length);
}

export function AvatarPanel({ model }: AvatarPanelProps) {
  const [snapshot, send] = useMachine(avatarStateMachine);
  const [transcript, setTranscript] = useState("完全沒有");
  const [draft, setDraft] = useState<VoiceAnswerDraft | null>(null);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [surveyRevision, setSurveyRevision] = useState(0);
  const [message, setMessage] = useState("等待喚醒詞，或直接使用手動開始與觸控問卷。");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaChunksRef = useRef<Blob[]>([]);
  const stateRef = useRef<AvatarState>("idle_touch_ready");
  const stopReasonRef = useRef<StopReason | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const state = snapshot.value as AvatarState;
  const currentQuestion = useMemo(() => getCurrentSurveyQuestion(model), [model, confirmedCount, surveyRevision]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const refresh = () => setSurveyRevision((revision) => revision + 1);
    model.onCurrentPageChanged.add(refresh);
    model.onValueChanged.add(refresh);
    return () => {
      model.onCurrentPageChanged.remove(refresh);
      model.onValueChanged.remove(refresh);
    };
  }, [model]);

  useEffect(() => {
    if (!wakeWordEnabled) {
      return;
    }

    send({ type: "WAKE_ARM" });
    const socket = new WebSocket(toWakeSocketUrl(wakeWordServiceUrl));
    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data) as { type?: string };
      if (payload.type === "wake.detected") {
        send({ type: "WAKE_DETECTED" });
        setMessage("偵測到喚醒詞，正在開啟錄音閘門。");
        startRecording().catch(() => {
          send({ type: "VOICE_SERVICE_DOWN" });
          setMessage("無法啟動錄音，可改用手動開始或觸控填答。");
        });
      }
    };
    socket.onerror = () => {
      setMessage("Wake word 連線尚未建立；手動開始與觸控問卷仍可完整使用。");
    };

    return () => {
      socket.onmessage = null;
      socket.onerror = null;
      socket.close();
    };
  }, [send]);

  function cleanupRecording() {
    cleanupRef.current?.();
    cleanupRef.current = null;
  }

  function stopByEndpoint(reason: StopReason) {
    if (stopReasonRef.current) {
      return;
    }
    stopReasonRef.current = reason;
    send({ type: reason });
    const recorder = mediaRecorderRef.current;
    if (recorder?.state === "recording") {
      recorder.stop();
      return;
    }
    cleanupRecording();
  }

  function startEndpointing(stream: MediaStream) {
    if (typeof AudioContext === "undefined") {
      const maxTimer = window.setTimeout(() => stopByEndpoint("MAX_UTTERANCE_REACHED"), maxUtteranceMs);
      cleanupRef.current = () => window.clearTimeout(maxTimer);
      return;
    }

    // ponytail: RMS gate keeps endpointing testable; replace with Silero ONNX when kiosk hardware is fixed.
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    const data = new Uint8Array(analyser.fftSize);
    const startedAt = performance.now();
    let speechCandidateAt: number | null = null;
    let speechStarted = false;
    let lastSpeechAt = startedAt;
    let frame = 0;

    const tick = () => {
      const now = performance.now();
      analyser.getByteTimeDomainData(data);
      const hasSpeech = speechRms(data) > 0.03;

      if (hasSpeech) {
        speechCandidateAt ??= now;
        if (!speechStarted && now - speechCandidateAt >= minSpeechMs) {
          speechStarted = true;
          lastSpeechAt = now;
        }
        if (speechStarted) {
          lastSpeechAt = now;
        }
      } else {
        speechCandidateAt = null;
      }

      if (!speechStarted && now - startedAt >= noSpeechTimeoutMs) {
        stopByEndpoint("NO_SPEECH_TIMEOUT");
        return;
      }
      if (speechStarted && now - lastSpeechAt >= endSilenceMs) {
        stopByEndpoint("VAD_END_SILENCE");
        return;
      }
      if (now - startedAt >= maxUtteranceMs) {
        stopByEndpoint("MAX_UTTERANCE_REACHED");
        return;
      }
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    cleanupRef.current = () => {
      window.cancelAnimationFrame(frame);
      void audioContext.close();
    };
  }

  async function startRecording() {
    if (!navigator.mediaDevices || typeof MediaRecorder === "undefined") {
      send({ type: "VOICE_SERVICE_DOWN" });
      setMessage("此瀏覽器目前無法使用 MediaRecorder，可改用觸控或文字模擬填答。");
      return;
    }

    cleanupRecording();
    stopReasonRef.current = null;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    mediaChunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        mediaChunksRef.current.push(event.data);
      }
    };
    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      cleanupRecording();
      mediaRecorderRef.current = null;
      const reason = stopReasonRef.current;
      if (reason === "NO_SPEECH_TIMEOUT") {
        setMessage("沒有偵測到有效語音，請重試或直接觸控填答。");
        return;
      }
      send({ type: "TRANSCRIBE" });
      setMessage(
        `錄音已自動停止（${mediaChunksRef.current.length} 個片段，pre-roll ${prerollMs}ms）。請送出 ASR 或使用文字模擬。`
      );
    };
    mediaRecorderRef.current = recorder;
    send({ type: "MANUAL_START" });
    setMessage("正在錄音；系統會用 VAD / endpointing 自動停止。");
    recorder.start();
    startEndpointing(stream);
  }

  function readQuestion() {
    if (!currentQuestion) {
      setMessage("問卷已全部填答，可以送出。");
      return;
    }
    send({ type: "WAKE_ARM" });
    setMessage(`Avatar：${currentQuestion.title}`);
  }

  function mapAnswer() {
    if (!currentQuestion) {
      setMessage("沒有需要填答的下一題。");
      return;
    }
    try {
      send({ type: "TRANSCRIBE" });
      const candidate = candidateFromTranscript(currentQuestion, transcript);
      if (!candidate) {
        setMessage("沒有找到可確認的候選答案，請重錄或使用觸控填答。");
        send({ type: "ASR_LOW_CONFIDENCE" });
        return;
      }
      setDraft({
        questionName: currentQuestion.name,
        questionTitle: currentQuestion.title,
        transcript,
        candidate
      });
      send({ type: "ASR_DONE" });
      setMessage("ASR 僅產生候選答案；請確認後才會寫入問卷。");
    } catch (error) {
      send({ type: "VOICE_SERVICE_DOWN" });
      setMessage(error instanceof Error ? error.message : "語音流程失敗，可改用觸控填答。");
    }
  }

  function confirmAnswer() {
    if (!currentQuestion || !draft) {
      return;
    }
    confirmVoiceAnswer(currentQuestion, draft.candidate);
    if (!model.isLastPage) {
      model.nextPage();
    }
    send({ type: "CONFIRM_YES" });
    setDraft(null);
    setConfirmedCount((count) => count + 1);
    setMessage("已確認並寫入問卷。");
    send({ type: "RESET" });
  }

  function retry() {
    setDraft(null);
    setMessage("請重新輸入語音文字，或改用觸控填答。");
    send({ type: stateRef.current === "confirming_candidate" ? "CONFIRM_NO" : "RESET" });
  }

  async function simulateWake() {
    try {
      await fetch(`${wakeWordServiceUrl.replace(/\/$/, "")}/simulate-wake`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ score: 0.82 })
      });
    } catch {
      send({ type: "VOICE_SERVICE_DOWN" });
      setMessage("Wake word 模擬服務不可用；請使用手動開始。");
    }
  }

  return (
    <aside className="avatar-panel" aria-label="AI health interaction guide">
      <div className="avatar-figure">
        <AvatarImage state={state} />
      </div>
      <div className="avatar-content">
        <div className="avatar-status-row">
          <strong>AI 健康互動助理</strong>
          <span className={`avatar-state avatar-state-${state}`}>{avatarStateLabel(state)}</span>
        </div>
        <p>{message}</p>
        {currentQuestion && (
          <p className="avatar-question">
            {currentQuestion.name}: {currentQuestion.title}
          </p>
        )}
        <label className="voice-input">
          <span>語音辨識文字</span>
          <input value={transcript} onChange={(event) => setTranscript(event.target.value)} />
        </label>
        <div className="voice-shortcuts" aria-label="voice answer shortcuts">
          {["完全沒有", "幾天", "一半以上", "幾乎每天"].map((text) => (
            <button key={text} type="button" onClick={() => setTranscript(text)}>
              {text}
            </button>
          ))}
        </div>
        <div className="voice-actions">
          <button type="button" onClick={() => startRecording().catch(() => send({ type: "VOICE_SERVICE_DOWN" }))}>
            手動開始
          </button>
          {showWakeSimulation && (
            <button type="button" onClick={() => void simulateWake()}>
              模擬喚醒
            </button>
          )}
          <button type="button" onClick={readQuestion}>
            朗讀題目
          </button>
          <button type="button" onClick={mapAnswer}>
            產生候選答案
          </button>
          <button type="button" onClick={retry}>
            重試
          </button>
        </div>
        {draft && (
          <div className="answer-confirmation">
            <strong>等待確認</strong>
            <span>{draft.questionTitle}</span>
            <span>ASR: {draft.transcript}</span>
            <span>
              Candidate: {draft.candidate.text} ({draft.candidate.value})
            </span>
            <button type="button" onClick={confirmAnswer}>
              確認寫入
            </button>
          </div>
        )}
        <p className="touch-fallback">觸控備援：下方問卷可隨時直接填答。</p>
      </div>
    </aside>
  );
}
