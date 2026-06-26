import { describe, expect, it } from "vitest";
import { pcm16ToFloat32, websocketUrlFromHttp } from "./StreamingAudioPlayer";

describe("StreamingAudioPlayer", () => {
  it("converts HTTP URLs to WebSocket URLs", () => {
    expect(websocketUrlFromHttp("https://example.test", "/v1/audio/stream")).toBe("wss://example.test/v1/audio/stream");
  });

  it("decodes little-endian PCM16 samples", () => {
    const buffer = new ArrayBuffer(6);
    const view = new DataView(buffer);
    view.setInt16(0, -32768, true);
    view.setInt16(2, 0, true);
    view.setInt16(4, 32767, true);

    const samples = pcm16ToFloat32(buffer);

    expect(Array.from(samples)).toEqual([-1, 0, 32767 / 32768]);
  });
});
