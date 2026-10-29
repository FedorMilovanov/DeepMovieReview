<#
 Film 001 — master evidence bundle, Windows launcher.

 Thin wrapper around make-evidence-bundle.sh so the bundle can be produced from
 PowerShell without hunting for Git Bash manually.

 Usage:
   powershell -ExecutionPolicy Bypass -File .\run-bundle.ps1 `
     -InputFile "C:\Users\Fedor\Downloads\The Truman Show (1998) BDRip.mkv"

 Optional:
   -OutDir .\truman-bundle      output folder
   -SubMap 0:s:2                ffmpeg subtitle map (0-based subtitle index)
   -GridStep 30                 seconds between individual stills
   -SheetStep 10                seconds between contact-sheet thumbnails

 Requires ffmpeg + ffprobe on PATH (winget install Gyan.FFmpeg) and Git Bash.
#>
param(
  [Parameter(Mandatory = $true)][string]$InputFile,
  [string]$OutDir = ".\truman-bundle",
  [string]$SubMap = "0:s:2",
  [int]$GridStep = 30,
  [int]$SheetStep = 10
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $InputFile)) {
  throw "Input file not found: $InputFile"
}

foreach ($tool in @("ffmpeg", "ffprobe")) {
  if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
    throw "$tool not found on PATH. Install with: winget install Gyan.FFmpeg (then reopen the terminal)."
  }
}

$bash = Get-Command bash -ErrorAction SilentlyContinue
if (-not $bash) {
  throw "bash not found. Install Git for Windows (it ships Git Bash) or run the .sh script under WSL."
}

$script = Join-Path $PSScriptRoot "make-evidence-bundle.sh"
if (-not (Test-Path -LiteralPath $script)) {
  throw "make-evidence-bundle.sh is missing next to this launcher."
}

# The .sh reads its tunables from the environment, so one configuration
# surface is shared by both entry points.
$env:GRID_STEP = "$GridStep"
$env:SHEET_STEP = "$SheetStep"

# Git Bash understands Windows absolute paths passed as arguments.
& $bash.Source $script $InputFile $OutDir $SubMap | Out-Host

if ($LASTEXITCODE -ne 0) {
  throw "bundle extraction failed with exit code $LASTEXITCODE"
}

Write-Host ""
Write-Host "Bundle written to: $OutDir"
