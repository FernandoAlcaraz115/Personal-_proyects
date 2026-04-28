import time
import uuid
from fastapi import APIRouter, HTTPException
from app.models.analysis import AnalysisRequest, AnalysisResponse
from app.services.detector import HallucinationDetector

router = APIRouter()
_detector = HallucinationDetector()


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze(request: AnalysisRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
    try:
        return await _detector.analyze(request)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
