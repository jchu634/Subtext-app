from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse, FileResponse, ORJSONResponse
from fastapi.staticfiles import StaticFiles
import logging
import os

home_router = APIRouter(tags=["Home"])
frontend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend")

####### favicon #######


@home_router.get("/favicon.ico", responses={200: {"description": "Success"}, 404: {"description": "Not Found"}})
def favicon():
    """
        Serves the favicon
    """
    if os.path.exists(os.path.join(frontend_path, "favicon.ico")):
        return FileResponse(os.path.join(frontend_path, "favicon.ico"))
    else:
        return ORJSONResponse(content={"error": "File not found"}, status_code=404)

####### Index.txt #######


@home_router.get("/index.txt", responses={200: {"description": "Success"}, 404: {"description": "Not Found"}})
def index():
    """
        Serves the favicon
    """
    if os.path.exists(os.path.join(frontend_path, "index.txt")):
        return FileResponse(os.path.join(frontend_path, "index.txt"))
    else:
        return ORJSONResponse(content={"error": "File not found"}, status_code=404)

####### NextJS Build + Static #######


@home_router.get("/")
@home_router.get("/{path:path}", responses={200: {"description": "Success"}, 404: {"description": "Not Found"}})
def home(request: Request, path: str = None):
    """
        Serves the NextJS Frontend
    """
    static_file_path = os.path.join(frontend_path, path)
    print(path)

    # Check if static file is a js, css, svg, woff2 file (To prevent leaking other files)
    if static_file_path.endswith(".js") or static_file_path.endswith(".css") or static_file_path.endswith(".svg") or static_file_path.endswith(".woff2"):
        # Checks if Static file exists
        if os.path.isfile(static_file_path):
            logging.info(f"Serving {static_file_path}")
            return FileResponse(static_file_path)

    if static_file_path.endswith(".html"):
        # Check if frontend exists
        logging.info(f"Serving {static_file_path}")
        return HTMLResponse(open(static_file_path, "r", encoding="utf-8").read())

    # Check if frontend page exists
    if os.path.exists(os.path.join(frontend_path, f"{os.path.normpath(path)}.html")):
        logging.info(f'Serving {os.path.join(frontend_path, f"{os.path.normpath(path)}.html")}')
        return HTMLResponse(open(os.path.join(frontend_path, f"{os.path.normpath(path)}.html"), "r", encoding="utf-8").read())

    # Path is empty (root path)
    if path == "":
        # Check if frontend index exists
        if os.path.exists(os.path.join(frontend_path, "index.html")):
            logging.info(f'Serving {os.path.join(frontend_path, "index.html")}')
            return HTMLResponse(open(os.path.join(frontend_path, "index.html"), "r", encoding="utf-8").read())
    return ORJSONResponse(content={"error": "Frontend not found"}, status_code=404)
