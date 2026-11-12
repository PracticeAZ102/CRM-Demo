<#
.SYNOPSIS
    ATCORP - India B2B CRM and CPQ Platform Launcher
#>

param(
    [ValidateSet("unified", "dev")]
    [string]$Mode = "unified"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  ATCORP - India: B2B CRM and AI CPQ Platform Launcher" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$VenvPython = Join-Path $ScriptDir "backend\venv\Scripts\python.exe"

if (-not (Test-Path $VenvPython)) {
    Write-Host "Virtual environment not found. Setting up..." -ForegroundColor Yellow
    python -m venv (Join-Path $ScriptDir "backend\venv")
    $Pip = Join-Path $ScriptDir "backend\venv\Scripts\pip.exe"
    $Reqs = Join-Path $ScriptDir "backend\requirements.txt"
    & $Pip install -r $Reqs
}

if ($Mode -eq "unified") {
    Write-Host "`n[Unified Monolith Mode]" -ForegroundColor Green
    Write-Host "Building React frontend assets into static bundle..." -ForegroundColor Gray
    
    $FrontendDir = Join-Path $ScriptDir "frontend"
    Push-Location $FrontendDir
    try {
        npm run build
    }
    finally {
        Pop-Location
    }

    Write-Host "`nLaunching Unified Server on http://localhost:8000..." -ForegroundColor Green
    Write-Host "  - React App UI: http://localhost:8000" -ForegroundColor Yellow
    Write-Host "  - Swagger Docs: http://localhost:8000/api/v1/docs" -ForegroundColor Yellow
    Write-Host "  - Health Check: http://localhost:8000/health" -ForegroundColor Yellow

    $env:PYTHONPATH = Join-Path $ScriptDir "backend"
    & $VenvPython -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
}
elseif ($Mode -eq "dev") {
    Write-Host "`n[Vite Hot-Reload Mode]" -ForegroundColor Green
    Write-Host "Starting FastAPI Backend on :8000 and Vite Frontend on :5173..." -ForegroundColor Gray

    $BackendDir = Join-Path $ScriptDir "backend"
    $CmdString = "`$env:PYTHONPATH = '$BackendDir'; & '$VenvPython' -m uvicorn app.main:app --reload --port 8000"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $CmdString

    $FrontendDir = Join-Path $ScriptDir "frontend"
    Set-Location $FrontendDir
    npm run dev
}
