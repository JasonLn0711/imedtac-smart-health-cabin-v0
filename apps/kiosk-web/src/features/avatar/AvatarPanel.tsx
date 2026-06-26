import { useEffect, useMemo, useRef, useState } from "react";
import type { Model, Question } from "survey-core";
import { useMachine } from "@xstate/react";
import { AvatarImage } from "./AvatarImage";
import { avatarStateLabel, avatarStateMachine } from "./avatarStateMachine";
import type { AvatarState, VoiceAnswerDraft } from "./avatarTypes";
import { playAgentTurnAudio } from "./StreamingAudioPlayer";
import {
  audioFormatFromBlob,
  blobToBase64,
  buildGuidanceTurn,
  createAgentSession,
  describeTtsStreamTurn,
  mapVoiceAnswerTurn,
  runAsrTurn,
  synthesizeTtsTurn
} from "./voiceAgentApi";
import { confirmVoiceAnswerAndMoveNext, getCurrentSurveyQuestion } from "./voiceQuestionnaireController";
import {
  isTouchVisible,
  isVoicePrimary,
  normalizeVoiceConversationMode,
  voiceModeLabel
} from "./voiceConversationMode";

interface AvatarPanelProps {
  model: Model;
}

type StopReason = "VAD_END_SILENCE" | "MAX_UTTERANCE_REACHED" | "NO_SPEECH_TIMEOUT";
type StartRecordingEvent = "MANUAL_START" | "LOOP_READY";
type RecordedTurnOutcome = "hold" | "continue" | "stop";

const wakeWordServiceUrl = import.meta.env.VITE_WAKE_WORD_SERVICE_URL ?? "http://localhost:8013";
const wakeWordEnabled = import.meta.env.VITE_WAKE_WORD_ENABLED !== "false";
const showWakeSimulation = import.meta.env.DEV;
const showVoiceDebug = import.meta.env.DEV;
const endpointMode = import.meta.env.VITE_VOICE_ENDPOINT_MODE ?? "standard";
const prerollMs = Number(import.meta.env.VITE_VOICE_PREROLL_MS ?? 300);
const minSpeechMs = Number(import.meta.env.VITE_VOICE_MIN_SPEECH_MS ?? (endpointMode === "elder" ? 300 : 250));
const endSilenceMs = Number(import.meta.env.VITE_VOICE_END_SILENCE_MS ?? (endpointMode === "elder" ? 1500 : 900));
const maxUtteranceMs = Number(
  import.meta.env.VITE_VOICE_MAX_UTTERANCE_MS ?? (endpointMode === "elder" ? 30000 : 20000)
);
const noSpeechTimeoutMs = Number(import.meta.env.VITE_VOICE_NO_SPEECH_TIMEOUT_MS ?? 5000);
const voiceConversationMode = normalizeVoiceConversationMode(import.meta.env.VITE_VOICE_CONVERSATION_MODE);
const preferStreamingTts = import.meta.env.VITE_TTS_STREAMING === "true";

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
  const [turnCount, setTurnCount] = useState(0);
  const [continuousVoiceActive, setContinuousVoiceActive] = useState(false);
  const [surveyRevision, setSurveyRevision] = useState(0);
  const [message, setMessage] = useState("可使用喚醒詞、手動開始，或直接用觸控完成問卷。");
  const currentQuestion = useMemo(() => getCurrentSurveyQuestion(model), [model, confirmedCount, surveyRevision]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaChunksRef = useRef<Blob[]>([]);
  const stateRef = useRef<AvatarState>("idle_touch_ready");
  const currentQuestionRef = useRef(currentQuestion);
  const continuousVoiceRef = useRef(false);
  const agentSessionIdRef = useRef<string | null>(null);
  const wakeIntroPlayingRef = useRef(false);
  const stopReasonRef = useRef<StopReason | null>(null);
  const cancelRecordingRef = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);
  const state = snapshot.value as AvatarState;

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    currentQuestionRef.current = currentQuestion;
  }, [currentQuestion]);

  useEffect(() => {
    continuousVoiceRef.current = continuousVoiceActive;
  }, [continuousVoiceActive]);

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
        setContinuousVoiceActive(true);
        continuousVoiceRef.current = true;
        setTurnCount(0);
        setMessage("偵測到喚醒詞，正在以語音開始問卷。");
        void speakWakeIntroThenRecord();
      }
    };
    socket.onerror = () => {
      setMessage("手動開始與觸控問卷可完整接續填答。");
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

  function stopContinuousVoice() {
    setContinuousVoiceActive(false);
    continuousVoiceRef.current = false;
    cancelRecordingRef.current = true;
    const recorder = mediaRecorderRef.current;
    if (recorder?.state === "recording") {
      recorder.stop();
    }
    setMessage("連續聆聽已結束；可用喚醒詞或手動開始再次啟動。");
    send({ type: "RESET" });
  }

  async function ensureAgentSession() {
    if (agentSessionIdRef.current) {
      return agentSessionIdRef.current;
    }
    const session = await createAgentSession(`sess_kiosk_voice_${Date.now()}`);
    agentSessionIdRef.current = session.agent_session_id;
    return session.agent_session_id;
  }

  async function speakText(input: { agentSessionId: string; questionName?: string; text: string }) {
    if (preferStreamingTts) {
      const stream = await describeTtsStreamTurn(input);
      if (stream.stream_url && stream.audio_transport === "ws_pcm16") {
        try {
          await playAgentTurnAudio(stream, { text: input.text });
          return;
        } catch {
          // ponytail: streaming fallback, surface errors if completed speech also fails.
        }
      }
    }
    await playAgentTurnAudio(await synthesizeTtsTurn(input));
  }

  async function speakWakeIntroThenRecord() {
    if (wakeIntroPlayingRef.current) {
      return;
    }
    wakeIntroPlayingRef.current = true;
    try {
      const question = currentQuestionRef.current;
      const agentSessionId = await ensureAgentSession();
      const greeting = await buildGuidanceTurn({ agentSessionId, purpose: "wake_greeting" });
      const greetingText =
        greeting.guidance ??
        "您好，我是慧誠智醫健康互動助理。接下來我會用語音帶您完成問卷，也可以隨時改用觸控填答。";
      setMessage(greetingText);
      await speakText({ agentSessionId, text: greetingText });

      if (question) {
        const guidance = await buildGuidanceTurn({ agentSessionId, questionName: question.name });
        const questionText = guidance.guidance ?? `接下來請回答：「${question.title}」。`;
        setMessage(questionText);
        await speakText({ agentSessionId, questionName: question.name, text: questionText });
      }

      await startRecording({ continuous: true });
    } catch (error) {
      send({ type: "VOICE_SERVICE_DOWN" });
      setMessage(error instanceof Error ? error.message : "語音開場失敗，可改用手動開始或觸控填答。");
    } finally {
      wakeIntroPlayingRef.current = false;
    }
  }

  function restartContinuousListening(startEvent: StartRecordingEvent = "MANUAL_START") {
    if (!continuousVoiceRef.current) {
      return;
    }
    window.setTimeout(() => {
      if (!continuousVoiceRef.current || mediaRecorderRef.current) {
        return;
      }
      startRecording({ continuous: true, startEvent }).catch(() => {
        continuousVoiceRef.current = false;
        setContinuousVoiceActive(false);
        send({ type: "VOICE_SERVICE_DOWN" });
        setMessage("手動開始與觸控填答可接續完成。");
      });
    }, 500);
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
    const maxTimer = window.setTimeout(() => stopByEndpoint("MAX_UTTERANCE_REACHED"), maxUtteranceMs);
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
      window.clearTimeout(maxTimer);
      window.cancelAnimationFrame(frame);
      void audioContext.close();
    };
  }

  async function handleRecordedTurn(audioBlob: Blob): Promise<RecordedTurnOutcome> {
    const question = currentQuestionRef.current;
    if (!question) {
      const doneText = "問卷已完成，可以送出問卷。";
      setMessage(doneText);
      const agentSessionId = await ensureAgentSession();
      await speakText({ agentSessionId, text: doneText });
      return "stop";
    }

    const agentSessionId = await ensureAgentSession();
    const audioBase64 = await blobToBase64(audioBlob);
    const asr = await runAsrTurn({
      agentSessionId,
      questionName: question?.name,
      audioBase64,
      audioFormat: audioFormatFromBlob(audioBlob),
      fallbackTranscript: transcript.trim()
    });
    const heardText = asr.transcript?.trim() || transcript.trim() || "尚未取得可用語音文字";
    setTranscript(heardText);
    send({ type: "ASR_DONE" });

    const mapped = await mapVoiceAnswerTurn({
      agentSessionId,
      questionName: question.name,
      transcript: heardText,
      asrConfidence: asr.confidence
    });
    send({ type: "ASR_DONE" });
    send({ type: "ASR_DONE" });

    if (!mapped.candidate || mapped.routing_decision === "low_confidence_retry" || mapped.routing_decision === "no_speech_retry") {
      const retryText = `我聽到：「${mapped.normalized_transcript ?? heardText}」。請用螢幕確認最接近的選項，或重新錄音一次。`;
      setMessage(retryText);
      send({ type: "ASR_LOW_CONFIDENCE" });
      await speakText({ agentSessionId, questionName: question.name, text: retryText });
      return "continue";
    }

    const voiceDraft: VoiceAnswerDraft = {
      questionName: question.name,
      questionTitle: question.title,
      transcript: heardText,
      normalizedTranscript: mapped.normalized_transcript,
      routingDecision: mapped.routing_decision,
      confirmationRequired: mapped.confirmation_required,
      candidate: mapped.candidate
    };

    if (mapped.routing_decision === "safety_sensitive_staff_review") {
      setDraft(voiceDraft);
      const staffText = `我剛剛聽到您說「${mapped.candidate.text}」。這一題會由現場人員協助處理。`;
      setMessage(staffText);
      send({ type: "STAFF_REVIEW" });
      await speakText({ agentSessionId, questionName: question.name, text: staffText });
      return "hold";
    }

    if (mapped.confirmation_required || mapped.routing_decision === "ambiguous_multiple_candidates") {
      const retryText = `我聽到：「${mapped.normalized_transcript ?? heardText}」。請重新錄音一次，或直接用觸控填答。`;
      setMessage(retryText);
      send({ type: "ASR_LOW_CONFIDENCE" });
      await speakText({ agentSessionId, questionName: question.name, text: retryText });
      return "continue";
    }

    await commitVoiceAnswer(question, voiceDraft);
    return "hold";
  }

  async function startRecording(options: { continuous?: boolean; startEvent?: StartRecordingEvent } = {}) {
    if (!navigator.mediaDevices || typeof MediaRecorder === "undefined") {
      send({ type: "VOICE_SERVICE_DOWN" });
      setMessage("此瀏覽器目前提供觸控與文字模擬填答。");
      return;
    }

    cleanupRecording();
    cancelRecordingRef.current = false;
    stopReasonRef.current = null;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    mediaChunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        mediaChunksRef.current.push(event.data);
      }
    };
    // ponytail: hard cap covers AudioContext/fake-mic endpointing stalls.
    const hardStopTimer = window.setTimeout(() => stopByEndpoint("MAX_UTTERANCE_REACHED"), maxUtteranceMs + 1000);
    recorder.onstop = () => {
      window.clearTimeout(hardStopTimer);
      stream.getTracks().forEach((track) => track.stop());
      cleanupRecording();
      mediaRecorderRef.current = null;
      if (cancelRecordingRef.current) {
        cancelRecordingRef.current = false;
        mediaChunksRef.current = [];
        return;
      }
      const reason = stopReasonRef.current;
      const audioBlob = new Blob(mediaChunksRef.current, { type: recorder.mimeType || "audio/webm" });
      if (reason === "NO_SPEECH_TIMEOUT" && audioBlob.size === 0) {
        setMessage("目前偵測到安靜狀態，系統持續聆聽；也可直接觸控填答。");
        restartContinuousListening();
        return;
      }
      send({ type: "TRANSCRIBE" });
      setMessage(`錄音已自動停止（${mediaChunksRef.current.length} 個片段），正在產生語音回覆。`);
      void handleRecordedTurn(audioBlob)
        .then((outcome) => {
          if (continuousVoiceRef.current && outcome === "continue") {
            restartContinuousListening("LOOP_READY");
          } else if (outcome === "stop") {
            send({ type: "RESET" });
          }
        })
        .catch((error) => {
          continuousVoiceRef.current = false;
          setContinuousVoiceActive(false);
          send({ type: "VOICE_SERVICE_DOWN" });
          setMessage(error instanceof Error ? error.message : "語音回覆流程已交由觸控填答接續。");
        });
    };
    mediaRecorderRef.current = recorder;
    send({ type: options.startEvent ?? "MANUAL_START" });
    setMessage("正在錄音；系統會用 VAD / endpointing 自動停止，然後以 TTS 回覆。");
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

  async function mapAnswer() {
    if (!currentQuestion) {
      setMessage("題目已填答完成，可以送出問卷。");
      return;
    }
    try {
      send({ type: "TRANSCRIBE" });
      const agentSessionId = await ensureAgentSession();
      const mapped = await mapVoiceAnswerTurn({
        agentSessionId,
        questionName: currentQuestion.name,
        transcript: transcript.trim()
      });
      send({ type: "ASR_DONE" });
      send({ type: "ASR_DONE" });
      send({ type: "ASR_DONE" });

      if (!mapped.candidate || mapped.routing_decision === "low_confidence_retry" || mapped.routing_decision === "no_speech_retry") {
        setDraft(null);
        setMessage("請用螢幕確認最接近的選項，或重新錄音一次。");
        send({ type: "ASR_LOW_CONFIDENCE" });
        return;
      }
      const voiceDraft: VoiceAnswerDraft = {
        questionName: currentQuestion.name,
        questionTitle: currentQuestion.title,
        transcript,
        normalizedTranscript: mapped.normalized_transcript,
        routingDecision: mapped.routing_decision,
        confirmationRequired: mapped.confirmation_required,
        candidate: mapped.candidate
      };
      if (mapped.routing_decision === "safety_sensitive_staff_review") {
        setDraft(voiceDraft);
        setMessage("這個語音內容已進入現場人員協助流程。");
        send({ type: "STAFF_REVIEW" });
        return;
      }
      if (mapped.confirmation_required || mapped.routing_decision === "ambiguous_multiple_candidates") {
        setMessage("請重新錄音一次，或直接用觸控填答。");
        send({ type: "ASR_LOW_CONFIDENCE" });
        return;
      }
      await commitVoiceAnswer(currentQuestion, voiceDraft);
    } catch (error) {
      send({ type: "VOICE_SERVICE_DOWN" });
      setMessage(error instanceof Error ? error.message : "語音流程已交由觸控填答接續。");
    }
  }

  async function commitVoiceAnswer(question: Question, voiceDraft: VoiceAnswerDraft) {
    const nextQuestion = confirmVoiceAnswerAndMoveNext(model, question, voiceDraft.candidate);
    send({ type: "ASR_DONE" });
    setDraft(null);
    setConfirmedCount((count) => count + 1);
    setTurnCount((count) => count + 1);
    const agentSessionId = await ensureAgentSession();
    let replyText = `我剛剛聽到您說「${voiceDraft.candidate.text}」。問卷已完成，可以送出問卷。`;
    let ttsQuestionName = question.name;
    let nextQuestionName: string | undefined;

    if (nextQuestion) {
      nextQuestionName = nextQuestion.name;
      ttsQuestionName = nextQuestion.name;
    } else {
      continuousVoiceRef.current = false;
      setContinuousVoiceActive(false);
    }
    const guidance = await buildGuidanceTurn({
      agentSessionId,
      questionName: question.name,
      nextQuestionName,
      transcript: voiceDraft.transcript,
      answerText: voiceDraft.candidate.text,
      purpose: "answer_followup"
    });
    const heardPrefix = `我剛剛聽到您說「${voiceDraft.candidate.text}」。`;
    const guidanceText = guidance.guidance ?? replyText;
    replyText = guidanceText.startsWith("我剛剛聽到您說") ? guidanceText : `${heardPrefix}${guidanceText}`;

    setMessage(replyText);
    await speakText({ agentSessionId, questionName: ttsQuestionName, text: replyText });
    send({ type: "RESET" });
    if (nextQuestion && continuousVoiceRef.current) {
      restartContinuousListening("MANUAL_START");
    }
  }

  function retry() {
    setDraft(null);
    setMessage("請重新錄音，或直接用觸控填答。");
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
      setMessage("請使用手動開始啟動語音流程。");
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
        <p className="voice-mode-status">
          {voiceModeLabel(voiceConversationMode)}
          {isVoicePrimary(voiceConversationMode) ? "；預設以語音完成問卷。" : "；語音作為輔助。"}
        </p>
        {continuousVoiceActive && (
          <p className="touch-fallback">連續語音模式啟用中，已完成 {turnCount} 輪語音回覆。</p>
        )}
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
          {continuousVoiceActive && (
            <button type="button" onClick={stopContinuousVoice}>
              結束連續聆聽
            </button>
          )}
          <button type="button" onClick={readQuestion}>
            朗讀題目
          </button>
          <button type="button" onClick={() => void mapAnswer()}>
            整理並填入
          </button>
          <button type="button" onClick={retry}>
            重新錄音
          </button>
        </div>
        {draft && (
          <div className="answer-confirmation">
            <strong>語音內容</strong>
            <span>{draft.questionTitle}</span>
            <span>語音文字：{draft.transcript}</span>
            {showVoiceDebug && draft.normalizedTranscript && <span>校正後: {draft.normalizedTranscript}</span>}
            {showVoiceDebug && draft.routingDecision && <span>路由: {draft.routingDecision}</span>}
            <span>
              候選答案：{draft.candidate.text} ({draft.candidate.value})
            </span>
          </div>
        )}
        <p className="touch-fallback">
          {isTouchVisible(voiceConversationMode)
            ? "觸控填答：下方問卷可隨時直接完成。"
            : "觸控填答目前收合；重新回答、改用觸控或現場人員協助仍可恢復。"}
        </p>
      </div>
    </aside>
  );
}
