"""Tests for the optional FastAPI endpoint (src/codebase_qa/api.py)."""

import json
from unittest.mock import patch

import pytest

pytest.importorskip("fastapi", reason="fastapi not installed")
pytest.importorskip("httpx", reason="httpx not installed (needed by TestClient)")

from fastapi.testclient import TestClient  # noqa: E402

from codebase_qa.api import app  # noqa: E402

client = TestClient(app)

_FAKE_CHUNKS = [
    {
        "text": "def greet(name): return f'Hello, {name}'",
        "metadata": {"file": "src/hello.py", "start_line": 1, "end_line": 3},
        "distance": 0.05,
    }
]


def test_health() -> None:
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_ask_mock_returns_answer_and_sources() -> None:
    with (
        patch("codebase_qa.qa.embed", return_value=[[0.0] * 384]),
        patch("codebase_qa.qa.query", return_value=_FAKE_CHUNKS),
    ):
        resp = client.post("/ask", json={"question": "What does greet do?", "mock": True})

    assert resp.status_code == 200
    data = resp.json()
    assert "[MOCK]" in data["answer"]
    assert len(data["sources"]) == 1
    assert data["sources"][0]["file"] == "src/hello.py"


def test_ask_no_chunks_returns_empty_sources() -> None:
    with (
        patch("codebase_qa.qa.embed", return_value=[[0.0] * 384]),
        patch("codebase_qa.qa.query", return_value=[]),
    ):
        resp = client.post("/ask", json={"question": "anything?", "mock": True})

    assert resp.status_code == 200
    data = resp.json()
    assert data["sources"] == []
    assert "No indexed chunks" in data["answer"]


def test_ask_stream_mock_emits_sse() -> None:
    with (
        patch("codebase_qa.qa.embed", return_value=[[0.0] * 384]),
        patch("codebase_qa.qa.query", return_value=_FAKE_CHUNKS),
    ):
        resp = client.post("/ask/stream", json={"question": "?", "mock": True})

    assert resp.status_code == 200
    lines = [l for l in resp.text.splitlines() if l.startswith("data:")]
    payloads = [json.loads(l[len("data: "):]) for l in lines if l != "data: [DONE]"]

    text_events = [p for p in payloads if p["type"] == "text"]
    source_events = [p for p in payloads if p["type"] == "sources"]

    assert any("[MOCK]" in e["content"] for e in text_events)
    assert len(source_events) == 1
    assert source_events[0]["content"][0]["file"] == "src/hello.py"
    assert "data: [DONE]" in resp.text
