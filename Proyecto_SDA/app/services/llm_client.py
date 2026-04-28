"""
Unified LLM client.
Supports Ollama (local), OpenAI, and Gemini.
Used for self-consistency sampling: asks the model to rate
its own factual confidence and averages N independent responses.
"""
import asyncio
import httpx
from app.core.config import settings


class LLMClient:
    def __init__(self):
        self._client = httpx.AsyncClient(timeout=60.0)

    async def self_consistency(
        self, text: str, n: int = 3, provider: str = "ollama"
    ) -> dict:
        prompt = (
            "Rate the factual confidence of the following statement "
            "on a scale from 0.0 (certainly false) to 1.0 (certainly true). "
            "Reply with only a single number, nothing else.\n\n"
            f"Statement: {text}"
        )
        tasks = [self._query(prompt, provider) for _ in range(n)]
        raw_results = await asyncio.gather(*tasks, return_exceptions=True)

        scores = []
        for r in raw_results:
            if isinstance(r, Exception):
                continue
            try:
                val = float(str(r).strip())
                if 0.0 <= val <= 1.0:
                    scores.append(val)
            except ValueError:
                pass

        if not scores:
            return {}
        return {"__global__": round(sum(scores) / len(scores), 3)}

    async def _query(self, prompt: str, provider: str) -> str:
        if provider == "ollama":
            return await self._ollama(prompt)
        if provider == "openai":
            return await self._openai(prompt)
        if provider == "gemini":
            return await self._gemini(prompt)
        raise ValueError(f"Unknown provider: {provider}")

    async def _ollama(self, prompt: str) -> str:
        res = await self._client.post(
            f"{settings.ollama_base_url}/api/generate",
            json={"model": settings.default_model, "prompt": prompt, "stream": False},
        )
        res.raise_for_status()
        return res.json()["response"]

    async def _openai(self, prompt: str) -> str:
        res = await self._client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {settings.openai_api_key}"},
            json={
                "model": "gpt-4o-mini",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 10,
                "temperature": 0.0,
            },
        )
        res.raise_for_status()
        return res.json()["choices"][0]["message"]["content"]

    async def _gemini(self, prompt: str) -> str:
        url = (
            "https://generativelanguage.googleapis.com/v1beta/models"
            f"/gemini-2.0-flash:generateContent?key={settings.gemini_api_key}"
        )
        res = await self._client.post(
            url,
            json={"contents": [{"parts": [{"text": prompt}]}]},
        )
        res.raise_for_status()
        return res.json()["candidates"][0]["content"]["parts"][0]["text"]
