# Subtext: Offline AI subtiting
![ScreenshotDark](https://github.com/user-attachments/assets/830b190b-d211-4d73-b1a1-db1fe013d4ae)

## About
Subtext is an easy to use subtitling app, which allows an user to utilise AI models to generate subtitles entirely on device.

## Development Setup Notes:
### Backend:
- Install dependencies using `pip install -r requirements.txt`
    - For CUDA Suport, instead install dependencies using `pip install -r cuda-requirements.txt`
      
- There are some flags which are useful for development
    - The recommended way to enable these flags is to 
        1. Set `env = "DEVELOPMENT"` in the `config.py` file
        2. Write the overrides into an `.env.development` file in the `backend` folder.

__Note: `.env.development` overrides will NOT be respected unless `env=DEVELOPMENT`__
      
- The backend has a signature check for model code.
    - To disable this check, set `allowUnsignedCode=true`
    - To sign model code, utilise the script `.\build_tools\build_generate_signatures.py`
  
### Frontend
- Install Dependencies using `npm install`
- Run app using `npm run dev`

### Build Scripts
Argument Documentation
- `buildFrontendApp.ps1`
    - `-SkipBuild`: Skips the building of frontend
- `bundleApp.ps1`
    - `WithCuda`: Install with cuda support
    - `SkipDependencies`: Skip dependency installation step
    - `SkipFrontend`: Skip frontend build step
    - `SkipBackendBuild`: Skip Backend build step
    - `SkipPortable`: Skip portable app build step
    - `SkipInstaller`: Skip installer build step
    - `Force`: Force script to continue execution even if a step errors out
    - `HardCodedPythonPath`: Make script use a hard-coded Python path for a Github Self-hosted Runner
    - `HardCoded7ZipPath`: Make script use a hard-coded 7zip path for a Github Self-hosted Runner
    - `HardCodedInnoPath`: Make script use a hard-coded InnoSetup path for a Github Self-hosted Runner
