import { describe, expect, it } from "vitest";
import { createActor } from "xstate";
import { avatarImageAltText, avatarImageSrc } from "./AvatarImage";
import { avatarStateLabel, avatarStateMachine, nextAvatarState } from "./avatarStateMachine";

describe("Avatar voice entry state machine", () => {
  it("allows wake word activation without writing an answer", () => {
    let state = nextAvatarState("idle_touch_ready", "WAKE_ARM");
    state = nextAvatarState(state, "WAKE_DETECTED");
    state = nextAvatarState(state, "VAD_SPEECH_START");
    state = nextAvatarState(state, "VAD_END_SILENCE");
    state = nextAvatarState(state, "TRANSCRIBE");
    state = nextAvatarState(state, "ASR_DONE");

    expect(state).toBe("confirming_candidate");
    expect(() => nextAvatarState("wake_detected", "CONFIRM_YES")).toThrow("Invalid Avatar event");
  });

  it("allows tap-to-start fallback when wakeword is unavailable", () => {
    let state = nextAvatarState("idle_touch_ready", "VOICE_SERVICE_DOWN");
    expect(state).toBe("voice_unavailable");

    state = nextAvatarState(state, "MANUAL_START");
    state = nextAvatarState(state, "MAX_UTTERANCE_REACHED");
    state = nextAvatarState(state, "ASR_DONE");

    expect(state).toBe("confirming_candidate");
    expect(avatarStateLabel("voice_unavailable")).toBe("語音服務不可用");
  });

  it("keeps low-confidence speech out of questionnaire writes", () => {
    let state = nextAvatarState("recording_answer", "VAD_END_SILENCE");
    state = nextAvatarState(state, "TRANSCRIBE");
    state = nextAvatarState(state, "ASR_LOW_CONFIDENCE");

    expect(state).toBe("retry_or_touch");
  });

  it("commits only after confirmation and resets to touch-ready idle", () => {
    let state = nextAvatarState("confirming_candidate", "CONFIRM_YES");
    state = nextAvatarState(state, "RESET");

    expect(state).toBe("idle_touch_ready");
  });

  it("exposes an xstate machine for the UI shell", () => {
    const actor = createActor(avatarStateMachine).start();

    actor.send({ type: "WAKE_ARM" });
    actor.send({ type: "WAKE_DETECTED" });
    actor.send({ type: "VAD_SPEECH_START" });

    expect(actor.getSnapshot().value).toBe("recording_answer");
    actor.stop();
  });

  it("rejects hidden jumps", () => {
    expect(() => nextAvatarState("idle_touch_ready", "CONFIRM_YES")).toThrow("Invalid Avatar event");
  });

  it("uses a static replaceable Avatar image with Traditional Chinese alt text", () => {
    expect(avatarImageSrc).toBe("/avatar/default-avatar.svg");
    expect(avatarImageAltText).toBe("AI 健康互動助理");
  });
});
