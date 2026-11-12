"""
HallucinationDetector — Unified orchestrator for multi-domain hallucination detection.

Supported modes:
1. "text": 4-layer factual pipeline (Linguistic + External + Adaptive Scorer + AI Corrector)
2. "code": AST syntax parsing + ghost PyPI packages + fabricated API calls + AI code patch
3. "math": SymPy symbolic & arithmetic equality verification + step-by-step reasoning breakdown
"""
from __future__ import annotations
import time
import uuid
from app.models.analysis import (
    AnalysisRequest,
    AnalysisResponse,
    AnalysisMode,
)
from app.services.claim_extractor import ClaimExtractor
from app.services.layer1_linguistic import LinguisticAnalyzer
from app.services.layer2_verifier import ExternalVerifier
from app.services.layer3_scorer import ConfidenceScorer
from app.services.layer4_corrector import HallucinationCorrector
from app.services.code_detector import CodeHallucinationDetector
from app.services.math_detector import MathHallucinationDetector
from app.services.llm_client import LLMClient


class HallucinationDetector:
    def __init__(self):
        self.extractor   = ClaimExtractor()
        self.layer1      = LinguisticAnalyzer()
        self.layer2      = ExternalVerifier()
        self.layer3      = ConfidenceScorer()
        self.layer4      = HallucinationCorrector()
        self.code_det    = CodeHallucinationDetector()
        self.math_det    = MathHallucinationDetector()
        self.llm         = LLMClient()

    async def analyze(self, request: AnalysisRequest) -> AnalysisResponse:
        start = time.time()
        req_mode = request.mode.value if isinstance(request.mode, AnalysisMode) else str(request.mode)

        # -------------------------------------------------------------
        # Mode: Code Hallucination Detection
        # -------------------------------------------------------------
        if req_mode == "code":
            code_res = await self.code_det.analyze(
                code=request.text,
                language="auto",
                check_pypi=request.use_external_verification,
                ai_correction=request.use_ai_correction,
                llm_client=self.llm,
                llm_provider=request.llm_provider.value if hasattr(request.llm_provider, "value") else str(request.llm_provider),
            )
            elapsed_ms = int((time.time() - start) * 1000)
            lang_label = "npm" if code_res.language == "javascript" else "pypi"
            return AnalysisResponse(
                id=str(uuid.uuid4()),
                mode="code",
                original_text=request.text,
                overall_score=code_res.confidence_score,
                risk_level=code_res.risk_level,
                processing_time_ms=elapsed_ms,
                method_used=f"syntax+{lang_label}-verifier+api-validator" + ("+ai-fix" if request.use_ai_correction else ""),
                code_result=code_res,
            )

        # -------------------------------------------------------------
        # Mode: Math & Arithmetic Hallucination Detection
        # -------------------------------------------------------------
        if req_mode == "math":
            math_res = await self.math_det.analyze(
                text=request.text,
                ai_correction=request.use_ai_correction,
                llm_client=self.llm,
                llm_provider=request.llm_provider.value if hasattr(request.llm_provider, "value") else str(request.llm_provider),
            )
            elapsed_ms = int((time.time() - start) * 1000)
            return AnalysisResponse(
                id=str(uuid.uuid4()),
                mode="math",
                original_text=request.text,
                overall_score=math_res.confidence_score,
                risk_level=math_res.risk_level,
                processing_time_ms=elapsed_ms,
                method_used="sympy-symbolic+arithmetic-verifier" + ("+ai-solution" if request.use_ai_correction else ""),
                math_result=math_res,
            )

        # -------------------------------------------------------------
        # Mode: Text / Factual Hallucination Detection (Default)
        # -------------------------------------------------------------
        claims_raw = await self.extractor.extract(request.text)

        sc_scores: dict = {}
        if request.self_consistency_samples > 1:
            sc_scores = await self.llm.self_consistency(
                request.text,
                n=request.self_consistency_samples,
                provider=request.llm_provider.value if hasattr(request.llm_provider, "value") else str(request.llm_provider),
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

            # Layer 4: AI correction
            if request.use_ai_correction:
                wiki_snippet = l2.snippet if l2 else ""
                result.l4 = await self.layer4.correct(
                    claim=claim,
                    wiki_snippet=wiki_snippet,
                    provider=request.llm_provider.value if hasattr(request.llm_provider, "value") else str(request.llm_provider),
                    language=request.language,
                )
                if result.l4 and result.l4.is_hallucination and result.l4.explanation != "AI correction unavailable.":
                    result.confidence = round(min(result.confidence * 0.35, 0.40), 3)
                    result.risk_level = "high"
                    result.explanation += " IA confirmó alucinación."

            results.append(result)

        overall = (
            round(sum(r.confidence for r in results) / len(results), 3)
            if results else 1.0
        )

        overall_risk = "low" if overall >= 0.75 else ("medium" if overall >= 0.50 else "high")

        parts = ["hybrid-adaptive"]
        if request.self_consistency_samples > 1:
            parts.append("self-consistency")
        if not request.use_external_verification:
            parts = ["linguistic-only"]
        if request.use_ai_correction:
            parts.append("ai-correction")

        return AnalysisResponse(
            id=str(uuid.uuid4()),
            mode="text",
            original_text=request.text,
            claims=results,
            overall_score=overall,
            risk_level=overall_risk,
            processing_time_ms=int((time.time() - start) * 1000),
            method_used="+".join(parts),
        )

    async def analyze_stream(self, request: AnalysisRequest):
        start = time.time()
        req_mode = request.mode.value if isinstance(request.mode, AnalysisMode) else str(request.mode)

        if req_mode == "code":
            yield {"event": "layer_progress", "data": {"layer": 0, "name": "Análisis Sintáctico y Estructura", "detail": "Inspeccionando sintaxis y tokens..."}}
            code_res = await self.code_det.analyze(
                code=request.text,
                language="auto",
                check_pypi=request.use_external_verification,
                ai_correction=request.use_ai_correction,
                llm_client=self.llm,
                llm_provider=request.llm_provider.value if hasattr(request.llm_provider, "value") else str(request.llm_provider),
            )
            reg_name = "npm" if code_res.language == "javascript" else "PyPI"
            yield {"event": "layer_progress", "data": {"layer": 1, "name": f"Registro de Paquetes ({reg_name})", "detail": f"Verificando dependencias en registro oficial {reg_name}..."}}
            yield {"event": "layer_progress", "data": {"layer": 2, "name": "Firmas de APIs", "detail": "Comprobando métodos y llamadas estándar..."}}
            if request.use_ai_correction:
                yield {"event": "layer_progress", "data": {"layer": 3, "name": "Corrección con IA", "detail": "Generando parche..."}}

            elapsed_ms = int((time.time() - start) * 1000)
            res = AnalysisResponse(
                id=str(uuid.uuid4()),
                mode="code",
                original_text=request.text,
                overall_score=code_res.confidence_score,
                risk_level=code_res.risk_level,
                processing_time_ms=elapsed_ms,
                method_used=f"syntax+{reg_name.lower()}-verifier+api-validator" + ("+ai-fix" if request.use_ai_correction else ""),
                code_result=code_res,
            )
            yield {"event": "final_result", "data": res.model_dump()}
            return

        if req_mode == "math":
            yield {"event": "layer_progress", "data": {"layer": 0, "name": "Extracción de Ecuaciones", "detail": "Segmentando igualdades matemáticas..."}}
            yield {"event": "layer_progress", "data": {"layer": 1, "name": "Evaluación SymPy", "detail": "Comprobando identidades simbólicas..."}}
            math_res = await self.math_det.analyze(
                text=request.text,
                ai_correction=request.use_ai_correction,
                llm_client=self.llm,
                llm_provider=request.llm_provider.value if hasattr(request.llm_provider, "value") else str(request.llm_provider),
            )
            yield {"event": "layer_progress", "data": {"layer": 2, "name": "Delta Numérico", "detail": "Evaluando discrepancias..."}}
            if request.use_ai_correction:
                yield {"event": "layer_progress", "data": {"layer": 3, "name": "Demostración", "detail": "Sintetizando pasos corregidos..."}}

            elapsed_ms = int((time.time() - start) * 1000)
            res = AnalysisResponse(
                id=str(uuid.uuid4()),
                mode="math",
                original_text=request.text,
                overall_score=math_res.confidence_score,
                risk_level=math_res.risk_level,
                processing_time_ms=elapsed_ms,
                method_used="sympy-symbolic+arithmetic-verifier" + ("+ai-solution" if request.use_ai_correction else ""),
                math_result=math_res,
            )
            yield {"event": "final_result", "data": res.model_dump()}
            return

        # Factual Text Mode:
        yield {"event": "layer_progress", "data": {"layer": 0, "name": "Señales Lingüísticas", "detail": "Extrayendo afirmaciones atómicas..."}}
        claims_raw = await self.extractor.extract(request.text)

        sc_scores: dict = {}
        if request.self_consistency_samples > 1:
            sc_scores = await self.llm.self_consistency(
                request.text,
                n=request.self_consistency_samples,
                provider=request.llm_provider.value if hasattr(request.llm_provider, "value") else str(request.llm_provider),
            )

        yield {"event": "layer_progress", "data": {"layer": 1, "name": "Grounding Wikipedia / Fuentes", "detail": f"Contrastando {len(claims_raw)} afirmaciones..."}}
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
            if request.use_ai_correction:
                wiki_snippet = l2.snippet if l2 else ""
                result.l4 = await self.layer4.correct(
                    claim=claim,
                    wiki_snippet=wiki_snippet,
                    provider=request.llm_provider.value if hasattr(request.llm_provider, "value") else str(request.llm_provider),
                    language=request.language,
                )
                if result.l4 and result.l4.is_hallucination and result.l4.explanation != "AI correction unavailable.":
                    result.confidence = round(min(result.confidence * 0.35, 0.40), 3)
                    result.risk_level = "high"
                    result.explanation += " IA confirmó alucinación."
            results.append(result)

        yield {"event": "layer_progress", "data": {"layer": 2, "name": "Scoring Adaptativo", "detail": "Ponderando matriz de riesgo..."}}
        if request.use_ai_correction:
            yield {"event": "layer_progress", "data": {"layer": 3, "name": "Auditoría IA", "detail": "Finalizando correcciones..."}}

        overall = (
            round(sum(r.confidence for r in results) / len(results), 3)
            if results else 1.0
        )
        overall_risk = "low" if overall >= 0.75 else ("medium" if overall >= 0.50 else "high")
        parts = ["hybrid-adaptive"]
        if request.self_consistency_samples > 1:
            parts.append("self-consistency")
        if not request.use_external_verification:
            parts = ["linguistic-only"]
        if request.use_ai_correction:
            parts.append("ai-correction")

        elapsed_ms = int((time.time() - start) * 1000)
        res = AnalysisResponse(
            id=str(uuid.uuid4()),
            mode="text",
            original_text=request.text,
            claims=results,
            overall_score=overall,
            risk_level=overall_risk,
            processing_time_ms=elapsed_ms,
            method_used="+".join(parts),
        )
        yield {"event": "final_result", "data": res.model_dump()}
