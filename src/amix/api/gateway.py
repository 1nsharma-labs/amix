"""AMIX Unified API Gateway."""

import time
from typing import Any

from fastapi import APIRouter

from amix.config import (
    AMIX_LITE_MODEL,
    AMIX_REASON_MODEL,
    CACHE_TTL_SECONDS,
    MODEL_PRICING,
    ROUTING_COMPLEXITY_THRESHOLD,
)
from amix.serving.vllm_client import VLLMClient

router = APIRouter()

_client: VLLMClient | None = None
_cache: dict[str, tuple[dict, float]] = {}
_cost_log: list[dict] = {}


def configure_client(client: VLLMClient) -> None:
    global _client
    _client = client


def get_client() -> VLLMClient:
    if _client is None:
        raise RuntimeError("AMIX gateway client not configured. Call amix.api.gateway.configure_client().")
    return _client


def _cache_get(key: str) -> dict | None:
    entry = _cache.get(key)
    if not entry:
        return None
    response, expires_at = entry
    if time.monotonic() > expires_at:
        _cache.pop(key, None)
        return None
    return response


def _cache_set(key: str, response: dict) -> None:
    _cache[key] = (response, time.monotonic() + CACHE_TTL_SECONDS)


def estimate_complexity(query: str) -> float:
    """Heuristic complexity score between 0 and 1."""
    score = min(1.0, len(query.split()) / 60)
    lowered = query.lower()
    for kw in (
        "reason",
        "research",
        "analyze",
        "compare",
        "explain",
        "multimodal",
        "agent",
        "pipeline",
        "scientific",
        "hypothesis",
        "code",
        "debug",
    ):
        if kw in lowered:
            score += 0.15
    return min(1.0, score)


def compute_cost(usage: dict, model: str) -> float:
    pricing = MODEL_PRICING.get(model, {"input": 0.0, "output": 0.0})
    return (
        usage.get("prompt_tokens", 0) * pricing["input"] / 1_000_000
        + usage.get("completion_tokens", 0) * pricing["output"] / 1_000_000
    )


async def _invoke(model: str, messages: list[dict]) -> dict:
    client = get_client()
    result = await client.chat(model=model, messages=messages)
    usage = result.get("usage") or {}
    _cost_log.append(
        {
            "model": model,
            "usage": usage,
            "cost_usd": compute_cost(usage, model),
        }
    )
    return result


@router.get("/health")
async def gateway_health() -> dict:
    return {
        "service": "AMIX-Unified-API-Gateway",
        "status": "operational",
        "routes": {
            "lite": AMIX_LITE_MODEL,
            "reason": AMIX_REASON_MODEL,
        },
    }


@router.post("/v1/intelligence/query")
async def query_intelligence(query: dict) -> dict:
    prompt = str(query.get("prompt") or query.get("query") or "")
    complexity = estimate_complexity(prompt)
    model = AMIX_REASON_MODEL if complexity >= ROUTING_COMPLEXITY_THRESHOLD else AMIX_LITE_MODEL

    cached = _cache_get(f"query:{prompt[:256]}")
    if cached is not None:
        return {**cached, "complexity": complexity, "cached": True}

    result = await _invoke(model, [{"role": "user", "content": prompt}])
    response = {
        "model": result["model"],
        "content": result["content"],
        "complexity": complexity,
        "cached": False,
    }
    _cache_set(f"query:{prompt[:256]}", response)
    return response


def get_cost_log() -> list[dict]:
    return list(_cost_log)
