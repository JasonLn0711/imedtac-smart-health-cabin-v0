import type { AvatarState } from "./avatarTypes";

const transitions: Record<AvatarState, AvatarState[]> = {
  idle: ["speaking", "error_fallback"],
  speaking: ["listening", "idle", "error_fallback"],
  listening: ["transcribing", "error_fallback"],
  transcribing: ["thinking", "error_fallback"],
  thinking: ["confirming_answer", "error_fallback"],
  confirming_answer: ["speaking", "listening", "idle", "error_fallback"],
  error_fallback: ["idle", "listening"]
};

export function nextAvatarState(current: AvatarState, next: AvatarState): AvatarState {
  if (!transitions[current].includes(next)) {
    throw new Error(`Invalid Avatar transition: ${current} -> ${next}`);
  }
  return next;
}

export function avatarStateLabel(state: AvatarState): string {
  return {
    idle: "待命",
    speaking: "說明中",
    listening: "聆聽中",
    transcribing: "語音辨識中",
    thinking: "整理回應中",
    confirming_answer: "等待確認",
    error_fallback: "可改用觸控填答"
  }[state];
}

