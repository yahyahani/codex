from __future__ import annotations

import os
from typing import TYPE_CHECKING

import chromadb

if TYPE_CHECKING:
    from codebase_qa.chunking import Chunk

_DB_PATH: str | None = None
_chroma_client: chromadb.PersistentClient | None = None


def _client() -> chromadb.PersistentClient:
    global _DB_PATH, _chroma_client
    db_path = os.getenv("CHROMA_DB_PATH", "chroma_db")
    if _chroma_client is None or _DB_PATH != db_path:
        _DB_PATH = db_path
        _chroma_client = chromadb.PersistentClient(path=db_path)
    return _chroma_client


def add_chunks(
    collection_name: str,
    chunks: list[Chunk],
    embeddings: list[list[float]],
) -> None:
    """Upsert chunks and their embeddings into the named ChromaDB collection."""
    col = _client().get_or_create_collection(collection_name)
    col.upsert(
        ids=[f"{c.file}:{c.start_line}:{c.end_line}" for c in chunks],
        embeddings=embeddings,
        documents=[c.text for c in chunks],
        metadatas=[
            {"file": str(c.file), "start_line": c.start_line, "end_line": c.end_line}
            for c in chunks
        ],
    )


def query(
    collection_name: str,
    embedding: list[float],
    top_k: int = 5,
) -> list[dict]:
    """Return the top-k most similar chunks for the given query embedding."""
    col = _client().get_or_create_collection(collection_name)
    results = col.query(
        query_embeddings=[embedding],
        n_results=top_k,
        include=["documents", "metadatas", "distances"],
    )
    return [
        {"text": doc, "metadata": meta, "distance": dist}
        for doc, meta, dist in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0],
        )
    ]
