"""
Layer 2 — External verification.
Search order:
  1. Spanish Wikipedia
  2. English Wikipedia (fallback)
  3. DuckDuckGo web search (additional source, free, no API key)

Contradiction check: if the claimed value is NOT present in any
retrieved snippet, the claim is marked as likely false.
"""
import asyncio
import httpx
from typing import Optional, Tuple
from app.models.analysis import Layer2Result

_WIKIPEDIA_API = "https://{lang}.wikipedia.org/w/api.php"

_HEADERS = {
    "User-Agent": "HalluciDetect/1.0 (educational hallucination detector; contact: dev@example.com)"
}

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

try:
    from duckduckgo_search import DDGS
    _DDG_AVAILABLE = True
except ImportError:
    _DDG_AVAILABLE = False


class ExternalVerifier:
    async def verify(self, claim: str) -> Layer2Result:
        try:
            subject, claimed_value = self._parse_claim(claim)

            # Gather snippets from all available sources concurrently.
            # DuckDuckGo uses the subject query (not the full claim) so the
            # snippet is about the subject entity, not the claimed value itself.
            wiki_es, wiki_en, ddg = await asyncio.gather(
                self._search_wikipedia(subject, "es"),
                self._search_wikipedia(subject, "en"),
                self._search_duckduckgo(subject),
            )

            snippets = [s for s, found in [wiki_es, wiki_en, ddg] if found and s]

            if not snippets:
                return Layer2Result(
                    verified=None,
                    confidence=0.5,
                    source="web",
                    snippet="No matching sources found.",
                )

            # Use all snippets combined for contradiction logic, but only
            # the primary source for display (avoids mixed-language output).
            combined = " ".join(snippets)
            display_snippet = snippets[0][:350]
            source_label = self._build_source_label(wiki_es[1], wiki_en[1], ddg[1])

            # Contradiction check: claimed value must appear in sources about the subject.
            if claimed_value and claimed_value.lower() not in combined.lower():
                return Layer2Result(
                    verified=False,
                    confidence=0.15,
                    source=source_label,
                    snippet=display_snippet,
                )

            overlap = self._lexical_overlap(claim.lower(), combined.lower())
            confidence = round(min(0.93, 0.50 + overlap * 0.85), 3)

            return Layer2Result(
                verified=confidence > 0.65,
                confidence=confidence,
                source=source_label,
                snippet=display_snippet,
            )

        except Exception:
            return Layer2Result(
                verified=None,
                confidence=0.5,
                source="web",
                snippet="Verification unavailable.",
            )

    async def _search_wikipedia(self, query: str, lang: str) -> Tuple[str, bool]:
        try:
            params = {
                "action": "query",
                "list": "search",
                "srsearch": query,
                "format": "json",
                "srlimit": 1,
            }
            async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
                res = await client.get(
                    _WIKIPEDIA_API.format(lang=lang),
                    params=params,
                    headers=_HEADERS,
                )
            results = res.json().get("query", {}).get("search", [])
            if not results:
                return "", False
            raw = results[0].get("snippet", "")
            clean = raw.replace('<span class="searchmatch">', "").replace("</span>", "")
            return clean, True
        except Exception:
            return "", False

    async def _search_duckduckgo(self, query: str) -> Tuple[str, bool]:
        if not _DDG_AVAILABLE:
            return "", False
        try:
            results = await asyncio.to_thread(self._ddg_sync, query)
            if not results:
                return "", False
            snippet = " | ".join(r.get("body", "")[:180] for r in results[:2])
            return snippet, True
        except Exception:
            return "", False

    def _ddg_sync(self, query: str) -> list:
        with DDGS() as ddgs:
            return list(ddgs.text(query, max_results=3))

    def _build_source_label(self, wiki_es: bool, wiki_en: bool, ddg: bool) -> str:
        sources = []
        if wiki_es or wiki_en:
            sources.append("Wikipedia")
        if ddg:
            sources.append("DuckDuckGo")
        return " + ".join(sources) if sources else "web"

    def _parse_claim(self, text: str) -> Tuple[str, Optional[str]]:
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
