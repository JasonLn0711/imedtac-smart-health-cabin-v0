---
id: smart-health-cabin-voice-entry-tech-selection-sdd-draft
title: "Smart Health Cabin Voice Entry Technology Selection SDD Draft"
date: 2026-06-25
topic: smart-health-cabin
type: system-design-decision-draft
status: draft
source:
  - ./MVP-SYSTEM-SPEC.md
  - ./MVP-QUESTIONNAIRE-AVATAR-SPRINT-PLAN.md
  - ../handoff/sprint-4.5-model-selection.md
  - ../../apps/voice-agent-server/README.md
  - ../../apps/model-sidecars/wakeword-service/README.md
  - ../../apps/model-sidecars/asr-service/README.md
  - ../../apps/model-sidecars/tts-service/README.md
---

# Voice Entry Technology Selection SDD Draft

## Purpose

This draft records the current selected technology stack and the Sprint 5.6
Voice Entry Activation Gate decision for the Smart Health Cabin voice entry
layer.

The latest accepted expert update moves the next product path from further
BreezyVoice runtime modification to:

```text
VOICE_CONVERSATION_PRIMARY questionnaire
+ CosyVoice3 real-time streaming TTS production candidate
+ BreezyVoice fallback / baseline / research lane
```

Touch remains a safety and recovery path. "No touch" means touch answers may be
collapsed or hidden in the default UI; it does not mean deleting touch or staff
fallback code paths.

The voice entry layer owns a controlled path from user speech to reviewable
questionnaire input:

```text
wake word or tap -> visible recording state -> VAD / endpointing auto-stop
-> ASR -> candidate answer mapping -> clear option commit or staff review
-> questionnaire answer
```

The first release scope is staff-review intake support and questionnaire
guidance for Traditional Chinese users in Taiwan enterprise settings. The voice
Agent guides, reads questions/options, maps candidate answers, and supports
manual confirmation. In continuous mode, only transcripts that map clearly to one
displayed option write and advance. It does not diagnose, recommend treatment,
change PHQ-9 scoring, or write low-confidence answers.

## Sprint 5.6 Product Decision

```text
Voice Entry Decision:
- Primary activation: wake word, local only
- Required fallback: tap-to-start + auto-stop
- No audio retention by default
- Wake word only triggers recording state
- Wake word never writes questionnaire answers
- ASR result must still go through candidate mapping; unmapped or low-confidence
  speech never writes
- Touch questionnaire remains complete path when voice stack fails
```

Wake word is the entrance control layer. ASR is the understanding layer. LLM
guidance and bounded mapping are the interaction layer. Questionnaire write is
still a candidate-gated state change.

## Already Selected

These choices are already present in the current system design or repo
configuration.

| Area | Selected choice | Current evidence |
| --- | --- | --- |
| Repo strategy | Single monorepo for MVP | `docs/specs/MVP-SYSTEM-SPEC.md` |
| Architecture style | Modular monolith with independently enabled modules | `docs/specs/MVP-SYSTEM-SPEC.md` |
| Phase 1 MVP spine | Open questionnaire platform + ASR/LLM/TTS Avatar Agent | `README.md`, `docs/specs/MVP-QUESTIONNAIRE-AVATAR-SPRINT-PLAN.md` |
| Phase 2 modules | Vision and hearing remain planned modules | `README.md`, module manifests |
| Frontend package manager | `pnpm@9.15.0` workspace | `package.json` |
| Kiosk frontend | React 19 + Vite 6 + TypeScript | `apps/kiosk-web/package.json` |
| Admin frontend | React/Vite admin app | `apps/admin-web/` |
| API server | Fastify 5 + TypeScript | `apps/api-server/package.json` |
| Database | PostgreSQL as source of truth | `infra/docker-compose.yml`, migrations |
| Event layer | Redpanda through outbox worker | `apps/outbox-worker/README.md` |
| Event client | `kafkajs` | `apps/outbox-worker/package.json` |
| Questionnaire renderer | SurveyJS | `apps/kiosk-web/package.json` |
| First demo questionnaire | PHQ-9 Traditional Chinese SurveyJS seed | `modules/questionnaire/seed/phq9.zh-TW.surveyjs.json` |
| Questionnaire scoring | PHQ-9 scoring config with human-review flag | `modules/questionnaire/scoring/phq9.public-scoring-config.json` |
| Avatar visual | Static SVG avatar | `apps/kiosk-web/public/avatar/default-avatar.svg` |
| Avatar UI state | XState + `@xstate/react` | `apps/kiosk-web/src/features/avatar/` |
| Browser capture | Web `MediaRecorder` | `docs/handoff/sprint-4.5-model-selection.md` |
| Voice activation gate | Local wake word with tap-to-start fallback | Sprint 5.6 decision |
| Wake word provider | sherpa-onnx KWS Zipformer zh-en 3M | `apps/model-sidecars/wakeword-service/README.md` |
| Voice provider mode | `mock`, `live`, `unavailable` status model | `apps/voice-agent-server/README.md` |
| ASR provider | `faster-whisper` + `Breeze-ASR-26` CTranslate2 int8 | `docs/handoff/sprint-4.5-model-selection.md` |
| ASR sidecar | Python FastAPI sidecar on port `8011` | `apps/model-sidecars/asr-service/README.md` |
| ASR acceptance | GPU-only live acceptance; no CPU fallback for live acceptance | `.env.example`, `apps/voice-agent-server/README.md` |
| LLM provider | Local Gemma 4 E4B through Ollama native or OpenAI-compatible runtime | `.env.example`, `docs/handoff/sprint-4.5-model-selection.md` |
| LLM behavior | Short flow guidance, temperature `0.3`, bounded answer mapping | `.env.example`, voice Agent routes |
| TTS provider | Current fallback/reference: BreezyVoice default voice; next production candidate: CosyVoice3 streaming | `docs/decisions/2026-06-26-voice-first-cosyvoice3-product-path.md` |
| TTS sidecar | CosyVoice streaming sidecar on port `8015`; BreezyVoice fallback sidecar on port `8012` | `apps/model-sidecars/cosyvoice-service/README.md`, `apps/model-sidecars/tts-service/README.md` |
| TTS voice control | Reject reference audio, voice cloning, custom voice IDs | `apps/model-sidecars/tts-service/README.md` |
| Voice write policy | Confirmation before voice answers write to questionnaire state | `apps/voice-agent-server/README.md` |
| Critical path rule | Redpanda failure must not block kiosk completion | `apps/outbox-worker/README.md` |

## Voice Entry Selection

These choices are the Sprint 5.6 baseline unless a hardware or customer
constraint changes them.

| Area | Proposed choice | Reason |
| --- | --- | --- |
| Start recording | Local wake word primary, tap-to-start fallback | Supports hands-free activation without making the system always write from speech |
| Always-listening mode | Not enabled as an assistant behavior | Wake word listens only as a local activation gate |
| Wake word | Enabled as local gate through sherpa-onnx KWS | Keeps activation offline, local, and free of external AccessKey / `.ppn` packaging |
| Wake phrase | `你好小慧` | Short, natural, project-aligned activation phrase for kiosk users |
| Wake word engineering fallback | Tap-to-start | Keep hands-free optional until onsite false-trigger / miss-rate checks pass |
| VAD primary | Silero VAD | Better modern VAD baseline for speech gating |
| VAD fallback | WebRTC VAD only if Silero cannot run | Lightweight fallback for constrained devices |
| VAD runtime | Prefer local runtime near capture path | Keeps noise gating before ASR cost and privacy exposure |
| Endpointing | Small local state machine | One controlled rule set is enough for MVP |
| ASR routing | Keep selected Breeze-ASR live provider; add confidence routing before write | Reuses current stack and improves field safety |
| Low-confidence handling | Confirm, repeat, touch fallback, or staff review | Turns ASR uncertainty into workflow control |
| Multi-speaker handling | Single-user mode first; staff review on overlap or speaker ambiguity | Fits cabin workflow and avoids overclaiming diarization |
| Elder mode | Slower endpoint timeout and stronger confirmation | Supports pauses, unclear speech, and mixed Mandarin/Taigi answers |

## Voice Entry State Machine

The MVP uses one small state machine:

```text
idle_touch_ready
-> wake_armed
-> wake_detected
-> recording_answer
-> endpointing_wait
-> transcribing
-> confirming_candidate
-> committed | retry_or_touch | voice_unavailable | staff_review
```

State rules:

- `idle_touch_ready`: microphone is not capturing; touch questionnaire remains available.
- `wake_armed`: local wake word gate is active.
- `wake_detected`: wake word fired and the UI makes recording state visible.
- `recording_answer`: browser captures the answer utterance.
- `endpointing_wait`: VAD / endpointing closes the utterance.
- `transcribing`: ASR receives the clipped utterance.
- `confirming_candidate`: ASR text is mapped to a questionnaire option candidate.
- `committed`: only confirmed answers write to questionnaire state.
- `retry_or_touch`: user or system asks for a new utterance or touch fallback.
- `voice_unavailable`: voice stack is down; touch questionnaire still works.
- `staff_review`: system preserves evidence and asks staff to assist.

Continuous voice loop:

- `wake.detected` starts continuous voice mode for hands-free interaction.
- Each captured turn runs ASR. A clear option match writes the current answer and
  advances the UI to the next question; an unmapped answer stays on the current
  question.
- The TTS reply says the recognized answer, gives one supportive sentence, then
  asks the next displayed question through the LLM guidance path.
- After TTS playback, the internal `LOOP_READY` transition returns directly to
  `recording_answer` for the next VAD-bounded utterance.
- The user-visible stop control cancels the active capture and returns to
  `idle_touch_ready`.

## Suggested VAD And Endpoint Parameters

These are starting values for onsite tuning, not final clinical validation.

| Mode | Min speech | End silence | Max utterance | Use case |
| --- | ---: | ---: | ---: | --- |
| Standard | 250 ms | 900 ms | 20 s | Typical questionnaire answer |
| Elder mode | 300 ms | 1500 ms | 30 s | Longer pauses or unclear speech |
| Noisy site | 350 ms | 1000 ms | 20 s | Higher background noise |

Add a short pre-roll buffer, such as 300 ms, so the first syllable is preserved
after VAD opens the speech segment.

## ASR Confidence Routing

The system should route ASR results by workflow confidence, not by transcript
text alone.

| Condition | Action |
| --- | --- |
| Clear transcript maps to one option | Continuous mode writes and advances; manual path can ask confirmation |
| Transcript maps to two likely options | Show both options and ask user to choose |
| Empty, noise, or no speech | Do not write; ask user to try again or use touch |
| Mixed Mandarin/Taigi or unclear phrase | Ask confirmation or switch to touch fallback |
| PHQ-9 item 9 positive | Preserve human-review flag and staff-review workflow |
| Multiple speakers or overlap suspected | Do not write automatically; route to staff review |

For PHQ-9, voice input should map only to the four answer options. It should not
rewrite the questionnaire, alter scoring, or create extra clinical claims.

## Decision Items For Jason / imedtac

These choices remain open and should be selected before this draft is merged
into the main system design.

| Decision | Recommended default | Options |
| --- | --- | --- |
| Recording interaction | Tap once to start, auto-stop | Push-to-talk; tap-to-start; always-listening |
| VAD deployment | Local Silero VAD near kiosk capture path | Browser ONNX; API-side VAD; native kiosk VAD |
| VAD fallback | WebRTC VAD | Disable voice on unsupported hardware; WebRTC VAD |
| Elder mode | Enabled as a site setting | Always standard; per-site elder mode; per-user elder mode |
| Multi-speaker policy | Staff review on ambiguity | Reject and retry; diarization; staff-assisted mode |
| Audio retention | Do not retain audio by default | No audio retention; short debug retention; full retention with consent |
| Cloud ASR fallback | Not enabled by default | OpenAI; Google Cloud; Azure; none |
| Formal wake phrase | Frozen as `你好小慧` | sherpa-onnx generated keyword token file; tap-to-start remains fallback |
| Diarization | Not in Phase 1 | None; OpenAI diarize; pyannote; vendor diarization |
| Hardware mic | To be selected onsite | USB directional mic; kiosk array mic; headset; built-in mic |

## CosyVoice3 Provider Gate

The CosyVoice3 path is accepted only when `cosyvoice3_streaming` provides real
audio-out streaming through WebSocket PCM16 chunks. A sidecar process, status
route, or completed WAV response is preflight evidence only.

Required provider fields:

```text
provider=cosyvoice3_streaming
streaming=true
audioTransport=ws_pcm16
fallbackProvider=breezyvoice_default
acceptanceEligible=true
```

If these fields are unavailable or the room test is not complete, keep touch
and staff fallback visible enough for recovery.
| Taigi support | Confirmation-first support | Mandarin only; mixed Mandarin/Taigi support; separate Taigi validation |

## Enterprise Pain Points And Controls

### 1. Background Noise And False Triggers

Taiwan enterprise sites may include front-desk speech, equipment noise, TV
audio, family members, and staff interruptions. The system controls this by
requiring a user-visible recording state, local VAD, endpointing, and
confirmation before write.

### 2. Elders Speak Slowly Or Unclear

The product should treat slow speech as an expected workflow condition. Elder
mode gives longer silence tolerance, preserves pre-roll audio, and routes
uncertain output to confirmation, touch fallback, or staff assistance.

### 3. Multiple People Around The Cabin

The cabin interaction is a single-user data collection workflow. Phase 1 should
not claim meeting-grade diarization. Speaker ambiguity becomes a staff-review
activation gate.

### 4. ASR Confidence Is Not Enough

ASR confidence alone does not prove that the answer is safe to write. The
system uses workflow confidence: transcript clarity, option mapping, current
question context, safety flag, and user confirmation.

### 5. Enterprise Governance And Procurement

Hospitals and enterprises will ask where audio goes, whether audio is retained,
which model is used, whether GPU is required, and how failure is handled. The
current local-first ASR/LLM/TTS stack answers that by keeping the live path on
local model sidecars and keeping mock mode for demo continuity. Cloud ASR can
remain a separately approved activation path.

## FIRST PRINCIPLE

The first principle is not "make speech recognition work." The first principle
is:

```text
Convert unstable human speech into reviewable, confirmed, structured
questionnaire input without weakening clinical, privacy, or staff-review
boundaries.
```

That principle sets the order of design:

1. Define when the system is allowed to listen.
2. Gate speech locally before model inference.
3. End each utterance predictably.
4. Transcribe with the selected ASR provider.
5. Route confidence into confirmation, retry, touch fallback, or staff review.
6. Write only confirmed structured answers.

## Next Update

After onsite validation selects the formal wake phrase and VAD runtime, promote
the final values into:

- `docs/specs/MVP-SYSTEM-SPEC.md`;
- `docs/specs/MVP-QUESTIONNAIRE-AVATAR-SPRINT-PLAN.md`, if sprint scope changes;
- `.env.example`, if VAD or cloud fallback settings become implementation
  requirements.
