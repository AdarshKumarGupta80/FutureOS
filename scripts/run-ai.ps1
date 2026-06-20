$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Push-Location (Join-Path $root "ai-service")
try {
  python -m pip install -r requirements.txt
  python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
} finally {
  Pop-Location
}
