# 🧠 ATTESTLY — Multi-Domain AI Hallucination & Security Studio

Herramienta de auditoría y detección de alucinaciones en modelos de lenguaje grande (LLMs de caja negra) a través de cuatro dimensiones críticas: **Texto Fáctico**, **Código Fuente**, **Seguridad & Slopsquatting / SQL**, y **Ecuaciones Matemáticas**, disponible tanto en **Web Studio** como en **CLI para CI/CD**.

---

## 🚀 Capacidades y Modos de Detección

### 1. 🌐 Modo Fáctico (Lenguaje Natural)
- **Capa 1 (Lingüística)**: Detección de lenguaje dubitativo (*hedging*) y términos vagos mediante heurísticas léxicas.
- **Capa 2 (Grounding Web)**: Consulta asíncrona a Wikipedia (ES & EN) y DuckDuckGo con verificación de solapamiento de entidades.
- **Capa 3 (Scorer Adaptativo)**: Ponderación de señales internas y externas con muestreo de auto-consistencia (*Self-Consistency*).
- **Capa 4 (Corrección IA)**: Consulta al LLM con contexto para generar corrección explicada.

### 2. 💻 Modo Código (Python, JavaScript/TypeScript & SQL)
- **Verificación Sintáctica**: Detección de errores de sintaxis y construcciones ilegales con número exacto de línea vía AST (Python) y balance de bloques (JS/SQL).
- **Auditoría de Librerías Fantasma**: Comprueba si los paquetes importados existen en la biblioteca estándar o en los registros oficiales de **PyPI** y **npm**.
- **Validación de APIs**: Detección de métodos o funciones alucinadas (ej. llamadas a métodos inexistentes en librerías estándar).
- **Parche de Código con IA**: Generación opcional del código corregido y funcional.

### 3. 🛡️ Modo Ciberseguridad & Slopsquatting (PyPI, npm & OSV)
- **Detección de Package Slopsquatting**: Analiza si una dependencia fue registrada recientemente (< 45 días) o presenta bajo volumen de versiones, alertando sobre paquetes trampa creados por atacantes para capturar alucinaciones de IA.
- **Avisos de Vulnerabilidad (OSV API)**: Consulta en tiempo real a Open Source Vulnerabilities (`osv.dev`) para identificar CVEs activos en las dependencias sugeridas por el LLM.
- **Auditoría SQL**: Detecta sentencias destructivas (`DELETE` o `UPDATE` sin `WHERE`), patrones de inyección SQL (concatenaciones directas de cadenas) y discrepancias dialectales (`DATEDIFF`, `GROUP_CONCAT`, `NVL`).

### 4. 🧮 Modo Matemáticas & Ecuaciones (SymPy Formal)
- **Extracción de Ecuaciones**: Identifica igualdades aritméticas, porcentajes y pasos de deducción paso a paso.
- **Evaluación Simbólica y Numérica**: Verifica mediante el motor formal SymPy si $LHS - RHS = 0$.
- **Cálculo de Discrepancia**: Indica la magnitud exacta del error y el valor real esperado.
- **Solución Formal**: Generación de la resolución paso a paso corregida.

---

## ⚡ Attestly CLI (Auditoría en Terminal & CI/CD)

Attestly incluye una CLI nativa que permite auditar código, consultas SQL y textos directamente desde la terminal o integrarlo en flujos de integración continua:

```bash
# Auditar un archivo específico (Python, JS, SQL, Matemáticas)
python -m app.cli audit script.py --fail-on high

# Auditar una consulta SQL directamente
python -m app.cli audit -t "DELETE FROM usuarios;" -m sql

# Escanear un repositorio completo de código de forma recursiva
python -m app.cli scan . --format table --fail-on high

# Exportar resultados en JSON estructurado para scripts o tuberías
python -m app.cli audit script.py --format json
```

### 🤖 Integración en GitHub Actions
El proyecto incluye un workflow en `.github/workflows/attestly-audit.yml` para bloquear automáticamente Pull Requests que introduzcan librerías fantasma, trampas de slopsquatting o errores sintácticos en código generado por asistentes de IA.

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
├── iniciar.bat          # Lanzador automático de ATTESTLY (Backend + Frontend)
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
