param(
    [Parameter()]
    [switch]$SkipBuild
)

# Save current root directory
$root = Get-Location
$backendFrontendFolder = Join-Path -Path $root -ChildPath "backend\home\frontend"
$frontendBuildFolder = Join-Path -Path $root -ChildPath "frontend\out"

# Create backend frontend folder if it doesn't exist
New-Item -ItemType Directory -Force -Path $backendFrontendFolder

if (-not $SkipBuild) {
    # Change directory to the frontend folder
    Set-Location frontend

    # Install dependencies
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install

    # Build the frontend
    Write-Host "Building frontend..." -ForegroundColor Cyan
    npm run build

    # Check if the build was successful
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Stopped Build Script: Failed to build the frontend"
        exit 1
    }

    # Change directory back to the root folder
    Set-Location $root
}

# Remove the old build files from the backend folder
Write-Host "Cleaning backend frontend folder..." -ForegroundColor Yellow
if (Test-Path $backendFrontendFolder) {
    Get-ChildItem -Path $backendFrontendFolder -Recurse | Remove-Item -Recurse -Force
}

# Copy the built files to the backend folder
Write-Host "Copying files to backend..." -ForegroundColor Cyan
Get-ChildItem -Path $frontendBuildFolder -Recurse | ForEach-Object {
    $relativePath = $_.FullName.Substring($frontendBuildFolder.Length)
    $destination = Join-Path $backendFrontendFolder $relativePath
    $destinationDir = Split-Path -Parent $destination

    # Create destination directory if it doesn't exist
    if (-not (Test-Path $destinationDir)) {
        New-Item -ItemType Directory -Force -Path $destinationDir
    }

    # Copy the file
    Copy-Item -Path $_.FullName -Destination $destination -Force
}

Write-Host "Frontend build process completed!" -ForegroundColor Green