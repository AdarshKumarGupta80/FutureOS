$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
& (Join-Path $PSScriptRoot "install-maven.ps1")

$maven = Join-Path $root ".tools\apache-maven-3.9.11\bin\mvn.cmd"
$env:JWT_SECRET = if ($env:JWT_SECRET) { $env:JWT_SECRET } else { "futureos-local-development-secret-change-me-please-123456" }
$env:AI_BASE_URL = if ($env:AI_BASE_URL) { $env:AI_BASE_URL } else { "http://localhost:8001" }
$env:DB_URL = if ($env:DB_URL) { $env:DB_URL } else { "jdbc:mysql://localhost:3306/futureos?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true" }
$env:DB_USERNAME = if ($env:DB_USERNAME) { $env:DB_USERNAME } else { "root" }
$env:DB_PASSWORD = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "futureos_root" }

Push-Location (Join-Path $root "backend")
try {
  & $maven spring-boot:run
} finally {
  Pop-Location
}
