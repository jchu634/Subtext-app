import uvicorn

if __name__ == "__main__":
    uvicorn.run("init:app", port=6789, reload=True)
