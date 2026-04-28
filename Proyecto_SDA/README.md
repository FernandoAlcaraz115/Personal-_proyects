# HalluciDetect

Herramienta de detección de alucinaciones en LLMs (modelos de caja negra).

## Stack
- **Frontend**: React + Vite + TailwindCSS
- **Backend**: FastAPI (Python)
- **NLP**: spaCy + sentence-transformers
- **LLMs**: Ollama (local) / OpenAI / Gemini

## Inicio rápido

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # edita tus API keys
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

API docs: http://localhost:8000/docs
Frontend:  http://localhost:5173

## Arquitectura del pipeline
1. **Capa 1** — Análisis lingüístico (sin fuentes externas)
2. **Capa 2** — Verificación externa (Wikipedia / Serper)
3. **Capa 3** — Score de confianza adaptativo
