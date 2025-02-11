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
    [switch]$SkipDependencies,

    [Parameter()]
    [switch]$Force,

    [Parameter()]
    [switch]$HardCodedPythonPath
)

# Set strict error handling
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

# Set error handling based on Force parameter
$ErrorActionPreference = if ($Force) { "Continue" } else { "Stop" }
Set-StrictMode -Version Latest

try {
    $applicationName = "Subtext"
    $rootPath = $PWD
    $backendPath = Join-Path $rootPath "backend"
    $backendBuilt = $false

    # Define Python path
    $pythonExe = if ($HardCodedPythonPath) {
        "C:\Users\build-gpu\AppData\Local\Programs\Python\Python312\python.exe"
    } else {
        "python"
    }

    if (-not $SkipFrontendBuild) {
        Write-Host "Building Frontend" -ForegroundColor Cyan
        & "$PSScriptRoot/buildFrontend.ps1"
        if ((-not $Force) -and ($LASTEXITCODE -ne 0)) { throw "Frontend build failed" }
    } else {
        Write-Host "Skipped Frontend Build" -ForegroundColor Green
    }

    Set-Location $backendPath
    if (-not $SkipDependencies) {
        if (-not (Test-Path -Path "venv" -PathType Container)) {
            Write-Host "Creating new virtual environment..." -ForegroundColor Cyan
            & $pythonExe -m venv venv
            if ((-not $Force) -and ($LASTEXITCODE -ne 0)) { throw "Failed to create virtual environment" }
        } else {
            Write-Host "Using existing virtual environment" -ForegroundColor Green
        }
        
        $venvPath = Resolve-Path "venv"
        Write-Host "Virtual environment location: $venvPath" -ForegroundColor Yellow
        
        & ./venv/Scripts/Activate.ps1
        if ($env:VIRTUAL_ENV) {
            Write-Host "Virtual environment activated successfully" -ForegroundColor Green
        } else {
            throw "Failed to activate venv"
        }
        
        Write-Host "Installing/Updating Requirements..." -ForegroundColor Cyan
        if ($WithCuda) {
            & python -m pip install -r cuda-requirements.txt
            if ((-not $Force) -and ($LASTEXITCODE -ne 0)) { throw "Failed to install CUDA requirements" }
        } else {
            & python -m pip install -r requirements.txt
            if ((-not $Force) -and ($LASTEXITCODE -ne 0)) { throw "Failed to install requirements" }
        }
    } else {
        if (-not (Test-Path -Path "venv" -PathType Container)) {
            throw "No virtual environment found and SkipDependencies is set"
        }
        Write-Host "Activating existing virtual environment" -ForegroundColor Green
        & ./venv/Scripts/Activate.ps1
    }

    if (Test-Path -Path "./key" -PathType Leaf) {
        Write-Host "Key file found" -ForegroundColor Green
        Write-Host "Generating Model Signatures" -ForegroundColor Cyan
        & python ./build_tools/build_generate_signatures.py key
        if ($LASTEXITCODE -ne 0) { throw "Failed to generate model signatures" }
    } else {
        throw "Key file not found"
    }

    if (-not $SkipPortable) { 
        Write-Host "Building App" -ForegroundColor Cyan
        if (-not $SkipBackendBuild){
            & pyinstaller Subtext.spec --clean --noconfirm
            if ((-not $Force) -and ($LASTEXITCODE -ne 0)) { throw "PyInstaller failed" }
            $backendBuilt = $true
        }
        
        # Package Executable into 7z
        Write-Host "Packaging executable" -ForegroundColor Cyan
        $7zPath = Join-Path "./dist" $applicationName
        & 7z a -t7z -m0=lzma2 "$7zPath.7z" "$7zPath/*"
        if ((-not $Force) -and ($LASTEXITCODE -ne 0)) { throw "7z packaging failed" }
        
        # Move Zipped Executable to Root
        Write-Host "Moving zipped application" -ForegroundColor Cyan
        $NewName = Join-Path $rootPath "$applicationName-Portable-Windows.7z"
        Move-Item "$7zPath.7z" $NewName -Force
    }

    if (-not $SkipInstaller){    
        Write-Host "INSTALLER NOT READY" -ForegroundColor Red
        if (($backendBuilt) -or ($SkipBackendBuild)){
            Write-Host "Skipping Build step as already built" -ForegroundColor Green
        } else {
            Write-Host "Building App" -ForegroundColor Cyan
            & pyinstaller Subtext.spec --clean --noconfirm
            if ((-not $Force) -and ($LASTEXITCODE -ne 0)) { throw "PyInstaller failed" }
        }
        
        Write-Host "Packaging App" -ForegroundColor Cyan
        & iscc ./package.iss
        if ((-not $Force) -and ($LASTEXITCODE -ne 0)) { throw "Inno Setup packaging failed" }

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
    if (-not $Force) {
        exit 1
    } else {
        Write-Host "Continuing despite error (Force mode)" -ForegroundColor Yellow
    }
} finally {
    # Always try to deactivate venv and restore location
    if (Get-Command "deactivate" -errorAction SilentlyContinue) {
        deactivate
    }
    Set-Location $rootPath
}
