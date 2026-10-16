import pytest
import asyncio
from app.models.analysis import AnalysisRequest, AnalysisMode
from app.services.detector import HallucinationDetector


@pytest.fixture
def detector():
    return HallucinationDetector()


@pytest.mark.asyncio
async def test_factual_text_detection(detector):
    # Factual analysis without external verification (linguistic only)
    req = AnalysisRequest(
        text="La capital de Francia podría ser París, según se cree comúnmente.",
        mode=AnalysisMode.text,
        use_external_verification=False,
    )
    res = await detector.analyze(req)
    assert res.mode == "text"
    assert len(res.claims) >= 1
    assert res.overall_score > 0.0


@pytest.mark.asyncio
async def test_code_syntax_error(detector):
    # Code with syntax error
    bad_code = "def sumar(a, b\n    return a + b"
    req = AnalysisRequest(
        text=bad_code,
        mode=AnalysisMode.code,
        use_external_verification=False,
    )
    res = await detector.analyze(req)
    assert res.mode == "code"
    assert res.code_result is not None
    assert res.code_result.is_valid_syntax is False
    assert res.risk_level == "high"
    assert any(i.category == "syntax" for i in res.code_result.issues)


@pytest.mark.asyncio
async def test_code_ghost_library(detector):
    # Code importing non-existent ghost library
    ghost_code = "import package_totalmente_fantasma_xyz123\n\nprint('hello')"
    req = AnalysisRequest(
        text=ghost_code,
        mode=AnalysisMode.code,
        use_external_verification=True,
    )
    res = await detector.analyze(req)
    assert res.mode == "code"
    assert res.code_result is not None
    assert "package_totalmente_fantasma_xyz123" in res.code_result.hallucinated_packages
    assert res.risk_level == "high"


@pytest.mark.asyncio
async def test_math_arithmetic_hallucination(detector):
    # Incorrect arithmetic equation
    math_text = "Calculando el resultado: 23 * 47 = 1181."
    req = AnalysisRequest(
        text=math_text,
        mode=AnalysisMode.math,
    )
    res = await detector.analyze(req)
    assert res.mode == "math"
    assert res.math_result is not None
    assert res.math_result.total_equations_found >= 1
    assert res.math_result.has_hallucinations is True
    # Real value is 1081, not 1181
    first_step = res.math_result.steps[0]
    assert first_step.is_valid is False
    assert "1081" in str(first_step.expected_value)


@pytest.mark.asyncio
async def test_math_valid_equation(detector):
    # Correct equations
    math_text = "Paso 1: 15 + 27 = 42\nPaso 2: 42 * 2 = 84"
    req = AnalysisRequest(
        text=math_text,
        mode=AnalysisMode.math,
    )
    res = await detector.analyze(req)
    assert res.mode == "math"
    assert res.math_result is not None
    assert res.math_result.has_hallucinations is False
    assert res.math_result.valid_equations == 2
    assert res.risk_level == "low"
