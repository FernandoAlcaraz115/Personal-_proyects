import time
import uuid
import json
from fastapi import APIRouter, HTTPException
from starlette.responses import StreamingResponse
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


@router.post("/analyze/stream")
async def analyze_stream(request: AnalysisRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    async def event_generator():
        try:
            async for ev in _detector.analyze_stream(request):
                payload = json.dumps(ev, default=str)
                yield f"data: {payload}\n\n"
        except Exception as exc:
            err_payload = json.dumps({"event": "error", "data": str(exc)})
            yield f"data: {err_payload}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )
