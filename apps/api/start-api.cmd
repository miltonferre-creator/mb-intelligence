@echo off
setlocal

set "NODE=node"
set "BUNDLED_NODE=C:\Users\ZeMil\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"

if exist "%BUNDLED_NODE%" (
  set "NODE=%BUNDLED_NODE%"
)

cd /d "%~dp0"
echo Iniciando MB Intelligence API em http://localhost:3333
echo Driver: Supabase
"%NODE%" "src\server-supabase.js"
