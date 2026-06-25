import { createMachine } from "xstate";
import type { AvatarState } from "./avatarTypes";

type AvatarEvent =
  | "WAKE_ARM"
  | "WAKE_DETECTED"
  | "MANUAL_START"
  | "VAD_SPEECH_START"
  | "VAD_END_SILENCE"
  | "MAX_UTTERANCE_REACHED"
  | "NO_SPEECH_TIMEOUT"
  | "TRANSCRIBE"
  | "ASR_DONE"
  | "ASR_LOW_CONFIDENCE"
  | "LOOP_READY"
  | "CONFIRM_YES"
  | "CONFIRM_NO"
  | "TOUCH_SELECTED"
  | "VOICE_SERVICE_DOWN"
  | "STAFF_REVIEW"
  | "RESET";

const transitions: Record<AvatarState, Partial<Record<AvatarEvent, AvatarState>>> = {
  idle_touch_ready: {
    WAKE_ARM: "wake_armed",
    WAKE_DETECTED: "wake_detected",
    MANUAL_START: "recording_answer",
    TOUCH_SELECTED: "idle_touch_ready",
    VOICE_SERVICE_DOWN: "voice_unavailable"
  },
  wake_armed: {
    WAKE_DETECTED: "wake_detected",
    MANUAL_START: "recording_answer",
    TOUCH_SELECTED: "idle_touch_ready",
    RESET: "idle_touch_ready",
    VOICE_SERVICE_DOWN: "voice_unavailable"
  },
  wake_detected: {
    VAD_SPEECH_START: "recording_answer",
    MANUAL_START: "recording_answer",
    NO_SPEECH_TIMEOUT: "retry_or_touch",
    RESET: "idle_touch_ready",
    VOICE_SERVICE_DOWN: "voice_unavailable"
  },
  recording_answer: {
    VAD_END_SILENCE: "endpointing_wait",
    MAX_UTTERANCE_REACHED: "endpointing_wait",
    NO_SPEECH_TIMEOUT: "retry_or_touch",
    RESET: "idle_touch_ready",
    VOICE_SERVICE_DOWN: "voice_unavailable"
  },
  endpointing_wait: {
    TRANSCRIBE: "transcribing",
    ASR_DONE: "confirming_candidate",
    ASR_LOW_CONFIDENCE: "retry_or_touch",
    RESET: "idle_touch_ready",
    VOICE_SERVICE_DOWN: "voice_unavailable"
  },
  transcribing: {
    ASR_DONE: "normalizing_asr",
    ASR_LOW_CONFIDENCE: "retry_or_touch",
    LOOP_READY: "recording_answer",
    RESET: "idle_touch_ready",
    VOICE_SERVICE_DOWN: "voice_unavailable"
  },
  normalizing_asr: {
    ASR_DONE: "building_semantic_frame",
    ASR_LOW_CONFIDENCE: "retry_or_touch",
    RESET: "idle_touch_ready",
    VOICE_SERVICE_DOWN: "voice_unavailable"
  },
  building_semantic_frame: {
    ASR_DONE: "ranking_candidates",
    ASR_LOW_CONFIDENCE: "retry_or_touch",
    RESET: "idle_touch_ready",
    VOICE_SERVICE_DOWN: "voice_unavailable"
  },
  ranking_candidates: {
    ASR_DONE: "confirming_candidate",
    ASR_LOW_CONFIDENCE: "clarifying_ambiguous",
    RESET: "idle_touch_ready",
    VOICE_SERVICE_DOWN: "voice_unavailable"
  },
  clarifying_ambiguous: {
    MANUAL_START: "recording_answer",
    TOUCH_SELECTED: "idle_touch_ready",
    RESET: "idle_touch_ready",
    VOICE_SERVICE_DOWN: "voice_unavailable"
  },
  confirming_candidate: {
    CONFIRM_YES: "committed",
    CONFIRM_NO: "retry_or_touch",
    ASR_LOW_CONFIDENCE: "retry_or_touch",
    STAFF_REVIEW: "staff_review",
    VOICE_SERVICE_DOWN: "voice_unavailable"
  },
  committed: {
    RESET: "idle_touch_ready",
    TOUCH_SELECTED: "idle_touch_ready"
  },
  retry_or_touch: {
    MANUAL_START: "recording_answer",
    WAKE_DETECTED: "wake_detected",
    TOUCH_SELECTED: "idle_touch_ready",
    RESET: "idle_touch_ready",
    VOICE_SERVICE_DOWN: "voice_unavailable"
  },
  voice_unavailable: {
    MANUAL_START: "recording_answer",
    TOUCH_SELECTED: "idle_touch_ready",
    RESET: "idle_touch_ready"
  },
  staff_review: {
    TOUCH_SELECTED: "idle_touch_ready",
    RESET: "idle_touch_ready"
  }
};

export function nextAvatarState(current: AvatarState, event: AvatarEvent): AvatarState {
  const next = transitions[current][event];
  if (!next) {
    throw new Error(`Invalid Avatar event: ${current} + ${event}`);
  }
  return next;
}

export const avatarStateMachine = createMachine({
  id: "smart-health-cabin-voice-entry",
  initial: "idle_touch_ready",
  states: Object.fromEntries(
    Object.entries(transitions).map(([state, events]) => [
      state,
      {
        on: events
      }
    ])
  )
});

export function avatarStateLabel(state: AvatarState): string {
  return {
    idle_touch_ready: "等待喚醒或觸控",
    wake_armed: "等待喚醒詞",
    wake_detected: "已偵測喚醒詞",
    recording_answer: "正在錄音",
    endpointing_wait: "自動停止中",
    transcribing: "語音辨識中",
    normalizing_asr: "語音校正中",
    building_semantic_frame: "建立語意框架",
    ranking_candidates: "候選排序中",
    clarifying_ambiguous: "需要重新確認",
    confirming_candidate: "等待確認",
    committed: "已寫入答案",
    retry_or_touch: "請重試或觸控",
    voice_unavailable: "語音服務不可用",
    staff_review: "需要人員協助"
  }[state];
}
