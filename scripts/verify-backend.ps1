$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
& (Join-Path $PSScriptRoot "install-maven.ps1")

$maven = Join-Path $root ".tools\apache-maven-3.9.11\bin\mvn.cmd"
Push-Location (Join-Path $root "backend")
try {
  & $maven test
} finally {
  Pop-Location
}
