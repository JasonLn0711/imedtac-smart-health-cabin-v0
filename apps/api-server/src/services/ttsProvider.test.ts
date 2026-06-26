import { afterEach, describe, expect, it } from "vitest";
import { getTtsProviderConfig, ttsStreamUrl } from "./ttsProvider";

afterEach(() => {
  delete process.env.TTS_PROVIDER;
  delete process.env.TTS_FALLBACK_PROVIDER;
  delete process.env.TTS_SERVICE_URL;
  delete process.env.TTS_MODEL_PATH;
  delete process.env.COSYVOICE3_BASE_URL;
  delete process.env.COSYVOICE3_MODEL_ID;
  delete process.env.COSYVOICE3_STREAMING;
  delete process.env.BREEZYVOICE_BASE_URL;
  delete process.env.BREEZYVOICE_TTS_SERVICE_URL;
  delete process.env.BREEZYVOICE_TTS_SYNTHESIZE_PATH;
  delete process.env.BREEZYVOICE_MODEL;
});

describe("tts provider config", () => {
  it("defaults to CosyVoice3 streaming with BreezyVoice fallback", () => {
    const config = getTtsProviderConfig();

    expect(config).toMatchObject({
      provider: "cosyvoice3_streaming",
      streaming: true,
      fallbackProvider: "breezyvoice_default"
    });
  });

  it("selects CosyVoice3 streaming with BreezyVoice fallback", () => {
    process.env.TTS_PROVIDER = "cosyvoice3_streaming";
    process.env.TTS_FALLBACK_PROVIDER = "breezyvoice_default";
    process.env.COSYVOICE3_BASE_URL = "http://localhost:8015";

    const config = getTtsProviderConfig();

    expect(config).toMatchObject({
      provider: "cosyvoice3_streaming",
      model: "FunAudioLLM/Fun-CosyVoice3-0.5B-2512",
      baseUrl: "http://localhost:8015",
      streaming: true,
      transport: "ws_pcm16",
      fallbackProvider: "breezyvoice_default"
    });
    expect(ttsStreamUrl(config)).toBe("ws://localhost:8015/v1/audio/stream");
  });

  it("keeps BreezyVoice as non-streaming fallback provider", () => {
    process.env.TTS_PROVIDER = "breezyvoice_default";
    process.env.TTS_SERVICE_URL = "http://localhost:8015";
    process.env.BREEZYVOICE_TTS_SERVICE_URL = "http://localhost:8012";

    const config = getTtsProviderConfig();

    expect(config).toMatchObject({
      provider: "breezyvoice_default",
      baseUrl: "http://localhost:8012",
      streaming: false,
      transport: "http_wav"
    });
    expect(ttsStreamUrl(config)).toBeUndefined();
  });
});
