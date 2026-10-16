# 🧠 HalluciDetect — Multi-Domain AI Hallucination Studio

Herramienta de auditoría y detección de alucinaciones en modelos de lenguaje grande (LLMs de caja negra) a través de tres dimensiones críticas: **Texto Fáctico**, **Código Fuente** y **Ecuaciones Matemáticas**.

---

## 🚀 Capacidades y Modos de Detección

### 1. 🌐 Modo Fáctico (Lenguaje Natural)
- **Capa 1 (Lingüística)**: Detección de lenguaje dubitativo (*hedging*) y términos vagos mediante heurísticas léxicas.
- **Capa 2 (Grounding Web)**: Consulta asíncrona a Wikipedia (ES & EN) y DuckDuckGo con verificación de solapamiento de entidades.
- **Capa 3 (Scorer Adaptativo)**: Ponderación de señales internas y externas con muestreo de auto-consistencia (*Self-Consistency*).
- **Capa 4 (Corrección IA)**: Consulta al LLM con contexto para generar corrección explicada.

### 2. 💻 Modo Código (Python AST & PyPI)
- **Verificación Sintáctica**: Detección de errores de sintaxis y construcciones ilegales con número exacto de línea vía AST.
- **Auditoría de Librerías Fantasma**: Comprueba si los paquetes importados existen en la biblioteca estándar de Python o en el registro oficial de PyPI.
- **Validación de APIs**: Detección de métodos o funciones alucinadas (ej. llamadas a métodos inexistentes en librerías estándar).
- **Parche de Código con IA**: Generación opcional del código corregido y funcional.

### 3. 🧮 Modo Matemáticas & Ecuaciones (SymPy Formal)
- **Extracción de Ecuaciones**: Identifica igualdades aritméticas, porcentajes y pasos de deducción paso a paso.
- **Evaluación Simbólica y Numérica**: Verifica mediante el motor formal SymPy si $LHS - RHS = 0$.
- **Cálculo de Discrepancia**: Indica la magnitud exacta del error y el valor real esperado.
- **Solución Formal**: Generación de la resolución paso a paso corregida.

---

## 🛠️ Stack Tecnológico

- **Backend**: FastAPI (Python 3.11+), Uvicorn, Pydantic v2, HTTPX.
- **Motores de Verificación**:
  - Simbólico / Matemáticas: `SymPy`
  - Sintaxis / Código: `ast` (Python Standard Library) + PyPI Registry API
  - Web Grounding: Wikipedia API + `duckduckgo-search`
- **Frontend**: React 18, Vite, Zustand, Vanilla CSS (Cyberpunk / AI Studio theme con Glassmorphism y Google Fonts Outfit / JetBrains Mono / Inter).
- **LLM Providers (Opcionales)**: Ollama (local), OpenAI (GPT-4o), Google Gemini.

---

## ⚡ Inicio Rápido

### 1. Backend (FastAPI)
```bash
# Desde la carpeta Proyecto_SDA:
python -m venv .venv
# Activar entorno virtual (Windows):
.\.venv\Scripts\activate
# Instalar dependencias:
pip install -r requirements.txt

# Configurar variables de entorno (opcional para OpenAI/Gemini):
cp .env.example .env

# Ejecutar el servidor:
python main.py
# O con uvicorn:
uvicorn app.main:app --reload
```
- API Docs interactiva: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
- Aplicación Web: [http://localhost:5173](http://localhost:5173)

### 3. Ejecutar Pruebas Automatizadas
```bash
pytest -v
```

---

## 📁 Estructura del Proyecto

```
Proyecto_SDA/
├── app/
│   ├── api/             # Endpoints FastAPI (/analyze, /health)
│   ├── core/            # Configuración y Settings
│   ├── models/          # Modelos Pydantic (Request, Response, Code, Math)
│   ├── services/
│   │   ├── code_detector.py      # Motor AST y PyPI para código
│   │   ├── math_detector.py      # Motor SymPy para ecuaciones
│   │   ├── detector.py           # Orquestador general del pipeline
│   │   ├── layer1_linguistic.py  # Señales léxicas
│   │   ├── layer2_verifier.py    # Wikipedia y DuckDuckGo
│   │   ├── layer3_scorer.py      # Puntuación adaptativa
│   │   ├── layer4_corrector.py   # Corrección con LLM
│   │   └── llm_client.py         # Cliente unificado Ollama/OpenAI/Gemini
│   └── main.py          # App FastAPI principal
├── frontend/
│   ├── src/
│   │   ├── components/  # TextInput, ResultPanel, CodeResultView, MathResultView, etc.
│   │   ├── store/       # Estado global Zustand (useAnalysisStore)
│   │   └── i18n.js      # Textos y demos en ES / EN
│   └── package.json
├── tests/
│   └── test_pipeline.py # Suite de tests automatizados con pytest
├── main.py              # Wrapper de inicio rápido
├── requirements.txt
└── README.md
```
