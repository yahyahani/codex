from pathlib import Path

import pytest

import codebase_qa.vectorstore as vs_module
from codebase_qa.chunking import Chunk

_DIM = 4  # small fixed dimension; real embed() uses 384


@pytest.fixture(autouse=True)
def reset_client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    """Point ChromaDB at a fresh temp dir and reset the cached client."""
    monkeypatch.setenv("CHROMA_DB_PATH", str(tmp_path / "chroma"))
    vs_module._chroma_client = None
    vs_module._DB_PATH = None
    yield
    vs_module._chroma_client = None
    vs_module._DB_PATH = None


def _vec(val: float = 0.5) -> list[float]:
    return [val] * _DIM


def test_add_and_query_round_trip() -> None:
    from codebase_qa.vectorstore import add_chunks, query

    chunk = Chunk(file=Path("src/foo.py"), start_line=1, end_line=3, text="def hello(): pass")
    add_chunks("col", [chunk], [_vec()])

    results = query("col", _vec(), top_k=1)

    assert len(results) == 1
    assert results[0]["text"] == "def hello(): pass"
    assert results[0]["metadata"]["file"] == "src/foo.py"
    assert results[0]["metadata"]["start_line"] == 1


def test_upsert_replaces_chunk() -> None:
    from codebase_qa.vectorstore import add_chunks, query

    chunk = Chunk(file=Path("a.py"), start_line=1, end_line=2, text="original")
    add_chunks("col", [chunk], [_vec(0.1)])

    updated = Chunk(file=Path("a.py"), start_line=1, end_line=2, text="updated")
    add_chunks("col", [updated], [_vec(0.2)])

    results = query("col", _vec(0.2), top_k=1)
    assert results[0]["text"] == "updated"


def test_query_returns_metadata() -> None:
    from codebase_qa.vectorstore import add_chunks, query

    chunks = [
        Chunk(file=Path("x.py"), start_line=1, end_line=5, text="chunk one"),
        Chunk(file=Path("y.py"), start_line=10, end_line=15, text="chunk two"),
    ]
    add_chunks("col", chunks, [_vec(0.1), _vec(0.9)])

    results = query("col", _vec(0.1), top_k=2)
    files = {r["metadata"]["file"] for r in results}
    assert "x.py" in files
    assert "y.py" in files
