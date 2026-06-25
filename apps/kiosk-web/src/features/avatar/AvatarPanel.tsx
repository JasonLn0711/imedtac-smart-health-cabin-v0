import { useMemo, useState } from "react";
import type { Model, Question } from "survey-core";
import { avatarStateLabel, nextAvatarState } from "./avatarStateMachine";
import type { AvatarState, VoiceAnswerDraft } from "./avatarTypes";
import { candidateFromTranscript, confirmVoiceAnswer } from "./voiceQuestionnaireController";

interface AvatarPanelProps {
  model: Model;
}

function getCurrentQuestion(model: Model): Question | null {
  return model.getAllQuestions().find((question) => question.value === undefined || question.value === null) ?? null;
}

export function AvatarPanel({ model }: AvatarPanelProps) {
  const [state, setState] = useState<AvatarState>("idle");
  const [transcript, setTranscript] = useState("完全沒有");
  const [draft, setDraft] = useState<VoiceAnswerDraft | null>(null);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [message, setMessage] = useState("可使用語音模擬填答，也可直接觸控問卷。");
  const currentQuestion = useMemo(() => getCurrentQuestion(model), [model, confirmedCount]);

  function move(next: AvatarState) {
    setState((current) => nextAvatarState(current, next));
  }

  function readQuestion() {
    if (!currentQuestion) {
      setMessage("問卷已全部填答，可以送出。");
      return;
    }
    move("speaking");
    setMessage(`Avatar：${currentQuestion.title}`);
    move("listening");
  }

  function mapAnswer() {
    if (!currentQuestion) {
      setMessage("沒有需要填答的下一題。");
      return;
    }
    try {
      move("transcribing");
      move("thinking");
      const candidate = candidateFromTranscript(currentQuestion, transcript);
      if (!candidate) {
        setMessage("沒有找到可確認的候選答案，請重錄或使用觸控填答。");
        setState("error_fallback");
        return;
      }
      setDraft({
        questionName: currentQuestion.name,
        questionTitle: currentQuestion.title,
        transcript,
        candidate
      });
      move("confirming_answer");
      setMessage("請確認候選答案後再寫入問卷。");
    } catch (error) {
      setState("error_fallback");
      setMessage(error instanceof Error ? error.message : "語音流程失敗，可改用觸控填答。");
    }
  }

  function confirmAnswer() {
    if (!currentQuestion || !draft) {
      return;
    }
    confirmVoiceAnswer(currentQuestion, draft.candidate);
    setDraft(null);
    setConfirmedCount((count) => count + 1);
    setMessage("已確認並寫入問卷。");
    setState("idle");
  }

  function retry() {
    setDraft(null);
    setMessage("請重新輸入語音文字，或改用觸控填答。");
    setState("listening");
  }

  return (
    <aside className="avatar-panel" aria-label="Avatar voice guide">
      <div className="avatar-figure" aria-hidden="true">
        <span>{state === "error_fallback" ? "!" : "A"}</span>
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

