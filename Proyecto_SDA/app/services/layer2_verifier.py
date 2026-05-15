"""
Layer 2 — External verification.
Search order depends on the requested language:
  - "es": Spanish Wikipedia → English Wikipedia → DuckDuckGo
  - "en": English Wikipedia → Spanish Wikipedia → DuckDuckGo

Contradiction check: if the claimed value is NOT present in any
retrieved snippet, the claim is marked as likely false.
"""
import asyncio
import urllib.parse
import httpx
from typing import Optional, Tuple
from app.models.analysis import Layer2Result

_WIKIPEDIA_API = "https://{lang}.wikipedia.org/w/api.php"
_WIKIPEDIA_URL  = "https://{lang}.wikipedia.org/wiki/{title}"

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
    async def verify(self, claim: str, language: str = "es") -> Layer2Result:
        try:
            subject, claimed_value = self._parse_claim(claim)

            # Search order: primary language first, then secondary
            primary   = language
            secondary = "en" if language == "es" else "es"

            wiki_primary, wiki_secondary, ddg = await asyncio.gather(
                self._search_wikipedia(subject, primary),
                self._search_wikipedia(subject, secondary),
                self._search_duckduckgo(subject),
            )

            # Build ordered snippet list: primary language result first
            sources_ordered = [wiki_primary, wiki_secondary, ddg]
            snippets = [s for s, found, _url in sources_ordered if found and s]

            if not snippets:
                return Layer2Result(
                    verified=None,
                    confidence=0.5,
                    source="web",
                    snippet="No matching sources found.",
                    source_url=None,
                )

            # Use all snippets combined for contradiction logic,
            # but only the primary-language source for display.
            combined       = " ".join(snippets)
            display_snippet = snippets[0][:350]
            source_label   = self._build_source_label(
                wiki_primary[1], wiki_secondary[1], ddg[1]
            )

            # Pick the first available Wikipedia URL (primary language preferred)
            source_url = wiki_primary[2] or wiki_secondary[2] or None

            # Contradiction check: claimed value must appear in sources about the subject.
            if claimed_value and claimed_value.lower() not in combined.lower():
                return Layer2Result(
                    verified=False,
                    confidence=0.15,
                    source=source_label,
                    snippet=display_snippet,
                    source_url=source_url,
                )

            overlap    = self._lexical_overlap(claim.lower(), combined.lower())
            confidence = round(min(0.93, 0.50 + overlap * 0.85), 3)

            return Layer2Result(
                verified=confidence > 0.65,
                confidence=confidence,
                source=source_label,
                snippet=display_snippet,
                source_url=source_url,
            )

        except Exception:
            return Layer2Result(
                verified=None,
                confidence=0.5,
                source="web",
                snippet="Verification unavailable.",
                source_url=None,
            )

    async def _search_wikipedia(self, query: str, lang: str) -> Tuple[str, bool, str]:
        """Returns (snippet, found, article_url)."""
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
                return "", False, ""
            raw   = results[0].get("snippet", "")
            title = results[0].get("title", "")
            clean = raw.replace('<span class="searchmatch">', "").replace("</span>", "")
            url   = _WIKIPEDIA_URL.format(
                lang=lang,
                title=urllib.parse.quote(title.replace(" ", "_"))
            )
            return clean, True, url
        except Exception:
            return "", False, ""

    async def _search_duckduckgo(self, query: str) -> Tuple[str, bool, str]:
        if not _DDG_AVAILABLE:
            return "", False, ""
        try:
            results = await asyncio.to_thread(self._ddg_sync, query)
            if not results:
                return "", False, ""
            snippet = " | ".join(r.get("body", "")[:180] for r in results[:2])
            return snippet, True, ""
        except Exception:
            return "", False, ""

    def _ddg_sync(self, query: str) -> list:
        with DDGS() as ddgs:
            return list(ddgs.text(query, max_results=3))

    def _build_source_label(self, wiki_primary: bool, wiki_secondary: bool, ddg: bool) -> str:
        sources = []
        if wiki_primary or wiki_secondary:
            sources.append("Wikipedia")
        if ddg:
            sources.append("DuckDuckGo")
        return " + ".join(sources) if sources else "web"

    def _parse_claim(self, text: str) -> Tuple[str, Optional[str]]:
        words = text.replace(".", "").replace(",", "").replace("¿", "").replace("¡", "").split()

        # First pass: prefer capitalized proper nouns as entities
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

        if entities:
            subject = entities[0]
            claimed_value = entities[-1] if len(entities) > 1 else None
            return subject, claimed_value

        # Fallback: extract meaningful words regardless of case.
        # Subject = first meaningful word, claimed_value = last meaningful word.
        meaningful = [
            w.strip(".,;:!?") for w in words
            if len(w.strip(".,;:!?")) > 2
            and w.strip(".,;:!?").lower() not in _STOP_WORDS
            and w.strip(".,;:!?").lower() not in _COMMON_STARTERS
        ]
        if len(meaningful) >= 2:
            return meaningful[0], meaningful[-1]
        if len(meaningful) == 1:
            return meaningful[0], None
        return self._build_query(text), None

    def _build_query(self, text: str) -> str:
        words = [w for w in text.split() if w.lower() not in _STOP_WORDS]
        return " ".join(words[:8])

    def _lexical_overlap(self, claim: str, snippet: str) -> float:
        claim_words   = set(claim.split()) - _STOP_WORDS
        snippet_words = set(snippet.split())
        if not claim_words:
            return 0.0
        return len(claim_words & snippet_words) / len(claim_words)
