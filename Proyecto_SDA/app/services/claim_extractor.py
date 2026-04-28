"""
Extracts atomic factual claims from a block of text.
Uses spaCy when available; falls back to regex sentence splitting.
"""
import re
from typing import List

try:
    import spacy
    _nlp = spacy.load("en_core_web_sm")
except Exception:
    _nlp = None


class ClaimExtractor:
    def __init__(self):
        self.nlp = _nlp

    async def extract(self, text: str) -> List[str]:
        if self.nlp:
            return self._spacy_extract(text)
        return self._regex_split(text)

    def _spacy_extract(self, text: str) -> List[str]:
        doc = self.nlp(text)
        claims = []
        for sent in doc.sents:
            s = sent.text.strip()
            if len(s) < 15:
                continue
            has_verb = any(t.pos_ == "VERB" for t in sent)
            has_noun = any(t.pos_ in ("NOUN", "PROPN") for t in sent)
            if has_verb and has_noun:
                claims.append(s)
        return claims or self._regex_split(text)

    def _regex_split(self, text: str) -> List[str]:
        sentences = re.split(r"(?<=[.!?])\s+", text.strip())
        return [s.strip() for s in sentences if len(s.strip()) > 15]
