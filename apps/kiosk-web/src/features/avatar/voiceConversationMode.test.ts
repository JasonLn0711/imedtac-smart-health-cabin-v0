import { describe, expect, it } from "vitest";
import { commandFromTranscript } from "./VoiceConversationController";
import { isTouchVisible, isVoicePrimary, normalizeVoiceConversationMode } from "./voiceConversationMode";

describe("voice conversation mode", () => {
  it("defaults to voice-first with touch still visible", () => {
    const mode = normalizeVoiceConversationMode(undefined);
    expect(mode).toBe("voice_first_touch_visible");
    expect(isVoicePrimary(mode)).toBe(true);
    expect(isTouchVisible(mode)).toBe(true);
  });

  it("treats collapsed touch as recoverable voice-first mode", () => {
    const mode = normalizeVoiceConversationMode("voice_first_touch_collapsed");
    expect(isVoicePrimary(mode)).toBe(true);
    expect(isTouchVisible(mode)).toBe(false);
  });

  it.each([
    ["重新回答", "retry"],
    ["我想改用觸控", "touch_fallback"],
    ["找人協助", "staff_assist"],
    ["完全沒有", "answer"]
  ] as const)("maps %s to %s", (transcript, command) => {
    expect(commandFromTranscript(transcript)).toBe(command);
  });
});
