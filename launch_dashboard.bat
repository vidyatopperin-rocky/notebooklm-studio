@echo off
title NotebookLM Studio Dashboard
echo Starting NotebookLM Studio Dashboard...
cd /d "%~dp0"
python -B server.py
pause
