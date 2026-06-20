$ErrorActionPreference = "Stop"

if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
  throw "Docker is required for one-command startup. Install Docker Desktop, then run this script again."
}

if (!(Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  Write-Host "Created .env from .env.example. Edit OPENAI_API_KEY before using AI features."
}

docker compose up --build
