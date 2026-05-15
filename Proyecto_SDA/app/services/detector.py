"""
HallucinationDetector — orchestrates the four-layer pipeline.

  Layer 1: Linguistic analysis       (always runs)
  Layer 2: External verification     (Wikipedia + DuckDuckGo, optional)
  Layer 3: Adaptive confidence score (always runs)
  Layer 4: AI correction             (only for medium/high risk, optional)
"""
import time
import uuid
from app.models.analysis import AnalysisRequest, AnalysisResponse
from app.services.claim_extractor import ClaimExtractor
from app.services.layer1_linguistic import LinguisticAnalyzer
from app.services.layer2_verifier import ExternalVerifier
from app.services.layer3_scorer import ConfidenceScorer
from app.services.layer4_corrector import HallucinationCorrector
from app.services.llm_client import LLMClient


class HallucinationDetector:
    def __init__(self):
        self.extractor  = ClaimExtractor()
        self.layer1     = LinguisticAnalyzer()
        self.layer2     = ExternalVerifier()
        self.layer3     = ConfidenceScorer()
        self.layer4     = HallucinationCorrector()
        self.llm        = LLMClient()

    async def analyze(self, request: AnalysisRequest) -> AnalysisResponse:
        start = time.time()

        claims_raw = await self.extractor.extract(request.text)

        sc_scores: dict = {}
        if request.self_consistency_samples > 1:
            sc_scores = await self.llm.self_consistency(
                request.text,
                n=request.self_consistency_samples,
                provider=request.llm_provider,
            )

        results = []
        for claim in claims_raw:
            l1 = await self.layer1.analyze(claim)

            l2 = None
            if request.use_external_verification:
                l2 = await self.layer2.verify(claim, language=request.language)

            result = await self.layer3.score(
                claim=claim,
                l1_result=l1,
                l2_result=l2,
                sc_score=sc_scores.get("__global__"),
            )

            # Layer 4: runs for all claims when enabled (let the AI decide)
            if request.use_ai_correction:
                wiki_snippet = l2.snippet if l2 else ""
                result.l4 = await self.layer4.correct(
                    claim=claim,
                    wiki_snippet=wiki_snippet,
                    provider=request.llm_provider,
                    language=request.language,
                )
                # If L4 confirms hallucination, override the score so it's consistent
                if result.l4 and result.l4.is_hallucination and result.l4.explanation != "AI correction unavailable.":
                    result.confidence = round(min(result.confidence * 0.35, 0.40), 3)
                    result.risk_level = "high"
                    result.explanation += " AI confirmed hallucination."

            results.append(result)

        overall = (
            round(sum(r.confidence for r in results) / len(results), 3)
            if results else 1.0
        )

        parts = ["hybrid-adaptive"]
        if request.self_consistency_samples > 1:
            parts.append("self-consistency")
        if not request.use_external_verification:
            parts = ["linguistic-only"]
        if request.use_ai_correction:
            parts.append("ai-correction")

        return AnalysisResponse(
            id=str(uuid.uuid4()),
            original_text=request.text,
            claims=results,
            overall_score=overall,
            processing_time_ms=int((time.time() - start) * 1000),
            method_used="+".join(parts),
        )
