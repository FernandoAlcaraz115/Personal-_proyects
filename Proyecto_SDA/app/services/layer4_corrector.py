"""
Layer 4 — AI Correction.
Asks the LLM to confirm whether the claim is a hallucination,
explain why it's wrong (or correct), and provide the corrected version.
All text output is in the language requested by the user.
"""
import json
import re
import httpx
from app.models.analysis import CorrectionResult
from app.core.config import settings

_LANG_NAME = {"es": "Spanish", "en": "English"}

_PROMPT = """You are a fact-checking assistant. Your ONLY job is to output a JSON object.
IMPORTANT: ALL text values inside the JSON MUST be written in {lang_name}. Do NOT use any other language.

Claim to verify: "{claim}"
{context}

Rules:
- Output ONLY raw JSON. No markdown. No code blocks. No explanation outside the JSON.
- "is_hallucination": true if the claim contains a factual error, false if it is correct.
- "explanation": one sentence in {lang_name} explaining why it is wrong or correct.
- "corrected_claim": the fixed sentence in {lang_name} if wrong, or the original if correct.

Output example (in {lang_name}):
{example}

Now output the JSON for the claim above:"""

_EXAMPLES = {
    "Spanish": '{{"is_hallucination": true, "explanation": "Berlín es la capital de Alemania, no de Francia.", "corrected_claim": "La capital de Francia es París."}}',
    "English": '{{"is_hallucination": true, "explanation": "Berlin is the capital of Germany, not France.", "corrected_claim": "The capital of France is Paris."}}',
}


class HallucinationCorrector:
    def __init__(self):
        self._client = httpx.AsyncClient(timeout=60.0)

    async def correct(
        self,
        claim: str,
        wiki_snippet: str = "",
        provider: str = "ollama",
        language: str = "es",
    ) -> CorrectionResult:
        lang_name = _LANG_NAME.get(language, "Spanish")
        context   = f'Context from Wikipedia: "{wiki_snippet[:300]}"' if wiki_snippet else ""
        prompt    = _PROMPT.format(
            lang_name=lang_name,
            claim=claim,
            context=context,
            example=_EXAMPLES[lang_name],
        )

        try:
            raw  = await self._query(prompt, provider)
            data = self._parse_json(raw)
            if data:
                return CorrectionResult(
                    is_hallucination=bool(data.get("is_hallucination", False)),
                    explanation=str(data.get("explanation", "No explanation available.")),
                    corrected_claim=str(data.get("corrected_claim", claim)),
                )
        except Exception:
            pass

        return CorrectionResult(
            is_hallucination=False,
            explanation="AI correction unavailable.",
            corrected_claim=claim,
        )

    def _parse_json(self, text: str) -> dict | None:
        try:
            return json.loads(text.strip())
        except Exception:
            pass
        match = re.search(r"\{[\s\S]*?\}", text)
        if match:
            try:
                return json.loads(match.group())
            except Exception:
                pass
        return None

    async def _query(self, prompt: str, provider: str) -> str:
        if provider == "openai":
            return await self._openai(prompt)
        if provider == "gemini":
            return await self._gemini(prompt)
        return await self._ollama(prompt)

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
                "max_tokens": 300,
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
