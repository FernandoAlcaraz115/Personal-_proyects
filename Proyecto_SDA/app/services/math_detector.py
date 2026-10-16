"""
MathHallucinationDetector — Verifies mathematical calculations, equations,
and arithmetic reasoning steps using SymPy.

Detects:
1. Arithmetic errors (e.g., 23 * 47 = 1181 vs 1081).
2. Symbolic equality contradictions (e.g., sin(x)^2 + cos(x)^2 = 2).
3. Percentage and ratio calculation hallucinations.
4. Step-by-step reasoning breakdown (identifies the exact erroneous step).
"""
from __future__ import annotations
import re
from typing import List, Dict, Optional, Tuple
from pydantic import BaseModel, Field
import sympy
from sympy.parsing.sympy_parser import (
    parse_expr,
    standard_transformations,
    implicit_multiplication_application,
    convert_xor,
)

_TRANSFORMATIONS = standard_transformations + (
    implicit_multiplication_application,
    convert_xor,
)


from app.models.analysis import MathStepResult, MathAnalysisResult



class MathHallucinationDetector:
    def __init__(self):
        pass

    async def analyze(
        self,
        text: str,
        ai_correction: bool = False,
        llm_client = None,
        llm_provider: str = "ollama",
    ) -> MathAnalysisResult:
        """Extracts and verifies mathematical equations and arithmetic claims."""
        text = text.strip()
        equations = self._extract_equations(text)

        if not equations:
            # Check if there are percentage or worded arithmetic expressions
            worded_eqs = self._extract_worded_arithmetic(text)
            equations.extend(worded_eqs)

        if not equations:
            return MathAnalysisResult(
                total_equations_found=0,
                valid_equations=0,
                hallucinated_equations=0,
                confidence_score=0.5,
                risk_level="medium",
                steps=[],
                has_hallucinations=False,
                summary="No se detectaron igualdades matemáticas o cálculos explícitos en el texto.",
            )

        step_results: List[MathStepResult] = []
        valid_count = 0
        hallu_count = 0

        for idx, (raw_str, lhs_str, rhs_str) in enumerate(equations, start=1):
            is_valid, calc_val, exp_val, diff_str, err = self._verify_equality(lhs_str, rhs_str)
            if is_valid:
                valid_count += 1
            else:
                hallu_count += 1

            step_results.append(MathStepResult(
                step_number=idx,
                raw_expression=raw_str,
                left_side=lhs_str,
                right_side=rhs_str,
                is_valid=is_valid,
                calculated_value=calc_val,
                expected_value=exp_val,
                difference=diff_str,
                error_message=err,
            ))

        total = len(step_results)
        confidence = round(valid_count / total, 3) if total > 0 else 1.0
        if confidence >= 0.85:
            risk = "low"
        elif confidence >= 0.50:
            risk = "medium"
        else:
            risk = "high"

        summary = (
            f"Se verificaron {total} igualdad(es) matemática(s). "
            f"{hallu_count} error(es) o alucinación(es) detectada(s)."
        )

        corrected_solution = None
        ai_explanation = None
        if ai_correction and llm_client and hallu_count > 0:
            corrected_solution, ai_explanation = await self._generate_ai_correction(
                text=text,
                failed_steps=[s for s in step_results if not s.is_valid],
                llm_client=llm_client,
                provider=llm_provider,
            )

        return MathAnalysisResult(
            total_equations_found=total,
            valid_equations=valid_count,
            hallucinated_equations=hallu_count,
            confidence_score=confidence,
            risk_level=risk,
            steps=step_results,
            has_hallucinations=hallu_count > 0,
            summary=summary,
            corrected_solution=corrected_solution,
            ai_explanation=ai_explanation,
        )

    def _extract_equations(self, text: str) -> List[Tuple[str, str, str]]:
        """Finds equations containing '=' in text or LaTeX format."""
        equations = []
        # Match lines or phrases containing an equal sign
        # e.g., "12 * 8 = 96", "x^2 + 5 = 14", "23 + 45 = 68"
        pattern = r"([a-zA-Z0-9\s\+\-\*\/\^\(\)\.\√]+)\s*=\s*([a-zA-Z0-9\s\+\-\*\/\^\(\)\.\√]+)"
        
        # Split text by lines or punctuation
        candidates = re.split(r"[\n;,]+", text)
        for cand in candidates:
            cand = cand.strip()
            # Clean bullet points or prefixes like "Paso 1: ", "1. "
            cand_clean = re.sub(r"^(paso\s*\d+:?|\d+[\.\)]\s*)", "", cand, flags=re.IGNORECASE).strip()
            matches = list(re.finditer(pattern, cand_clean))
            for m in matches:
                lhs = m.group(1).strip()
                rhs = m.group(2).strip()
                # Basic validation that lhs and rhs contain math symbols or numbers
                if any(c.isdigit() for c in lhs) or any(c.isdigit() for c in rhs):
                    # Filter out non-mathematical assignments like "x = foo"
                    if len(lhs) <= 60 and len(rhs) <= 60:
                        raw = f"{lhs} = {rhs}"
                        equations.append((raw, lhs, rhs))
        return equations

    def _extract_worded_arithmetic(self, text: str) -> List[Tuple[str, str, str]]:
        """Detects worded arithmetic statements like 'el 20% de 150 es 30'."""
        equations = []
        # Pattern: el X% de Y es Z
        pct_pattern = r"(?:el\s*)?(\d+(?:\.\d+)?)\s*%\s*de\s*(\d+(?:\.\d+)?)\s*(?:es|=)\s*(\d+(?:\.\d+)?)"
        for m in re.finditer(pct_pattern, text, re.IGNORECASE):
            pct_val = m.group(1)
            base_val = m.group(2)
            res_val = m.group(3)
            raw = f"{pct_val}% de {base_val} = {res_val}"
            lhs = f"({pct_val}/100) * {base_val}"
            rhs = res_val
            equations.append((raw, lhs, rhs))

        # Pattern: X por Y es Z (multiplicación)
        mul_pattern = r"(\d+(?:\.\d+)?)\s*(?:por|\*|multiplicado por)\s*(\d+(?:\.\d+)?)\s*(?:es|=)\s*(\d+(?:\.\d+)?)"
        for m in re.finditer(mul_pattern, text, re.IGNORECASE):
            v1, v2, res_val = m.group(1), m.group(2), m.group(3)
            raw = f"{v1} * {v2} = {res_val}"
            lhs = f"{v1} * {v2}"
            rhs = res_val
            equations.append((raw, lhs, rhs))

        return equations

    def _clean_math_expr(self, expr_str: str) -> str:
        """Sanitizes text expression for SymPy parser."""
        s = expr_str.strip()
        # Replace common math symbols
        s = s.replace("×", "*").replace("÷", "/").replace("−", "-")
        s = re.sub(r"\√\s*(\d+)", r"sqrt(\1)", s)
        s = re.sub(r"sqrt\s*\((.*?)\)", r"sqrt(\1)", s)
        # Remove trailing words if attached
        s = re.sub(r"[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$", "", s).strip()
        return s

    def _verify_equality(self, lhs_str: str, rhs_str: str) -> Tuple[bool, Optional[str], Optional[str], Optional[str], Optional[str]]:
        clean_lhs = self._clean_math_expr(lhs_str)
        clean_rhs = self._clean_math_expr(rhs_str)

        try:
            lhs_expr = parse_expr(clean_lhs, transformations=_TRANSFORMATIONS)
            rhs_expr = parse_expr(clean_rhs, transformations=_TRANSFORMATIONS)

            # Check exact or simplified difference: lhs - rhs == 0
            diff = sympy.simplify(lhs_expr - rhs_expr)
            
            # If purely numeric, evaluate float comparison
            if diff.is_number:
                val = float(diff.evalf())
                is_zero = abs(val) < 1e-6
                lhs_val = str(sympy.N(lhs_expr, 6))
                rhs_val = str(sympy.N(rhs_expr, 6))
                if is_zero:
                    return True, rhs_val, lhs_val, "0.0", None
                else:
                    return False, rhs_val, lhs_val, f"{val:.4f}", f"Discrepancia detectada: se calculó {rhs_val}, pero el valor real es {lhs_val}."

            # If symbolic (contains variables like x, y)
            if diff == 0:
                return True, str(rhs_expr), str(lhs_expr), "0", None
            else:
                return False, str(rhs_expr), str(lhs_expr), str(diff), f"Identidad simbólica incorrecta: la diferencia es {diff}."

        except Exception as exc:
            return False, None, None, None, f"No se pudo evaluar matemáticamente la expresión: {str(exc)}"

    async def _generate_ai_correction(
        self,
        text: str,
        failed_steps: List[MathStepResult],
        llm_client,
        provider: str,
    ) -> Tuple[Optional[str], Optional[str]]:
        try:
            steps_desc = "\n".join(
                f"- Paso {s.step_number}: '{s.raw_expression}' -> {s.error_message}"
                for s in failed_steps
            )
            prompt = f"""Eres un profesor y verificador de matemáticas riguroso.
Detectamos alucinaciones o errores aritméticos en este cálculo generado por un LLM:

Errores detectados:
{steps_desc}

Texto / problema original:
{text}

Instrucciones:
1. Resuelve el problema paso a paso de manera correcta y formal.
2. Explica brevemente en español dónde se equivocó el modelo original.

Responde ÚNICAMENTE en formato JSON con la siguiente estructura:
{{
  "corrected_solution": "solución paso a paso correcta",
  "explanation": "explicación clara del error en español"
}}
No incluyas markdown fuera del JSON."""

            raw = await llm_client._query(prompt, provider)
            import json
            match = re.search(r"\{[\s\S]*\}", raw)
            if match:
                data = json.loads(match.group())
                return data.get("corrected_solution"), data.get("explanation")
        except Exception:
            pass
        return None, None
