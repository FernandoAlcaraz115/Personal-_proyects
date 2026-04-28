"""
Layer 3 — Adaptive confidence scorer.
Blends Layer 1 (linguistic), Layer 2 (external), and self-consistency
signals into a single [0, 1] confidence score per claim.
"""
from typing import Optional
from app.models.analysis import Layer1Result, Layer2Result, ClaimResult


class ConfidenceScorer:
    async def score(
        self,
        claim: str,
        l1_result: Layer1Result,
        l2_result: Optional[Layer2Result],
        sc_score: Optional[float],
    ) -> ClaimResult:
        # Base confidence penalized by linguistic signals
        linguistic_penalty = l1_result.hedging_score * 0.4 + l1_result.vagueness_score * 0.2
        confidence = 1.0 - linguistic_penalty

        # Blend with external verification (equal weight when available)
        if l2_result is not None:
            confidence = confidence * 0.5 + l2_result.confidence * 0.5

        # Blend with self-consistency score
        if sc_score is not None:
            confidence = confidence * 0.6 + sc_score * 0.4

        confidence = round(max(0.0, min(1.0, confidence)), 3)

        if confidence >= 0.75:
            risk_level = "low"
        elif confidence >= 0.50:
            risk_level = "medium"
        else:
            risk_level = "high"

        return ClaimResult(
            text=claim,
            confidence=confidence,
            risk_level=risk_level,
            l1=l1_result,
            l2=l2_result,
            explanation=self._explain(l1_result, l2_result, sc_score, confidence),
        )

    def _explain(self, l1, l2, sc_score, confidence) -> str:
        parts = []
        if l1.hedging_score > 0.3:
            sample = ", ".join(l1.hedge_phrases[:2])
            parts.append(f"hedging language detected ({sample})")
        if l1.vagueness_score > 0.3:
            sample = ", ".join(l1.vague_phrases[:2])
            parts.append(f"vague terms found ({sample})")
        if l2 is not None:
            status = (
                "supported by Wikipedia" if l2.verified
                else "not supported by Wikipedia" if l2.verified is False
                else "unverifiable externally"
            )
            parts.append(status)
        if sc_score is not None:
            parts.append(f"self-consistency score {sc_score:.2f}")
        if not parts:
            parts.append("no major linguistic issues detected")
        return "; ".join(parts).capitalize() + f". Confidence: {confidence:.0%}."
