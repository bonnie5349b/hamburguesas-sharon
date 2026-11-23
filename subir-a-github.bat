@echo off
chcp 65001 > nul
title Subir Hamburguesas Sharon a GitHub
cd /d "C:\Users\soyos\.gemini\antigravity\scratch\hamburguesas-sharon"

echo ========================================================
echo   SUBIENDO HAMBURGUESAS SHARON A GITHUB (bonnie5349b)
echo ========================================================
echo.
echo Recuerda que primero debes haber creado el repositorio en:
echo https://github.com/new  con el nombre: hamburguesas-sharon
echo.
echo Conectando y enviando los archivos...
echo.

"C:\Users\soyos\bin\git\cmd\git.exe" push -u origin main

echo.
echo ========================================================
echo Proceso finalizado.
echo ========================================================
pause
