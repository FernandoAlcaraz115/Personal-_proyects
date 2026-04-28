"""
Layer 1 — Linguistic analysis.
Detects hedging language and vague terms via regex patterns.
No external calls; runs entirely in-process.
"""
import re
from typing import List
from app.models.analysis import Layer1Result

_HEDGE_PATTERNS = [
    r"\b(might|may|could|possibly|perhaps|probably|likely)\b",
    r"\b(seems?|appears?|suggests?|indicates?)\b",
    r"\b(I think|I believe|I guess|in my opinion|it seems|it appears)\b",
    r"\b(approximately|roughly|around|about|almost|nearly|more or less)\b",
    r"\b(sometimes|often|usually|generally|typically|tends? to)\b",
    r"\b(according to|reportedly|allegedly|supposedly|claimed to)\b",
]

_VAGUE_PATTERNS = [
    r"\b(many|some|few|several|various|numerous|a lot of|lots of)\b",
    r"\b(things?|stuff|something|somehow|somewhere|sometime)\b",
    r"\b(very|really|quite|rather|fairly|pretty|somewhat)\b",
    r"\b(recently|soon|later|earlier|before|after)\b",
    r"\b(etc\.?|and so on|and more|among others?)\b",
    r"\b(good|bad|nice|great|big|small|high|low)\b",
]


class LinguisticAnalyzer:
    def __init__(self):
        self._hedge = [re.compile(p, re.IGNORECASE) for p in _HEDGE_PATTERNS]
        self._vague = [re.compile(p, re.IGNORECASE) for p in _VAGUE_PATTERNS]

    async def analyze(self, text: str) -> Layer1Result:
        hedge_hits = self._collect(text, self._hedge)
        vague_hits = self._collect(text, self._vague)

        word_count = max(len(text.split()), 1)
        hedging_score  = min(1.0, len(hedge_hits) / max(word_count * 0.15, 1))
        vagueness_score = min(1.0, len(vague_hits) / max(word_count * 0.15, 1))

        return Layer1Result(
            hedging_score=round(hedging_score, 3),
            vagueness_score=round(vagueness_score, 3),
            hedge_phrases=list(dict.fromkeys(hedge_hits)),
            vague_phrases=list(dict.fromkeys(vague_hits)),
        )

    def _collect(self, text: str, patterns: List) -> List[str]:
        hits = []
        for pat in patterns:
            hits.extend(m.group() for m in pat.finditer(text))
        return hits
