# Voice Agent Server Route

Sprint 3 uses the existing `apps/api-server` process for the first voice Agent
seam. A separate runtime remains an activation gate, not a requirement for the
local MVP.

Implemented Sprint 3 routes:

- ASR endpoint;
- LLM flow-guidance endpoint;
- TTS endpoint;
- `agent_turns` logging;
- confirmation before voice answers write to questionnaire state.

Scope control: the voice Agent guides flow, reads questions/options, and asks
for confirmation. It does not diagnose, recommend treatment, or change PHQ-9
scoring.

Routes:

```text
POST /api/v1/agent-sessions
POST /api/v1/agent-turns/asr
POST /api/v1/agent-turns/respond
POST /api/v1/agent-turns/tts
POST /api/v1/agent-turns/map-answer
```
