@echo off
REM Start MongoDB, backend and frontend for the project

REM ===== Start MongoDB (Windows service) =====
echo Starting MongoDB service (if installed)...
net start MongoDB >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  echo MongoDB service is running.
) else (
  echo Could not start MongoDB service automatically.
  echo If you run MongoDB via mongod.exe, start it manually or edit this file to point to mongod.
)
echo.

REM ===== Start backend in a new window =====
cd /d "%~dp0backend"
start "DEMO_FEEDBACK Backend" cmd /k npm run dev

REM ===== Start frontend in a new window =====
cd /d "%~dp0"
start "DEMO_FEEDBACK Frontend" cmd /k npm run dev

REM Optional: keep this window open with a message, or exit
echo Backend and frontend are starting in separate windows.
echo You can close this window if you like.
pause
