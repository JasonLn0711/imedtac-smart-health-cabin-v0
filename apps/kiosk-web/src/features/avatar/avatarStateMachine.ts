import { createMachine } from "xstate";
import type { AvatarState } from "./avatarTypes";

const transitions: Record<AvatarState, AvatarState[]> = {
  idle: ["speaking", "listening", "error_fallback"],
  speaking: ["listening", "idle", "error_fallback"],
  listening: ["recording", "transcribing", "error_fallback"],
  recording: ["transcribing", "error_fallback"],
  transcribing: ["thinking", "error_fallback"],
  thinking: ["confirming_answer", "error_fallback"],
  confirming_answer: ["writing_answer", "speaking", "listening", "idle", "error_fallback"],
  writing_answer: ["idle", "error_fallback"],
  error_fallback: ["idle", "listening", "recording"]
};

export function nextAvatarState(current: AvatarState, next: AvatarState): AvatarState {
  if (!transitions[current].includes(next)) {
    throw new Error(`Invalid Avatar transition: ${current} -> ${next}`);
  }
  return next;
}

export const avatarStateMachine = createMachine({
  id: "smart-health-cabin-avatar",
  initial: "idle",
  states: {
    idle: { on: { SPEAK: "speaking", LISTEN: "listening", FAIL: "error_fallback" } },
    speaking: { on: { LISTEN: "listening", RESET: "idle", FAIL: "error_fallback" } },
    listening: { on: { RECORD: "recording", TRANSCRIBE: "transcribing", FAIL: "error_fallback" } },
    recording: { on: { TRANSCRIBE: "transcribing", FAIL: "error_fallback" } },
    transcribing: { on: { THINK: "thinking", FAIL: "error_fallback" } },
    thinking: { on: { CONFIRM: "confirming_answer", FAIL: "error_fallback" } },
    confirming_answer: {
      on: { WRITE: "writing_answer", SPEAK: "speaking", LISTEN: "listening", RESET: "idle", FAIL: "error_fallback" }
    },
    writing_answer: { on: { RESET: "idle", FAIL: "error_fallback" } },
    error_fallback: { on: { RESET: "idle", LISTEN: "listening", RECORD: "recording" } }
  }
});

export function avatarStateLabel(state: AvatarState): string {
  return {
    idle: "待命",
    speaking: "說明中",
    listening: "聆聽中",
    recording: "錄音中",
    transcribing: "語音辨識中",
    thinking: "整理回應中",
    confirming_answer: "等待確認",
    writing_answer: "寫入答案中",
    error_fallback: "可改用觸控填答"
  }[state];
}
