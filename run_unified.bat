@echo off
setlocal
cd /d "%~dp0"

echo ==========================================================
echo   ATCORP - India: B2B CRM and AI CPQ Platform Launcher
echo ==========================================================
echo.

if not exist "backend\venv\Scripts\python.exe" (
    echo [Setup] Creating Python virtual environment...
    python -m venv backend\venv
    call backend\venv\Scripts\pip.exe install -r backend\requirements.txt
)

echo [Frontend] Building React assets...
cd frontend
call npm.cmd run build
if %ERRORLEVEL% NEQ 0 (
    echo [Error] Frontend build failed.
    pause
    exit /b %ERRORLEVEL%
)
cd ..

echo.
echo [Backend] Launching Unified Server on http://localhost:8000
echo   - React UI:     http://localhost:8000
echo   - Swagger Docs: http://localhost:8000/api/v1/docs
echo   - Health Check: http://localhost:8000/health
echo.
echo Press CTRL+C to stop the server.
echo ==========================================================

set PYTHONPATH=%~dp0backend
call backend\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause

