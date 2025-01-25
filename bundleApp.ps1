param(
    [Parameter()]
    [switch]$SkipFrontend,

    [Parameter()]
    [switch]$SkipPortable,

    [Parameter()]
    [switch]$SkipInstaller,

    [Parameter()]
    [switch]$WithCuda,

    [Parameter()]
    [switch]$SkipDependencies

)

$applicationName = "Subtext"
$rootPath = $PWD
$backendPath = Join-Path $rootPath "backend"

if (-not $SkipFrontend) {
    Write-Host "Building Frontend" -ForegroundColor Cyan
    .\buildFrontend.ps1
} else {
    Write-Host "Skipped Frontend Build" -ForegroundColor Green
}

Set-Location $backendPath
if (-not $SkipDependencies) {

    python -m venv venv
    .\venv\Scripts\activate
    if ($WithCuda){
        pip install -r cuda-requirements.txt    
    } else {
        pip install -r requirements.txt
    }
} else {
    .\venv\Scripts\activate
}

#Write model signatures
if (Test-Path -Path ".\key" -PathType Leaf) {
    Write-Host "Key file found" -ForegroundColor Green
    Write-Host "Generating Model Signatures" -ForegroundColor Cyan
    python .\build_tools\build_generate_signatures.py key
} else {
    Write-Host "Key file not found" -ForegroundColor Red
}

# Package Backend + Frontend into Portable Executable
if (-not $SkipPortable) { 
    Write-Host "Building App" -ForegroundColor Cyan
    pyinstaller Subtext.spec --clean --noconfirm
    
    if ($LASTEXITCODE -eq 0) {
        # Package Executable into Zip
        Write-Host "Packaging executable" -ForegroundColor Cyan
        $7zVar = Join-Path ".\dist" $applicationName
        7z -tzip a (Join-Path $7zVar ".zip") (Join-Path $7zVar "*")
        
        # Move Zipped Executable to Root
        Write-Host "Moving zipped application" -ForegroundColor Cyan
        $NewName = Join-Path $rootPath "$applicationName-Portable-Windows.zip"
        Move-Item (Join-Path $7zVar ".zip") $NewName -Force
    } else {
        Write-Host "PyInstaller failed, skipping packaging steps" -ForegroundColor Red
    }
}

# Package Backend + Frontend into Installation Executable
if (-not $SkipInstaller){    
    Write-Host "INSTALLER NOT READY" -ForegroundColor Red
    # pyinstaller .\pywebview_installed.py --hide-console "hide-early" --add-data "library;library" --add-data "sql_app.db;." --noconfirm --clean --name $applicationName --contents-directory "." --icon "library\static\favicon.ico" --hidden-import=keras --hidden-import=PIL --hidden-import=glob --hidden-import=numpy --hidden-import=tensorflow --hidden-import=cv2 --hidden-import=torchvision --hidden-import=torch 
    # iscc .\package.iss

    # # # Move Installation Executable to Root
    # $OldName = ".\$applicationName-Setup.exe"
    # $NewName = Join-Path $rootPath "$applicationName-Setup.exe"
    # Move-Item $OldName $NewName -Force
}

# Disable Venv
deactivate

# Set Location back to Root
Set-Location $rootPath
Write-Host "Completed Script" -ForegroundColor Green
