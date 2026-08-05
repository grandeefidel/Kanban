import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

STATIC_DIR = Path(os.environ.get("STATIC_DIR", Path(__file__).resolve().parent.parent / "static"))

app = FastAPI(title="Kanban")


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


# Mounted last so API routes take precedence over the static catch-all.
app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
