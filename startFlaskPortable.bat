@echo off
setlocal enabledelayedexpansion
set /p PYTHON_PATH=<PythonPath.txt
echo !PYTHON_PATH!
echo Running main.py with Python at !PYTHON_PATH!
"!PYTHON_PATH!" startFlask.py
pause
