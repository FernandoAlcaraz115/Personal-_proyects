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
        self._client = httpx.AsyncClient(timeout=15.0)

    async def self_consistency(
        self, text: str, n: int = 3, provider: str = "ollama", model: str = "llama3.2"
    ) -> dict:
        prompt = (
            "Rate the factual confidence of the following statement "
            "on a scale from 0.0 (certainly false) to 1.0 (certainly true). "
            "Reply with only a single number, nothing else.\n\n"
            f"Statement: {text}"
        )
        tasks = [self._query(prompt, provider, model) for _ in range(n)]
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

    async def generate_answer_stream(
        self,
        prompt: str,
        provider: str = "ollama",
        model: str = "llama3.2",
        mode: str = "text",
        language: str = "es",
    ):
        """
        Async generator yielding incremental text chunks from Ollama (real streaming)
        or a single full chunk from OpenAI/Gemini, avoiding ReadTimeout on local CPUs.
        """
        import json

        lang_hint = "Respond in Spanish." if language == "es" else "Respond in English."
        if mode == "code":
            sys_hint = f"{lang_hint} Return ONLY the requested source code without markdown fences if possible."
        elif mode == "sql":
            sys_hint = f"{lang_hint} Return ONLY the requested SQL query."
        elif mode == "math":
            sys_hint = f"{lang_hint} Solve step-by-step concisely, writing explicit mathematical equations (e.g. 2 + 2 = 4) on separate lines."
        else:
            sys_hint = f"{lang_hint} Answer the user's request naturally and concisely in 2 to 4 clear sentences."

        full_prompt = f"{sys_hint}\n\nQuestion: {prompt}"
        timeout = httpx.Timeout(connect=10.0, read=120.0, write=30.0, pool=10.0)

        async with httpx.AsyncClient(timeout=timeout) as gen_client:
            if provider == "openai":
                if not settings.openai_api_key or not settings.openai_api_key.strip():
                    raise ValueError("Falta configurar OPENAI_API_KEY en el archivo .env. Cambia el proveedor a 'Ollama (Local)' o añade tu API key de OpenAI.")
                target_model = model if model and "gpt" in model else "gpt-4o-mini"
                res = await gen_client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {settings.openai_api_key}"},
                    json={
                        "model": target_model,
                        "messages": [{"role": "user", "content": full_prompt}],
                        "max_tokens": 450,
                        "temperature": 0.3,
                    },
                )
                res.raise_for_status()
                yield res.json()["choices"][0]["message"]["content"].strip()
                return

            if provider == "gemini":
                if not settings.gemini_api_key or not settings.gemini_api_key.strip():
                    raise ValueError("Falta configurar GEMINI_API_KEY en el archivo .env. Cambia el proveedor a 'Ollama (Local)' o añade tu API key de Gemini.")
                url = (
                    "https://generativelanguage.googleapis.com/v1beta/models"
                    f"/gemini-2.0-flash:generateContent?key={settings.gemini_api_key}"
                )
                res = await gen_client.post(
                    url,
                    json={"contents": [{"parts": [{"text": full_prompt}]}]},
                )
                res.raise_for_status()
                yield res.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
                return

            # Default: Ollama local with real token streaming
            target_model = model.strip() if model and model.strip() else settings.default_model
            async with gen_client.stream(
                "POST",
                f"{settings.ollama_base_url}/api/generate",
                json={
                    "model": target_model,
                    "prompt": full_prompt,
                    "stream": True,
                    "keep_alive": "15m",
                    "options": {
                        "num_predict": 280,
                        "temperature": 0.6,
                    },
                },
            ) as res:
                if res.status_code == 404:
                    raise ValueError(f"Modelo '{target_model}' no encontrado en Ollama. Ejecuta 'ollama list' para ver los modelos instalados.")
                res.raise_for_status()
                async for line in res.aiter_lines():
                    if not line.strip():
                        continue
                    try:
                        chunk_data = json.loads(line)
                        piece = chunk_data.get("response", "")
                        if piece:
                            yield piece
                        if chunk_data.get("done"):
                            break
                    except Exception:
                        continue

    async def generate_answer(
        self,
        prompt: str,
        provider: str = "ollama",
        model: str = "llama3.2",
        mode: str = "text",
        language: str = "es",
    ) -> str:
        """Collects full LLM response from generate_answer_stream."""
        parts = []
        async for piece in self.generate_answer_stream(
            prompt=prompt,
            provider=provider,
            model=model,
            mode=mode,
            language=language,
        ):
            parts.append(piece)
        return "".join(parts).strip()

    async def _query(self, prompt: str, provider: str, model: str = "llama3.2") -> str:
        if provider == "ollama":
            return await self._ollama(prompt, model)
        if provider == "openai":
            return await self._openai(prompt, model)
        if provider == "gemini":
            return await self._gemini(prompt)
        raise ValueError(f"Unknown provider: {provider}")

    async def _ollama(self, prompt: str, model: str = "llama3.2") -> str:
        target_model = model.strip() if model and model.strip() else settings.default_model
        payload = {
            "model": target_model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "num_predict": 150,
                "temperature": 0.1,
            }
        }
        res = await self._client.post(
            f"{settings.ollama_base_url}/api/generate",
            json=payload,
        )
        res.raise_for_status()
        return res.json()["response"]

    async def _openai(self, prompt: str, model: str = "gpt-4o-mini") -> str:
        target_model = model if model and "gpt" in model else "gpt-4o-mini"
        res = await self._client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {settings.openai_api_key}"},
            json={
                "model": target_model,
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 150,
                "temperature": 0.1,
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
