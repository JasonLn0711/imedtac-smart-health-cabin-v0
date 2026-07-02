---
id: open-llm-vtuber-asr-tts-taiwan-spec
title: "Open-LLM-VTuber ASR/TTS Taiwan Spec"
date: 2026-07-02
topic: smart-health-cabin
type: asr-tts-spec
status: active-mainline-design
---

# Open-LLM-VTuber ASR/TTS Taiwan Spec

## Goal

Tune or replace ASR/TTS so the second stack supports real-time Taiwan health
station interaction in Taiwan Traditional Chinese with Taiwan Mandarin speech.

## Non-Negotiable Language Boundary

Visible text is Traditional Chinese.

Internal TTS text may be converted to Simplified Chinese only when the selected
model requires it for better text normalization. That conversion is an internal
backend step and must not alter UI text, subtitles, reports, planning notes, or
handoff docs.

Recommended internal fields:

```json
{
  "display_text_zh_tw": "請確認最接近的選項。",
  "tts_text_internal": "请确认最接近的选项。",
  "tts_text_internal_lang": "zh-CN-for-tts-only"
}
```

## TTS Accent Boundary

Production or company-facing demos must not use a China-accent voice as the
default. A voice can advance only after Taiwan listener review accepts:

- pronunciation of Taiwan healthcare terms;
- prosody and sentence rhythm;
- speed under kiosk background noise;
- no Simplified Chinese subtitle leakage;
- no China-accent default voice impression.

## TTS Text Pipeline

For every TTS request:

```text
Traditional Chinese display text
-> sanitize markdown / emoji / unsupported symbols
-> normalize numbers, dates, units, English abbreviations
-> segment into short utterances
-> optional OpenCC zh-TW to zh-CN only if selected TTS needs it
-> send internal TTS text
-> display original Traditional Chinese text
```

Do not use TTS-normalized text as UI copy.

## Voice-Cloning Prompt Fidelity

Zero-shot or few-shot voice cloning is allowed only when prompt metadata is
exact.

Required:

- `prompt_audio` content exactly matches `prompt_text`;
- same language and dialect/accent target;
- clean audio with controlled noise;
- stable emotion and speaking style;
- duration within the selected model's recommended range;
- no hidden extra words, breaths presented as words, background speech, or
  transcript mismatch;
- prompt file and transcript stored together with checksum and reviewer note.

If prompt text and prompt audio do not match, do not run the voice-cloning path
as an acceptance candidate.

## ASR Provider Candidates

| Provider | Role | Gate |
| --- | --- | --- |
| `sherpa_onnx_asr` SenseVoiceSmall | Current low-friction baseline | Room test with Taiwan Mandarin and measurement terms. |
| `sherpa_onnx_asr` Fire Red ASR | Chinese-English mixed candidate | Compare accuracy on mixed terms and names. |
| `faster_whisper` large-v3-turbo | GPU accuracy candidate | Measure latency on local GPU and endpointing behavior. |
| `azure_asr` or `groq_whisper_asr` | Cloud candidate | Use only with privacy, credential, and network controls. |

ASR acceptance samples must include:

```text
血壓
收縮壓
舒張壓
身高體重
健康檢測
問卷填答
幾乎每天
超過一半的天數
完全沒有
現場人員協助確認
```

## TTS Provider Candidates

| Provider | Role | Gate |
| --- | --- | --- |
| Edge TTS `zh-TW-HsiaoChenNeural` | Low-friction lab baseline | Useful for smoke tests, not final custom voice. |
| Azure zh-TW voice | Cloud production candidate | Check Taiwan accent, credential/privacy path, latency. |
| Piper/sherpa-onnx local voice | Local fast candidate | Only if Taiwan Mandarin voice is available and accepted. |
| GPT-SoVITS | Voice-clone candidate | Prompt fidelity, latency, and Taiwan accent gate. |
| CosyVoice / SparkTTS | Voice-clone or controllable candidate | Prompt fidelity, text normalization, real-time gate. |
| OpenAI-compatible TTS | API candidate | Taiwan accent, data policy, and network gate. |

## Real-Time Evidence

For each TTS candidate, collect:

- provider and model/voice;
- runtime device;
- text length and segment count;
- first audio payload time;
- full audio ready time;
- playback duration;
- generated artifact path;
- listener acceptance notes;
- failure and recovery path.

Status labels:

```text
PREFLIGHT_ONLY
HARNESS_READY_ONLY
RUNTIME_READY
LIVE_MINIMUM_COMPLETED
LIVE_FULL_COMPLETED
BLOCKED_UNRESOLVED
```

Do not call completed-WAV-over-WebSocket true streaming. It is valid for product
playback if latency passes, but it is not a true streaming runtime proof.

## Acceptance Gate

The second stack can become a product candidate when:

- ASR passes Taiwan Mandarin room samples;
- TTS passes Taiwan listener review;
- UI text remains Traditional Chinese;
- internal simplified text, if used, is logged as TTS-only and never displayed;
- voice-cloning prompt fidelity is enforced;
- touch fallback and staff-review remain active;
- measured latency is acceptable for the kiosk interaction.

