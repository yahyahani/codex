"""Optional FastAPI web interface for codebase-qa.

Install extras:  pip install -e ".[api]"
Run:             uvicorn codebase_qa.api:app --reload
"""

from __future__ import annotations

import json

from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from codebase_qa.qa import iter_answer

app = FastAPI(title="Codebase Q&A", version="0.1.0")


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

    Each event is a JSON object with ``type`` (``"text"`` or ``"sources"``)
    and ``content``. The stream ends with ``data: [DONE]``.

    Example client (curl)::

        curl -N -X POST http://localhost:8000/ask/stream \\
             -H 'Content-Type: application/json' \\
             -d '{"question": "How does greet work?", "mock": true}'
    """
    def generate():
        for event in iter_answer(req.question, req.collection, req.top_k, mock=req.mock):
            yield f"data: {json.dumps(event)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
