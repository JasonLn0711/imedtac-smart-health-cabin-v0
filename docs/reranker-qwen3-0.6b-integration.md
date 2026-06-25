# Qwen3-Reranker-0.6B Integration

Smart Health Cabin uses a local reranker boundary for bounded document and
option ranking. The MVP default is:

```text
provider=qwen3_reranker_0_6b
model=Qwen3-Reranker-0.6B
service=http://localhost:8014
```

Qwen3-Reranker-0.6B is the default because the kiosk needs local-first
multilingual/Chinese ranking with lower latency and lower GPU pressure than
larger 4B or 8B rerankers. Larger models remain benchmark options.

## Service

Sidecar path:

```text
apps/model-sidecars/reranker-service/
```

Endpoints:

- `GET /healthz`
- `GET /status`
- `POST /rerank`
- `POST /rerank-options`

`/rerank-options` ranks bounded choices only. It returns
`confirmationRequired=true` and never writes questionnaire state.

## Failure Behavior

- In mock mode, the sidecar uses deterministic lexical scoring for tests.
- In live mode, the sidecar reports unavailable unless `RERANKER_MODEL_PATH`
  exists.
- If the reranker is unavailable, the questionnaire still completes through
  deterministic mapping, confirmation, or touch fallback.

## Validation

Run against a started sidecar:

```bash
corepack pnpm smoke:reranker
```

Provider status exposes reranker readiness. Sprint 5 live acceptance remains
gated by ASR, LLM, TTS, Redpanda, and voice-agent readiness until a local live
reranker model is installed and promoted. Set
`RERANKER_REQUIRED_FOR_LIVE_ACCEPTANCE=true` only for that promotion gate.
