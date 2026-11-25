"""
Layer 2 — Multi-Source Authoritative Grounding.
Prioritizes higher-authority sources over generic web snippets:
  Tier 1 (academic):     OpenAlex (peer-reviewed papers & DOIs) + Authoritative domains (.edu, .gov, Britannica, NIH, NASA, WHO, Nature)
  Tier 2 (encyclopedic): Wikidata Knowledge Graph + Wikipedia (primary & secondary language)
  Tier 3 (web):          General DuckDuckGo web search

Also supports Prompt-Aware Grounding: when the user supplies the original LLM prompt,
implicit subjects in the answer are enriched with entities from the prompt.
"""
import asyncio
import re
import urllib.parse
import httpx
from typing import Optional, Tuple, List
from app.models.analysis import Layer2Result

_WIKIPEDIA_API = "https://{lang}.wikipedia.org/w/api.php"
_WIKIPEDIA_URL = "https://{lang}.wikipedia.org/wiki/{title}"
_WIKIDATA_API = "https://www.wikidata.org/w/api.php"
_OPENALEX_API = "https://api.openalex.org/works"

_HEADERS = {
    "User-Agent": "ATTESTLY/2.5 (educational hallucination detector; contact: dev@example.com)"
}

_TRUSTED_DOMAINS = (
    ".edu", ".gov", "britannica.com", "who.int", "nasa.gov", "nih.gov",
    "nature.com", "sciencedirect.com", "springer.com", "ieee.org",
    "reuters.com", "apnews.com", "bbc.com", "bbc.co.uk", "rae.es",
    "unesco.org", "un.org", "stanford.edu", "mit.edu", "harvard.edu",
)

_COMMON_STARTERS = {
    "la", "el", "los", "las", "un", "una", "uno",
    "the", "a", "an", "this", "that", "these", "those",
}

_STOP_WORDS = {
    "de", "del", "en", "es", "son", "fue", "ser", "estar",
    "con", "por", "para", "que", "se", "su", "sus", "como", "cuando", "quien", "donde",
    "the", "a", "an", "is", "are", "was", "were", "of", "in",
    "on", "at", "to", "for", "with", "by", "from", "and", "or",
    "not", "it", "its", "this", "that", "what", "who", "when", "where", "how",
}

try:
    from duckduckgo_search import DDGS
    _DDG_AVAILABLE = True
except ImportError:
    _DDG_AVAILABLE = False


class ExternalVerifier:
    async def verify(
        self,
        claim: str,
        language: str = "es",
        user_prompt: Optional[str] = None,
    ) -> Layer2Result:
        try:
            subject, claimed_value = self._parse_claim(claim)

            # Prompt-Aware Context Enrichment:
            # If the user provided the original prompt, extract its main entity
            # to resolve implicit subjects (e.g., "Fue fundada en 1975" -> "Microsoft").
            search_query = subject
            if user_prompt and user_prompt.strip():
                prompt_subject, _ = self._parse_claim(user_prompt)
                if prompt_subject and prompt_subject.lower() not in subject.lower():
                    if len(subject.split()) <= 2:
                        search_query = f"{prompt_subject} {subject}".strip()

            primary = language
            secondary = "en" if language == "es" else "es"

            # Query authoritative sources in parallel
            openalex_res, wikidata_res, wiki_primary, wiki_secondary, ddg_res = await asyncio.gather(
                self._search_openalex(search_query),
                self._search_wikidata(search_query, primary),
                self._search_wikipedia(search_query, primary),
                self._search_wikipedia(search_query, secondary),
                self._search_duckduckgo(search_query),
            )

            # Each source tuple: (snippet, found, url, label, tier)
            candidates: List[Tuple[str, bool, str, str, str]] = [
                (*openalex_res, "OpenAlex (Académico)", "academic"),
                (*ddg_res,),  # returns (snippet, found, url, label, tier)
                (*wikidata_res, "Wikidata", "encyclopedic"),
                (*wiki_primary, "Wikipedia", "encyclopedic"),
                (*wiki_secondary, "Wikipedia", "encyclopedic"),
            ]

            valid_sources = [c for c in candidates if c[1] and c[0]]
            if not valid_sources:
                return Layer2Result(
                    verified=None,
                    confidence=0.5,
                    source="web",
                    source_tier="web",
                    snippet="No matching sources found.",
                    source_url=None,
                )

            # Rank sources by: (1) relevance to claim, (2) authority tier
            tier_rank = {"academic": 3, "encyclopedic": 2, "web": 1}
            scored_sources = []
            for snippet, _found, url, label, tier in valid_sources:
                rel = self._lexical_overlap(claim, snippet)
                # Prefer academic/trusted sources when they have meaningful overlap
                rank_score = rel * 1.4 + (tier_rank.get(tier, 1) * 0.12)
                scored_sources.append((rank_score, rel, snippet, url, label, tier))

            scored_sources.sort(key=lambda x: x[0], reverse=True)
            best = scored_sources[0]
            display_snippet = best[2][:360]
            source_url = best[3] or next((s[3] for s in scored_sources if s[3]), None)
            best_tier = best[5]

            # Build deduplicated source label
            seen_labels = []
            for s in scored_sources:
                if s[4] not in seen_labels:
                    seen_labels.append(s[4])
            source_label = " + ".join(seen_labels[:3])

            # Combine snippets for contradiction & overlap check
            combined = " ".join(s[2] for s in scored_sources)
            overlap = self._lexical_overlap(claim, combined)

            if claimed_value:
                clean_claimed = claimed_value.strip().lower()
                if clean_claimed not in combined.lower():
                    conf = round(max(0.18, 0.45 - overlap * 0.2), 3)
                    return Layer2Result(
                        verified=False if overlap > 0.28 else None,
                        confidence=conf,
                        source=source_label,
                        source_tier=best_tier,
                        snippet=display_snippet,
                        source_url=source_url,
                    )

            # Bonus confidence when backed by Tier 1 academic/institutional source
            tier_bonus = 0.06 if best_tier == "academic" else (0.02 if best_tier == "encyclopedic" else 0.0)
            confidence = round(min(0.95, 0.50 + overlap * 0.85 + tier_bonus), 3)

            return Layer2Result(
                verified=confidence > 0.65,
                confidence=confidence,
                source=source_label,
                source_tier=best_tier,
                snippet=display_snippet,
                source_url=source_url,
            )

        except Exception:
            return Layer2Result(
                verified=None,
                confidence=0.5,
                source="web",
                source_tier="web",
                snippet="Verification unavailable.",
                source_url=None,
            )

    async def _search_openalex(self, query: str) -> Tuple[str, bool, str]:
        """Queries OpenAlex (open scholarly literature API) for peer-reviewed abstracts & DOIs."""
        try:
            params = {
                "search": query,
                "per-page": 2,
                "select": "id,title,doi,publication_year,abstract_inverted_index,primary_location",
            }
            async with httpx.AsyncClient(timeout=6.0, follow_redirects=True) as client:
                res = await client.get(_OPENALEX_API, params=params, headers=_HEADERS)
            if res.status_code != 200:
                return "", False, ""
            works = res.json().get("results", [])
            if not works:
                return "", False, ""

            top = works[0]
            title = top.get("title") or ""
            year = top.get("publication_year") or ""
            doi = top.get("doi") or top.get("id") or ""
            abstract = self._reconstruct_openalex_abstract(top.get("abstract_inverted_index"))

            snippet_parts = [f"{title} ({year})"] if title else []
            if abstract:
                snippet_parts.append(abstract[:280])
            snippet = " — ".join(snippet_parts).strip()
            if not snippet:
                return "", False, ""
            return snippet, True, doi
        except Exception:
            return "", False, ""

    def _reconstruct_openalex_abstract(self, inverted_index: Optional[dict]) -> str:
        if not inverted_index or not isinstance(inverted_index, dict):
            return ""
        positions = []
        for word, idxs in inverted_index.items():
            for idx in idxs:
                if idx < 80:
                    positions.append((idx, word))
        positions.sort(key=lambda x: x[0])
        return " ".join(w for _, w in positions)

    async def _search_wikidata(self, query: str, lang: str) -> Tuple[str, bool, str]:
        """Queries Wikidata structured knowledge graph for verified entity facts."""
        try:
            params = {
                "action": "wbsearchentities",
                "search": query,
                "language": lang,
                "format": "json",
                "limit": 2,
            }
            async with httpx.AsyncClient(timeout=6.0, follow_redirects=True) as client:
                res = await client.get(_WIKIDATA_API, params=params, headers=_HEADERS)
            if res.status_code != 200:
                return "", False, ""
            items = res.json().get("search", [])
            if not items:
                return "", False, ""
            top = items[0]
            label = top.get("label", "")
            desc = top.get("description", "")
            url = top.get("concepturi") or (f"https://www.wikidata.org/wiki/{top.get('id')}" if top.get("id") else "")
            if not desc:
                return "", False, ""
            return f"{label}: {desc}", True, url
        except Exception:
            return "", False, ""

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
            async with httpx.AsyncClient(timeout=8.0, follow_redirects=True) as client:
                res = await client.get(
                    _WIKIPEDIA_API.format(lang=lang),
                    params=params,
                    headers=_HEADERS,
                )
            results = res.json().get("query", {}).get("search", [])
            if not results:
                return "", False, ""
            raw = results[0].get("snippet", "")
            title = results[0].get("title", "")
            clean = raw.replace('<span class="searchmatch">', "").replace("</span>", "")
            url = _WIKIPEDIA_URL.format(
                lang=lang,
                title=urllib.parse.quote(title.replace(" ", "_")),
            )
            return clean, True, url
        except Exception:
            return "", False, ""

    async def _search_duckduckgo(self, query: str) -> Tuple[str, bool, str, str, str]:
        """Returns (snippet, found, url, label, tier), prioritizing institutional/academic domains."""
        if not _DDG_AVAILABLE:
            return "", False, "", "Web", "web"
        try:
            results = await asyncio.to_thread(self._ddg_sync, query)
            if not results:
                return "", False, "", "Web", "web"

            # Prefer trusted institutional / academic / reference domains
            trusted = [
                r for r in results
                if any(dom in (r.get("href") or "").lower() for dom in _TRUSTED_DOMAINS)
            ]
            chosen = trusted if trusted else results
            top_url = chosen[0].get("href", "")
            snippet = " | ".join(r.get("body", "")[:180] for r in chosen[:2] if r.get("body"))
            if not snippet:
                return "", False, "", "Web", "web"

            if trusted:
                domain = urllib.parse.urlparse(top_url).netloc.replace("www.", "")
                return snippet, True, top_url, f"Institucional ({domain})", "academic"
            return snippet, True, top_url, "DuckDuckGo", "web"
        except Exception:
            return "", False, "", "Web", "web"

    def _ddg_sync(self, query: str) -> list:
        with DDGS() as ddgs:
            return list(ddgs.text(query, max_results=5))

    def _parse_claim(self, text: str) -> Tuple[str, Optional[str]]:
        if len(text.split()) < 4:
            return text.strip(), None

        words = text.replace(".", "").replace(",", "").replace("¿", "").replace("¡", "").replace("?", "").split()

        entities = []
        i = 0
        while i < len(words):
            w = words[i].strip(".,;:!?\"'()")
            if (
                w and w[0].isupper() and len(w) > 1
                and w.lower() not in _COMMON_STARTERS
                and w.lower() not in _STOP_WORDS
            ):
                span = [w]
                j = i + 1
                while j < len(words):
                    nw = words[j].strip(".,;:!?\"'()")
                    if (
                        nw and nw[0].isupper() and len(nw) > 1
                        and nw.lower() not in _COMMON_STARTERS
                        and nw.lower() not in _STOP_WORDS
                    ):
                        span.append(nw)
                        j += 1
                    else:
                        break
                entities.append(" ".join(span))
                i = j
            else:
                i += 1

        if entities:
            subject = entities[0]
            claimed_value = entities[-1] if len(entities) > 1 else None
            return subject, claimed_value

        meaningful = [
            w.strip(".,;:!?\"'()") for w in words
            if len(w.strip(".,;:!?\"'()")) > 2
            and w.strip(".,;:!?\"'()").lower() not in _STOP_WORDS
            and w.strip(".,;:!?\"'()").lower() not in _COMMON_STARTERS
        ]
        if len(meaningful) >= 2:
            return meaningful[0], meaningful[-1]
        if len(meaningful) == 1:
            return meaningful[0], None
        return self._build_query(text), None

    def _build_query(self, text: str) -> str:
        words = [w for w in text.split() if w.lower() not in _STOP_WORDS]
        return " ".join(words[:8])

    def _clean_tokens(self, text: str) -> set:
        tokens = re.findall(r"\b[\wáéíóúüñÁÉÍÓÚÜÑ0-9]+\b", text.lower())
        return {t for t in tokens if t not in _STOP_WORDS}

    def _lexical_overlap(self, claim: str, snippet: str) -> float:
        claim_words = self._clean_tokens(claim)
        snippet_words = self._clean_tokens(snippet)
        if not claim_words:
            return 0.0
        return len(claim_words & snippet_words) / len(claim_words)
