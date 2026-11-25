import asyncio
from contextlib import asynccontextmanager
import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import analysis, health
from app.core.config import settings


async def _warmup_ollama():
    """Silently preloads the default Ollama model in RAM/GPU with keep_alive so live demos respond fast."""
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            await client.post(
                f"{settings.ollama_base_url}/api/generate",
                json={
                    "model": settings.default_model,
                    "prompt": "",
                    "keep_alive": "30m",
                },
            )
    except Exception:
        pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-warm Ollama in background without blocking API startup
    asyncio.create_task(_warmup_ollama())
    yield


app = FastAPI(
    title="ATTESTLY API",
    description="Detección de alucinaciones en LLMs (Texto, Código, SQL, Seguridad & Matemáticas)",
    version="2.5.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(analysis.router, prefix="/api/v1")


@app.get("/")
def root():
    return {"status": "ok", "project": "ATTESTLY", "version": "2.5.0"}
