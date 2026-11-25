import json
from fastapi import APIRouter, HTTPException
from starlette.responses import StreamingResponse
from app.models.analysis import AnalysisRequest, AnalysisResponse, LiveGenerateRequest
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
        },
    )


@router.post("/live-audit", response_model=AnalysisResponse)
async def live_audit(request: LiveGenerateRequest):
    """Generates a live response from the chosen LLM and audits it immediately with prompt context."""
    if not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")
    try:
        prov = request.llm_provider.value if hasattr(request.llm_provider, "value") else str(request.llm_provider)
        mode_val = request.mode.value if hasattr(request.mode, "value") else str(request.mode)
        generated = await _detector.llm.generate_answer(
            prompt=request.prompt,
            provider=prov,
            model=request.model,
            mode=mode_val,
            language=request.language,
        )
        if not generated or len(generated.strip()) < 2:
            raise HTTPException(status_code=502, detail="El LLM devolvió una respuesta vacía.")

        audit_req = AnalysisRequest(
            text=generated,
            prompt=request.prompt,
            mode=request.mode,
            llm_provider=request.llm_provider,
            model=request.model,
            language=request.language,
            use_external_verification=request.use_external_verification,
            use_ai_correction=request.use_ai_correction,
            self_consistency_samples=request.self_consistency_samples,
        )
        return await _detector.analyze(audit_req)
    except HTTPException:
        raise
    except Exception as exc:
        detail_msg = str(exc).strip() or f"{type(exc).__name__} (el modelo tardó demasiado o no respondió)"
        raise HTTPException(status_code=502, detail=f"Error al consultar el LLM ({request.llm_provider.value}): {detail_msg}")


@router.post("/live-audit/stream")
async def live_audit_stream(request: LiveGenerateRequest):
    """Streams live LLM generation token-by-token followed immediately by real-time multi-layer hallucination auditing."""
    if not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")

    async def event_generator():
        try:
            prov = request.llm_provider.value if hasattr(request.llm_provider, "value") else str(request.llm_provider)
            mode_val = request.mode.value if hasattr(request.mode, "value") else str(request.mode)

            yield f"data: {json.dumps({'event': 'layer_progress', 'data': {'layer': 0, 'name': f'Generando respuesta en vivo ({prov})', 'detail': f'Consultando {request.model} con tu pregunta...'}})}\n\n"

            acc = []
            chunk_count = 0
            async for piece in _detector.llm.generate_answer_stream(
                prompt=request.prompt,
                provider=prov,
                model=request.model,
                mode=mode_val,
                language=request.language,
            ):
                acc.append(piece)
                chunk_count += 1
                # Stream partial text to the UI every 6 tokens so the user watches it type live
                if chunk_count % 6 == 0:
                    yield f"data: {json.dumps({'event': 'llm_response', 'data': {'text': ''.join(acc), 'provider': prov, 'model': request.model}})}\n\n"

            generated = "".join(acc).strip()
            if not generated or len(generated) < 2:
                yield f"data: {json.dumps({'event': 'error', 'data': 'El LLM devolvió una respuesta vacía.'})}\n\n"
                return

            # Emit final generated text before running audit
            yield f"data: {json.dumps({'event': 'llm_response', 'data': {'text': generated, 'provider': prov, 'model': request.model}})}\n\n"

            audit_req = AnalysisRequest(
                text=generated,
                prompt=request.prompt,
                mode=request.mode,
                llm_provider=request.llm_provider,
                model=request.model,
                language=request.language,
                use_external_verification=request.use_external_verification,
                use_ai_correction=request.use_ai_correction,
                self_consistency_samples=request.self_consistency_samples,
            )
            async for ev in _detector.analyze_stream(audit_req):
                payload = json.dumps(ev, default=str)
                yield f"data: {payload}\n\n"
        except Exception as exc:
            detail_msg = str(exc).strip() or f"{type(exc).__name__} (timeout o conexión interrumpida)"
            err_msg = f"No se pudo conectar con {request.llm_provider.value} ({request.model}): {detail_msg}"
            yield f"data: {json.dumps({'event': 'error', 'data': err_msg})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
