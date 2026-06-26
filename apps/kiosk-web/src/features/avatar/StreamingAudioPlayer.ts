import type { AgentTurnResponse } from "@shc/contracts";
import { playAudioDataUrl } from "./voiceAgentApi";

interface StreamingPlaybackOptions {
  text?: string;
  stallTimeoutMs?: number;
}

export function websocketUrlFromHttp(baseUrl: string, path: string): string {
  const url = new URL(path, baseUrl);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.toString();
}

export function pcm16ToFloat32(buffer: ArrayBuffer): Float32Array {
  const view = new DataView(buffer);
  const samples = new Float32Array(Math.floor(buffer.byteLength / 2));
  for (let index = 0; index < samples.length; index += 1) {
    samples[index] = Math.max(-1, view.getInt16(index * 2, true) / 32768);
  }
  return samples;
}

function audioContextConstructor(): (new () => AudioContext) | undefined {
  const globalAudio = globalThis as typeof globalThis & {
    AudioContext?: new () => AudioContext;
    webkitAudioContext?: new () => AudioContext;
  };
  return globalAudio.AudioContext ?? globalAudio.webkitAudioContext;
}

async function playPcm16WebSocket(streamUrl: string, options: StreamingPlaybackOptions = {}): Promise<void> {
  const AudioContextCtor = audioContextConstructor();
  if (!AudioContextCtor) {
    throw new Error("Streaming playback requires Web Audio support");
  }

  const audioContext = new AudioContextCtor();
  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  const socket = new WebSocket(streamUrl);
  socket.binaryType = "arraybuffer";

  return new Promise((resolve, reject) => {
    let sampleRate = 24000;
    let nextStartTime = audioContext.currentTime + 0.05;
    let pendingChunks = 0;
    let sawAudio = false;
    let streamEnded = false;
    let settled = false;
    let stallTimer = 0;

    const settle = (error?: Error) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(stallTimer);
      socket.close();
      void audioContext.close();
      if (error) reject(error);
      else resolve();
    };

    const resetStallTimer = () => {
      window.clearTimeout(stallTimer);
      stallTimer = window.setTimeout(
        () => settle(new Error("Streaming TTS stalled before completion")),
        options.stallTimeoutMs ?? 30000
      );
    };

    const finishIfReady = () => {
      if (streamEnded && pendingChunks === 0) {
        settle();
      }
    };

    const scheduleChunk = (buffer: ArrayBuffer) => {
      const samples = pcm16ToFloat32(buffer);
      if (samples.length === 0) return;
      sawAudio = true;
      const audioBuffer = audioContext.createBuffer(1, samples.length, sampleRate);
      audioBuffer.getChannelData(0).set(samples);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      pendingChunks += 1;
      source.onended = () => {
        pendingChunks -= 1;
        finishIfReady();
      };
      const startTime = Math.max(nextStartTime, audioContext.currentTime + 0.02);
      source.start(startTime);
      nextStartTime = startTime + audioBuffer.duration;
    };

    socket.onopen = () => {
      resetStallTimer();
      socket.send(JSON.stringify({ text: options.text ?? "" }));
    };
    socket.onerror = () => settle(new Error("Streaming TTS WebSocket failed"));
    socket.onclose = () => {
      streamEnded = true;
      if (!sawAudio && !settled) {
        settle(new Error("Streaming TTS ended without audio"));
        return;
      }
      finishIfReady();
    };
    socket.onmessage = (event) => {
      resetStallTimer();
      if (typeof event.data === "string") {
        const payload = JSON.parse(event.data) as { event?: string; sample_rate?: number; message?: string };
        if (typeof payload.sample_rate === "number") {
          sampleRate = payload.sample_rate;
        }
        if (payload.event === "error") {
          settle(new Error(payload.message ?? "Streaming TTS returned an error"));
        }
        if (payload.event === "stream_end") {
          streamEnded = true;
          finishIfReady();
        }
        return;
      }
      if (event.data instanceof ArrayBuffer) {
        scheduleChunk(event.data);
        return;
      }
      if (event.data instanceof Blob) {
        void event.data.arrayBuffer().then(scheduleChunk, (error: unknown) => {
          settle(error instanceof Error ? error : new Error("Could not read streaming audio chunk"));
        });
      }
    };
  });
}

export async function playAgentTurnAudio(
  turn: AgentTurnResponse,
  options: StreamingPlaybackOptions = {}
): Promise<void> {
  if (turn.audio_data_url) {
    await playAudioDataUrl(turn.audio_data_url);
    return;
  }
  if (turn.stream_url) {
    await playPcm16WebSocket(turn.stream_url, options);
  }
}
