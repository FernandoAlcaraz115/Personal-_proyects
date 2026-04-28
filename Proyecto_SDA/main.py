from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import analysis, health
from app.core.config import settings

app = FastAPI(
    title="HalluciDetect API",
    description="Detección de alucinaciones en LLMs",
    version="0.1.0",
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
    return {"status": "ok", "project": "HalluciDetect"}
