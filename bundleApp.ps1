# Set strict error handling
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

param(
    [Parameter()]
    [switch]$SkipFrontendBuild,

    [Parameter()]
    [switch]$SkipPortable,

    [Parameter()]
    [switch]$SkipInstaller,

    [Parameter()]
    [switch]$SkipBackendBuild,

    [Parameter()]
    [switch]$WithCuda,

    [Parameter()]
    [switch]$SkipDependencies

)

try {
    $applicationName = "Subtext"
    $rootPath = $PWD
    $backendPath = Join-Path $rootPath "backend"
    $backendBuilt = $false

    if (-not $SkipFrontendBuild) {
        Write-Host "Building Frontend" -ForegroundColor Cyan
        & "$PSScriptRoot\buildFrontend.ps1"
        if ($LASTEXITCODE -ne 0) { throw "Frontend build failed" }
    } else {
        Write-Host "Skipped Frontend Build" -ForegroundColor Green
    }

    Set-Location $backendPath
    if (-not $SkipDependencies) {
        python -m venv venv
        if ($LASTEXITCODE -ne 0) { throw "Failed to create virtual environment" }
        
        .\venv\Scripts\activate
        if ($WithCuda){
            pip install -r cuda-requirements.txt
            if ($LASTEXITCODE -ne 0) { throw "Failed to install CUDA requirements" }
        } else {
            pip install -r requirements.txt
            if ($LASTEXITCODE -ne 0) { throw "Failed to install requirements" }
        }
    } else {
        .\venv\Scripts\activate
    }

    if (Test-Path -Path ".\key" -PathType Leaf) {
        Write-Host "Key file found" -ForegroundColor Green
        Write-Host "Generating Model Signatures" -ForegroundColor Cyan
        python .\build_tools\build_generate_signatures.py key
        if ($LASTEXITCODE -ne 0) { throw "Failed to generate model signatures" }
    } else {
        throw "Key file not found"
    }

    if (-not $SkipPortable) { 
        Write-Host "Building App" -ForegroundColor Cyan
        if (-not $SkipBackendBuild){
            pyinstaller Subtext.spec --clean --noconfirm
            if ($LASTEXITCODE -ne 0) { throw "PyInstaller failed" }
            $backendBuilt = $true
        }
        
        # Package Executable into 7z
        Write-Host "Packaging executable" -ForegroundColor Cyan
        $7zVar = Join-Path ".\dist" $applicationName
        7z a -t7z -m0=lzma2 (Join-Path $7zVar ".7z") (Join-Path $7zVar "*")
        if ($LASTEXITCODE -ne 0) { throw "7z packaging failed" }
        
        # Move Zipped Executable to Root
        Write-Host "Moving zipped application" -ForegroundColor Cyan
        $NewName = Join-Path $rootPath "$applicationName-Portable-Windows.7z"
        Move-Item (Join-Path $7zVar ".7z") $NewName -Force
    }

    if (-not $SkipInstaller){    
        Write-Host "INSTALLER NOT READY" -ForegroundColor Red
        if (($backendBuilt) -or ($SkipBackendBuild)){
            Write-Host "Skipping Build step as already built" -ForegroundColor Green
        } else {
            Write-Host "Building App" -ForegroundColor Cyan
            pyinstaller Subtext.spec --clean --noconfirm
            if ($LASTEXITCODE -ne 0) { throw "PyInstaller failed" }
        }
        
        Write-Host "Packaging App" -ForegroundColor Cyan
        iscc .\package.iss
        if ($LASTEXITCODE -ne 0) { throw "Inno Setup packaging failed" }

        Write-Host "Moving packaged setup" -ForegroundColor Cyan
        $OldName = ".\$applicationName-Setup.exe"
        $NewName = Join-Path $rootPath "$applicationName-Setup.exe"
        Move-Item $OldName $NewName -Force
    }

    # Cleanup
    deactivate
    Set-Location $rootPath
    Write-Host "Completed Script" -ForegroundColor Green

} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
} finally {
    # Always try to deactivate venv and restore location
    if (Get-Command "deactivate" -errorAction SilentlyContinue) {
        deactivate
    }
    Set-Location $rootPath
}
