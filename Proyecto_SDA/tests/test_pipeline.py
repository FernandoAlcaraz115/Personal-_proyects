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


@pytest.mark.asyncio
async def test_javascript_ghost_package_and_api(detector):
    js_code = """
    import { something } from 'nonexistent-slopsquat-lib-998877';
    const arr = [1, [2, [3]]];
    const flat = arr.flatDeep();
    """
    req = AnalysisRequest(
        text=js_code,
        mode=AnalysisMode.code,
        use_external_verification=True,
    )
    res = await detector.analyze(req)
    assert res.mode == "code"
    assert res.code_result is not None
    assert res.code_result.language == "javascript"
    assert "nonexistent-slopsquat-lib-998877" in res.code_result.hallucinated_packages
    assert any("flatDeep" in i.symbol for i in res.code_result.issues)
    assert res.risk_level == "high"


@pytest.mark.asyncio
async def test_sql_destructive_hallucination(detector):
    # SQL query with destructive DELETE without WHERE clause
    bad_sql = "DELETE FROM clientes;\nUPDATE cuentas SET saldo = 0;"
    req = AnalysisRequest(
        text=bad_sql,
        mode=AnalysisMode.sql,
        use_external_verification=False,
    )
    res = await detector.analyze(req)
    assert res.code_result is not None
    assert res.code_result.language == "sql"
    assert any(i.category == "security" and i.symbol == "NO_WHERE_CLAUSE" for i in res.code_result.issues)
    assert res.risk_level == "high"


@pytest.mark.asyncio
async def test_sql_syntax_and_dialect_incompatibility(detector):
    # SQL with comma before FROM and duplicate WHERE
    sql_query = "SELECT id, nombre, FROM usuarios WHERE activo = 1 WHERE rol = 'admin';"
    req = AnalysisRequest(
        text=sql_query,
        mode=AnalysisMode.code,
        use_external_verification=False,
    )
    res = await detector.analyze(req)
    assert res.code_result is not None
    assert res.code_result.language == "sql"
    assert res.code_result.is_valid_syntax is False
    assert any(i.symbol == ", FROM" for i in res.code_result.issues)
    assert any(i.symbol == "DUPLICATE_WHERE" for i in res.code_result.issues)


@pytest.mark.asyncio
async def test_slopsquatting_heuristic(detector):
    from unittest.mock import patch, AsyncMock
    # Simulate a package registered in PyPI 5 days ago with 1 release
    mock_pkg_data = {
        "exists": True,
        "is_slopsquatting": True,
        "reason": "Paquete registrado hace solo 5 días.",
        "vulnerabilities": [{"id": "GHSA-fake-1234", "summary": "Malicious trap package"}]
    }
    with patch.object(detector.code_det, "_verify_pypi_package_deep", new=AsyncMock(return_value=mock_pkg_data)):
        code = "import recent_trap_package\nprint('running')"
        req = AnalysisRequest(text=code, mode=AnalysisMode.code, use_external_verification=True)
        res = await detector.analyze(req)
        assert res.code_result is not None
        assert "recent_trap_package" in res.code_result.suspicious_packages
        assert any(i.category == "slopsquatting" for i in res.code_result.issues)
        assert any(i.category == "vulnerability" for i in res.code_result.issues)


@pytest.mark.asyncio
async def test_math_chatgpt_latex_and_unicode_sanitizer(detector):
    # Formulas copied from ChatGPT with LaTeX \frac, \times, \sqrt, Unicode minus and chained equalities
    chatgpt_math = r"""
    Paso 1: \[ \frac{100}{4} \times 2 = 50 \]
    Paso 2: \( \sqrt{81} + 23 × 47 = 1,190 \)
    """
    req = AnalysisRequest(
        text=chatgpt_math,
        mode=AnalysisMode.math,
    )
    res = await detector.analyze(req)
    assert res.math_result is not None
    assert res.math_result.total_equations_found == 2
    assert res.math_result.valid_equations == 1
    assert res.math_result.hallucinated_equations == 1
    assert res.math_result.has_hallucinations is True


@pytest.mark.asyncio
async def test_prompt_aware_and_academic_source_tier(detector):
    from unittest.mock import patch, AsyncMock
    # Simulate OpenAlex returning a peer-reviewed academic match
    with patch.object(
        detector.layer2, "_search_openalex",
        new=AsyncMock(return_value=("Water molecule H2O structure (2022) — Water consists of two hydrogen atoms and one oxygen atom.", True, "https://doi.org/10.1000/h2o"))
    ), patch.object(
        detector.layer2, "_search_wikidata",
        new=AsyncMock(return_value=("", False, ""))
    ), patch.object(
        detector.layer2, "_search_wikipedia",
        new=AsyncMock(return_value=("", False, ""))
    ), patch.object(
        detector.layer2, "_search_duckduckgo",
        new=AsyncMock(return_value=("", False, "", "Web", "web"))
    ):
        req = AnalysisRequest(
            prompt="What is the chemical composition of water?",
            text="Water consists of two hydrogen atoms and one oxygen atom.",
            mode=AnalysisMode.text,
            language="en",
            use_external_verification=True,
        )
        res = await detector.analyze(req)
        assert res.prompt == "What is the chemical composition of water?"
        assert len(res.claims) >= 1
        assert res.claims[0].l2 is not None
        assert res.claims[0].l2.source_tier == "academic"
        assert "OpenAlex" in res.claims[0].l2.source


@pytest.mark.asyncio
async def test_code_markdown_fence_extraction(detector):
    # LLM response wrapping valid Python code in markdown fences with prose
    llm_wrapped = "Aquí tienes la función en Python:\n```python\nimport math\ndef area(r):\n    return math.pi * r * r\n```\nEspero que te sirva."
    req = AnalysisRequest(
        text=llm_wrapped,
        mode=AnalysisMode.code,
        use_external_verification=False,
    )
    res = await detector.analyze(req)
    assert res.code_result is not None
    assert res.code_result.language == "python"
    assert res.code_result.is_valid_syntax is True
    assert res.risk_level == "low"




