@echo off
setlocal

REM Get the directory where the script is located
set "SCRIPT_DIR=%~dp0"

echo Activating virtual environment...
call "%SCRIPT_DIR%venv\Scripts\activate.bat"
if %errorlevel% neq 0 (
    echo Failed to activate venv
    exit /b %errorlevel%
)

echo Running Streamlit app...
cd /d "%SCRIPT_DIR%"

REM Streamlit requires docstrings during startup, so disable any inherited optimize flag.
set "PYTHONOPTIMIZE="

REM Optionally remove existing 'db' directory
if exist "%SCRIPT_DIR%db" (
    rmdir /s /q "%SCRIPT_DIR%db"
)

streamlit run app/app.py --server.headless True
