# Milestone 3 — ChromaDB wrapper


def add_chunks(collection_name: str, chunks: list, embeddings: list[list[float]]) -> None:
    """Store chunks and their embeddings in ChromaDB. Implemented in Milestone 3."""
    raise NotImplementedError


def query(collection_name: str, embedding: list[float], top_k: int = 5) -> list[dict]:
    """Retrieve the top-k most similar chunks. Implemented in Milestone 3."""
    raise NotImplementedError
