import { useMemo, useRef, useState } from "react";
import type { Model, Question } from "survey-core";
import { useMachine } from "@xstate/react";
import { AvatarImage } from "./AvatarImage";
import { avatarStateLabel, avatarStateMachine } from "./avatarStateMachine";
import type { AvatarState, VoiceAnswerDraft } from "./avatarTypes";
import { candidateFromTranscript, confirmVoiceAnswer } from "./voiceQuestionnaireController";

interface AvatarPanelProps {
  model: Model;
}

function getCurrentQuestion(model: Model): Question | null {
  return model.getAllQuestions().find((question) => question.value === undefined || question.value === null) ?? null;
}

export function AvatarPanel({ model }: AvatarPanelProps) {
  const [snapshot, send] = useMachine(avatarStateMachine);
  const [transcript, setTranscript] = useState("完全沒有");
  const [draft, setDraft] = useState<VoiceAnswerDraft | null>(null);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [message, setMessage] = useState("可使用語音模擬填答，也可直接觸控問卷。");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaChunksRef = useRef<Blob[]>([]);
  const state = snapshot.value as AvatarState;
  const currentQuestion = useMemo(() => getCurrentQuestion(model), [model, confirmedCount]);

  async function startRecording() {
    if (!navigator.mediaDevices || typeof MediaRecorder === "undefined") {
      send({ type: "FAIL" });
      setMessage("此瀏覽器目前無法使用 MediaRecorder，可改用觸控或文字模擬填答。");
      return;
    }

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
      send({ type: "TRANSCRIBE" });
      setMessage(`錄音已完成（${mediaChunksRef.current.length} 個片段）。請送出 ASR 或使用文字模擬。`);
    };
    mediaRecorderRef.current = recorder;
    send({ type: "LISTEN" });
    send({ type: "RECORD" });
    recorder.start();
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
  }

  function readQuestion() {
    if (!currentQuestion) {
      setMessage("問卷已全部填答，可以送出。");
      return;
    }
    send({ type: "SPEAK" });
    setMessage(`Avatar：${currentQuestion.title}`);
    send({ type: "LISTEN" });
  }

  function mapAnswer() {
    if (!currentQuestion) {
      setMessage("沒有需要填答的下一題。");
      return;
    }
    try {
      send({ type: "TRANSCRIBE" });
      send({ type: "THINK" });
      const candidate = candidateFromTranscript(currentQuestion, transcript);
      if (!candidate) {
        setMessage("沒有找到可確認的候選答案，請重錄或使用觸控填答。");
        send({ type: "FAIL" });
        return;
      }
      setDraft({
        questionName: currentQuestion.name,
        questionTitle: currentQuestion.title,
        transcript,
        candidate
      });
      send({ type: "CONFIRM" });
      setMessage("請確認候選答案後再寫入問卷。");
    } catch (error) {
      send({ type: "FAIL" });
      setMessage(error instanceof Error ? error.message : "語音流程失敗，可改用觸控填答。");
    }
  }

  function confirmAnswer() {
    if (!currentQuestion || !draft) {
      return;
    }
    confirmVoiceAnswer(currentQuestion, draft.candidate);
    send({ type: "WRITE" });
    setDraft(null);
    setConfirmedCount((count) => count + 1);
    setMessage("已確認並寫入問卷。");
    send({ type: "RESET" });
  }

  function retry() {
    setDraft(null);
    setMessage("請重新輸入語音文字，或改用觸控填答。");
    send({ type: "LISTEN" });
  }

  return (
    <aside className="avatar-panel" aria-label="Avatar voice guide">
      <div className="avatar-figure">
        <AvatarImage state={state} />
      </div>
      <div className="avatar-content">
        <div className="avatar-status-row">
          <strong>Avatar Agent</strong>
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
          <button type="button" onClick={() => startRecording().catch(() => send({ type: "FAIL" }))}>
            Start recording
          </button>
          <button type="button" onClick={stopRecording}>
            Stop recording
          </button>
          <button type="button" onClick={readQuestion}>
            Read
          </button>
          <button type="button" onClick={mapAnswer}>
            Map
          </button>
          <button type="button" onClick={retry}>
            Retry
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
              Confirm Answer
            </button>
          </div>
        )}
        <p className="touch-fallback">觸控備援：下方問卷可隨時直接填答。</p>
      </div>
    </aside>
  );
}
