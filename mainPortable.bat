@echo off
setlocal enabledelayedexpansion
set /p PYTHON_PATH=<PythonPath.txt
echo Running main.py with Python at !PYTHON_PATH!
"!PYTHON_PATH!" main.py
echo main.py executed successfully.
pause
