export type VoiceConversationMode =
  | "voice_first_touch_visible"
  | "voice_first_touch_collapsed"
  | "touch_first_voice_assist"
  | "staff_assisted";

export function normalizeVoiceConversationMode(value?: string): VoiceConversationMode {
  if (
    value === "voice_first_touch_visible" ||
    value === "voice_first_touch_collapsed" ||
    value === "touch_first_voice_assist" ||
    value === "staff_assisted"
  ) {
    return value;
  }
  return "voice_first_touch_visible";
}

export function isVoicePrimary(mode: VoiceConversationMode): boolean {
  return mode === "voice_first_touch_visible" || mode === "voice_first_touch_collapsed";
}

export function isTouchVisible(mode: VoiceConversationMode): boolean {
  return mode !== "voice_first_touch_collapsed";
}

export function voiceModeLabel(mode: VoiceConversationMode): string {
  return {
    voice_first_touch_visible: "語音優先，保留觸控輔助",
    voice_first_touch_collapsed: "語音優先，觸控可恢復",
    touch_first_voice_assist: "觸控優先，語音輔助",
    staff_assisted: "現場人員協助"
  }[mode];
}
