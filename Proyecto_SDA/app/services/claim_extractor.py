"""
Extracts atomic factual claims from a block of text.
Uses spaCy when available; falls back to regex sentence splitting.
"""
import re
from typing import List, Optional

_nlp = None
_spacy_checked = False


def _get_nlp():
    global _nlp, _spacy_checked
    if not _spacy_checked:
        _spacy_checked = True
        try:
            import spacy
            try:
                _nlp = spacy.load("es_core_news_sm")
            except Exception:
                try:
                    _nlp = spacy.load("en_core_web_sm")
                except Exception:
                    _nlp = None
        except Exception:
            _nlp = None
    return _nlp


class ClaimExtractor:
    def __init__(self):
        pass

    async def extract(self, text: str) -> List[str]:
        nlp = _get_nlp()
        if nlp:
            return self._spacy_extract(text, nlp)
        return self._regex_split(text)

    def _spacy_extract(self, text: str, nlp) -> List[str]:
        doc = nlp(text)
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
