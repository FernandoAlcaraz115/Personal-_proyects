import httpx
from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()

_WIKI_TEST_URL = "https://es.wikipedia.org/w/api.php"
_HEADERS = {
    "User-Agent": "ATTESTLY/2.5 (educational hallucination detector; contact: dev@example.com)"
}


@router.get("/health")
def health():
    return {"status": "ok", "version": "2.5.0"}


@router.get("/health/system")
async def health_system():
    """Live system status for UI indicator: Backend + Ollama connectivity."""
    ollama_online = False
    models = []
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            res = await client.get(f"{settings.ollama_base_url}/api/tags")
            if res.status_code == 200:
                ollama_online = True
                data = res.json()
                models = [m.get("name", "") for m in data.get("models", []) if m.get("name")]
    except Exception:
        ollama_online = False

    return {
        "backend": "ok",
        "version": "2.5.0",
        "ollama": {
            "online": ollama_online,
            "base_url": settings.ollama_base_url,
            "default_model": settings.default_model,
            "models": models[:8],
        },
    }


@router.get("/health/wikipedia")
async def health_wikipedia():
    """Test endpoint: verifies Wikipedia API connectivity."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(
                _WIKI_TEST_URL,
                params={"action": "query", "list": "search", "srsearch": "Francia", "format": "json", "srlimit": 1},
                headers=_HEADERS,
            )
        data = res.json()
        results = data.get("query", {}).get("search", [])
        snippet = results[0].get("snippet", "") if results else ""
        return {
            "status": "ok",
            "http_status": res.status_code,
            "results_found": len(results),
            "snippet_preview": snippet[:120] if snippet else "(empty)",
        }
    except Exception as exc:
        return {"status": "error", "detail": str(exc)}
