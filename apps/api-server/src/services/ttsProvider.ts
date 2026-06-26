import type { ProviderRuntimeStatus } from "@shc/contracts";

export const defaultBreezyVoiceProvider = "breezyvoice_default";
export const defaultBreezyVoiceModel = "/models/breezyvoice";
export const defaultCosyVoice3Provider = "cosyvoice3_streaming";
export const defaultCosyVoice3Model = "FunAudioLLM/Fun-CosyVoice3-0.5B-2512";

export interface TtsProviderConfig {
  provider: string;
  model: string;
  baseUrl: string;
  healthPath: string;
  synthesizePath: string;
  streamPath: string;
  streaming: boolean;
  transport: "http_wav" | "ws_pcm16";
  fallbackProvider: string;
}

function env(source: NodeJS.ProcessEnv, name: string, fallback: string): string {
  return source[name] ?? fallback;
}

function trimSlash(value: string): string {
  return value.replace(/\/$/, "");
}

export function joinUrl(baseUrl: string, path: string): string {
  return `${trimSlash(baseUrl)}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getTtsProviderConfig(source: NodeJS.ProcessEnv = process.env): TtsProviderConfig {
  const provider = env(source, "TTS_PROVIDER", defaultCosyVoice3Provider);
  const fallbackProvider = env(source, "TTS_FALLBACK_PROVIDER", defaultBreezyVoiceProvider);

  if (provider === defaultCosyVoice3Provider) {
    return {
      provider,
      model: env(source, "COSYVOICE3_MODEL_ID", defaultCosyVoice3Model),
      baseUrl: env(source, "COSYVOICE3_BASE_URL", env(source, "TTS_SERVICE_URL", "http://localhost:8015")),
      healthPath: env(source, "COSYVOICE3_HEALTH_PATH", "/readyz"),
      synthesizePath: env(source, "COSYVOICE3_SYNTHESIZE_PATH", "/v1/audio/speech"),
      streamPath: env(source, "COSYVOICE3_STREAM_PATH", "/v1/audio/stream"),
      streaming: env(source, "COSYVOICE3_STREAMING", "true").toLowerCase() !== "false",
      transport: "ws_pcm16",
      fallbackProvider
    };
  }

  if (provider === "cosyvoice2_streaming") {
    return {
      provider,
      model: env(source, "COSYVOICE2_MODEL_ID", "CosyVoice2-0.5B"),
      baseUrl: env(source, "COSYVOICE2_BASE_URL", env(source, "TTS_SERVICE_URL", "http://localhost:8016")),
      healthPath: env(source, "COSYVOICE2_HEALTH_PATH", "/readyz"),
      synthesizePath: env(source, "COSYVOICE2_SYNTHESIZE_PATH", "/v1/audio/speech"),
      streamPath: env(source, "COSYVOICE2_STREAM_PATH", "/v1/audio/stream"),
      streaming: true,
      transport: "ws_pcm16",
      fallbackProvider
    };
  }

  const breezyBaseUrl = source.BREEZYVOICE_BASE_URL ?? source.BREEZYVOICE_TTS_SERVICE_URL ?? env(source, "TTS_SERVICE_URL", "http://localhost:8012");
  const breezyOpenAiStyle = Boolean(source.BREEZYVOICE_BASE_URL);

  return {
    provider,
    model: source.BREEZYVOICE_MODEL ?? env(source, "TTS_MODEL_PATH", defaultBreezyVoiceModel),
    baseUrl: breezyBaseUrl,
    healthPath: breezyOpenAiStyle ? "/models" : env(source, "BREEZYVOICE_TTS_HEALTH_PATH", env(source, "TTS_HEALTH_PATH", "/healthz")),
    synthesizePath: breezyOpenAiStyle
      ? "/audio/speech"
      : env(source, "BREEZYVOICE_TTS_SYNTHESIZE_PATH", env(source, "TTS_SYNTHESIZE_PATH", "/v1/tts/synthesize")),
    streamPath: "",
    streaming: false,
    transport: "http_wav",
    fallbackProvider
  };
}

export function ttsStreamUrl(config = getTtsProviderConfig()): string | undefined {
  if (!config.streaming) {
    return undefined;
  }
  const url = new URL(joinUrl(config.baseUrl, config.streamPath));
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.toString();
}

export function ttsRuntimeStatusPatch(config = getTtsProviderConfig()): Pick<
  ProviderRuntimeStatus,
  "provider" | "model" | "endpoint" | "fallback" | "streaming" | "audioTransport" | "fallbackProvider"
> {
  return {
    provider: config.provider,
    model: config.model,
    endpoint: config.baseUrl,
    fallback: config.fallbackProvider,
    streaming: config.streaming,
    audioTransport: config.transport,
    fallbackProvider: config.fallbackProvider
  };
}
