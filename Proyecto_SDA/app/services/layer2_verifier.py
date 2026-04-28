"""
Layer 2 — External verification.
Strategy:
  1. Parse the claim to extract the subject entity and the claimed value.
  2. Search Spanish Wikipedia first (handles Spanish text), then English.
  3. If the claimed value is NOT present in the Wikipedia snippet about the
     subject, mark it as contradicted with low confidence.
  4. If the claimed value IS present, compute standard lexical overlap.
"""
import httpx
from typing import Optional, Tuple
from app.models.analysis import Layer2Result

_COMMON_STARTERS = {
    "la", "el", "los", "las", "un", "una", "uno",
    "the", "a", "an", "this", "that", "these", "those",
}

_STOP_WORDS = {
    "de", "del", "en", "es", "son", "fue", "ser", "estar",
    "con", "por", "para", "que", "se", "su", "sus",
    "the", "a", "an", "is", "are", "was", "were", "of", "in",
    "on", "at", "to", "for", "with", "by", "from", "and", "or",
    "not", "it", "its", "this", "that",
}


class ExternalVerifier:
    def __init__(self):
        self._client = httpx.AsyncClient(timeout=10.0)

    async def verify(self, claim: str) -> Layer2Result:
        try:
            subject, claimed_value = self._parse_claim(claim)

            # Try Spanish Wikipedia first, then English
            snippet, found = await self._search_wikipedia(subject, lang="es")
            if not found:
                snippet, found = await self._search_wikipedia(subject, lang="en")

            if not found:
                return Layer2Result(
                    verified=None,
                    confidence=0.5,
                    source="wikipedia",
                    snippet="No matching article found.",
                )

            snippet_lower = snippet.lower()

            # Core contradiction check:
            # If the asserted value is not mentioned at all in Wikipedia's
            # description of the subject, the claim is likely wrong.
            if claimed_value and claimed_value.lower() not in snippet_lower:
                return Layer2Result(
                    verified=False,
                    confidence=0.15,
                    source="wikipedia",
                    snippet=snippet[:300],
                )

            # Standard overlap when the claimed value is found or unknown
            overlap = self._lexical_overlap(claim.lower(), snippet_lower)
            confidence = round(min(0.92, 0.50 + overlap * 0.85), 3)

            return Layer2Result(
                verified=confidence > 0.65,
                confidence=confidence,
                source="wikipedia",
                snippet=snippet[:300],
            )

        except Exception:
            return Layer2Result(
                verified=None,
                confidence=0.5,
                source="wikipedia",
                snippet="Verification unavailable.",
            )

    async def _search_wikipedia(self, query: str, lang: str = "en") -> Tuple[str, bool]:
        api = f"https://{lang}.wikipedia.org/w/api.php"
        params = {
            "action": "query",
            "list": "search",
            "srsearch": query,
            "format": "json",
            "srlimit": 1,
        }
        res = await self._client.get(api, params=params)
        results = res.json().get("query", {}).get("search", [])
        if not results:
            return "", False
        raw = results[0].get("snippet", "")
        clean = raw.replace('<span class="searchmatch">', "").replace("</span>", "")
        return clean, True

    def _parse_claim(self, text: str) -> Tuple[str, Optional[str]]:
        """
        Extract the subject entity (for the Wikipedia query) and the
        claimed value (the asserted fact we want to verify).

        Example: "La capital de Francia es Berlín."
          → subject="Francia", claimed_value="Berlín"
        """
        words = text.replace(".", "").replace(",", "").replace("¿", "").replace("¡", "").split()
        entities = []
        for w in words:
            clean = w.strip(".,;:!?")
            if (
                clean
                and clean[0].isupper()
                and len(clean) > 2
                and clean.lower() not in _COMMON_STARTERS
                and clean.lower() not in _STOP_WORDS
            ):
                entities.append(clean)

        if not entities:
            return self._build_query(text), None

        # Subject = first named entity; claimed value = last (what's being asserted)
        subject = entities[0]
        claimed_value = entities[-1] if len(entities) > 1 else None
        return subject, claimed_value

    def _build_query(self, text: str) -> str:
        words = [w for w in text.split() if w.lower() not in _STOP_WORDS]
        return " ".join(words[:8])

    def _lexical_overlap(self, claim: str, snippet: str) -> float:
        claim_words = set(claim.split()) - _STOP_WORDS
        snippet_words = set(snippet.split())
        if not claim_words:
            return 0.0
        return len(claim_words & snippet_words) / len(claim_words)
