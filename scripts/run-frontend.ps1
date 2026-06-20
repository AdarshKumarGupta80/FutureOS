$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Push-Location (Join-Path $root "frontend")
try {
  if (!(Test-Path "node_modules")) {
    npm install
  }
  if (!$env:VITE_API_BASE) {
    $env:VITE_API_BASE = "http://localhost:8080/api"
  }
  npm run dev
} finally {
  Pop-Location
}
