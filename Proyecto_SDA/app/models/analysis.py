from __future__ import annotations
from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field


class LLMProvider(str, Enum):
    ollama = "ollama"
    openai = "openai"
    gemini = "gemini"


class AnalysisMode(str, Enum):
    text = "text"
    code = "code"
    math = "math"


class AnalysisRequest(BaseModel):
    text: str = Field(..., min_length=2)
    mode: AnalysisMode = AnalysisMode.text
    llm_provider: LLMProvider = LLMProvider.ollama
    model: str = "llama3.2"
    language: str = "es"
    use_external_verification: bool = True
    use_ai_correction: bool = False
    self_consistency_samples: int = Field(1, ge=1, le=5)


# -------------------------------------------------------------
# Factual / Text Models
# -------------------------------------------------------------
class Layer1Result(BaseModel):
    hedging_score: float
    vagueness_score: float
    hedge_phrases: List[str]
    vague_phrases: List[str]


class Layer2Result(BaseModel):
    verified: Optional[bool]
    confidence: float
    source: str
    snippet: str
    source_url: Optional[str] = None


class CorrectionResult(BaseModel):
    is_hallucination: bool
    explanation: str
    corrected_claim: str


class ClaimResult(BaseModel):
    text: str
    confidence: float
    risk_level: str  # "low" | "medium" | "high"
    l1: Layer1Result
    l2: Optional[Layer2Result] = None
    l4: Optional[CorrectionResult] = None
    explanation: str


# -------------------------------------------------------------
# Code Analysis Models
# -------------------------------------------------------------
class CodeIssue(BaseModel):
    category: str  # "syntax", "hallucinated_package", "hallucinated_api", "deprecated"
    severity: str  # "high", "medium", "low"
    line_number: Optional[int] = None
    column: Optional[int] = None
    symbol: str
    message: str
    suggestion: Optional[str] = None


class CodeAnalysisResult(BaseModel):
    is_valid_syntax: bool
    confidence_score: float
    risk_level: str
    issues: List[CodeIssue] = Field(default_factory=list)
    hallucinated_packages: List[str] = Field(default_factory=list)
    ast_metrics: Dict[str, int] = Field(default_factory=dict)
    corrected_code: Optional[str] = None
    ai_explanation: Optional[str] = None


# -------------------------------------------------------------
# Math Analysis Models
# -------------------------------------------------------------
class MathStepResult(BaseModel):
    step_number: int
    raw_expression: str
    left_side: str
    right_side: str
    is_valid: bool
    calculated_value: Optional[str] = None
    expected_value: Optional[str] = None
    difference: Optional[str] = None
    error_message: Optional[str] = None


class MathAnalysisResult(BaseModel):
    total_equations_found: int
    valid_equations: int
    hallucinated_equations: int
    confidence_score: float
    risk_level: str
    steps: List[MathStepResult] = Field(default_factory=list)
    has_hallucinations: bool
    summary: str
    corrected_solution: Optional[str] = None
    ai_explanation: Optional[str] = None


# -------------------------------------------------------------
# Unified Response
# -------------------------------------------------------------
class AnalysisResponse(BaseModel):
    id: str
    mode: str = "text"
    original_text: str
    overall_score: float
    risk_level: str = "low"
    processing_time_ms: int
    method_used: str
    claims: List[ClaimResult] = Field(default_factory=list)
    code_result: Optional[CodeAnalysisResult] = None
    math_result: Optional[MathAnalysisResult] = None
