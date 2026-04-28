"""
HallucinationDetector — orquesta las tres capas del pipeline:

  Capa 1: Análisis lingüístico (sin fuentes externas)
  Capa 2: Verificación externa (Wikipedia / Serper)
  Capa 3: Score de confianza adaptativo

También implementa self-consistency sampling para caja negra.
"""
from app.models.analysis import AnalysisRequest, AnalysisResponse
from app.services.claim_extractor import ClaimExtractor
from app.services.layer1_linguistic import LinguisticAnalyzer
from app.services.layer2_verifier import ExternalVerifier
from app.services.layer3_scorer import ConfidenceScorer
from app.services.llm_client import LLMClient

class HallucinationDetector:
    def __init__(self):
        self.extractor = ClaimExtractor()
        self.layer1    = LinguisticAnalyzer()
        self.layer2    = ExternalVerifier()
        self.layer3    = ConfidenceScorer()
        self.llm       = LLMClient()

    async def analyze(self, request: AnalysisRequest) -> AnalysisResponse:
        # 1. Extraer claims atómicos del texto
        claims_raw = await self.extractor.extract(request.text)

        # 2. Self-consistency sampling (caja negra)
        sc_scores = {}
        if request.self_consistency_samples > 1:
            sc_scores = await self.llm.self_consistency(
                request.text,
                n=request.self_consistency_samples,
                provider=request.llm_provider
            )

        results = []
        for claim in claims_raw:
            # Capa 1: señales lingüísticas
            l1 = await self.layer1.analyze(claim)

            # Capa 2: verificación externa (opcional)
            l2 = None
            if request.use_external_verification:
                l2 = await self.layer2.verify(claim)

            # Capa 3: score final adaptativo
            result = await self.layer3.score(
                claim=claim,
                l1_result=l1,
                l2_result=l2,
                sc_score=sc_scores.get("__global__", None)
            )
            results.append(result)

        overall = sum(r.confidence for r in results) / len(results) if results else 1.0

        return AnalysisResponse(
            id="",
            original_text=request.text,
            claims=results,
            overall_score=round(overall, 3),
            processing_time_ms=0,
            method_used="hybrid-adaptive"
        )
