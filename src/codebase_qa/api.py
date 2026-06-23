"""FastAPI web interface for codebase-qa.

Run (dev):   uvicorn codebase_qa.api:app --reload
Run (prod):  uvicorn codebase_qa.api:app --host 0.0.0.0 --port 8000
"""

from __future__ import annotations

import json
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from codebase_qa.qa import iter_answer

app = FastAPI(title="Codebase Q&A", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class AskRequest(BaseModel):
    question: str
    collection: str = "codebase"
    top_k: int = 5
    mock: bool = False


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/ask")
def ask(req: AskRequest) -> dict:
    """Return the full answer and sources in one JSON response."""
    text_parts: list[str] = []
    sources: list[dict] = []

    for event in iter_answer(req.question, req.collection, req.top_k, mock=req.mock):
        if event["type"] == "text":
            text_parts.append(event["content"])
        elif event["type"] == "sources":
            sources = event["content"]

    return {"answer": "".join(text_parts), "sources": sources}


@app.post("/ask/stream")
def ask_stream(req: AskRequest) -> StreamingResponse:
    """Stream answer chunks as Server-Sent Events.

    Each SSE event is ``{"type": "text"|"sources", "content": ...}``.
    The stream ends with ``data: [DONE]``.
    """
    def generate():
        for event in iter_answer(req.question, req.collection, req.top_k, mock=req.mock):
            yield f"data: {json.dumps(event)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


# Serve the web frontend — must be mounted LAST so API routes take priority.
_FRONTEND = Path(__file__).parent.parent.parent / "frontend"
if _FRONTEND.is_dir():
    app.mount("/", StaticFiles(directory=str(_FRONTEND), html=True), name="frontend")
