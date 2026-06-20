$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$tools = Join-Path $root ".tools"
$mavenVersion = "3.9.11"
$mavenDir = Join-Path $tools "apache-maven-$mavenVersion"
$mavenZip = Join-Path $tools "apache-maven-$mavenVersion-bin.zip"
$mavenUrl = "https://archive.apache.org/dist/maven/maven-3/$mavenVersion/binaries/apache-maven-$mavenVersion-bin.zip"

if (Test-Path (Join-Path $mavenDir "bin\mvn.cmd")) {
  Write-Host "Maven already installed at $mavenDir"
  exit 0
}

New-Item -ItemType Directory -Force $tools | Out-Null

if (!(Test-Path $mavenZip)) {
  Write-Host "Downloading Maven $mavenVersion..."
  Invoke-WebRequest -Uri $mavenUrl -OutFile $mavenZip
}

Write-Host "Extracting Maven..."
Expand-Archive -Path $mavenZip -DestinationPath $tools -Force
Write-Host "Maven installed at $mavenDir"
