import { describe, expect, it } from "vitest";
import { createActor } from "xstate";
import { avatarImageAltText, avatarImageSrc } from "./AvatarImage";
import { avatarStateLabel, avatarStateMachine, nextAvatarState } from "./avatarStateMachine";

describe("Avatar state machine", () => {
  it("allows the expected voice answer path", () => {
    let state = nextAvatarState("idle", "speaking");
    state = nextAvatarState(state, "listening");
    state = nextAvatarState(state, "transcribing");
    state = nextAvatarState(state, "thinking");
    state = nextAvatarState(state, "confirming_answer");
    state = nextAvatarState(state, "idle");

    expect(state).toBe("idle");
    expect(avatarStateLabel("error_fallback")).toBe("可改用觸控填答");
  });

  it("allows the Sprint 4.5 recording and writing path", () => {
    let state = nextAvatarState("idle", "listening");
    state = nextAvatarState(state, "recording");
    state = nextAvatarState(state, "transcribing");
    state = nextAvatarState(state, "thinking");
    state = nextAvatarState(state, "confirming_answer");
    state = nextAvatarState(state, "writing_answer");
    state = nextAvatarState(state, "idle");

    expect(state).toBe("idle");
    expect(avatarStateLabel("recording")).toBe("錄音中");
  });

  it("exposes an xstate machine for the UI shell", () => {
    const actor = createActor(avatarStateMachine).start();

    actor.send({ type: "LISTEN" });
    actor.send({ type: "RECORD" });
    actor.send({ type: "TRANSCRIBE" });

    expect(actor.getSnapshot().value).toBe("transcribing");
    actor.stop();
  });

  it("rejects hidden jumps", () => {
    expect(() => nextAvatarState("idle", "confirming_answer")).toThrow("Invalid Avatar transition");
  });

  it("uses a static replaceable Avatar image with Traditional Chinese alt text", () => {
    expect(avatarImageSrc).toBe("/avatar/default-avatar.svg");
    expect(avatarImageAltText).toBe("健康檢測助理");
  });
});
