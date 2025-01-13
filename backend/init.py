from config import Settings
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


def create_app():
    tags_metadata = [
        {
            "name": "Utilities",
            "description": "Contains functions for the frontend to interact with."
        },
        {
            "name": "Home",
            "description": "Api dedicated to serving the React App for local app client+server deployment."
        },
        {
            "name": "Transcription",
            "description": "Api dedicated for delivering the transcription to users"
        },

    ]
    if Settings.debuggingEnabled == True:
        app = FastAPI(openapi_tags=tags_metadata)
    else:
        app = FastAPI(openapi_tags=tags_metadata, docs_url=None, redoc_url=None)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    from home import home
    from inference import inference

    app.include_router(inference.transcription_router)
    # Always include the home router last as it contains a catch all route which will prevent other routes from being accessed
    app.include_router(home.home_router)
    return app


app = create_app()
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("init:app", port=6789, reload=True)
