import os
import re
from pathlib import Path
from typing import Any

from fastapi import FastAPI
from pydantic import BaseModel, Field


SERVICE = "reranker-service"
PROVIDER = "qwen3_reranker_0_6b"
MODEL = os.getenv("RERANKER_MODEL", "Qwen3-Reranker-0.6B")
PORT = int(os.getenv("RERANKER_PORT", "8014"))


class RerankDocument(BaseModel):
    id: str
    text: str
    metadata: dict[str, Any] = Field(default_factory=dict)


class RerankRequest(BaseModel):
    query: str
    documents: list[RerankDocument]
    topK: int = 5
    instruction: str | None = None


class RerankOption(BaseModel):
    optionId: str
    text: str


class RerankOptionsRequest(BaseModel):
    query: str
    questionId: str
    options: list[RerankOption]
    topK: int = 3


app = FastAPI(title="Smart Health Cabin Reranker Sidecar")


def configured_mode() -> str:
    mode = os.getenv("RERANKER_MODE", "mock").lower()
    if mode not in {"live", "mock", "unavailable"}:
        return "unavailable"
    if mode == "live" and not Path(os.getenv("RERANKER_MODEL_PATH", "/models/qwen3-reranker-0.6b")).exists():
        return "unavailable"
    return mode


def tokenize(text: str) -> set[str]:
    return set(re.findall(r"[\w\u4e00-\u9fff]+", text.lower()))


def score(query: str, text: str) -> float:
    query_tokens = tokenize(query)
    text_tokens = tokenize(text)
    if not query_tokens or not text_tokens:
        return 0.0
    overlap = len(query_tokens & text_tokens)
    return round(overlap / len(query_tokens | text_tokens), 4)


@app.get("/healthz")
def healthz():
    return {"ok": True, "service": SERVICE}


@app.get("/status")
def status():
    mode = configured_mode()
    return {
        "provider": PROVIDER,
        "model": MODEL,
        "mode": mode,
        "device": os.getenv("RERANKER_DEVICE", "cuda"),
        "port": PORT,
    }


@app.post("/rerank")
def rerank(request: RerankRequest):
    ranked = sorted(
        (
            {
                "id": document.id,
                "score": score(request.query, document.text),
                "metadata": document.metadata,
            }
            for document in request.documents
        ),
        key=lambda item: item["score"],
        reverse=True,
    )[: request.topK]
    return {
        "provider": PROVIDER,
        "model": MODEL,
        "results": [
            {**item, "rank": index + 1}
            for index, item in enumerate(ranked)
        ],
    }


@app.post("/rerank-options")
def rerank_options(request: RerankOptionsRequest):
    ranked = sorted(
        (
            {
                "optionId": option.optionId,
                "text": option.text,
                "score": score(request.query, option.text),
            }
            for option in request.options
        ),
        key=lambda item: item["score"],
        reverse=True,
    )[: request.topK]
    return {
        "candidateOptions": [
            {**item, "rank": index + 1}
            for index, item in enumerate(ranked)
        ],
        "confirmationRequired": True,
    }
