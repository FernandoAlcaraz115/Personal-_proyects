from __future__ import annotations
from typing import List, Optional
from enum import Enum
from pydantic import BaseModel, Field


class LLMProvider(str, Enum):
    ollama = "ollama"
    openai = "openai"
    gemini = "gemini"


class AnalysisRequest(BaseModel):
    text: str = Field(..., min_length=10, description="Text to analyze for hallucinations")
    llm_provider: LLMProvider = LLMProvider.ollama
    model: str = "llama3"
    use_external_verification: bool = True
    self_consistency_samples: int = Field(1, ge=1, le=5)


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


class ClaimResult(BaseModel):
    text: str
    confidence: float
    risk_level: str  # "low" | "medium" | "high"
    l1: Layer1Result
    l2: Optional[Layer2Result] = None
    explanation: str


class AnalysisResponse(BaseModel):
    id: str
    original_text: str
    claims: List[ClaimResult]
    overall_score: float
    processing_time_ms: int
    method_used: str
