# Smart Health Cabin Reranker Sidecar

FastAPI boundary for bounded retrieval and questionnaire-option ranking.

Default provider metadata:

```text
provider=qwen3_reranker_0_6b
model=Qwen3-Reranker-0.6B
port=8014
```

The service never writes questionnaire state. `/rerank-options` returns ranked
candidate options with `confirmationRequired=true`; API and kiosk code must
still require explicit confirmation before persistence.

Modes:

- `RERANKER_MODE=mock`: deterministic lexical scoring for tests and fallback.
- `RERANKER_MODE=live`: reports live only when `RERANKER_MODEL_PATH` exists.
- `RERANKER_MODE=unavailable`: explicit unavailable provider status.

Run:

```bash
cd apps/model-sidecars/reranker-service
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8014
```
