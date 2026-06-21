$ErrorActionPreference = "Stop"

$node = "node"
$bundledNode = "C:\Users\ZeMil\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"

if (Test-Path $bundledNode) {
  $node = $bundledNode
}

Write-Host "Iniciando MB Intelligence API em http://localhost:3333"
$envFile = Join-Path $PSScriptRoot ".env"
$driver = "json"
if (Test-Path $envFile) {
  $line = Get-Content $envFile | Where-Object { $_ -like "MBI_STORAGE_DRIVER=*" } | Select-Object -First 1
  if ($line) {
    $driver = $line.Split("=", 2)[1].Trim()
  }
}

if ($driver -eq "supabase") {
  & $node "src/server-supabase.js"
} else {
  & $node "src/server.js"
}
