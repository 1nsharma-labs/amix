"""AMIX serving client - talks to open-source models served via vLLM."""

import httpx


class VLLMClient:
    """Async client for vLLM's OpenAI-compatible /v1 API."""

    def __init__(
        self,
        base_url: str = "http://localhost:8000",
        api_key: str | None = None,
        timeout: float = 120.0,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.timeout = timeout
        self._client = httpx.AsyncClient(base_url=self.base_url, api_key=api_key, timeout=timeout)

    async def health(self) -> dict:
        resp = await self._client.get("/health")
        resp.raise_for_status()
        return resp.json()

    async def chat(self, model: str, messages: list[dict], temperature: float = 0.7) -> dict:
        resp = await self._client.post(
            "/v1/chat/completions",
            json={"model": model, "messages": messages, "temperature": temperature, "stream": False},
        )
        resp.raise_for_status()
        data = resp.json()
        return {
            "content": data["choices"][0]["message"]["content"],
            "usage": data.get("usage") or {},
            "model": data.get("model") or model,
        }

    async def close(self) -> None:
        await self._client.aclose()
