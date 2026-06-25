import { describe, expect, it } from "vitest";
import { avatarStateLabel, nextAvatarState } from "./avatarStateMachine";

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

  it("rejects hidden jumps", () => {
    expect(() => nextAvatarState("idle", "confirming_answer")).toThrow("Invalid Avatar transition");
  });
});

