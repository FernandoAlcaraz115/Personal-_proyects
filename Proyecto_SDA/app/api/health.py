import httpx
from fastapi import APIRouter

router = APIRouter()

_WIKI_TEST_URL = "https://es.wikipedia.org/w/api.php"
_HEADERS = {
    "User-Agent": "HalluciDetect/1.0 (educational hallucination detector; contact: dev@example.com)"
}


@router.get("/health")
def health():
    return {"status": "ok", "version": "0.1.0"}


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
