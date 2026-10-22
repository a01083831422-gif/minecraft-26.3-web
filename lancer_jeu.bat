@echo off
cd /d "%~dp0"
echo ==============================================
echo Demarrage du serveur local Minecraft Web WASM
echo ==============================================
start http://localhost:8080
node server.js
pause
