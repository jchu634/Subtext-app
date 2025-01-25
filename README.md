# Subtext: Offline AI subtiting
Subtext is an easy to use subtitling app, which allows an user to utilise AI models to generate subtitles entirely on device.

## Development Setup Notes:
### Backend:
- To utilise CUDA, install the dependencies using `pip install cuda-requirements.txt`
- There are some flags which are useful for development
    - The recommended way to enable these flags is to 
        1. Set `env = "DEVELOPMENT"` in the `config.py` file
        2. Write the overrides into an `.env.development` file in the `backend` folder.
    - Note: `.env.development` overrides will NOT be respected unless `env=DEVELOPMENT`
- The backend has a signature check for model code.
    - To disable this check, set `allowUnsignedCode=true`
    - To sign model code instead, utilise the script `.\build_tools\build_generate_signatures.py`

### Build Scripts
Argument Documentation
- `buildFrontendApp.ps1`
    - `-SkipBuild`: Skips the building of frontend
- `bundleApp.ps1`
    - `WithCuda`: Install with cuda support
    - `SkipDependencies`: Skip dependency installation step
    - `SkipFrontend`: Skip frontend build step
    - `SkipPortable`: Skip portable app build step
    - `SkipInstaller`: Skip installer build step



