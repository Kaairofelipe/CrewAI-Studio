@echo off
setlocal

:: Set the script directory
set "SCRIPT_DIR=%~dp0"

:: Prefer the project-local Miniconda install, but fall back to the user's one.
set "ACTIVATE_BAT=%SCRIPT_DIR%miniconda\Scripts\activate.bat"
if not exist "%ACTIVATE_BAT%" (
    set "ACTIVATE_BAT=%USERPROFILE%\Miniconda3\Scripts\activate.bat"
)

if not exist "%ACTIVATE_BAT%" (
    echo Could not find a Miniconda installation. Run install_conda.bat first.
    exit /b 1
)

:: Suppress cosmetic chardet/urllib3 warnings emitted by the base conda env during activation
set "PYTHONWARNINGS=ignore"

:: Initialize Conda for this script session only
call "%ACTIVATE_BAT%" || (
    echo Failed to initialize conda
    exit /b 1
)

:: Activate the conda environment
call conda activate crewai_env || (
    echo Failed to activate conda environment
    exit /b 1
)

cd /d "%SCRIPT_DIR%"

:: Streamlit requires docstrings during startup, so disable any inherited optimize flag.
set "PYTHONOPTIMIZE="

:: Restore default warning behavior for the application itself
set "PYTHONWARNINGS=default"

:: Run the Streamlit application
streamlit run app/app.py --server.headless True
