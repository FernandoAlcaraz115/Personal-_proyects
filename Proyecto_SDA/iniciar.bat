@echo off
title ATTESTLY - AI Hallucination Studio
color 0B

echo.
echo ==============================================================
echo    ATTESTLY - Multi-Domain AI Hallucination Studio v2.0
echo ==============================================================
echo.

cd /d "%~dp0"

:: 1. Verificar entorno virtual de Python
if not exist ".venv\Scripts\python.exe" (
    echo [!] No se detecto el entorno virtual en .venv.
    echo [*] Creando entorno virtual con Python...
    python -m venv .venv
    if errorlevel 1 (
        echo [ERROR] No se pudo crear el entorno virtual. Asegurate de tener Python instalado.
        pause
        exit /b 1
    )
    echo [*] Instalando dependencias de Python...
    .\.venv\Scripts\pip.exe install -r requirements.txt
)

:: 2. Verificar dependencias de frontend
if not exist "frontend\node_modules" (
    echo [*] Instalando dependencias de Node.js en frontend...
    cd frontend
    call npm install
    cd ..
)

echo.
echo [*] Iniciando Backend FastAPI en puerto 8000...
start "ATTESTLY Backend" cmd /k "cd /d "%~dp0" && .\.venv\Scripts\python.exe main.py"

echo [*] Esperando que inicie el backend...
ping 127.0.0.1 -n 3 >nul

echo [*] Iniciando Frontend React/Vite en puerto 5173...
start "ATTESTLY Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo [*] Abriendo ATTESTLY en el navegador...
start http://localhost:5173

echo.
echo ==============================================================
echo    ATTESTLY se ha iniciado correctamente!
echo.
echo    - Frontend Web: http://localhost:5173
echo    - API Backend:  http://localhost:8000/docs
echo ==============================================================
echo.
echo Puedes cerrar esta ventana.
pause